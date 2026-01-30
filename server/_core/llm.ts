import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// Anthropic API types
type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | Array<{ type: "text"; text: string } | { type: "image"; source: { type: "base64"; media_type: string; data: string } }>;
};

type AnthropicTool = {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
};

type AnthropicResponse = {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{ type: "text"; text: string } | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }>;
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use" | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const extractTextContent = (content: MessageContent | MessageContent[]): string => {
  const parts = ensureArray(content);
  return parts
    .map(part => {
      if (typeof part === "string") return part;
      if (part.type === "text") return part.text;
      return "";
    })
    .join("\n");
};

const convertToAnthropicMessages = (messages: Message[]): { system: string; messages: AnthropicMessage[] } => {
  let systemPrompt = "";
  const anthropicMessages: AnthropicMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      // Anthropic uses a separate system parameter
      systemPrompt += (systemPrompt ? "\n\n" : "") + extractTextContent(msg.content);
    } else if (msg.role === "user" || msg.role === "assistant") {
      const content = ensureArray(msg.content);
      
      // Check if it's simple text
      const isSimpleText = content.every(part => typeof part === "string" || part.type === "text");
      
      if (isSimpleText) {
        anthropicMessages.push({
          role: msg.role,
          content: extractTextContent(msg.content),
        });
      } else {
        // Handle multimodal content
        const anthropicContent: Array<{ type: "text"; text: string } | { type: "image"; source: { type: "base64"; media_type: string; data: string } }> = [];
        
        for (const part of content) {
          if (typeof part === "string") {
            anthropicContent.push({ type: "text", text: part });
          } else if (part.type === "text") {
            anthropicContent.push({ type: "text", text: part.text });
          } else if (part.type === "image_url") {
            // Convert image URL to base64 format expected by Anthropic
            const url = part.image_url.url;
            if (url.startsWith("data:")) {
              const matches = url.match(/^data:([^;]+);base64,(.+)$/);
              if (matches) {
                anthropicContent.push({
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: matches[1],
                    data: matches[2],
                  },
                });
              }
            }
          }
        }
        
        anthropicMessages.push({
          role: msg.role,
          content: anthropicContent,
        });
      }
    }
    // Skip tool/function messages for now (can be extended if needed)
  }

  return { system: systemPrompt, messages: anthropicMessages };
};

const convertTools = (tools: Tool[] | undefined): AnthropicTool[] | undefined => {
  if (!tools || tools.length === 0) return undefined;
  
  return tools.map(tool => ({
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters || { type: "object", properties: {} },
  }));
};

const convertAnthropicResponse = (response: AnthropicResponse): InvokeResult => {
  // Extract text content
  const textContent = response.content
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map(block => block.text)
    .join("");

  // Extract tool calls
  const toolCalls = response.content
    .filter((block): block is { type: "tool_use"; id: string; name: string; input: Record<string, unknown> } => block.type === "tool_use")
    .map(block => ({
      id: block.id,
      type: "function" as const,
      function: {
        name: block.name,
        arguments: JSON.stringify(block.input),
      },
    }));

  return {
    id: response.id,
    created: Date.now(),
    model: response.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: textContent,
          ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
        },
        finish_reason: response.stop_reason === "end_turn" ? "stop" : response.stop_reason,
      },
    ],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
};

const assertApiKey = () => {
  if (!ENV.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const {
    messages,
    tools,
    maxTokens,
    max_tokens,
  } = params;

  const { system, messages: anthropicMessages } = convertToAnthropicMessages(messages);
  const anthropicTools = convertTools(tools);

  const payload: Record<string, unknown> = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens || max_tokens || 4096,
    messages: anthropicMessages,
  };

  if (system) {
    payload.system = system;
  }

  if (anthropicTools && anthropicTools.length > 0) {
    payload.tools = anthropicTools;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ENV.anthropicApiKey!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Anthropic API failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const anthropicResponse = (await response.json()) as AnthropicResponse;
  return convertAnthropicResponse(anthropicResponse);
}
