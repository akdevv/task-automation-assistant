"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput from "@/components/chat-input";
import type { Message } from "@/types/message";

export default function Home() {
	const [input, setInput] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
		null
	);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const sendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			id: `user_${Date.now().toString()}`,
			content: input,
			role: "user",
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		// placeholder assistant message for streaming
		const assistantMessageId = `assistant_${(Date.now() + 1).toString()}`;
		const assistantMessage: Message = {
			id: assistantMessageId,
			content: "",
			role: "assistant",
			timestamp: new Date(),
			isStreaming: true,
		};
		setMessages((prev) => [...prev, assistantMessage]);
		setStreamingMessageId(assistantMessageId);

		// create abort controller for streaming
		abortControllerRef.current = new AbortController();

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userMessage: userMessage.content }),
				signal: abortControllerRef.current?.signal,
			});

			if (!res.ok) {
				throw new Error("Failed to fetch");
			}

			// get tools used from headers
			const toolsUsedHeader = res.headers.get("X-Tools-Used");
			const toolsUsed = toolsUsedHeader
				? JSON.parse(toolsUsedHeader)
				: [];

			// stream response
			const reader = res.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("No response stream available");
			}

			let accumulatedContent = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						if (data === "[DONE]") {
							// stream complete
							setMessages((prev) =>
								prev.map((msg) =>
									msg.id === assistantMessageId
										? { ...msg, isStreaming: false }
										: msg
								)
							);
							setStreamingMessageId(null);
							setIsLoading(false);
							return;
						}

						try {
							const parsed = JSON.parse(data);
							if (parsed.content) {
								accumulatedContent += parsed.content;

								// update streaming message content
								setMessages((prev) =>
									prev.map((msg) =>
										msg.id === assistantMessageId
											? {
													...msg,
													content: accumulatedContent,
											  }
											: msg
									)
								);
							}
						} catch (error) {
							console.error("Error parsing JSON:", error);
						}
					}
				}
			}
		} catch (error) {
			console.error("Error sending message:", error);
			if (error instanceof Error && error.name === "AbortError") {
				// req was aborted
				setMessages((prev) =>
					prev.filter((msg) => msg.id !== assistantMessageId)
				);
			} else {
				// update with error message
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === assistantMessageId
							? {
									...msg,
									content:
										"Sorry, I encountered an error. Please try again.",
									isStreaming: false,
							  }
							: msg
					)
				);
			}

			setStreamingMessageId(null);
			setIsLoading(false);
		}
	};

	const stopGeneration = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			setIsLoading(false);
			setStreamingMessageId(null);
		}
	};

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex flex-col h-screen">
			<div className="relative h-full w-full">
				<ScrollArea className="flex-1 overflow-y-auto p-3 h-full pb-40">
					<div className="max-w-4xl mx-auto">
						<div className="flex flex-col gap-2">
							{messages.map((msg) => (
								<div key={msg.id} className="mb-4">
									<p>Role: {msg.role}</p>
									<p>Content: {msg.content}</p>
									<p>
										Timestamp:{" "}
										{msg.timestamp.toLocaleString()}
									</p>
									<p>
										Is Streaming:{" "}
										{msg.isStreaming ? "Yes" : "No"}
									</p>
								</div>
							))}
						</div>
						{messages.length === 0 && (
							<div className="flex items-center justify-center h-full">
								<p className="text-muted-foreground">
									No messages yet. Start a conversation!
								</p>
							</div>
						)}
					</div>
				</ScrollArea>

				<div className="fixed bottom-0 w-full">
					<div className="pb-3 px-3 bg-background mx-auto max-w-4xl">
						<ChatInput
							input={input}
							setInput={setInput}
							isLoading={isLoading}
							onSendMessage={sendMessage}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
