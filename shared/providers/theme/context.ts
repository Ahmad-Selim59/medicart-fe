import { createContext } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
	resolvedMode: "light" | "dark";
	toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
