"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowUpLong, FaXmark, FaPlus } from "react-icons/fa6";

interface ChatInputProps {
	input: string;
	setInput: (value: string) => void;
	isLoading: boolean;
	onSendMessage: (e: React.FormEvent, uploadedFile?: File) => void;
}

interface UploadedFile {
	file: File;
	name: string;
	size: string;
	type: string;
}

export default function ChatInput({
	input,
	setInput,
	isLoading,
	onSendMessage,
}: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
		}
	}, [input]);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check file size (50MB limit)
		const maxSize = 50 * 1024 * 1024; // 50MB in bytes
		if (file.size > maxSize) {
			alert("File size must be less than 50MB");
			return;
		}

		setUploadedFile({
			file,
			name: file.name,
			size: formatFileSize(file.size),
			type: file.type || "Unknown",
		});

		// Clear the file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeUploadedFile = () => {
		setUploadedFile(null);
	};

	const handleSubmit = (e: React.FormEvent) => {
		onSendMessage(e, uploadedFile?.file);
		setUploadedFile(null); // Clear the uploaded file after sending
	};

	return (
		<div className="p-2 bg-primary/30 rounded-lg">
			{/* Uploaded file display */}
			{uploadedFile && (
				<div className="mb-2 p-3 bg-muted rounded-lg border">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
								<span className="text-sm font-medium">📄</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{uploadedFile.name}
								</p>
								<p className="text-xs text-muted-foreground">
									{uploadedFile.size} • {uploadedFile.type}
								</p>
							</div>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={removeUploadedFile}
							className="h-8 w-8 p-0 hover:bg-destructive/10"
						>
							<FaXmark className="h-3 w-3" />
						</Button>
					</div>
				</div>
			)}

			<div className="p-4 bg-muted rounded-lg">
				<form onSubmit={handleSubmit}>
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
								handleSubmit(e);
							}
						}}
						className="w-full min-h-[44px] sm:min-h-[48px] max-h-[120px] p-2 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground overflow-y-auto"
					/>

					{/* Controls */}
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							{/* File upload button */}
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								className="h-8 w-8 p-0 hover:bg-muted-foreground/10"
								disabled={isLoading}
							>
								<FaPlus className="h-3.5 w-3.5" />
								<span className="sr-only">Upload file</span>
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								className="hidden"
								onChange={handleFileSelect}
								accept=".txt,.json,.csv,.md,.pdf,.doc,.docx"
							/>
						</div>

						{/* Send button */}
						<Button
							type="submit"
							size="icon"
							disabled={
								(!input.trim() && !uploadedFile) || isLoading
							}
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
