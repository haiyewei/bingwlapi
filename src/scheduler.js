export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(this.handleScheduled(env, controller));
  },

  async handleScheduled(env, controller) {
    // 获取当前的 UTC 时间
    const now = new Date(controller.scheduledTime);
    const currentMinute = now.getUTCMinutes();
    const currentHour = now.getUTCHours();

    // 定义调度映射表：{ "UTC 时间": "工作流文件名" }
    const scheduleMap = {
      "23:01": "update-de-DE-fr-FR-it-IT.yml", // UTC 23:01 = GMT+8 07:01 (次日)
      "0:01": "update-en-GB.yml", // UTC 00:01 = GMT+8 08:01
      "18:31": "update-en-IN.yml", // UTC 18:31 = GMT+8 02:31 (次日)
      "5:01": "update-en-US-en-CA.yml", // UTC 05:01 = GMT+8 13:01
      "15:01": "update-ja-JP.yml", // UTC 15:01 = GMT+8 23:01
      "16:01": "update-zh-CN.yml", // UTC 16:01 = GMT+8 00:01 (次日)
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
