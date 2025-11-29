export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  },
};

async function handleScheduled(event, env) {
  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  // As per wrangler.toml, GITHUB_USER is the owner. Using a more descriptive name.
  const GITHUB_OWNER = env.GITHUB_USER;
  const GITHUB_REPO = env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_OWNER) {
    console.error(
      "Missing required secrets: GITHUB_TOKEN, GITHUB_REPO, GITHUB_USER (as owner)",
    );
    return new Response("Missing required secrets", { status: 500 });
  }

  const scheduledTime = new Date(event.scheduledTime);
  const hour = scheduledTime.getUTCHours();
  const minutes = scheduledTime.getUTCMinutes();

  let workflow_id = null;

  // Determine which workflow to trigger based on the cron schedule in wrangler.toml
  if (minutes === 5) {
    switch (hour) {
      case 0:
        workflow_id = "update-en-GB.yml";
        break;
      case 5:
        workflow_id = "update-en-US-en-CA.yml";
        break;
      case 15:
        workflow_id = "update-ja-JP.yml";
        break;
      case 16:
        workflow_id = "update-zh-CN.yml";
        break;
      case 23:
        workflow_id = "update-de-DE-fr-FR-it-IT.yml";
        break;
    }
  } else if (hour === 18 && minutes === 35) {
    workflow_id = "update-en-IN.yml";
  }

  if (!workflow_id) {
    console.log(
      `No workflows to trigger at ${hour}:${String(minutes).padStart(2, "0")} UTC.`,
    );
    return;
  }

  console.log(`Triggering workflow: ${workflow_id}`);

  await triggerWorkflowDispatch(
    GITHUB_OWNER,
    GITHUB_REPO,
    workflow_id,
    GITHUB_TOKEN,
  );
}

async function triggerWorkflowDispatch(owner, repo, workflow_id, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;
  console.log(`Triggering workflow dispatch for: ${workflow_id}`);

  try {
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

    if (response.ok) {
      console.log(
        `Successfully triggered workflow ${workflow_id}. Status: ${response.status}`,
      );
    } else {
      const errorText = await response.text();
      console.error(
        `Failed to trigger workflow ${workflow_id}. Status: ${response.status}. Body: ${errorText}`,
      );
    }
  } catch (error) {
    console.error(`Error triggering workflow ${workflow_id}:`, error);
  }
}
