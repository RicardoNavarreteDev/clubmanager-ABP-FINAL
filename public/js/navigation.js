const sidebarCollapseButton = document.querySelector("[data-sidebar-collapse]");
const sidebarStorageKey = "clubmanager-sidebar-collapsed";

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);

  if (sidebarCollapseButton) {
    sidebarCollapseButton.setAttribute("aria-expanded", String(!collapsed));
    sidebarCollapseButton.setAttribute("aria-label", collapsed ? "Expandir navegacion" : "Contraer navegacion");
  }
}

if (sidebarCollapseButton) {
  const storedPreference = window.localStorage.getItem(sidebarStorageKey);
  setSidebarCollapsed(storedPreference === "true" && window.innerWidth > 768);

  sidebarCollapseButton.addEventListener("click", () => {
    const collapsed = !document.body.classList.contains("sidebar-collapsed");
    setSidebarCollapsed(collapsed);
    window.localStorage.setItem(sidebarStorageKey, String(collapsed));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(false);
    }
  });
}
