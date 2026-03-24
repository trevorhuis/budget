import {
  chat,
  toServerSentEventsResponse,
  type ModelMessage,
  type UIMessage,
} from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { z } from "zod";

import { buildBudgetChatTools } from "./chat.tools.js";
import { getOpenAiApiKey } from "../../env.js";

const ChatMessageSchema = z.custom<ModelMessage | UIMessage>(
  (value) => typeof value === "object" && value !== null,
  "Invalid chat message",
);

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  conversationId: z.string().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

const jsonError = (error: string, status: number) => {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export async function createChatResponse(
  request: Request,
  { messages, conversationId }: ChatRequest,
  userId: string,
) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return jsonError("OPENAI_API_KEY not configured", 500);
  }

  process.env.OPENAI_API_KEY = apiKey;

  try {
    const abortController = new AbortController();
    request.signal.addEventListener("abort", () => abortController.abort(), {
      once: true,
    });

    const stream = chat({
      adapter: openaiText("gpt-5-mini"),
      messages: messages as Array<any>,
      conversationId,
      systemPrompts: [
        "You are a budgeting assistant. Use the provided tools for any factual questions about budgets, budget items, transactions, and recurring transactions. Do not invent balances, totals, dates, IDs, or transaction details when tool data is available.",
      ],
      tools: buildBudgetChatTools(userId),
      abortController,
    });

    return toServerSentEventsResponse(stream, { abortController });
  } catch (error) {
    console.error(error);
    return jsonError(
      error instanceof Error ? error.message : "An error occurred",
      500,
    );
  }
}
