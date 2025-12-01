async function triggerWorkflowDispatch(owner, repo, workflow_id, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;
  console.log(`Triggering workflow dispatch for: ${workflow_id}`);

  try {
    console.log(`Requesting API URL: ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "cloudflare-worker-bingwlapi-updater",
      },
      body: JSON.stringify({
        ref: "main",
      }),
    });

    const responseBody = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseBody}`);

    if (!response.ok) {
      console.error(
        `Failed to trigger workflow ${workflow_id}. Status: ${response.status}. Body: ${responseBody}`,
      );
    } else {
      console.log(
        `Successfully triggered workflow ${workflow_id}. Status: ${response.status}`,
      );
    }
  } catch (error) {
    console.error(`Error triggering workflow ${workflow_id}:`, error);
  }
}

export const scheduled = async (controller, env, ctx) => {
  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  const GITHUB_OWNER = env.GITHUB_USER;
  const GITHUB_REPO = env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_OWNER) {
    console.error(
      "Missing required secrets: GITHUB_TOKEN, GITHUB_REPO, GITHUB_USER (as owner)",
    );
    return;
  }

  let workflow_id = null;

  switch (controller.cron) {
    // UTC time: 00:05, Beijing time: 08:05
    case "5 0 * * *":
      workflow_id = "update-en-GB.yml";
      break;
    // UTC time: 05:05, Beijing time: 13:05
    case "5 5 * * *":
      workflow_id = "update-en-US-en-CA.yml";
      break;
    // UTC time: 15:05, Beijing time: 23:05
    case "5 15 * * *":
      workflow_id = "update-ja-JP.yml";
      break;
    // UTC time: 16:05, Beijing time: 00:05 (+1 day)
    case "5 16 * * *":
      workflow_id = "update-zh-CN.yml";
      break;
    // UTC time: 23:05, Beijing time: 07:05 (+1 day)
    case "5 23 * * *":
      workflow_id = "update-de-DE-fr-FR-it-IT.yml";
      break;
    // UTC time: 18:35, Beijing time: 02:35 (+1 day)
    case "35 18 * * *":
      workflow_id = "update-en-IN.yml";
      break;
    default:
      console.log("No matching cron schedule");
      break;
  }

  if (workflow_id) {
    console.log(`Triggering workflow: ${workflow_id}`);
    ctx.waitUntil(
      triggerWorkflowDispatch(
        GITHUB_OWNER,
        GITHUB_REPO,
        workflow_id,
        GITHUB_TOKEN,
      ),
    );
  }
  console.log("cron processed");
};
