const GUIDE_SKILLS = {
  e1: {
    id: "e1",
    brand: "DeepSeek",
    iconEmoji: "💬",
    brandColor: "#007AFF",
    targetAppId: "wx5fe31a9ac20a3fae",
    strategy: "结构化拒绝法：先肯定价值，再陈述客观冲突，最后给出可执行替代方案。",
    masterPrompt:
      "[角色设定] 你是资深职场沟通顾问，语气专业克制、尊重上下级关系。\n" +
      "[任务目标] 生成一段礼貌拒绝参加 17:59 临时会议的回复。\n" +
      "[约束条件] 必须包含：肯定价值 + 客观冲突 + 替代方案；长度 80-120 字；不情绪化、不抱怨；可承诺补看纪要或提供书面输入。\n" +
      "[输出格式] 仅输出一段可直接发送的中文回复。"
  },
  e2: {
    id: "e2",
    brand: "Kimi",
    iconEmoji: "✨",
    brandColor: "#00E266",
    targetAppId: "wx4984641680c131dc",
    strategy: "价值锚点放大法：把单点修复提升为关键链路优化与系统性收益。",
    masterPrompt:
      "[角色设定] 你是资深技术负责人，擅长从工程价值与业务影响角度复盘工作。\n" +
      "[任务目标] 将“修复一个 Bug”扩写为“底层链路优化”的周报段落。\n" +
      "[约束条件] 强调稳定性提升、故障率下降、扩展性收益；避免空话；字数 150-220 字；可量化处请给出合理区间。\n" +
      "[输出格式] 输出一段周报正文，不要标题。"
  }
};

const TAG_STYLES = {
  "[角色设定]": "color: #facc15;",
  "[任务目标]": "color: #22c55e;",
  "[约束条件]": "color: #60a5fa;",
  "[输出格式]": "color: #f97316;"
};

Page({
  data: {
    skill: null,
    promptNodes: [],
    isTyping: false
  },

  onLoad(options) {
    const skillId = options && options.id;
    const skill = GUIDE_SKILLS[skillId] || GUIDE_SKILLS.e1;
    this.setData({ skill });
    this.startTyping(skill.masterPrompt);
  },

  buildPromptNodes(text) {
    const parts = text.split(/(\[(?:角色设定|任务目标|约束条件|输出格式)\])/);
    return parts
      .filter((part) => part !== "")
      .map((part) => {
        const style = TAG_STYLES[part];
        if (style) {
          return {
            name: "span",
            attrs: { style },
            children: [{ type: "text", text: part }]
          };
        }
        return {
          name: "span",
          attrs: { style: "color: #e2e8f0;" },
          children: [{ type: "text", text: part }]
        };
      });
  },

  startTyping(fullText) {
    if (this._typingTimer) clearInterval(this._typingTimer);
    this.setData({ isTyping: true, promptNodes: [] });

    let index = 0;
    this._typingTimer = setInterval(() => {
      index += 2;
      const snippet = fullText.slice(0, index);
      this.setData({ promptNodes: this.buildPromptNodes(snippet) });
      if (index >= fullText.length) {
        clearInterval(this._typingTimer);
        this._typingTimer = null;
        this.setData({ isTyping: false });
      }
    }, 20);
  },

  copyPrompt() {
    const skill = this.data.skill;
    if (!skill) return;
    wx.setClipboardData({
      data: skill.masterPrompt,
      success: () => {
        wx.showToast({ title: "咒语已复制", icon: "success" });
      }
    });
  },

  handleEnterTool() {
    const skill = this.data.skill;
    if (!skill) return;
    wx.navigateToMiniProgram({
      appId: skill.targetAppId
    });
  },

  onUnload() {
    if (this._typingTimer) clearInterval(this._typingTimer);
  }
});
