const logoInput = document.querySelector("[data-logo-input]");
const logoPreview = document.querySelector("[data-logo-preview]");

let currentLogoObjectUrl = null;

logoInput?.addEventListener("change", () => {
  const [file] = logoInput.files;

  if (!file || !logoPreview) {
    return;
  }

  if (currentLogoObjectUrl) {
    URL.revokeObjectURL(currentLogoObjectUrl);
  }

  const imageUrl = URL.createObjectURL(file);
  currentLogoObjectUrl = imageUrl;
  logoPreview.textContent = "";
  logoPreview.style.backgroundImage = `url("${imageUrl.replace(/"/g, "%22")}")`;
});

const landingModals = document.querySelectorAll("[data-landing-modal]");

function closeLandingModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

function openLandingModal(name) {
  const modal = document.querySelector(`[data-landing-modal="${name}"]`);
  if (!modal) return;
  landingModals.forEach(closeLandingModal);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector("input, select, button")?.focus();
}

document.addEventListener("click", (event) => {
  const openTrigger = event.target.closest("[data-landing-modal-open]");
  if (openTrigger) {
    event.preventDefault();
    openLandingModal(openTrigger.dataset.landingModalOpen);
    return;
  }

  const closeTrigger = event.target.closest("[data-landing-modal-close]");
  if (closeTrigger) {
    closeLandingModal(closeTrigger.closest("[data-landing-modal]"));
    return;
  }

  const backdrop = event.target.closest("[data-landing-modal]");
  if (backdrop && event.target === backdrop) closeLandingModal(backdrop);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeLandingModal(document.querySelector("[data-landing-modal]:not([hidden])"));
});

const requestedModal = new URLSearchParams(window.location.search).get("modal");
if (requestedModal) openLandingModal(requestedModal);
