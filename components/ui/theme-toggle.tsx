"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

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
  const themes = [
    { value: "light", label: "Light", icon: <IconSun className="size-5" /> },
    { value: "dark", label: "Dark", icon: <IconMoon className="size-5" /> },
    {
      value: "solana",
      label: "Solana",
      icon: <IconSolana className="size-5" />,
    },
  ];
  const current = themes.find((t) => t.value === theme) || themes[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {current.icon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value}>
              <span className="flex items-center gap-2">
                {t.icon}
                {t.label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
