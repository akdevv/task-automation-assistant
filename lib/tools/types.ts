export interface ToolParameter {
	name: string;
	type: "string" | "number" | "boolean";
	description: string;
	required: boolean;
}

export interface Tool {
	name: string;
	description: string;
	parameters: ToolParameter[];
	execute: (params: Record<string, any>) => Promise<ToolResult>;
}

export interface ToolResult {
	success: boolean;
	data?: any;
	error?: string;
	toolName: string;
}

export interface ToolCall {
	toolName: string;
	parameters: Record<string, any>;
}

export interface AIToolResponse {
	needsTools: boolean;
	toolCalls: ToolCall[];
	reasoning?: string;
}
