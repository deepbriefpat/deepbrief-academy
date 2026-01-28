/**
 * Basic test to verify LLM API is working
 */

import { describe, it, expect } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("LLM API Basic Test", () => {
  it("should successfully call LLM API with simple message", async () => {
    console.log("\n🧪 Testing basic LLM API call...");
    
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: "Say 'Hello World' and nothing else."
          }
        ]
      });

      console.log("✅ LLM API Response received:");
      console.log("Model:", response.model);
      console.log("Response:", response.choices[0].message.content);
      
      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(response.choices.length).toBeGreaterThan(0);
      expect(response.choices[0].message.content).toBeDefined();
      
    } catch (error) {
      console.error("❌ LLM API call failed:");
      console.error(error);
      throw error;
    }
  }, 30000); // 30 second timeout

  it("should successfully call LLM API with JSON schema response", async () => {
    console.log("\n🧪 Testing LLM API with JSON schema...");
    
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: "Extract the name and age: 'My name is Alice and I am 30 years old.'"
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "person_info",
            strict: true,
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                age: { type: "number" }
              },
              required: ["name", "age"],
              additionalProperties: false
            }
          }
        }
      });

      console.log("✅ LLM API JSON Response received:");
      console.log("Response:", response.choices[0].message.content);
      
      const parsed = JSON.parse(response.choices[0].message.content as string);
      console.log("Parsed:", parsed);
      
      expect(response).toBeDefined();
      expect(parsed.name).toBe("Alice");
      expect(parsed.age).toBe(30);
      
    } catch (error) {
      console.error("❌ LLM API JSON schema call failed:");
      console.error(error);
      throw error;
    }
  }, 30000); // 30 second timeout
});
