"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Wallet } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const themes = [
    { value: "light", label: "Light", icon: <Sun className="size-5" /> },
    { value: "dark", label: "Dark", icon: <Moon className="size-5" /> },
    {
      value: "solana",
      label: "Solana",
      icon: <Wallet className="size-5" />,
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
