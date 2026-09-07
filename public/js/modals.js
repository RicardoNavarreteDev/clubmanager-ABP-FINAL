// Este archivo maneja las aperturas, cierres y transiciones de los modales del frontend.
if (window.gsap && window.Flip && window.CustomEase) {
  gsap.registerPlugin(Flip, CustomEase);
  CustomEase.create(
    "modalArchiveEase",
    "M0,0 C0.305,0.206 0.116,0.567 0.3,0.8 0.394,0.921 0.491,1 1,1",
  );
}

const modalArchiveDuration = 0.6;

function getMobileNavToggle() {
  return document.querySelector("[data-mobile-nav-toggle]");
}

function getMobileNavPanel() {
  return document.querySelector("[data-mobile-nav-panel]");
}

function getMobileNavBackdrop() {
  return document.querySelector("[data-mobile-nav-backdrop]");
}

function isMobileNavOpen() {
  return document.body.classList.contains("mobile-nav-open");
}

function closeMobileNav() {
  document.body.classList.remove("mobile-nav-open");

  const toggle = getMobileNavToggle();
  const backdrop = getMobileNavBackdrop();

  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu de navegacion");
  }

  if (backdrop) {
    backdrop.hidden = true;
  }
}

function openMobileNav() {
  document.body.classList.add("mobile-nav-open");

  const toggle = getMobileNavToggle();
  const backdrop = getMobileNavBackdrop();

  if (toggle) {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menu de navegacion");
  }

  if (backdrop) {
    backdrop.hidden = false;
  }
}

function toggleMobileNav() {
  if (isMobileNavOpen()) {
    closeMobileNav();
    return;
  }

  openMobileNav();
}

function getModal(modalName) {
  return document.querySelector(`[data-modal="${modalName}"]`);
}

function getModalPanel(modal) {
  return modal?.querySelector(".modal-panel");
}

function getModalArchiveElements(modal) {
  return modal?.querySelectorAll("[data-modal-archive-item]");
}

function usesArchiveEffect(modal) {
  return modal?.hasAttribute("data-modal-archive");
}

function populateEventDetailModal(trigger) {
  const modal = getModal("event-detail-modal");
  if (!modal || !trigger) {
    return null;
  }

  const detailTag = modal.querySelector("[data-event-detail-tag]");
  if (detailTag) {
    detailTag.classList.remove("event-tag-positive", "event-tag-negative", "event-tag-neutral");
    detailTag.classList.add(`event-tag-${trigger.dataset.eventTagTone ?? "neutral"}`);
  }

  const detailResult = modal.querySelector("[data-event-detail-result]");
  if (detailResult) {
    detailResult.classList.remove("event-result-positive", "event-result-negative", "event-result-neutral");
    detailResult.classList.add(`event-result-${trigger.dataset.eventTagTone ?? "neutral"}`);
  }

  const mappings = [
    ["[data-event-detail-tag]", "eventTag"],
    ["[data-event-detail-type]", "eventType"],
    ["[data-event-detail-heading]", "eventTitle"],
    ["[data-event-detail-subtitle]", "eventSubtitle"],
    ["[data-event-detail-date]", "eventDate"],
    ["[data-event-detail-time]", "eventTime"],
    ["[data-event-detail-location]", "eventLocation"],
    ["[data-event-detail-condition]", "eventCondition"],
    ["[data-event-detail-result]", "eventResult"],
  ];

  mappings.forEach(([selector, key]) => {
    const target = modal.querySelector(selector);
    if (target) {
      target.textContent = trigger.dataset[key] ?? "-";
    }
  });

  return modal;
}

function populateChampionshipDetailModal(trigger) {
  const modal = getModal("championship-detail-modal");
  if (!modal || !trigger) {
    return null;
  }

  const statusTag = modal.querySelector("[data-championship-detail-status]");
  if (statusTag) {
    statusTag.classList.remove("event-tag-positive", "event-tag-negative", "event-tag-neutral");
    statusTag.classList.add(`event-tag-${trigger.dataset.championshipStatusTone ?? "neutral"}`);
    statusTag.textContent = trigger.dataset.championshipStatus ?? "-";
  }

  const mappings = [
    ["[data-championship-detail-season]", "championshipSeason", (value) => `Temporada ${value}`],
    ["[data-championship-detail-name]", "championshipName"],
    ["[data-championship-detail-description]", "championshipDescription"],
    ["[data-championship-detail-category]", "championshipCategory"],
    ["[data-championship-detail-venue]", "championshipVenue"],
    ["[data-championship-detail-start]", "championshipStart"],
    ["[data-championship-detail-end]", "championshipEnd"],
    ["[data-championship-detail-variable]", "championshipVariable"],
    ["[data-championship-detail-players]", "championshipPlayers"],
  ];

  mappings.forEach(([selector, key, formatter]) => {
    const target = modal.querySelector(selector);
    if (!target) {
      return;
    }

    const rawValue = trigger.dataset[key] ?? "-";
    target.textContent = formatter ? formatter(rawValue) : rawValue;
  });

  return modal;
}

function getModalForm(modal) {
  return modal?.querySelector("[data-settings-form]");
}

function getStatusElement(form) {
  return form?.querySelector("[data-form-status]");
}

function getCommentCountTriggers(modalName) {
  return document.querySelectorAll(`[data-modal-open="${modalName}"] [data-feed-comment-count], [data-modal-open="${modalName}"][data-feed-comment-count]`);
}

function setStatusMessage(form, message, tone = "") {
  const statusElement = getStatusElement(form);
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.dataset.tone = tone;
}

function clearFieldErrors(form) {
  if (!form) {
    return;
  }

  const errorElements = form.querySelectorAll("[data-field-error]");
  errorElements.forEach((element) => {
    element.textContent = "";
  });

  const invalidFields = form.querySelectorAll(".is-invalid");
  invalidFields.forEach((field) => {
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
  });
}

function setFieldError(form, fieldName, message) {
  const input = form?.elements?.namedItem(fieldName);
  const errorElement = form?.querySelector(`[data-field-error="${fieldName}"]`);

  if (input instanceof HTMLElement) {
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
  }

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function setFormSavingState(form, isSaving) {
  if (!form) {
    return;
  }

  const modal = form.closest("[data-modal]");
  const saveButton = modal?.querySelector(`.modal-save-button[form="${form.id}"]`);
  const fields = form.querySelectorAll("input, textarea, select, button");

  form.dataset.saving = String(isSaving);

  fields.forEach((field) => {
    field.disabled = isSaving;
  });

  if (saveButton) {
    saveButton.disabled = isSaving;
    saveButton.textContent = isSaving ? "Guardando..." : "Guardar";
  }
}

function resetSettingsForm(form) {
  if (!form) {
    return;
  }

  form.reset();
  clearFieldErrors(form);
  setStatusMessage(form, "", "");
  setFormSavingState(form, false);
}

function validatePasswordForm(form) {
  const currentPassword = String(form.elements.currentPassword.value || "").trim();
  const newPassword = String(form.elements.newPassword.value || "").trim();
  const confirmPassword = String(form.elements.confirmPassword.value || "").trim();
  let isValid = true;

  clearFieldErrors(form);
  setStatusMessage(form, "", "");

  if (currentPassword.length < 8) {
    setFieldError(form, "currentPassword", "Ingresa tu contrasena actual completa.");
    isValid = false;
  }

  if (newPassword.length < 8) {
    setFieldError(form, "newPassword", "La nueva contrasena debe tener al menos 8 caracteres.");
    isValid = false;
  }

  if (newPassword && currentPassword && newPassword === currentPassword) {
    setFieldError(form, "newPassword", "La nueva contrasena debe ser distinta de la actual.");
    isValid = false;
  }

  if (confirmPassword !== newPassword) {
    setFieldError(form, "confirmPassword", "La confirmacion no coincide con la nueva contrasena.");
    isValid = false;
  }

  if (!isValid) {
    setStatusMessage(form, "Revisa los campos marcados antes de guardar.", "error");
  }

  return isValid;
}

function validateEmailForm(form) {
  const currentEmail = String(form.elements.currentEmail.value || "").trim();
  const newEmail = String(form.elements.newEmail.value || "").trim();
  const confirmEmail = String(form.elements.confirmEmail.value || "").trim();
  let isValid = true;

  clearFieldErrors(form);
  setStatusMessage(form, "", "");

  if (!currentEmail || !currentEmail.includes("@")) {
    setFieldError(form, "currentEmail", "Ingresa un correo actual valido.");
    isValid = false;
  }

  if (!newEmail || !newEmail.includes("@")) {
    setFieldError(form, "newEmail", "Ingresa un nuevo correo valido.");
    isValid = false;
  }

  if (newEmail && currentEmail && newEmail.toLowerCase() === currentEmail.toLowerCase()) {
    setFieldError(form, "newEmail", "El nuevo correo debe ser distinto del actual.");
    isValid = false;
  }

  if (confirmEmail.toLowerCase() !== newEmail.toLowerCase()) {
    setFieldError(form, "confirmEmail", "La confirmacion no coincide con el nuevo correo.");
    isValid = false;
  }

  if (!isValid) {
    setStatusMessage(form, "Revisa los campos marcados antes de guardar.", "error");
  }

  return isValid;
}

function validateSettingsForm(form) {
  if (!form) {
    return false;
  }

  if (form.dataset.settingsForm === "password") {
    return validatePasswordForm(form);
  }

  if (form.dataset.settingsForm === "email") {
    return validateEmailForm(form);
  }

  return true;
}

function handleSettingsFormSubmit(form) {
  if (!validateSettingsForm(form)) {
    return;
  }

  setFormSavingState(form, true);
  setStatusMessage(form, "Guardando cambios...", "neutral");

  window.setTimeout(() => {
    setFormSavingState(form, false);
    setStatusMessage(form, "Cambios guardados correctamente.", "success");

    const modal = form.closest("[data-modal]");
    if (!modal) {
      return;
    }

    window.setTimeout(() => {
      resetSettingsForm(form);
      closeModal(modal);
    }, 650);
  }, 850);
}

function getSettingsMenu() {
  return document.querySelector("[data-settings-menu]");
}

function getSettingsMenuToggle() {
  return document.querySelector("[data-settings-menu-toggle]");
}

function closeSettingsMenu() {
  const menu = getSettingsMenu();
  const toggle = getSettingsMenuToggle();

  if (menu) {
    menu.hidden = true;
  }

  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
  }
}

function toggleSettingsMenu() {
  const menu = getSettingsMenu();
  const toggle = getSettingsMenuToggle();

  if (!menu || !toggle) {
    return;
  }

  const isOpen = !menu.hidden;
  menu.hidden = isOpen;
  toggle.setAttribute("aria-expanded", String(!isOpen));
}

function cleanupModal(modal, panel) {
  modal.hidden = true;
  gsap.set(modal, { clearProps: "all" });
  gsap.set(panel, { clearProps: "all" });

  const archiveElements = getModalArchiveElements(modal);
  if (archiveElements?.length) {
    gsap.set(archiveElements, { clearProps: "all" });
  }

  const form = getModalForm(modal);
  if (form) {
    resetSettingsForm(form);
  }

  const originButton = modal._originButton;
  if (originButton) {
    delete originButton.dataset.flipId;
  }

  delete panel.dataset.flipId;
  delete modal._originButton;
}

function openModal(modal, originButton) {
  if (!modal) {
    return;
  }

  if (!originButton) {
    return;
  }

  modal._originButton = originButton;

  const flipId = `modal-${modal.dataset.modal}`;
  originButton.dataset.flipId = flipId;

  const panel = getModalPanel(modal);
  if (!panel) {
    return;
  }

  const isArchiveModal = usesArchiveEffect(modal);

  if (!isArchiveModal) {
    modal.hidden = false;

    gsap.set(modal, { opacity: 0 });
    gsap.set(panel, { opacity: 0, y: -16, scale: 0.97 });

    const timeline = gsap.timeline();

    timeline.to(modal, {
      opacity: 1,
      duration: 0.22,
      ease: "power2.out",
    });

    timeline.to(
      panel,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      },
      "-=0.12",
    );

    return;
  }

  panel.dataset.flipId = flipId;

  const originState = Flip.getState(originButton);

  modal.hidden = false;

  gsap.set(modal, { opacity: 0 });
  gsap.set(panel, { opacity: 1 });

  gsap.to(modal, {
    opacity: 1,
    duration: 0.28,
    ease: "power2.out",
  });

  Flip.from(originState, {
    targets: panel,
    duration: modalArchiveDuration,
    ease: window.CustomEase ? "modalArchiveEase" : "power2.out",
    absolute: true,
    scale: true,
    toggleClass: "pretty-modal-opening",
  });
}

function closeModal(modal) {
  if (!modal) {
    return;
  }

  const panel = getModalPanel(modal);
  if (!panel) {
    return;
  }

  const originButton = modal._originButton;
  const archiveElements = getModalArchiveElements(modal);
  const isArchiveModal = usesArchiveEffect(modal);

  if (!isArchiveModal || !originButton) {
    const timeline = gsap.timeline({
      onComplete: () => cleanupModal(modal, panel),
    });

    timeline.to(panel, {
      opacity: 0,
      y: -16,
      scale: 0.97,
      duration: 0.3,
      ease: "power2.in",
    });

    timeline.to(
      modal,
      {
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
      },
      "-=0.12",
    );
    return;
  }

  const flipId = `modal-${modal.dataset.modal}`;
  originButton.dataset.flipId = flipId;
  panel.dataset.flipId = flipId;

  const originState = Flip.getState(originButton);

  if (archiveElements?.length) {
    gsap.to(archiveElements, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      ease: "power2.in",
      stagger: 0.02,
    });
  }

  gsap.to(modal, {
    opacity: 0,
    duration: modalArchiveDuration,
    ease: "power2.in",
    delay: 0,
  });

  Flip.to(originState, {
    targets: panel,
    duration: modalArchiveDuration,
    ease: window.CustomEase ? "modalArchiveEase" : "power2.inOut",
    absolute: true,
    scale: true,
    toggleClass: "pretty-modal-closing",
    onComplete: () => cleanupModal(modal, panel),
  });
}

window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener("click", (event) => {
  const settingsToggle = event.target.closest("[data-settings-menu-toggle]");
  if (settingsToggle) {
    toggleSettingsMenu();
    return;
  }

  const mobileNavToggle = event.target.closest("[data-mobile-nav-toggle]");
  if (mobileNavToggle) {
    toggleMobileNav();
    return;
  }

  const mobileNavBackdrop = event.target.closest("[data-mobile-nav-backdrop]");
  if (mobileNavBackdrop) {
    closeMobileNav();
    return;
  }

  const mobileNavLink = event.target.closest(".sidebar .nav-link[href]");
  if (mobileNavLink && window.innerWidth <= 768) {
    closeMobileNav();
  }

  const feedLikeButton = event.target.closest("[data-feed-like-toggle]");
  if (feedLikeButton) {
    const likeCountElement = feedLikeButton.querySelector("[data-feed-like-count]");
    const isActive = feedLikeButton.classList.toggle("is-active");

    if (likeCountElement) {
      const currentCount = Number.parseInt(likeCountElement.textContent || "0", 10);
      likeCountElement.textContent = String(currentCount + (isActive ? 1 : -1));
    }

    return;
  }

  const commentLikeButton = event.target.closest("[data-comment-like-toggle]");
  if (commentLikeButton) {
    const likeCountElement = commentLikeButton.querySelector("[data-comment-like-count]");
    const isActive = commentLikeButton.classList.toggle("is-active");

    if (likeCountElement) {
      const currentCount = Number.parseInt(likeCountElement.textContent || "0", 10);
      likeCountElement.textContent = String(currentCount + (isActive ? 1 : -1));
    }

    return;
  }

  const commentReplyToggle = event.target.closest("[data-comment-reply-toggle]");
  if (commentReplyToggle) {
    const commentCard = commentReplyToggle.closest(".comment-thread-card");
    const replyForm = commentCard?.querySelector("[data-comment-reply-form]");

    if (replyForm) {
      replyForm.hidden = !replyForm.hidden;
    }

    return;
  }

  const commentRepliesToggle = event.target.closest("[data-comment-replies-toggle]");
  if (commentRepliesToggle) {
    const commentCard = commentRepliesToggle.closest(".comment-thread-card");
    const expanded = commentCard?.querySelector("[data-comment-replies-panel]");

    if (expanded) {
      const isOpen = !expanded.hidden;
      expanded.hidden = isOpen;
      commentRepliesToggle.textContent = isOpen
        ? `Ver todas las respuestas (${expanded.children.length})`
        : "Ocultar respuestas";
    }

    return;
  }

  const championshipCardTrigger = event.target.closest("[data-championship-modal-trigger]");
  if (championshipCardTrigger) {
    const modal = populateChampionshipDetailModal(championshipCardTrigger);
    if (modal) {
      openModal(modal, championshipCardTrigger);
    }
    return;
  }

  const eventCardTrigger = event.target.closest("[data-event-modal-trigger]");
  if (eventCardTrigger) {
    const modal = populateEventDetailModal(eventCardTrigger);
    if (modal) {
      openModal(modal, eventCardTrigger);
    }
    return;
  }

  const openButton = event.target.closest("[data-modal-open]");
  if (openButton) {
    const modalName = openButton.getAttribute("data-modal-open");
    const modal = getModal(modalName);

    openModal(modal, openButton);

    return;
  }

  const closeButton = event.target.closest("[data-modal-close]");
  if (closeButton) {
    const modalName = closeButton.getAttribute("data-modal-close");
    const modal = getModal(modalName);

    closeModal(modal);
    return;
  }

  const backdrop = event.target.closest(".modal-backdrop");
  if (backdrop && event.target === backdrop) {
    closeModal(backdrop);
    return;
  }

  const settingsMenu = getSettingsMenu();
  if (settingsMenu && !settingsMenu.hidden && !settingsMenu.contains(event.target)) {
    closeSettingsMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (isMobileNavOpen()) {
    closeMobileNav();
    return;
  }

  const openModalElement = document.querySelector(
    ".modal-backdrop:not([hidden])",
  );
  if (openModalElement) {
    closeModal(openModalElement);
    return;
  }

  closeSettingsMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    const championshipCardTrigger = event.target.closest("[data-championship-modal-trigger]");
    if (championshipCardTrigger) {
      event.preventDefault();

      const modal = populateChampionshipDetailModal(championshipCardTrigger);
      if (modal) {
        openModal(modal, championshipCardTrigger);
      }
      return;
    }
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const eventCardTrigger = event.target.closest("[data-event-modal-trigger]");
  if (!eventCardTrigger) {
    return;
  }

  event.preventDefault();

  const modal = populateEventDetailModal(eventCardTrigger);
  if (modal) {
    openModal(modal, eventCardTrigger);
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-settings-form]");
  if (!form) {
    const commentsComposerForm = event.target.closest("[data-comments-composer-form]");
    if (commentsComposerForm) {
      event.preventDefault();

      const textarea = commentsComposerForm.querySelector("textarea");
      const text = textarea?.value.trim();
      if (!text) {
        return;
      }

      const commentsShell = commentsComposerForm.closest(".comments-thread-shell");
      const list = commentsShell?.querySelector(".comments-thread-list");
      if (list) {
        const comment = document.createElement("article");
        comment.className = "comment-thread-card";
        comment.innerHTML = `
          <div class="comment-thread-header">
            <img src="/images/avatars/profile.svg" alt="Avatar de Ricardo Navarrete" width="80">
            <div>
              <h3>Ricardo Navarrete</h3>
              <p>Jugador · Ahora</p>
            </div>
          </div>
          <p class="comment-thread-content"></p>
          <div class="comment-thread-actions">
            <button type="button" class="comment-action-button" data-comment-like-toggle>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 20.5s-6.5-3.99-8.56-7.16C1.54 10.46 2.2 6.9 5.3 5.48c2.2-1 4.3-.15 5.55 1.55 1.24-1.7 3.35-2.55 5.55-1.55 3.1 1.42 3.76 4.98 1.86 7.86C18.5 16.51 12 20.5 12 20.5Z" />
              </svg>
              <strong data-comment-like-count>0</strong>
            </button>
            <button type="button" class="comment-action-button" data-comment-reply-toggle>Responder</button>
          </div>
          <form class="comment-reply-form" data-comment-reply-form hidden>
            <label class="form-field">
              <span>Responder comentario</span>
              <textarea placeholder="Escribe una respuesta breve"></textarea>
            </label>
            <div class="comment-reply-actions">
              <button type="submit" class="composer-actions-button-primary">Responder</button>
            </div>
          </form>
        `;

        comment.querySelector(".comment-thread-content").textContent = text;
        list.prepend(comment);
      }

      const modal = commentsComposerForm.closest("[data-modal]");
      if (modal) {
        const countTriggers = getCommentCountTriggers(modal.dataset.modal);
        countTriggers.forEach((countElement) => {
          const currentCount = Number.parseInt(countElement.textContent || "0", 10);
          countElement.textContent = String(currentCount + 1);
        });
      }

      textarea.value = "";
      return;
    }

    const replyForm = event.target.closest("[data-comment-reply-form]");
    if (!replyForm) {
      return;
    }

    event.preventDefault();

    const textarea = replyForm.querySelector("textarea");
    if (textarea) {
      textarea.value = "";
    }

    replyForm.hidden = true;
    return;
  }

  event.preventDefault();
  handleSettingsFormSubmit(form);
});
