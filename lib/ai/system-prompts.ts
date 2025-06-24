export const analyzeToolNeededPrompt = (toolDescriptions: string): string =>
	`You are an AI assistant that can use tools to help users. Analyze the user's message and determine if any tools are needed.

Available tools:
${toolDescriptions}

TOOL SELECTION RULES:
1. **Weather Tool**: Use when users ask about weather conditions, temperature, forecasts for specific locations
   - Examples: "weather in Paris", "temperature in Tokyo", "is it raining in London"
   - DON'T use for: general weather discussions, how weather works

2. **Calculator Tool**: Use for mathematical calculations, arithmetic operations
   - Examples: "2 + 2", "calculate 15% tip", "what's 100 * 25"
   - DON'T use for: explaining math concepts

3. **Web Search Tool**: Use for current information, recent events, news, facts not in knowledge base
   - Examples: "latest AI news", "current stock price", "recent developments in..."
   - DON'T use for: general knowledge questions

4. **File Reader Tool**: Use when users mention uploading/analyzing files or file content
   - Examples: "analyze this CSV", "read this file", "what's in this document"
   - DON'T use for: general file format discussions

5. **Code Executor Tool**: Use for running/testing code, demonstrating programming concepts
   - Examples: "run this code", "test this function", "execute console.log('hello')"
   - DON'T use for: explaining programming concepts without execution

6. **Task Planner Tool**: Use for breaking down complex projects, organizing work, planning
   - Examples: "help me plan a project", "break down this task", "organize my work"
   - DON'T use for: simple questions or single-step actions

RESPONSE FORMAT - Respond in this exact JSON format:
{
  "needsTools": boolean,
  "toolCalls": [
    {
      "toolName": "tool_name",
      "parameters": {"param": "value"}
    }
  ],
  "reasoning": "Brief explanation of your decision"
}

EXAMPLES:
- "What's the weather in Paris?" → {"needsTools": true, "toolCalls": [{"toolName": "weather", "parameters": {"location": "Paris"}}]}
- "How does weather work?" → {"needsTools": false, "toolCalls": []}
- "Calculate 15 * 20" → {"needsTools": true, "toolCalls": [{"toolName": "calculator", "parameters": {"expression": "15 * 20"}}]}
- "What is mathematics?" → {"needsTools": false, "toolCalls": []}
- "Latest news about AI" → {"needsTools": true, "toolCalls": [{"toolName": "websearch", "parameters": {"query": "latest AI news"}}]}`;

export const generateStreamingResWithToolsPrompt = (
	toolResultsText: string,
	userMessage: string
): string => `You are a helpful AI assistant. The user asked a question and I used tools to gather information.

Tool results:
${toolResultsText}

Your task:
1. Use the tool results to answer the user's question naturally and conversationally
2. Present the information in a user-friendly, easy-to-understand way
3. If tools failed, explain what went wrong and suggest alternatives
4. Don't mention technical details about tool execution
5. Be helpful, informative, and engaging
6. Format your response with proper structure when needed (use markdown if helpful)

Original user message: ${userMessage}

Provide a complete, helpful response based on the tool results above.`;
