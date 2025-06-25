"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";

interface ChatBubbleProps {
	message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
	const isUser = message.role === "user";

	return (
		<div
			className={cn(
				"flex w-full mb-4",
				isUser ? "justify-end" : "justify-start"
			)}
		>
			<div
				className={cn(
					"max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
					isUser
						? "bg-primary text-primary-foreground rounded-br-md"
						: "bg-muted text-foreground rounded-bl-md"
				)}
			>
				<div className="prose prose-sm max-w-none">
					<p className="whitespace-pre-wrap break-words m-0 leading-relaxed">
						{message.content}
					</p>
				</div>

				{message.isStreaming && (
					<div className="flex items-center gap-1 mt-2">
						<div className="flex space-x-1">
							<div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
							<div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]"></div>
							<div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
						</div>
					</div>
				)}

				<div
					className={cn(
						"text-xs mt-2 opacity-70",
						isUser
							? "text-primary-foreground/70"
							: "text-muted-foreground"
					)}
				>
					{message.timestamp.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</div>
		</div>
	);
}
