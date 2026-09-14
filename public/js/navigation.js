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
  let storedPreference = null;
  try {
    storedPreference = window.localStorage.getItem(sidebarStorageKey);
  } catch {
    storedPreference = null;
  }
  setSidebarCollapsed(storedPreference === "true" && window.innerWidth > 768);

  sidebarCollapseButton.addEventListener("click", () => {
    const collapsed = !document.body.classList.contains("sidebar-collapsed");
    setSidebarCollapsed(collapsed);
    try {
      window.localStorage.setItem(sidebarStorageKey, String(collapsed));
    } catch {
      // Sin almacenamiento disponible, se mantiene solo en memoria.
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(false);
    }
  });
}
