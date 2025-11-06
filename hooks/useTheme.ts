import { useLocalStorage } from "./useLocalStorage";
import { useEffect } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useLocalStorage<boolean>("theme-dark", false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return {
    theme: isDark ? "dark" : "light",
    toggleTheme,
  };
}
