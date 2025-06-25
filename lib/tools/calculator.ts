import { Tool, ToolResult } from "./types";

export const calculatorTool: Tool = {
	name: "calculator",
	description:
		"Perform mathematical calculations and arithmetic operations. Use when users ask for math problems, calculations, or numerical computations.",
	parameters: [
		{
			name: "expression",
			type: "string",
			description:
				'Mathematical expression to evaluate (e.g., "2 + 2", "10 * 5 - 3", "100 / 4", "(5 + 3) * 2")',
			required: true,
		},
	],
	execute: async (params: Record<string, any>): Promise<ToolResult> => {
		try {
			const { expression } = params;
			if (!expression) {
				return {
					success: false,
					error: "Expression parameter is required",
					toolName: "calculator",
				};
			}

			const validExpression = /^[0-9+\-*/.()% ]+$/.test(
				expression.replace(/\s/g, "")
			);
			if (!validExpression) {
				return {
					success: false,
					error: "Invalid mathematical expression. Only numbers and basic operators (+, -, *, /, %, parentheses) are allowed.",
					toolName: "calculator",
				};
			}

			// check for dangerous patterns
			if (expression.includes("..") || expression.includes("__")) {
				return {
					success: false,
					error: "Dangerous pattern detected. Please use a safe expression.",
					toolName: "calculator",
				};
			}

			try {
				// safe eval using function
				const sanitized = expression.replace(/[^0-9+\-*/.()% ]/g, "");
				const result = Function(
					`"use strict"; return (${sanitized})`
				)();

				if (typeof result !== "number" || !isFinite(result)) {
					return {
						success: false,
						error: "Calculation resulted in invalid number",
						toolName: "calculator",
					};
				}

				return {
					success: true,
					data: {
						expression: expression,
						result: Number(result.toFixed(10)), // Prevent floating point precision issues
						formatted: `${expression} = ${result}`,
						timestamp: new Date().toISOString(),
					},
					toolName: "calculator",
				};
			} catch (evalError) {
				return {
					success: false,
					error: "Invalid mathematical expression or division by zero",
					toolName: "calculator",
				};
			}
		} catch (error) {
			console.error("Calculator tool error:", error);
			return {
				success: false,
				error: "Failed to perform calculation. Please try again.",
				toolName: "calculator",
			};
		}
	},
};
