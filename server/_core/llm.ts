import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages, maxTokens, max_tokens, temperature = 0.7 } = params;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: maxTokens || max_tokens || 4096,
    temperature,
  });

  return {
    id: response.id,
    created: response.created,
    model: response.model,
    choices: response.choices.map((choice, index) => ({
      index,
      message: {
        role: choice.message.role as Role,
        content: choice.message.content || "",
      },
      finish_reason: choice.finish_reason,
    })),
    usage: response.usage ? {
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
    } : undefined,
  };
}

// Streaming version for real-time responses
export async function* streamLLM(params: InvokeParams): AsyncGenerator<string> {
  const { messages, maxTokens, max_tokens, temperature = 0.7 } = params;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: maxTokens || max_tokens || 4096,
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
