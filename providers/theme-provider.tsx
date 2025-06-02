"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="anchor-studio-theme"
      disableTransitionOnChange
      themes={["light", "dark", "solana"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
