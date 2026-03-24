import {
  ArrowPathRoundedSquareIcon,
  BoltIcon,
  CommandLineIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { authenticatedFetch } from "../lib/api";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Divider } from "./ui/divider";
import { Heading, Subheading } from "./ui/heading";
import { Text } from "./ui/text";
import { Textarea } from "./ui/textarea";

const suggestedPrompts = [
  "Summarize my current month budget and point out anything risky.",
  "Which categories are overspending the fastest right now?",
  "Look at recent transactions and explain what changed this month.",
] as const;

const capabilityItems = [
  "Budgets and budget health",
  "Budget items and category pressure",
  "Transactions and recurring commitments",
] as const;

const formatToolName = (toolName: string) => {
  return toolName
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export function ChatWorkspace() {
  const [input, setInput] = useState("");
  const scrollRegionRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, isLoading, error, connectionStatus, clear } =
    useChat({
      connection: fetchServerSentEvents("/api/chat", {
        credentials: "include",
        fetchClient: authenticatedFetch,
      }),
      initialMessages: [
        {
          id: "chat-welcome",
          role: "assistant",
          parts: [
            {
              type: "text",
              content:
                "Ask about budgets, transactions, recurring commitments, or spending pressure. I can answer from your app data and explain how the numbers connect.",
            },
          ],
        },
      ],
    });

  useEffect(() => {
    const container = scrollRegionRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = input.trim();

    if (!nextMessage || isLoading) {
      return;
    }

    setInput("");

    try {
      await sendMessage(nextMessage);
    } catch {
      setInput(nextMessage);
    }
  };

  const transcriptCount = useMemo(
    () => messages.filter((message) => message.role !== "system").length,
    [messages],
  );

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-6 border-b border-zinc-950/6 pb-8 dark:border-white/8"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Heading>Assistant</Heading>
            <Text>
              Ask direct questions about your budget, spending drift, and recent
              account activity. The assistant is connected to your budget data
              and can reason over the current workspace instead of answering
              generically.
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge color="sky">
              <ArrowPathRoundedSquareIcon className="size-4" />
              {connectionStatus}
            </Badge>
            <Badge color={isLoading ? "amber" : "emerald"}>
              <SparklesIcon className="size-4" />
              {isLoading ? "Responding" : "Ready"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 border-y border-zinc-950/6 py-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,24rem)] dark:border-white/8">
          <div className="space-y-3">
            <Subheading>Suggested asks</Subheading>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  plain
                  disabled={isLoading}
                  onClick={() => setInput(prompt)}
                  className="justify-start"
                >
                  <BoltIcon data-slot="icon" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Subheading>Coverage</Subheading>
            <div className="space-y-2">
              {capabilityItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-950/8 px-4 py-3 dark:border-white/10"
                >
                  <Text className="text-zinc-950 dark:text-white">{item}</Text>
                  <Badge color="zinc">Tool-backed</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="min-h-[42rem] overflow-hidden rounded-[1.75rem] border border-zinc-950/8 bg-linear-to-b from-zinc-50 via-white to-white dark:border-white/10 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950"
        >
          <div className="flex items-center justify-between gap-4 border-b border-zinc-950/6 px-6 py-4 dark:border-white/8">
            <div>
              <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                Conversation
              </div>
              <Text>{transcriptCount} messages in this thread</Text>
            </div>

            <Button plain onClick={() => clear()} disabled={isLoading}>
              Reset
            </Button>
          </div>

          <div
            ref={scrollRegionRef}
            className="max-h-[34rem] space-y-6 overflow-y-auto px-6 py-6"
          >
            {messages.map((message, index) => (
              <motion.article
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  delay: Math.min(index * 0.03, 0.18),
                  ease: "easeOut",
                }}
                className="grid gap-3 sm:grid-cols-[2.75rem_minmax(0,1fr)]"
              >
                <div className="pt-0.5">
                  <Avatar
                    className="size-11 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    initials={message.role === "assistant" ? "AI" : "Y"}
                    alt={message.role === "assistant" ? "Assistant" : "You"}
                  />
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {message.role === "assistant" ? "Assistant" : "You"}
                    </span>
                    <Badge color={message.role === "assistant" ? "sky" : "zinc"}>
                      {message.role}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {message.parts.map((part, partIndex) => {
                      if (part.type === "text") {
                        return (
                          <div
                            key={`${message.id}-text-${partIndex}`}
                            className="max-w-3xl whitespace-pre-wrap text-[15px]/7 text-zinc-700 dark:text-zinc-200"
                          >
                            {part.content}
                          </div>
                        );
                      }

                      if (part.type === "thinking") {
                        return (
                          <div
                            key={`${message.id}-thinking-${partIndex}`}
                            className="rounded-2xl border border-dashed border-zinc-950/10 px-4 py-3 text-sm/6 italic text-zinc-500 dark:border-white/10 dark:text-zinc-400"
                          >
                            Thinking: {part.content}
                          </div>
                        );
                      }

                      if (part.type === "tool-call") {
                        return (
                          <div
                            key={`${message.id}-tool-${part.id}`}
                            className="rounded-2xl border border-zinc-950/8 px-4 py-3 dark:border-white/10"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge color="amber">
                                <CommandLineIcon className="size-4" />
                                {formatToolName(part.name)}
                              </Badge>
                              <Text>
                                {part.state === "approval-requested"
                                  ? "Awaiting approval"
                                  : part.state.replace(/-/g, " ")}
                              </Text>
                            </div>
                          </div>
                        );
                      }

                      if (part.type === "tool-result") {
                        return (
                          <details
                            key={`${message.id}-tool-result-${part.toolCallId}`}
                            className="rounded-2xl border border-zinc-950/8 px-4 py-3 dark:border-white/10"
                          >
                            <summary className="cursor-pointer list-none text-sm font-medium text-zinc-950 dark:text-white">
                              Tool result
                            </summary>
                            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm/6 text-zinc-600 dark:text-zinc-300">
                              {part.content}
                            </pre>
                          </details>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <Divider soft />

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about plan health, category pressure, recent transactions, or recurring commitments."
              rows={3}
              resizable={false}
              disabled={isLoading}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Text>
                The assistant answers from your budget domain tools, not a
                detached generic prompt.
              </Text>
              <Button
                type="submit"
                color="dark/zinc"
                disabled={!input.trim() || isLoading}
              >
                <PaperAirplaneIcon data-slot="icon" />
                Send
              </Button>
            </div>

            {error ? (
              <Text className="text-rose-600 dark:text-rose-400">
                {error.message}
              </Text>
            ) : null}
          </form>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: 0.08, ease: "easeOut" }}
          className="space-y-6"
        >
          <section className="space-y-3 border-b border-zinc-950/6 pb-6 dark:border-white/8">
            <Subheading>How to use it</Subheading>
            <div className="space-y-3">
              <Text>Ask one concrete question at a time for better tool use.</Text>
              <Text>
                Reference a month, category, or recent transaction pattern when
                you want a tighter answer.
              </Text>
              <Text>
                The assistant can explain numbers, but it does not change data
                from this surface.
              </Text>
            </div>
          </section>

          <section className="space-y-3">
            <Subheading>Good prompts</Subheading>
            <div className="space-y-2">
              <PromptExample text="Why is my March budget trending over plan?" />
              <PromptExample text="Which recurring commitments are driving fixed spend?" />
              <PromptExample text="Compare recent transactions against my housing and food budget items." />
            </div>
          </section>
        </motion.aside>
      </div>
    </div>
  );
}

function PromptExample({ text }: { text: string }) {
  return (
    <div className="border-l border-zinc-950/10 pl-4 dark:border-white/10">
      <Text className="text-zinc-600 dark:text-zinc-300">{text}</Text>
    </div>
  );
}
