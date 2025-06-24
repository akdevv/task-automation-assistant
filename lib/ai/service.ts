import Groq from "groq-sdk";
import { getToolDescriptions } from "../tools/registry";
import { AIToolResponse, ToolResult } from "../tools/types";
import {
	analyzeToolNeededPrompt,
	generateStreamingResWithToolsPrompt,
} from "./system-prompts";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

// step: 1 = analyze if tool is needed (non-streaming)
export const analyzeToolNeeded = async (
	userMessage: string
): Promise<AIToolResponse> => {
	const toolDescriptions = getToolDescriptions();
	const systemPrompt = analyzeToolNeededPrompt(toolDescriptions);

	try {
		const res = await groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userMessage },
			],
			model: "gemma2-9b-it",
			temperature: 0.1,
			max_tokens: 500,
			stream: false,
		});

		const content = res.choices[0].message.content;
		if (!content) {
			throw new Error("No content returned from Groq");
		}

		try {
			let cleanedContent = content.trim();

			// remove markdown code blocks if present
			if (cleanedContent.startsWith("```json")) {
				cleanedContent = cleanedContent
					.replace(/^```json\s*/, "")
					.replace(/\s*```$/, "");
			} else if (cleanedContent.startsWith("```")) {
				cleanedContent = cleanedContent
					.replace(/^```\s*/, "")
					.replace(/\s*```$/, "");
			}

			// remove any leading/trailing whitespace again
			cleanedContent = cleanedContent.trim();

			// try to find JSON object if there's extra text
			const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				cleanedContent = jsonMatch[0];
			}

			console.log("Cleaned content for parsing:", cleanedContent);

			const parsed = JSON.parse(cleanedContent) as AIToolResponse;

			// validate parsed response
			if (typeof parsed.needsTools !== "boolean") {
				throw new Error("Invalid needsTools format");
			}
			if (!Array.isArray(parsed.toolCalls)) {
				throw new Error("Invalid toolCalls format");
			}

			// validate each tool call
			for (const toolCall of parsed.toolCalls) {
				if (
					!toolCall.toolName ||
					typeof toolCall.toolName !== "string"
				) {
					throw new Error("Invalid toolCall format");
				}
				if (
					!toolCall.parameters ||
					typeof toolCall.parameters !== "object"
				) {
					throw new Error("Invalid tool parameters format");
				}
			}

			return parsed;
		} catch (parseError) {
			console.error("Failed to parse AI response:", content);
			console.error("Parse error:", parseError);

			// Fallback: try to extract basic info from response
			const needsTools =
				content.toLowerCase().includes("true") &&
				(content.toLowerCase().includes("weather") ||
					content.toLowerCase().includes("calculator") ||
					content.toLowerCase().includes("search"));

			return {
				needsTools: needsTools,
				toolCalls: [],
				reasoning:
					"Failed to parse structured response, using fallback analysis",
			};
		}
	} catch (error) {
		console.error("Error analyzing tool need:", error);
		return {
			needsTools: false,
			toolCalls: [],
			reasoning: "Error occurred during tool analysis",
		};
	}
};
// step: 2 = generate streaming res with tool results
export const generateStreamingResWithTools = (
	userMessage: string,
	toolResults: ToolResult[]
): Promise<ReadableStream> => {
	const toolResultsText = toolResults
		.map((result) => {
			if (result.success) {
				return `${result.toolName} tool result: ${JSON.stringify(
					result.data,
					null,
					2
				)}`;
			} else {
				return `${result.toolName} tool failed: ${result.error}`;
			}
		})
		.join("\n\n");

	const systemPrompt = generateStreamingResWithToolsPrompt(
		toolResultsText,
		userMessage
	);

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const chatCompletion = await groq.chat.completions.create({
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userMessage },
					],
					model: "gemma2-9b-it",
					temperature: 0.7,
					max_tokens: 1500,
					stream: true,
				});

				for await (const chunk of chatCompletion) {
					const content = chunk.choices[0]?.delta?.content || "";
					if (content) {
						controller.enqueue(
							new TextEncoder().encode(
								`data: ${JSON.stringify({
									content,
									type: "content",
								})}\n\n`
							)
						);
					}
				}

				controller.enqueue(
					new TextEncoder().encode("data: [DONE]\n\n")
				);
				controller.close();
			} catch (error) {
				console.error("Streaming error:", error);

				// send error message through stream
				controller.enqueue(
					new TextEncoder().encode(
						`data: ${JSON.stringify({
							content:
								"I apologize, but I encountered an error while processing the tool results. Please try again.",
							type: "error",
						})}\n\n`
					)
				);
				controller.enqueue(
					new TextEncoder().encode("data: [DONE]\n\n")
				);
				controller.close();
			}
		},
	});

	return Promise.resolve(stream);
};

// step 3 = generate normal streaming res (no tool)
export const generateStreamingRes = (
	userMessage: string
): Promise<ReadableStream> => {
	const systemPrompt = `You are a helpful, knowledgeable AI assistant. Respond naturally and conversationally to the user's message. Be informative, engaging, and helpful. Use markdown formatting when it would improve readability.`;

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const chatCompletion = await groq.chat.completions.create({
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userMessage },
					],
					model: "gemma2-9b-it",
					temperature: 0.7,
					max_tokens: 1500,
					stream: true,
				});

				for await (const chunk of chatCompletion) {
					const content = chunk.choices[0]?.delta?.content || "";
					if (content) {
						controller.enqueue(
							new TextEncoder().encode(
								`data: ${JSON.stringify({
									content,
									type: "content",
								})}\n\n`
							)
						);
					}
				}

				controller.enqueue(
					new TextEncoder().encode("data: [DONE]\n\n")
				);
				controller.close();
			} catch (error) {
				console.error("Streaming error:", error);

				// send error message through stream
				controller.enqueue(
					new TextEncoder().encode(
						`data: ${JSON.stringify({
							content:
								"I apologize, but I encountered an error. Please try again.",
							type: "error",
						})}\n\n`
					)
				);
				controller.enqueue(
					new TextEncoder().encode("data: [DONE]\n\n")
				);
				controller.close();
			}
		},
	});

	return Promise.resolve(stream);
};

// utility function to create error stream
export const createErrorStream = (errorMessage: string): ReadableStream => {
	return new ReadableStream({
		start(controller) {
			controller.enqueue(
				new TextEncoder().encode(
					`data: ${JSON.stringify({
						content: errorMessage,
						type: "error",
					})}\n\n`
				)
			);
			controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
			controller.close();
		},
	});
};
