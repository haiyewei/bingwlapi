export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(this.handleScheduled(env, controller));
  },

  async handleScheduled(env, controller) {
    // 获取当前的 UTC 时间
    const now = new Date(controller.scheduledTime);
    const currentMinute = now.getUTCMinutes();
    const currentHour = now.getUTCHours();

    // 定义调度映射表：{ "小时:分钟": "工作流文件名" }
    const scheduleMap = {
      "23:05": ".github/workflows/update-de-DE-fr-FR-it-IT.yml",
      "0:05": ".github/workflows/update-en-GB.yml",
      "18:35": ".github/workflows/update-en-IN.yml",
      "5:05": ".github/workflows/update-en-US-en-CA.yml",
      "15:05": ".github/workflows/update-ja-JP.yml",
      "16:05": ".github/workflows/update-zh-CN.yml",
    };

    const timeKey = `${currentHour}:${String(currentMinute).padStart(2, "0")}`;
    const workflowFile = scheduleMap[timeKey];

    if (workflowFile) {
      console.log(
        `Time matched: ${timeKey}. Triggering workflow: ${workflowFile}`,
      );
      await this.triggerWorkflow(env, workflowFile, {});
    } else {
      console.warn(
        `No workflow scheduled for the current time: ${timeKey}. This might happen if cron triggers and worker execution time are slightly misaligned.`,
      );
    }
  },

  async triggerWorkflow(env, workflowFile, inputs = {}) {
    const url = `https://api.github.com/repos/${env.GITHUB_USERNAME}/${env.GITHUB_REPONAME}/actions/workflows/${workflowFile}/dispatches`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "cloudflare-worker-github-actions-trigger",
      },
      body: JSON.stringify({
        ref: "main",
        inputs,
      }),
    });

    if (response.ok) {
      console.log(`Successfully triggered workflow: ${workflowFile}`);
    } else {
      const errorText = await response.text();
      console.error(
        `Failed to trigger workflow ${workflowFile}: ${response.status} ${response.statusText}`,
        errorText,
      );
    }
  },
};
