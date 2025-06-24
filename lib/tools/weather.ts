import { Tool, ToolResult } from "./types";

export const weatherTool: Tool = {
	name: "weather",
	description:
		"Get current weather information for a specific location. Use this when users ask about weather conditions, temperature, or weather forecasts.",
	parameters: [
		{
			name: "location",
			type: "string",
			description:
				"The city or location to get weather for (e.g., 'New York', 'Paris', 'Tokyo')",
			required: true,
		},
	],
	execute: async (params: Record<string, any>): Promise<ToolResult> => {
		try {
			const { location } = params;
			if (!location) {
				return {
					success: false,
					error: "Location parameter is required",
					toolName: "weather",
				};
			}

			const API_KEY = process.env.OPENWEATHER_API_KEY;
			if (!API_KEY) {
				return {
					success: false,
					error: "Weather API key not configured",
					toolName: "weather",
				};
			}

			const res = await fetch(
				`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
					location
				)}&appid=${API_KEY}&units=metric`
			);

			if (!res.ok) {
				if (res.status === 404) {
					return {
						success: false,
						error: `Location "${location}" not found`,
						toolName: "weather",
					};
				}
				throw new Error(`API request failed: ${res.status}`);
			}

			const weatherData = await res.json();

			return {
				success: true,
				data: {
					location: weatherData.name,
					country: weatherData.sys.country,
					temperature: Math.round(weatherData.main.temp),
					feelsLike: Math.round(weatherData.main.feels_like),
					description: weatherData.weather[0].description,
					humidity: weatherData.main.humidity,
					windSpeed: weatherData.wind.speed,
					timestamp: new Date().toISOString(),
				},
				toolName: "weather",
			};
		} catch (error) {
			console.error("Weather tool error:", error);
			return {
				success: false,
				error: "Failed to fetch weather data. Please try again.",
				toolName: "weather",
			};
		}
	},
};
