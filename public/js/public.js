const logoInput = document.querySelector("[data-logo-input]");
const logoPreview = document.querySelector("[data-logo-preview]");

logoInput?.addEventListener("change", () => {
  const [file] = logoInput.files;

  if (!file || !logoPreview) {
    return;
  }

  const imageUrl = URL.createObjectURL(file);
  logoPreview.textContent = "";
  logoPreview.style.backgroundImage = `url("${imageUrl}")`;
});
