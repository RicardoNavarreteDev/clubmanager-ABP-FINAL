(function () {
  const composer = document.querySelector("[data-feed-composer]");
  const authToken = document.body.dataset.authToken || "";

  const request = async (url, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
    const response = await fetch(url, { ...options, headers });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || "No se pudo completar la accion.");
    return body?.data;
  };

  const setComposerType = (type) => {
    const input = composer?.querySelector("[data-feed-type-input]");
    if (!input) return;
    input.value = type;
    composer.querySelectorAll("[data-feed-type]").forEach((button) => button.classList.toggle("active", button.dataset.feedType === type));
    composer.querySelector("[data-feed-photo-panel]").hidden = type !== "photo";
    composer.querySelector("[data-feed-poll-panel]").hidden = type !== "poll";
    composer.querySelector("[data-feed-event-panel]").hidden = type !== "event";
    if (type !== "photo") {
      composer.querySelector("[data-feed-image-input]").value = "";
      composer.querySelector("[data-feed-photo-name]").textContent = "Selecciona una imagen para publicar.";
    }
  };

  composer?.querySelectorAll("[data-feed-type]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentType = composer.querySelector("[data-feed-type-input]").value;
      const type = currentType === button.dataset.feedType ? "text" : button.dataset.feedType;
      setComposerType(type);
      if (type === "photo") composer.querySelector("[data-feed-image-input]").click();
    });
  });

  composer?.querySelector("[data-feed-image-input]")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    composer.querySelector("[data-feed-photo-name]").textContent = file ? file.name : "Selecciona una imagen para publicar.";
  });

  composer?.querySelector("[data-add-poll-option]")?.addEventListener("click", () => {
    const options = composer.querySelectorAll("[data-poll-option]");
    if (options.length >= 10) return;
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Opcion ${options.length + 1}`;
    input.dataset.pollOption = "";
    composer.querySelector("[data-add-poll-option]").before(input);
  });

  composer?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = composer.querySelector("[data-feed-status]");
    if (composer.closest("[data-feed-enabled]")?.dataset.feedEnabled !== "true") {
      status.textContent = "La cuenta demo muestra contenido de ejemplo. Crea un club para publicar de forma persistente.";
      return;
    }
    const formData = new FormData(composer);
    if (formData.get("type") === "poll") {
      const options = [...composer.querySelectorAll("[data-poll-option]")].map((input) => input.value.trim()).filter(Boolean);
      formData.set("pollOptions", JSON.stringify(options));
    }
    status.textContent = "Publicando...";
    try {
      await request("/api/feed", { method: "POST", body: formData });
      window.location.reload();
    } catch (error) {
      status.textContent = error.message;
    }
  });

  document.querySelectorAll("[data-feed-like]").forEach((button) => button.addEventListener("click", async () => {
    try {
      const result = await request(`/api/feed/${button.dataset.postId}/likes`, { method: "POST" });
      button.classList.toggle("active", result.liked);
      button.querySelector("[data-like-count]").textContent = result.likesCount;
    } catch (error) {
      window.alert(error.message);
    }
  }));

  document.querySelectorAll("[data-comments-toggle]").forEach((button) => button.addEventListener("click", () => {
    const panel = button.closest("[data-feed-post]")?.querySelector("[data-comments-panel]");
    panel?.classList.toggle("open");
  }));

  document.querySelectorAll("[data-reply-toggle]").forEach((button) => button.addEventListener("click", () => {
    const form = button.closest(".team-feed-comment")?.querySelector(":scope > [data-feed-reply-form]");
    if (form) form.hidden = !form.hidden;
  }));

  document.querySelectorAll("[data-feed-comment-form], [data-feed-reply-form]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isReply = form.hasAttribute("data-feed-reply-form");
    const url = isReply
      ? `/api/feed/${form.dataset.postId}/comments/${form.dataset.commentId}/replies`
      : `/api/feed/${form.dataset.postId}/comments`;
    try {
      await request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: form.elements.content.value }) });
      window.location.reload();
    } catch (error) {
      window.alert(error.message);
    }
  }));

  document.querySelectorAll("[data-feed-poll-form]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selected = form.querySelector("input[name='optionId']:checked");
    if (!selected) return;
    try {
      await request(`/api/feed/${form.dataset.postId}/votes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ optionId: selected.value }) });
      window.location.reload();
    } catch (error) {
      window.alert(error.message);
    }
  }));
})();
