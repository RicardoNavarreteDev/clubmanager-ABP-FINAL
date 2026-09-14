// Este archivo conecta los formularios web con la API real usando el token de la sesion actual.
(function () {
  const root = document.body;
  const authToken = root?.dataset?.authToken || "";

  const isAuthenticated = root?.dataset?.isAuthenticated === "true";

  const isPlayerRoleOption = (select) => {
    const selectedOption = select?.selectedOptions?.[0];
    return selectedOption ? selectedOption.textContent.trim().toLowerCase() === "player" : false;
  };

  const getStatusElement = (form) => form?.querySelector("[data-form-status]");

  const clearFieldErrors = (form) => {
    form?.querySelectorAll("[data-field-error]").forEach((element) => {
      element.textContent = "";
    });

    form?.querySelectorAll(".is-invalid").forEach((field) => {
      field.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    });
  };

  const setFieldError = (form, fieldName, message) => {
    const field = form?.elements?.namedItem(fieldName);
    const errorElement = form?.querySelector(`[data-field-error="${fieldName}"]`);

    if (errorElement && !errorElement.id) {
      errorElement.id = `err-${fieldName}-${form.id || "form"}`;
    }

    if (field instanceof HTMLElement) {
      field.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");
      if (errorElement?.id) {
        field.setAttribute("aria-describedby", errorElement.id);
      }
    }

    if (errorElement) {
      errorElement.textContent = message;
    }
  };

  const focusFirstInvalidField = (form) => {
    form?.querySelector("[aria-invalid='true']")?.focus({ preventScroll: true });
  };

  const setStatusMessage = (form, message, tone = "") => {
    const statusElement = getStatusElement(form);
    if (!statusElement) {
      return;
    }

    statusElement.setAttribute("role", tone === "error" ? "alert" : "status");
    statusElement.textContent = "";
    window.requestAnimationFrame(() => {
      statusElement.textContent = message;
    });
    statusElement.dataset.tone = tone;
  };

  const setFormSavingState = (form, isSaving) => {
    const controls = form?.querySelectorAll("input, textarea, select, button");
    controls?.forEach((control) => {
      control.disabled = isSaving;
    });

    const modal = form?.closest("[data-modal]");
    const submitButton = modal?.querySelector(`.modal-save-button[form="${form.id}"]`) ?? form?.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.disabled = isSaving;
    }
  };

  const handleApiError = async (response) => {
    let body = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    throw new Error(body?.message || "No se pudo completar la solicitud.");
  };

  const apiRequest = async (url, options = {}) => {
    const headers = new Headers(options.headers || {});

    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const closeOwningModal = (form) => {
    const modal = form.closest("[data-modal]");
    if (modal && typeof window.closeModal === "function") {
      window.closeModal(modal);
    }
  };

  const reloadAfterDelay = (ms = 450) => {
    window.setTimeout(() => {
      window.location.reload();
    }, ms);
  };

  const handleProfileFormSubmit = async (form) => {
    clearFieldErrors(form);
    setStatusMessage(form, "Guardando cambios...", "neutral");
    setFormSavingState(form, true);

    try {
      const payload = {
        displayName: form.elements.displayName.value,
        bio: form.elements.bio.value,
        location: form.elements.location.value,
        birthDate: form.elements.birthDate.value,
      };

      await apiRequest("/api/auth/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setStatusMessage(form, "Perfil actualizado correctamente.", "success");
      closeOwningModal(form);
      reloadAfterDelay();
    } catch (error) {
      setStatusMessage(form, error.message, "error");
      setFormSavingState(form, false);
    }
  };

  const handleEmailFormSubmit = async (form) => {
    clearFieldErrors(form);
    setStatusMessage(form, "Actualizando correo...", "neutral");
    setFormSavingState(form, true);

    try {
      await apiRequest("/api/auth/me/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentEmail: form.elements.currentEmail.value,
          newEmail: form.elements.newEmail.value,
          confirmEmail: form.elements.confirmEmail.value,
        }),
      });

      setStatusMessage(form, "Correo actualizado correctamente.", "success");
      closeOwningModal(form);
      reloadAfterDelay();
    } catch (error) {
      setStatusMessage(form, error.message, "error");
      setFormSavingState(form, false);
    }
  };

  const handlePasswordFormSubmit = async (form) => {
    clearFieldErrors(form);
    setStatusMessage(form, "Actualizando password...", "neutral");
    setFormSavingState(form, true);

    try {
      await apiRequest("/api/auth/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: form.elements.currentPassword.value,
          newPassword: form.elements.newPassword.value,
          confirmPassword: form.elements.confirmPassword.value,
        }),
      });

      setStatusMessage(form, "Password actualizada correctamente.", "success");
      closeOwningModal(form);
      reloadAfterDelay();
    } catch (error) {
      setStatusMessage(form, error.message, "error");
      setFormSavingState(form, false);
    }
  };

  const populatePlayerEditForm = (button) => {
    const form = document.querySelector("[data-player-edit-form]");
    if (!form || !button) {
      return;
    }

    form.elements.playerId.value = button.dataset.playerId || "";
    form.elements.name.value = button.dataset.playerName || "";
    form.elements.position.value = button.dataset.playerPosition || "";
    form.elements.number.value = button.dataset.playerNumber || "";
    form.elements.bio.value = button.dataset.playerBio || "";
    form.elements.location.value = button.dataset.playerLocation || "";
    form.elements.birthDate.value = button.dataset.playerBirthDate || "";
    clearFieldErrors(form);
    setStatusMessage(form, "", "");
  };

  const populatePlayerStatusForm = (button) => {
    const form = document.querySelector("[data-player-status-form]");
    if (!form || !button) {
      return;
    }

    form.elements.playerId.value = button.dataset.playerId || "";
    form.elements.playerName.value = button.dataset.playerName || "";
    form.elements.rosterStatus.value = button.dataset.playerStatus || "active";
    clearFieldErrors(form);
    setStatusMessage(form, "", "");
  };

  const handlePlayerEditFormSubmit = async (form) => {
    clearFieldErrors(form);
    setStatusMessage(form, "Guardando jugador...", "neutral");
    setFormSavingState(form, true);

    try {
      const playerId = form.elements.playerId.value;

      await apiRequest(`/api/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.elements.name.value,
          position: form.elements.position.value,
          number: form.elements.number.value,
          bio: form.elements.bio.value,
          location: form.elements.location.value,
          birthDate: form.elements.birthDate.value,
        }),
      });

      setStatusMessage(form, "Jugador actualizado correctamente.", "success");
      closeOwningModal(form);
      reloadAfterDelay();
    } catch (error) {
      setStatusMessage(form, error.message, "error");
      setFormSavingState(form, false);
    }
  };

  const handlePlayerStatusFormSubmit = async (form) => {
    clearFieldErrors(form);
    setStatusMessage(form, "Actualizando estado...", "neutral");
    setFormSavingState(form, true);

    try {
      const playerId = form.elements.playerId.value;

      await apiRequest(`/api/players/${playerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rosterStatus: form.elements.rosterStatus.value,
        }),
      });

      setStatusMessage(form, "Estado actualizado correctamente.", "success");
      closeOwningModal(form);
      reloadAfterDelay();
    } catch (error) {
      setStatusMessage(form, error.message, "error");
      setFormSavingState(form, false);
    }
  };

  const syncInvitationCategoryField = () => {
    const select = document.querySelector("[data-invitation-role-select]");
    const categoryField = document.querySelector("[data-invitation-category-field]");
    const categorySelect = document.querySelector("[data-invitation-category-select]");

    if (!select || !categoryField || !categorySelect) {
      return;
    }

    const isPlayer = isPlayerRoleOption(select);
    categoryField.dataset.required = String(isPlayer);
    categorySelect.required = isPlayer;

    if (!isPlayer) {
      categorySelect.value = "";
    }
  };

  const handleInvitationCreateSubmit = async (form) => {
    clearFieldErrors(form);
    setStatusMessage(form, "Creando invitacion...", "neutral");
    setFormSavingState(form, true);

    try {
      await apiRequest("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.elements.email.value,
          name: form.elements.name.value,
          roleId: Number(form.elements.roleId.value),
          primaryCategoryId: form.elements.primaryCategoryId.value || null,
        }),
      });

      setStatusMessage(form, "Invitacion creada correctamente.", "success");
      reloadAfterDelay();
    } catch (error) {
      setStatusMessage(form, error.message, "error");
      setFormSavingState(form, false);
    }
  };

  const handleInvitationStatusSubmit = async (form) => {
    setStatusMessage(form, "Actualizando estado...", "neutral");

    try {
      await apiRequest(`/api/invitations/${form.elements.invitationId.value}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: form.elements.status.value,
        }),
      });

      setStatusMessage(form, "Estado actualizado correctamente.", "success");
      reloadAfterDelay();
    } catch (error) {
      setStatusMessage(form, error.message, "error");
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) {
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    try {
      await apiRequest("/api/auth/me/avatar", {
        method: "POST",
        body: uploadFormData,
      });

      window.location.reload();
    } catch (error) {
      const profileForm = document.querySelector("[data-profile-form]");
      if (profileForm) {
        setStatusMessage(profileForm, error.message, "error");
      }
    }
  };

  document.addEventListener("click", (event) => {
    const avatarTrigger = event.target.closest("[data-avatar-upload-trigger]");
    if (avatarTrigger) {
      document.querySelector("[data-avatar-file-input]")?.click();
      return;
    }

    const editTrigger = event.target.closest("[data-player-edit-open]");
    if (editTrigger) {
      populatePlayerEditForm(editTrigger);
      return;
    }

    const statusTrigger = event.target.closest("[data-player-status-open]");
    if (statusTrigger) {
      populatePlayerStatusForm(statusTrigger);
    }
  });

  document.addEventListener("change", (event) => {
    const fileInput = event.target.closest("[data-avatar-file-input]");
    if (fileInput) {
      const [file] = fileInput.files || [];
      handleAvatarUpload(file).finally(() => {
        fileInput.value = "";
      });
      return;
    }

    const roleSelect = event.target.closest("[data-invitation-role-select]");
    if (roleSelect) {
      syncInvitationCategoryField();
    }
  });

  document.addEventListener("submit", (event) => {
    const profileForm = event.target.closest("[data-profile-form]");
    const settingsForm = event.target.closest("[data-settings-form]");
    const playerEditForm = event.target.closest("[data-player-edit-form]");
    const playerStatusForm = event.target.closest("[data-player-status-form]");
    const invitationCreateForm = event.target.closest("[data-invitation-create-form]");
    const invitationStatusForm = event.target.closest("[data-invitation-status-form]");

    if (!profileForm && !settingsForm && !playerEditForm && !playerStatusForm && !invitationCreateForm && !invitationStatusForm) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (profileForm) {
      handleProfileFormSubmit(profileForm);
      return;
    }

    if (settingsForm?.dataset.settingsForm === "email") {
      handleEmailFormSubmit(settingsForm);
      return;
    }

    if (settingsForm?.dataset.settingsForm === "password") {
      handlePasswordFormSubmit(settingsForm);
      return;
    }

    if (playerEditForm) {
      handlePlayerEditFormSubmit(playerEditForm);
      return;
    }

    if (playerStatusForm) {
      handlePlayerStatusFormSubmit(playerStatusForm);
      return;
    }

    if (invitationCreateForm) {
      handleInvitationCreateSubmit(invitationCreateForm);
      return;
    }

    if (invitationStatusForm) {
      handleInvitationStatusSubmit(invitationStatusForm);
    }
  }, true);

  syncInvitationCategoryField();
})();
