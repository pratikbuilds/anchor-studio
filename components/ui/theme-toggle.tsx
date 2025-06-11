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

function IconSolana(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/solana.svg"
      alt="Solana"
      width="20"
      height="20"
      className="size-5"
      {...props}
    />
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
