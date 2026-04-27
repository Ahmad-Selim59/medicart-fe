"use client";

import * as React from "react";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";

const iconMap = {
	light: Sun,
	dark: Moon,
	system: Monitor,
};

const nextMode: Record<string, string> = {
	light: "dark",
	dark: "system",
	system: "light",
};

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" disabled aria-label="Toggle theme">
				<div className="size-4" />
			</Button>
		);
	}

	const Icon = iconMap[resolvedTheme as keyof typeof iconMap] ?? Monitor;

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
			aria-label="Toggle theme"
		>
			<Icon className="size-4" />
		</Button>
	);
}
