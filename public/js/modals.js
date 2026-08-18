document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-modal-open]");
  if (openButton) {
    const modalName = openButton.getAttribute("data-modal-open");
    const modal = document.querySelector(`[data-modal="${modalName}"]`);

    if (modal) {
      modal.hidden = false;
    }

    return;
  }

  const closeButton = event.target.closest("[data-modal-close]");
  if (closeButton) {
    const modalName = closeButton.getAttribute("data-modal-close");
    const modal = document.querySelector(`[data-modal="${modalName}"]`);

    if (modal) {
      modal.hidden = true;
    }

    return;
  }

  const backdrop = event.target.closest(".modal-backdrop");
  if (backdrop && event.target === backdrop) {
    backdrop.hidden = true;
    return;
  }

  const accountMenu = document.querySelector(".sidebar-account[open]");
  if (accountMenu && !accountMenu.contains(event.target)) {
    accountMenu.removeAttribute("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const openModal = document.querySelector('.modal-backdrop:not([hidden])');
  if (openModal) {
    openModal.hidden = true;
    return;
  }

  const accountMenu = document.querySelector(".sidebar-account[open]");
  if (accountMenu) {
    accountMenu.removeAttribute("open");
  }
});
