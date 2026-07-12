function dashboard() {
  return {
    dark: false,
    colorIcons: true,
    init() {
      this.dark =
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      this.colorIcons = localStorage.getItem("iconColor") !== "false";
      this.applyTheme();
      this.applyIcons();
      document.addEventListener("htmx:afterSwap", (e) => {
        if (e.detail.target && e.detail.target.id === "services") {
          this.applyTheme();
          this.applyIcons();
        }
      });
    },
    applyTheme() {
      document.documentElement.classList.toggle("dark", this.dark);
    },
    iconUrl(slug) {
      if (this.colorIcons) {
        return "https://cdn.simpleicons.org/" + slug;
      }
      return "https://cdn.simpleicons.org/" + slug + "/" + (this.dark ? "e2e8f0" : "0f172a");
    },
    applyIcons() {
      document.querySelectorAll("img[data-icon]").forEach((img) => {
        img.src = this.iconUrl(img.getAttribute("data-icon"));
      });
    },
    toggleTheme() {
      this.dark = !this.dark;
      localStorage.setItem("theme", this.dark ? "dark" : "light");
      this.applyTheme();
      this.applyIcons();
    },
    toggleIcons() {
      this.colorIcons = !this.colorIcons;
      localStorage.setItem("iconColor", this.colorIcons ? "true" : "false");
      this.applyIcons();
    },
  };
}

window.dashboard = dashboard;
