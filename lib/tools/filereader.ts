import { Tool, ToolResult } from "./types";

export const fileReaderTool: Tool = {
	name: "filereader",
	description:
		"Read, parse, and analyze uploaded files including JSON, CSV, text, and markdown files. Use when users upload files or ask to analyze file content.",
	parameters: [
		{
			name: "fileContent",
			type: "string",
			description: "The content of the file to analyze",
			required: true,
		},
		{
			name: "fileName",
			type: "string",
			description:
				"Name of the file (optional, helps with type detection)",
			required: false,
		},
		{
			name: "fileType",
			type: "string",
			description: "MIME type of the file (optional)",
			required: false,
		},
		{
			name: "action",
			type: "string",
			description:
				'Type of analysis to perform: "analyze", "summarize", or "extract" (default: analyze)',
			required: false,
		},
	],
	execute: async (params: Record<string, any>): Promise<ToolResult> => {
		try {
			const {
				fileContent,
				fileName,
				fileType,
				action = "analyze",
			} = params;
			if (!fileContent) {
				return {
					success: false,
					error: "File content is required",
					toolName: "filereader",
				};
			}

			let analysis: any = {};
			try {
				const detectedType = detectFileType(
					fileName,
					fileType,
					fileContent
				);

				switch (detectedType) {
					case "json":
						analysis = analyzeJsonFile(fileContent);
						break;
					case "csv":
						analysis = analyzeCsvFile(fileContent);
						break;
					case "txt":
						analysis = analyzeTextFile(fileContent);
						break;
					case "markdown":
						analysis = analyzeMarkdownFile(fileContent);
						break;
					default:
						analysis = analyzeGenericFile(fileContent);
						break;
				}

				return {
					success: true,
					data: {
						fileName: fileName || "Unknown",
						fileType: detectedType,
						action: action,
						analysis: analysis,
						timestamp: new Date().toISOString(),
					},
					toolName: "filereader",
				};
			} catch (parseError) {
				return {
					success: false,
					error: `Failed to parse file: ${
						parseError instanceof Error
							? parseError.message
							: "Unknown parsing error"
					}`,
					toolName: "filereader",
				};
			}
		} catch (error) {
			console.error("File reader tool error:", error);
			return {
				success: false,
				error: "Failed to read and analyze file. Please try again.",
				toolName: "filereader",
			};
		}
	},
};

const detectFileType = (
	fileName?: string,
	fileType?: string,
	fileContent?: string
) => {
	if (fileName) {
		const ext = fileName.toLowerCase().split(".").pop();
		if (ext === "json") return "json";
		if (ext === "csv") return "csv";
		if (ext === "md") return "markdown";
		if (ext === "txt") return "txt";
	}

	if (fileType?.includes("json")) return "json";
	if (fileType?.includes("csv")) return "csv";
	if (fileType?.includes("text")) return "txt";

	// Try to detect from content
	if (fileContent) {
		const trimmed = fileContent.trim();
		if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
		if (trimmed.includes(",") && trimmed.includes("\n")) return "csv";
		if (trimmed.includes("#") && trimmed.includes("\n")) return "markdown";
	}

	return "txt";
};

const analyzeJsonFile = (fileContent: string) => {
	const data = JSON.parse(fileContent);
	return {
		type: "JSON",
		structure: Array.isArray(data) ? "array" : typeof data,
		itemCount: Array.isArray(data) ? data.length : Object.keys(data).length,
		keys: Array.isArray(data)
			? "Array items"
			: Object.keys(data).slice(0, 10),
		preview: JSON.stringify(data, null, 2).substring(0, 500),
	};
};

const analyzeCsvFile = (fileContent: string) => {
	const lines = fileContent.split("\n").filter((line) => line.trim());
	const headers = lines[0]?.split(",").map((h) => h.trim()) || [];
	const dataRows = lines.slice(1);

	return {
		type: "CSV",
		rowCount: dataRows.length,
		columnCount: headers.length,
		headers: headers.slice(0, 10),
		preview: lines.slice(0, 5).join("\n"),
		summary: `CSV file with ${dataRows.length} rows and ${headers.length} columns`,
	};
};

const analyzeTextFile = (fileContent: string) => {
	const lines = fileContent.split("\n");
	const words = fileContent.split(/\s+/).filter((w) => w.length > 0);
	const chars = fileContent.length;

	return {
		type: "Text",
		lineCount: lines.length,
		wordCount: words.length,
		characterCount: chars,
		preview: fileContent.substring(0, 500),
		summary: `Text file with ${lines.length} lines, ${words.length} words, and ${chars} characters`,
	};
};

const analyzeMarkdownFile = (fileContent: string) => {
	const lines = fileContent.split("\n");
	const headers = lines.filter((line) => line.trim().startsWith("#"));
	const words = fileContent.split(/\s+/).filter((w) => w.length > 0);

	return {
		type: "Markdown",
		lineCount: lines.length,
		wordCount: words.length,
		headerCount: headers.length,
		headers: headers.slice(0, 10),
		preview: fileContent.substring(0, 500),
		summary: `Markdown file with ${headers.length} headers and ${words.length} words`,
	};
};

const analyzeGenericFile = (fileContent: string) => {
	return {
		type: "Unknown",
		size: fileContent.length,
		preview: fileContent.substring(0, 200),
		summary: `File with ${fileContent.length} characters`,
	};
};
