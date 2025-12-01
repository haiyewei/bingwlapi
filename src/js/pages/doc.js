import { apiStore } from "../store.js";
import { debounce, updateBackground } from "../utils.js";

export const renderDoc = (app) => {
  app.innerHTML = `
        <div id="background" class="h-screen bg-black bg-cover bg-center fixed top-0 left-0 right-0 bottom-0 -z-10"></div>
        <div class="h-screen flex flex-col">
            <nav class="flex-shrink-0 p-4 flex justify-start items-center glass-effect z-10">
                <md-text-button id="home-button" class="glass-effect" style="--md-text-button-label-text-color: currentColor;">主页</md-text-button>
            </nav>
            <main class="flex-grow overflow-y-auto">
                <div class="p-4 md:p-8 max-w-4xl mx-auto">
                    <div class="glass-effect p-8">
                        <h2 class="text-2xl font-bold mb-4">参数说明</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left table-grid">
                                <thead>
                                    <tr>
                                        <th class="p-2">参数</th>
                                        <th class="p-2">说明</th>
                                        <th class="p-2">可选值</th>
                                        <th class="p-2">默认值</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Parameters will be inserted here -->
                                </tbody>
                            </table>
                        </div>

                        <h2 class="text-2xl font-bold mt-8 mb-4">参数控制</h2>
                        <div id="api-controls" class="controls-grid">
                            <!-- API controls will be inserted here -->
                        </div>

                        <h2 class="text-2xl font-bold mt-8 mb-4">请求地址预览</h2>
                        <div class="flex items-center gap-2 flex-col-mobile">
                            <md-filled-text-field id="request-url" readonly class="flex-grow w-full" style="cursor: pointer;"></md-filled-text-field>
                        </div>

                        <h2 class="text-2xl font-bold mt-8 mb-4">API 响应预览</h2>
                        <md-filled-text-field id="response-preview" type="textarea" readonly class="w-full h-auto"></md-filled-text-field>
                    </div>
                </div>
            </main>
        </div>
    `;

  const homeButton = document.getElementById("home-button");
  const goToHome = () => {
    window.location.hash = "/";
  };
  homeButton.addEventListener("click", goToHome);

  const updateDocView = () => {
    updateBackground(apiStore.background);
  };

  const unsubscribe = apiStore.subscribe(updateDocView);
  apiStore.fetchBackground();
  updateDocView();

  const resizeHandler = debounce(
    () => updateBackground(apiStore.background),
    250,
  );
  window.addEventListener("resize", resizeHandler);

  const parameters = [
    {
      name: "mkt",
      desc: "获取指定国家/地区的市场",
      values:
        "<code>en-US</code>, <code>zh-CN</code>, <code>ja-JP</code>, <code>en-GB</code>, <code>fr-FR</code>, <code>it-IT</code>, <code>de-DE</code>, <code>en-CA</code>, <code>en-IN</code>",
      default: "<code>en-US</code>",
    },
    {
      name: "idx",
      desc: "图片数组的起始索引",
      values: "<code>0-8</code>",
      default: "<code>0</code>",
    },
    {
      name: "n",
      desc: "要获取的图片数量",
      values: "<code>1-8</code>",
      default: "<code>8</code>",
    },
    {
      name: "format",
      desc: "返回数据的格式",
      values: "<code>js</code>, <code>ssr</code>, <code>xml</code>",
      default: "<code>js</code>",
    },
    {
      name: "tab",
      desc: "为图片 URL 添加补全",
      values: "<code>1</code> (开启)",
      default: "<code>0</code> (关闭)",
    },
    {
      name: "imgsize",
      desc: "在返回数据中包含多种分辨率的图片 URL",
      values: "<code>1</code> (开启)",
      default: "<code>0</code> (关闭)",
    },
  ];

  const tbody = app.querySelector("tbody");
  tbody.innerHTML = parameters
    .map(
      (p) => `
        <tr>
            <td class="p-2" data-label="参数"><code>${p.name}</code></td>
            <td class="p-2" data-label="说明">${p.desc}</td>
            <td class="p-2" data-label="可选值">${p.values}</td>
            <td class="p-2" data-label="默认值">${p.default}</td>
        </tr>
    `,
    )
    .join("");

  const controlsContainer = document.getElementById("api-controls");
  const markets = [
    "zh-CN",
    "en-US",
    "ja-JP",
    "en-GB",
    "fr-FR",
    "it-IT",
    "de-DE",
    "en-CA",
    "en-IN",
  ];
  const idxOptions = Array.from({ length: 9 }, (_, i) => i);
  const nOptions = Array.from({ length: 8 }, (_, i) => i + 1);

  controlsContainer.innerHTML = `
        <md-outlined-select name="mkt" label="mkt">
            ${markets.map((m) => `<md-select-option value="${m}"${m === "zh-CN" ? " selected" : ""}>${m}</md-select-option>`).join("")}
        </md-outlined-select>
        <md-outlined-select name="idx" label="idx">
            ${idxOptions.map((i) => `<md-select-option value="${i}"${i === 0 ? " selected" : ""}>${i}</md-select-option>`).join("")}
        </md-outlined-select>
        <md-outlined-select name="n" label="n">
            ${nOptions.map((i) => `<md-select-option value="${i}"${i === 1 ? " selected" : ""}>${i}</md-select-option>`).join("")}
        </md-outlined-select>
        <label class="flex items-center gap-2"><md-checkbox name="tab"></md-checkbox> Tab 补全</label>
        <label class="flex items-center gap-2"><md-checkbox name="imgsize"></md-checkbox> 图片尺寸</label>
    `;

  const requestUrlEl = document.getElementById("request-url");
  const responsePreviewEl = document.getElementById("response-preview");
  let unsubscribePreview = null;

  const updatePreview = () => {
    if (unsubscribePreview) {
      unsubscribePreview();
      unsubscribePreview = null;
    }
    const params = { format: "js" };
    controlsContainer
      .querySelectorAll("md-outlined-select, md-checkbox")
      .forEach((el) => {
        if (el.tagName === "MD-CHECKBOX") {
          if (el.checked) params[el.name] = "1";
        } else {
          params[el.name] = el.value;
        }
      });
    const searchParams = new URLSearchParams(params);
    const endpoint = `/api?${searchParams.toString()}`;
    requestUrlEl.value = `${window.location.origin}${endpoint}`;

    responsePreviewEl.value = "Loading...";
    apiStore.fetchData(endpoint);
    unsubscribePreview = apiStore.subscribe(() => {
      const { data, loading, error } = apiStore;
      if (loading[endpoint]) {
        responsePreviewEl.value = "Loading...";
      } else if (error[endpoint]) {
        responsePreviewEl.value = `Error: ${error[endpoint].message}`;
      } else if (data[endpoint]) {
        responsePreviewEl.value = JSON.stringify(data[endpoint], null, 2);
        const textarea = responsePreviewEl.shadowRoot.querySelector("textarea");
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
          textarea.style.overflowY = "hidden";
        }
      }
    });
  };

  controlsContainer.addEventListener("change", updatePreview);
  const copyUrl = () => {
    navigator.clipboard.writeText(requestUrlEl.value).then(() => {
      // Visual feedback
      requestUrlEl.style.outline = "2px solid #4ade80";
      setTimeout(() => {
        requestUrlEl.style.outline = "none";
      }, 1500);
    });
  };
  requestUrlEl.addEventListener("click", copyUrl);

  setTimeout(updatePreview, 0);

  return () => {
    window.removeEventListener("resize", resizeHandler);
    homeButton.removeEventListener("click", goToHome);
    controlsContainer.removeEventListener("change", updatePreview);
    requestUrlEl.removeEventListener("click", copyUrl);
    unsubscribe();
    if (unsubscribePreview) {
      unsubscribePreview();
    }
  };
};
