const fs = require("fs").promises;
const path = require("path");
const fetchDataForLocale = require("./fetch-api");

const dataDir = path.join(__dirname, "..", "data");
const locales = [
  "en-US",
  "zh-CN",
  "ja-JP",
  "en-GB",
  "fr-FR",
  "de-DE",
  "en-IN",
  "en-CA",
  "it-IT",
];

async function fetchAllData() {
  for (const locale of locales) {
    await fetchDataForLocale(locale);
  }
}

fetchAllData();
