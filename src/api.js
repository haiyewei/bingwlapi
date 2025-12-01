// Statically import all the data files
import deDE from "../data/de-DE.json";
import enCA from "../data/en-CA.json";
import enGB from "../data/en-GB.json";
import enIN from "../data/en-IN.json";
import enUS from "../data/en-US.json";
import frFR from "../data/fr-FR.json";
import itIT from "../data/it-IT.json";
import jaJP from "../data/ja-JP.json";
import zhCN from "../data/zh-CN.json";

// A map of market codes to the imported data
const allData = {
  "de-DE": deDE,
  "en-CA": enCA,
  "en-GB": enGB,
  "en-IN": enIN,
  "en-US": enUS,
  "fr-FR": frFR,
  "it-IT": itIT,
  "ja-JP": jaJP,
  "zh-CN": zhCN,
};

const availableMarkets = Object.keys(allData);

async function handleRequest(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const format = searchParams.get("format") || "js";

    let mkt = searchParams.get("mkt");
    if (!mkt) {
      const acceptLanguage =
        context.request.headers.get("Accept-Language") || "";
      // This logic is a bit simplified, a robust solution would parse the q-factor weighting
      const preferredLanguage = acceptLanguage.split(",").trim();
      if (availableMarkets.includes(preferredLanguage)) {
        mkt = preferredLanguage;
      } else {
        mkt = "en-US"; // Default market
      }
    }

    const data = allData[mkt];

    if (!data) {
      return new Response("Not Found", { status: 404 });
    }

    let idx = parseInt(searchParams.get("idx"), 10) || 0;
    let n = parseInt(searchParams.get("n"), 10) || 1;
    const tab = searchParams.get("tab") === "1";
    const imgsize = searchParams.get("imgsize");

    if (idx < 0) {
      idx = 0;
    }
    if (n > 8) {
      n = 8;
    }

    let images = data.images.slice(idx, idx + n);

    if (tab) {
      images = images.map((img) => ({
        ...img,
        url: `https://www.bing.com${img.url}`,
        urlbase: `https://www.bing.com${img.urlbase}`,
        quiz: `https://www.bing.com${img.quiz}`,
      }));
    }

    if (imgsize === "1") {
      const sizes = [
        "UHD",
        "1920x1200",
        "1920x1080",
        "1080x1920",
        "1366x768",
        "1280x768",
        "1024x768",
        "800x600",
        "800x480",
        "768x1280",
        "720x1280",
        "640x480",
        "480x800",
        "400x240",
        "320x240",
        "240x320",
      ];
      images = images.map((img) => {
        const imagesize = {};
        sizes.forEach((size) => {
          imagesize[size] = `${img.urlbase}_${size}.jpg`;
        });
        return { ...img, imagesize };
      });
    }

    // Create a copy of the data to avoid modifying the original imported object
    const responseData = { ...data, images };

    switch (format) {
      case "ssr":
        return new Response(`bingwl(${JSON.stringify(responseData)})`, {
          headers: { "Content-Type": "application/javascript" },
        });
      case "xml":
        // Note: This is a placeholder as the original logic was incomplete.
        return new Response("<images/>", {
          headers: { "Content-Type": "application/xml" },
        });
      case "js":
      default:
        return new Response(JSON.stringify(responseData), {
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    // Log the error for debugging if possible in the environment
    console.error(error);
    return new Response(
      JSON.stringify({ error: "An internal server error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function handleApiRequest(request) {
  const response = await handleRequest({ request });
  // Apply CORS headers to the response
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function handleApiOptions() {
  // Handle CORS preflight requests
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
