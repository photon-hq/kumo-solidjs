import { Show, createEffect, createSignal, onCleanup } from "solid-js";

import { Button } from "@photon-ai/kumo-solid";
import { SunIcon, MoonIcon } from "~/components/icons";

export function ThemeToggle() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");
  const [mounted, setMounted] = createSignal(false);

  createEffect(() => {
    const getCurrentTheme = () => {
      const mode = document.documentElement.getAttribute("data-mode");
      if (mode === "dark" || mode === "light") return mode;

      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored;

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<{ theme?: "light" | "dark" }>)
        .detail?.theme;
      if (nextTheme === "dark" || nextTheme === "light") {
        setTheme(nextTheme);
      }
    };

    setMounted(true);
    setTheme(getCurrentTheme());
    window.addEventListener("kumo:theme-change", handleThemeChange);

    onCleanup(() => {
      window.removeEventListener("kumo:theme-change", handleThemeChange);
    });
  });

  const toggleTheme = () => {
    const newTheme = theme() === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-mode", newTheme);
    window.dispatchEvent(
      new CustomEvent("kumo:theme-change", { detail: { theme: newTheme } }),
    );
  };

  return (
    <Show
      when={mounted()}
      fallback={
        <Button variant="ghost" shape="square" aria-label="Toggle theme">
          <SunIcon size={20} />
        </Button>
      }
    >
      <Button
        variant="ghost"
        shape="square"
        aria-label={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
        title="Toggle theme (D)"
        onClick={toggleTheme}
      >
        {theme() === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
      </Button>
    </Show>
  );
}
