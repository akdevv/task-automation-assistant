import { Tool } from "./types";
import { weatherTool } from "./weather";
import { calculatorTool } from "./calculator";
import { fileReaderTool } from "./filereader";

const toolsMap = new Map<string, Tool>();

// Initialize with all available tools
toolsMap.set(weatherTool.name, weatherTool);
toolsMap.set(calculatorTool.name, calculatorTool);
toolsMap.set(fileReaderTool.name, fileReaderTool);

export const registerTool = (tool: Tool) => {
	toolsMap.set(tool.name, tool);
};

export const getTool = (name: string): Tool | undefined => {
	return toolsMap.get(name);
};

export const getAllTools = (): Tool[] => {
	return Array.from(toolsMap.values());
};

export const getToolDescriptions = (): string => {
	return getAllTools()
		.map((tool) => {
			const params = tool.parameters
				.map(
					(p) =>
						`${p.name}: ${p.type}${
							p.required ? " (required)" : ""
						} - ${p.description}`
				)
				.join(", ");
			return `${tool.name}: ${tool.description}. Parameters: ${params}`;
		})
		.join("\n");
};
