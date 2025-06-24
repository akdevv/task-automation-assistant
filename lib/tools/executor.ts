import { getTool } from "./registry";
import { Tool, ToolCall, ToolResult } from "./types";

export const executeTool = async (
	toolCalls: ToolCall[]
): Promise<ToolResult[]> => {
	const results: ToolResult[] = [];

	for (const call of toolCalls) {
		try {
			const result = await executeSingleTool(call);
			results.push(result);
		} catch (error) {
			console.error(`Tool execution failed: ${call.toolName}`, error);
			results.push({
				success: false,
				error: `Failed to execute ${call.toolName}: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
				toolName: call.toolName,
			});
		}
	}

	return results;
};

export const executeSingleTool = async (
	call: ToolCall
): Promise<ToolResult> => {
	const tool = getTool(call.toolName);
	if (!tool) {
		return {
			success: false,
			error: `Tool "${call.toolName}" not found`,
			toolName: call.toolName,
		};
	}

	// validate params
	const validationError = validateToolParams(tool, call.parameters);
	if (validationError) {
		return {
			success: false,
			error: validationError,
			toolName: call.toolName,
		};
	}

	// execute tool with timeout
	return await Promise.race([
		tool.execute(call.parameters),
		createTimeoutPromise(call.toolName, 10000), // 10 seconds timeout
	]);
};

const validateToolParams = (
	tool: Tool,
	params: Record<string, any>
): string | null => {
	for (const param of tool.parameters) {
		if (param.required && !params[param.name]) {
			return `Missing required parameter: ${param.name}`;
		}

		if (params[param.name] && typeof params[param.name] !== param.type) {
			return `Parameter ${param.name} must be of type ${param.type}`;
		}
	}
	return null;
};

const createTimeoutPromise = (
	toolName: string,
	timeout: number
): Promise<ToolResult> => {
	return new Promise((_, reject) => {
		setTimeout(() => {
			reject(
				new Error(`Tool "${toolName}" timed out after ${timeout}ms`)
			);
		}, timeout);
	});
};
