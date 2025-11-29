import { apiStore } from "../store.js";
import { debounce, updateBackground } from "../utils.js";

export const renderHome = (app) => {
  app.innerHTML = `
        <div id="background" class="h-screen bg-black bg-cover bg-center fixed top-0 left-0 right-0 bottom-0 -z-10"></div>
        <div class="h-screen overflow-hidden flex flex-col justify-center items-center p-4 relative z-0">
            <nav class="absolute top-0 left-0 right-0 p-4 flex items-center glass-effect z-10">
                <md-text-button id="doc-button" class="glass-effect" style="--md-text-button-label-text-color: currentColor;">文档</md-text-button>
                <div class="flex-grow"></div>
                <md-text-button id="download-link" class="hidden glass-effect" style="--md-text-button-label-text-color: currentColor;">下载今日4K</md-text-button>
            </nav>
            <h1 id="title" class="text-5xl font-bold text-center"></h1>
            <div id="copyright" class="absolute bottom-4 right-4 text-sm glass-effect p-2"></div>
        </div>
    `;

  const docButton = document.getElementById("doc-button");
  const goToDoc = () => {
    window.location.hash = "/doc";
  };
  docButton.addEventListener("click", goToDoc);

  const downloadLink = document.getElementById("download-link");
  const downloadHandler = (e) => {
    e.preventDefault();
    const { background: imageData } = apiStore;
    if (!imageData) return;
    const uhdUrl = imageData.imagesize.UHD;
    if (!uhdUrl) return;

    fetch(uhdUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        const sanitizeFilename = (str) =>
          str.replace(/[\\/\\?%*:|"<>\\[\\]]/g, "-");
        const filename = `${imageData.enddate}_${sanitizeFilename(
          imageData.copyright,
        )}.jpg`;
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => window.open(uhdUrl, "_blank"));
  };
  downloadLink.addEventListener("click", downloadHandler);

  const updateHomeView = () => {
    const { background: imageData } = apiStore;
    if (imageData) {
      updateBackground(imageData);

      const titleEl = document.getElementById("title");
      if (titleEl.textContent !== imageData.title) {
        titleEl.innerHTML = ""; // Clear previous content
        new Typewriter(titleEl, {
          strings: imageData.title,
          autoStart: true,
          delay: 75,
        });
      }

      const copyrightEl = document.getElementById("copyright");
      if (imageData.copyrightlink) {
        copyrightEl.innerHTML = `<a href="${imageData.copyrightlink}" target="_blank" rel="noopener noreferrer">${imageData.copyright}</a>`;
      } else {
        copyrightEl.textContent = imageData.copyright;
      }

      downloadLink.href = imageData.imagesize.UHD;
      downloadLink.classList.remove("hidden");
    }
  };

  const unsubscribe = apiStore.subscribe(updateHomeView);
  apiStore.fetchBackground();
  updateHomeView();

  const resizeHandler = debounce(
    () => updateBackground(apiStore.background),
    250,
  );
  window.addEventListener("resize", resizeHandler);

  return () => {
    window.removeEventListener("resize", resizeHandler);
    docButton.removeEventListener("click", goToDoc);
    downloadLink.removeEventListener("click", downloadHandler);
    unsubscribe();
  };
};
