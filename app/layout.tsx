import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Task Automation Assistant",
	description: "A task automation assistant that uses tools and agents",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`antialiased dark`}>{children}</body>
		</html>
	);
}
