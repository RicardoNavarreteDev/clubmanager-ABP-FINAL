const tabs = [...document.querySelectorAll("[data-auth-tab]")];
const panes = [...document.querySelectorAll("[data-auth-pane]")];

function showAuthPane(name) {
  tabs.forEach(tab => {
    const active = tab.dataset.authTab === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  panes.forEach(pane => {
    const active = pane.dataset.authPane === name;
    pane.classList.toggle("is-active", active);
    pane.hidden = !active;
  });

  document.querySelector(`[data-auth-pane="${name}"] input`)?.focus();
}

tabs.forEach(tab => tab.addEventListener("click", () => showAuthPane(tab.dataset.authTab)));
document.querySelectorAll("[data-auth-show]").forEach(button => {
  button.addEventListener("click", () => showAuthPane(button.dataset.authShow));
});

const requestedPane = new URLSearchParams(window.location.search).get("modal");
showAuthPane(requestedPane === "create-club" ? "register" : "login");
