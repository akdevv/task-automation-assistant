import { NextRequest } from "next/server";
import {
	analyzeToolNeeded,
	createErrorStream,
	generateStreamingRes,
	generateStreamingResWithTools,
} from "@/lib/ai/service";
import { executeTool } from "@/lib/tools/executor";

// Enable edge runtime for streaming
export const runtime = "edge";

export async function POST(req: NextRequest) {
	try {
		const { userMessage } = await req.json();
		if (!userMessage) {
			return new Response(createErrorStream("Message is required"), {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		}

		console.log("processing user message:", userMessage);
		// step 1: analyze if tool is needed
		const toolAnalysis = await analyzeToolNeeded(userMessage);
		console.log("tool analysis:", toolAnalysis);

		// stream res with tools
		if (toolAnalysis.needsTools && toolAnalysis.toolCalls.length > 0) {
			console.log("Tools needed, executing:", toolAnalysis.toolCalls);

			// step 2: execute tool calls
			const toolResults = await executeTool(toolAnalysis.toolCalls);
			console.log("tool results:", toolResults);

			// step 3: generate streaming res with tools
			const stream = await generateStreamingResWithTools(
				userMessage,
				toolResults
			);

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"X-Tools-Used": JSON.stringify(
						toolAnalysis.toolCalls.map((call) => call.toolName)
					),
					"X-Tool-Results": JSON.stringify(
						toolResults.map((r) => ({
							tool: r.toolName,
							success: r.success,
						}))
					),
				},
			});
		} else {
			console.log("No tools needed, generating normal response");

			// stream res without tools
			const stream = await generateStreamingRes(userMessage);

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"X-Tools-Used": JSON.stringify([]),
				},
			});
		}
	} catch (error) {
		console.error("Chat API error:", error);
		return new Response(createErrorStream("Internal server error"), {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	}
}
