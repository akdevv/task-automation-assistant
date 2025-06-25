"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const tools = [
	{
		name: "Weather",
		description:
			"Get current weather information for any location worldwide",
		example: "What's the weather like in New York?",
		icon: "🌤️",
	},
	{
		name: "Calculator",
		description:
			"Perform mathematical calculations and arithmetic operations",
		example: "Calculate 125 * 8 + 45",
		icon: "🔢",
	},
	{
		name: "File Reader",
		description:
			"Read, parse, and analyze uploaded files including JSON, CSV, text, and markdown",
		example: "Upload a CSV file to analyze data",
		icon: "📄",
	},
];

export default function WelcomeScreen() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
					Task Automation Assistant
				</h1>
				<p className="text-lg text-muted-foreground max-w-2xl">
					Your intelligent AI assistant equipped with powerful tools
					to help you automate tasks, get information, and analyze
					data.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
				{tools.map((tool, index) => (
					<Card
						key={index}
						className="hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/20"
					>
						<CardHeader className="text-center">
							<div className="text-4xl mb-2">{tool.icon}</div>
							<CardTitle className="text-xl">
								{tool.name}
							</CardTitle>
						</CardHeader>
						<CardContent className="text-center">
							<CardDescription className="mb-3 text-sm leading-relaxed">
								{tool.description}
							</CardDescription>
							<div className="bg-muted p-3 rounded-lg">
								<p className="text-xs text-muted-foreground mb-1">
									Example:
								</p>
								<p className="text-sm italic">
									"{tool.example}"
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="mt-8 text-center">
				<p className="text-muted-foreground">
					Start a conversation by typing a message or uploading a file
					below
				</p>
			</div>
		</div>
	);
}
