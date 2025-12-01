// Import the API handler
import { handleApiRequest, handleApiOptions } from "./api.js";
import scheduler from "./scheduler.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle API routes
    if (url.pathname === "/api") {
      if (request.method === "OPTIONS") {
        return handleApiOptions();
      }
      return handleApiRequest(request);
    }

    // For all other routes, let the static assets handle it
    // This will be handled by Cloudflare Workers' built-in assets serving
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    await scheduler.scheduled(controller, env, ctx);
  },
};
