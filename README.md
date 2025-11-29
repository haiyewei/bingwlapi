# bingwlapi

bingwlapi is a project that provides a daily wallpaper API for Bing, along with a front-end page for displaying wallpapers and viewing API documentation. The project automatically scrapes wallpaper data from multiple regions daily from Bing using GitHub Actions and provides a stable and fast Serverless API service through Cloudflare Pages and Functions.

##Front-end Preview

[bingwlapi.haiyewei.top](https://bingwlapi.haiyewei.top)

## ✨ Features

- **Daily Automatic Updates**: Automatically retrieves the latest Bing wallpaper data using GitHub Actions.

- **Multi-Region Support**: Supports wallpaper sources from multiple major countries and regions worldwide.

- **High-Performance API**: Based on the Cloudflare Serverless architecture, it provides a low-latency, highly available API service.

- **Rich Parameters**: Supports retrieving wallpapers from different regions, with different quantities, and different resolutions via parameters.

- **Front-end Display and Documentation**: Provides a concise wallpaper display page and clear API usage documentation.

- **Easy to Deploy:** The project structure is clear and can be easily deployed on the Cloudflare Pages platform.

## 📁 File Structure

```
.
├── .github/ # GitHub Actions workflow configuration for daily automatic data updates

├── api-get/ # Node.js script for retrieving wallpaper data from the Bing API

│ ├── api.js # Core data retrieval logic

│ └── regions.js # Defines supported country/region codes

├── cloudflare/ # Cloudflare

│ └── worker.js # Cloudflare worker for periodically triggering GitHub actions

├── data/ # Stores daily wallpaper JSON data retrieved from Bing

├── functions/ # Cloudflare Pages Functions API routing

│ └── api.js # API core logic, handling /api requests

├── js/ # JavaScript file for the front-end pages

│ ├── pages/ # Page components (homepage, documentation page)

│ ├── main.js # Main Entry File

│ ├── router.js # Simple front-end routing

│ └── utils.js # Utility functions

├── css/ # CSS style file for front-end pages

├── index.html # Main HTML file

├── package.json # Project dependencies and script configuration

└── README.md # This document

```

## 🚀 Setup Method

### **Step 1: Fork the Project**

First, you need to fork this repository to your own GitHub account.

### **Step 2: Deploy to Cloudflare Pages**

1. Log in to the [Cloudflare Console](https://dash.cloudflare.com/).

2. In the left navigation bar, select **Workers & Pages**, then click **Create application** > **Pages** > **Connect to Git**.

3. Select the repository you just forked and authorize Cloudflare access.

4. On the build settings page, Cloudflare doesn't require any preset settings; simply click **Save and Deploy**.

### **Step 3: Configure Environment Variables**

To allow GitHub Actions to automatically push updated wallpaper data to your repository, you need to configure a deployment key.

1. In the Cloudflare worker's project dashboard, go to bingwlapi-updater

**Settings** > **Environment variables**.

2. Add a new environment variable named `TOKEN`.

3. The value of this `TOKEN` needs to be a GitHub Personal Access Token (Classic) with `repo` permissions. You can generate a new token by visiting the [GitHub Personal Access Tokens](https://github.com/settings/tokens) page.

4. Paste the generated token into the value field of the `TOKEN` environment variable and save.

### **Step Four: Enabling GitHub Actions**

By default, GitHub Actions workflows are disabled in forked repositories. You need to enable them manually.

1. Go to the page of your forked repository.

2. Click the **Actions** tab at the top.

3. Find the workflow named `Fetch Bing Wallpaper` on the left and click the **Enable workflow** button.

After completing the above steps, your personal wallpaper API is set up and will automatically update daily.

## 🚀 API Usage

The API's only endpoint is `/api`. You can add different query parameters to retrieve customized wallpaper data.

**Base Request URL:** `https://bingwlapi.haiyewei.top/api`

---

### **Available Parameters**

| Parameter | Description | Default Value | Optional Value |

| :-------- | :---------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------ |

| `format` | **Return Format**, specifies the format of the returned data. | `js` | `js` (JSON), `ssr` (JSONP (not implemented)), `xml` (XML (not implemented)) |

| `mkt` | **Region Code**, specifies which region's wallpaper to retrieve. It will attempt to automatically detect this from the `Accept-Language` header. | `en-US` | `zh-CN`, `en-US`, `ja-JP`, `en-GB`, `de-DE`, `en-IN`, `en-CA`, `fr-FR`, `it-IT` |

| `n` | **Quantity**, specifies the number of wallpapers to retrieve. | `1` | An integer between `1` and `8` |

| `idx` | **Index**, specifies the starting day for retrieval. `0` represents today, `1` represents yesterday, and so on. | `0` | An integer between `0` and `7` |

| `imgsize` | **Get All Resolutions**, a switch to retrieve a list of URLs for all available resolutions. | (Not set) | `1` |

| `tab` | **Auto-complete URLs**, a switch to auto-complete URLs in the returned data if they are absolute paths. | (Not set) | `1` |

---

### **Request Examples**

1. **Get wallpapers for the current day in China (default parameters)**

```
/api?mkt=zh-CN

```

2. **Get the 3 most recent wallpapers from the US**

```
/api?mkt=en-US&n=3

```

3. **Get wallpapers from yesterday in Japan**

```
/api?mkt=ja-JP&idx=1

```

4. **Get wallpapers of all sizes for the current day in Germany**

```
/api?mkt=de-DE&imgsize=1

```

### **Return Data Format**

The API returns a JSON object containing an array of `images`.

```json

{
"images": [
{
"startdate": "20231128",

"fullstartdate": "202311281600",

"enddate": "20231129",

"url": "/th?id=OHR.DevetashkaCave_ZH-CN9553249001_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp",

"urlbase": "/th?id=OHR.DevetashkaCave_ZH-CN9553249001",

"copyright": "Devetashka Cave, Bulgaria (© Grigor Valchev/Getty Images)",

"copyrightlink": "https://www.bing.com/search?q=%E5%BE%B7%E5%BC%97%E5%A1%94%E4%BB%80%E5%8D%A1%E6%B4%9E%E7%A9%B4&form=hpcapt&mkt=zh-cn",

"title": "Natural Wonders of Bulgaria",

"quiz": "/search?q=Bing+homepage+quiz&filters=WQOskey:%22HPQuiz_20231128_DevetashkaCave%22&FORM=HPQUIZ",

"wp": true,

"hsh": "00f135a513c1c51a146445b23d57d363",

"drk": 1,

"top": 1,

"bot": 1,

"hs": []

}
]
```
