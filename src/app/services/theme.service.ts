import { Injectable, signal } from "@angular/core"

type Theme = "light" | "dark"

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private storageKey = "booktracker-theme"
  currentTheme = signal<Theme>("light")

  constructor() {
    this.initTheme()
  }

  private initTheme(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem(this.storageKey) as Theme | null

    // Check for system preference if no saved preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      this.setTheme(prefersDark ? "dark" : "light")
      return
    }

    this.setTheme(savedTheme)
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme)
    localStorage.setItem(this.storageKey, theme)

    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme")
    } else {
      document.documentElement.classList.remove("dark-theme")
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === "light" ? "dark" : "light"
    this.setTheme(newTheme)
  }
}