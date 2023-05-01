import React from "react";
import { useTheme } from "next-themes";

export const DarkModeSwitch = () => {
	const { systemTheme, theme, setTheme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;

	return (
		<button
			onClick={() => (theme == "dark" ? setTheme("light") : setTheme("dark"))}
			className="bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-all duration-100 text-white dark:text-zinc-800 px-8 py-3 text-sm md:text-sm rounded-full"
		>
			{currentTheme === "dark" ? "🌞" : "🌙"}
		</button>
	);
};
