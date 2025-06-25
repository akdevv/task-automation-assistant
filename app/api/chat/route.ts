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
		const { userMessage, uploadedFile } = await req.json();
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
		console.log(
			"uploaded file:",
			uploadedFile ? uploadedFile.name : "none"
		);

		let toolAnalysis;
		let finalMessage = userMessage;

		// If a file is uploaded, automatically use the file reader tool
		if (uploadedFile) {
			console.log("File uploaded, using file reader tool");
			toolAnalysis = {
				needsTools: true,
				toolCalls: [
					{
						toolName: "filereader",
						parameters: {
							fileContent: uploadedFile.content,
							fileName: uploadedFile.name,
							fileType: uploadedFile.type,
							action: "analyze",
						},
					},
				],
				reasoning:
					"User uploaded a file, analyzing with file reader tool",
			};

			// Enhance the user message with file context
			finalMessage = `${userMessage}\n\n[File uploaded: ${
				uploadedFile.name
			} (${Math.round(uploadedFile.size / 1024)} KB)]`;
		} else {
			// step 1: analyze if tool is needed
			toolAnalysis = await analyzeToolNeeded(userMessage);
		}

		console.log("tool analysis:", toolAnalysis);

		// stream res with tools
		if (toolAnalysis.needsTools && toolAnalysis.toolCalls.length > 0) {
			console.log("Tools needed, executing:", toolAnalysis.toolCalls);

			// step 2: execute tool calls
			const toolResults = await executeTool(toolAnalysis.toolCalls);
			console.log("tool results:", toolResults);

			// step 3: generate streaming res with tools
			const stream = await generateStreamingResWithTools(
				finalMessage,
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
			const stream = await generateStreamingRes(finalMessage);

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
