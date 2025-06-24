"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowUpLong } from "react-icons/fa6";

interface ChatInputProps {
	input: string;
	setInput: (value: string) => void;
	isLoading: boolean;
	onSendMessage: (e: React.FormEvent) => void;
}

export default function ChatInput({
	input,
	setInput,
	isLoading,
	onSendMessage,
}: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
		}
	}, [input]);

	return (
		<div className="p-2 bg-primary/30 rounded-lg">
			<div className="p-4 bg-muted rounded-lg">
				<form onSubmit={onSendMessage}>
					<textarea
						ref={textareaRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						style={{ resize: "none" }}
						placeholder="Ask anything..."
						rows={1}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSendMessage(e);
							}
						}}
						className="w-full min-h-[44px] sm:min-h-[48px] max-h-[120px] p-2 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground overflow-y-auto"
					/>

					{/* send button */}
					<div className="flex justify-end">
						<Button
							type="submit"
							size="icon"
							disabled={!input.trim() || isLoading}
							className="h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
						>
							<FaArrowUpLong className="h-3.5 w-3.5" />
							<span className="sr-only">Send message</span>
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
