import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext =
  createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => undefined,
  });

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] =
    useState<Theme>(() => {
      const storedTheme =
        localStorage.getItem(
          "sgpbse-theme",
        );

      if (
        storedTheme === "dark" ||
        storedTheme === "light"
      ) {
        return storedTheme;
      }

      return "light";
    });

  useEffect(() => {
    const root =
      document.documentElement;

    root.classList.toggle(
      "dark",
      theme === "dark",
    );

    localStorage.setItem(
      "sgpbse-theme",
      theme,
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previous) =>
      previous === "light"
        ? "dark"
        : "light",
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}