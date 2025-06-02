"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { Button } from "./button";

// Placeholder Solana icon (can be replaced with an SVG or icon library)
function IconSolana(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <rect width="20" height="20" rx="4" fill="#191A1F" />
      <path d="M5 7h10l-2 2H3l2-2zM7 11h10l-2 2H5l2-2z" fill="#00FFA3" />
      <path d="M5 9h10l-2 2H3l2-2z" fill="#9945FF" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const themes = ["light", "dark", "solana"];
  const icons = {
    light: <IconSun className="size-5" />,
    dark: <IconMoon className="size-5" />,
    solana: <IconSolana className="size-5" />,
  };
  const nextTheme = () => {
    const idx = themes.indexOf(theme as string);
    setTheme(themes[(idx + 1) % themes.length]);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={nextTheme}
      aria-label="Toggle theme"
    >
      {icons[theme as keyof typeof icons] || <IconSun className="size-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
