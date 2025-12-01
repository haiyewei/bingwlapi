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
      "23:05": "update-de-DE-fr-FR-it-IT.yml",
      "0:05": "update-en-GB.yml",
      "18:35": "update-en-IN.yml",
      "5:05": "update-en-US-en-CA.yml",
      "15:05": "update-ja-JP.yml",
      "16:05": "update-zh-CN.yml",
    };

    const timeKey = `${currentHour}:${String(currentMinute).padStart(2, '0')}`;
    const workflowFile = scheduleMap[timeKey];

    if (workflowFile) {
      console.log(`Time matched: ${timeKey}. Triggering workflow: ${workflowFile}`);
      await this.triggerWorkflow(env, workflowFile);
    } else {
      console.warn(`No workflow scheduled for the current time: ${timeKey}. This might happen if cron triggers and worker execution time are slightly misaligned.`);
    }
  },

  async triggerWorkflow(env, workflowFile) {
    const url = `https://api.github.com/repos/${env.GITHUB_USERNAME}/${env.GITHUB_REPONAME}/actions/workflows/${workflowFile}/dispatches`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'cloudflare-worker-github-actions-trigger',
      },
      body: JSON.stringify({
        ref: 'main',
      }),
    });

    if (response.ok) {
      console.log(`Successfully triggered workflow: ${workflowFile}`);
    } else {
      const errorText = await response.text();
      console.error(`Failed to trigger workflow ${workflowFile}: ${response.status} ${response.statusText}`, errorText);
    }
  }
};
