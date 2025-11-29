import { renderHome } from "./pages/home.js";
import { renderDoc } from "./pages/doc.js";

let cleanupPage = null;
const app = document.getElementById("app");

const routes = {
  "/": renderHome,
  "/doc": renderDoc,
};

export const router = () => {
  if (cleanupPage) {
    cleanupPage();
    cleanupPage = null;
  }
  const path = window.location.hash.slice(1) || "/";
  const render = routes[path] || renderHome;
  cleanupPage = render(app);
};
