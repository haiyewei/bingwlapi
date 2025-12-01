export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

export const analyzeImageBrightness = (imageUrl, callback) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageUrl;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let brightnessSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // HSP equation from http://alienryderflex.com/hsp.html
      const brightness = Math.sqrt(
        0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b),
      );
      brightnessSum += brightness;
    }
    const avgBrightness = brightnessSum / (data.length / 4);
    if (avgBrightness > 127.5) {
      callback("light-bg");
    } else {
      callback("dark-bg");
    }
  };
  img.onerror = () => {
    // fallback to dark-bg if image fails to load
    callback("dark-bg");
  };
};

export const getMarketCode = () => {
  const supportedMarkets = [
    "de-DE",
    "en-CA",
    "en-GB",
    "en-IN",
    "en-US",
    "fr-FR",
    "it-IT",
    "ja-JP",
    "zh-CN",
  ];
  const browserLanguage = navigator.language;

  if (supportedMarkets.includes(browserLanguage)) {
    return browserLanguage;
  }

  return "en-US";
};

export const updateBackground = (imageData) => {
  if (!imageData) return;

  const backgroundUrl =
    window.innerWidth > 768
      ? imageData.imagesize["1920x1080"]
      : imageData.imagesize["1080x1920"];

  const backgroundElement = document.getElementById("background");
  if (
    backgroundElement &&
    backgroundElement.style.backgroundImage !== `url("${backgroundUrl}")`
  ) {
    backgroundElement.style.backgroundImage = `url(${backgroundUrl})`;
    analyzeImageBrightness(backgroundUrl, (theme) => {
      document.body.className = theme;
    });
  }
};
