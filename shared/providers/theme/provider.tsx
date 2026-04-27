import { useCallback, useEffect, useMemo, useState } from "react";

import type { ThemeMode } from "./context";

import { ThemeContext } from "./context";

const STORAGE_KEY = "medicart-theme";

function readStoredMode(): ThemeMode {
	if (typeof localStorage === "undefined")
		return "system";
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function detectSystemDark(): boolean {
	if (typeof window === "undefined")
		return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(resolved: "light" | "dark") {
	document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [mode, setMode] = useState<ThemeMode>(readStoredMode);
	const [systemDark, setSystemDark] = useState<boolean>(detectSystemDark);

	const resolvedMode: "light" | "dark" = useMemo(() => {
		if (mode === "dark")
			return "dark";
		if (mode === "light")
			return "light";
		return systemDark ? "dark" : "light";
	}, [mode, systemDark]);

	useEffect(() => {
		apply(resolvedMode);
	}, [resolvedMode]);

	useEffect(() => {
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => setSystemDark(mql.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, []);

	const updateMode = useCallback((next: ThemeMode) => {
		localStorage.setItem(STORAGE_KEY, next);
		setMode(next);
	}, []);

	const toggle = useCallback(() => {
		updateMode(resolvedMode === "dark" ? "light" : "dark");
	}, [resolvedMode, updateMode]);

	const value = useMemo(
		() => ({ mode, setMode: updateMode, resolvedMode, toggle }),
		[mode, updateMode, resolvedMode, toggle],
	);

	return <ThemeContext value={value}>{children}</ThemeContext>;
}
