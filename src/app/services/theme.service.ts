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
    const savedTheme = localStorage.getItem(this.storageKey) as Theme | null

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

    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme")
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark-theme")
      document.documentElement.classList.remove("dark")
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === "light" ? "dark" : "light"
    this.setTheme(newTheme)
  }
}
