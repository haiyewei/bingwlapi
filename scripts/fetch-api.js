const fs = require("fs").promises;
const path = require("path");

const baseUrl = "https://bing.com/HPImageArchive.aspx";
const params = {
  format: "js",
  idx: 0,
  n: 8,
};
const dataDir = path.join(__dirname, "..", "data");

async function fetchDataForLocale(locale) {
  const url = `${baseUrl}?format=${params.format}&idx=${params.idx}&n=${params.n}&mkt=${locale}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newData = await response.json();
    const filePath = path.join(dataDir, `${locale}.json`);

    let existingData = { images: [] };
    try {
      const existingContent = await fs.readFile(filePath, "utf8");
      existingData = JSON.parse(existingContent);
    } catch (readError) {
      if (readError.code !== "ENOENT") {
        throw readError;
      }
    }

    const newImages = newData.images;
    const existingDates = new Set(
      existingData.images.map((img) => img.startdate),
    );
    const uniqueNewImages = newImages.filter(
      (img) => !existingDates.has(img.startdate),
    );

    if (uniqueNewImages.length > 0) {
      const mergedData = [...uniqueNewImages, ...existingData.images];
      const dataToSave = { images: mergedData };
      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
    }
  } catch (fetchError) {
    console.error(`Error fetching data for locale ${locale}:`, fetchError);
  }
}

module.exports = fetchDataForLocale;
