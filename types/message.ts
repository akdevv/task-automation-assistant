export interface Message {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: Date;
	toolsUsed?: string[];
	isStreaming?: boolean;
}
