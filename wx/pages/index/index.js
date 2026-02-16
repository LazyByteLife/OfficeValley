const OFFICE_BG_URL = "https://youke.xn--y7xa690gmna.cn/s1/2026/02/16/699288a392da8.webp";

const BOSS_SKILLS = [
  {
    id: "b1",
    name: "下班·封印术",
    nickname: "17:59分的发起人",
    desc: "17:59 发起会议，锁定下班按钮",
    attackText: "快下班了，`简单`开个会，所有人进会议室！",
    satisfiedText: "既然你还有紧急交付，那这次会你先不用参加了，看纪要吧。",
    iconEmoji: "📞"
  },
  {
    id: "b2",
    name: "微操·周报催命",
    nickname: "对齐颗粒度的王总",
    desc: "要求精确到分钟的日报，体力减半",
    attackText: "这周产出不够饱和啊，发个周报看看？",
    satisfiedText: "这个总结非常有深度，看到你对底层架构的思考了，不错。",
    iconEmoji: "🧾"
  }
];

const ALL_EMP_SKILLS = [
  {
    id: "e1",
    name: "AI 嘴替·礼貌回绝",
    nickname: "反卷链路突围者",
    desc: "LLM 生成高情商废话",
    iconEmoji: "🙂",
    brand: "DeepSeek",
    brandColor: "#007AFF",
    brandIconEmoji: "💬",
    techTitle: "DeepSeek 教你怎么委婉拒绝中...",
    castSteps: [
      "分析老板语气情绪...",
      "匹配‘委婉拒绝’大模型...",
      "正在构建高情商拒接话术...",
      "生成最终回复内容..."
    ],
    actionBtn: "发送回复",
    resultType: "text",
    resultContent: "收到。但我手头有一个紧急需求必须在今晚交付，可能无法参加。我会看纪要，有需要我配合的随时同步。",
    link: "https://deepseek.com/",
    targetAppId: "wx5fe31a9ac20a3fae",
    strategy: "结构化拒绝法：先肯定价值，再陈述客观冲突，最后给出可执行替代方案。",
    masterPrompt:
      "[角色设定] 你是资深职场沟通顾问，语气专业克制、尊重上下级关系。\n" +
      "[任务目标] 生成一段礼貌拒绝参加 17:59 临时会议的回复。\n" +
      "[约束条件] 必须包含：肯定价值 + 客观冲突 + 替代方案；长度 80-120 字；不情绪化、不抱怨；可承诺补看纪要或提供书面输入。\n" +
      "[输出格式] 仅输出一段可直接发送的中文回复。"
  },
  {
    id: "e2",
    name: "黑话·周报膨胀术",
    nickname: "底层逻辑架构师(自封)",
    desc: "把 1 个 Bug 吹成底层重构",
    iconEmoji: "🧠",
    brand: "Kimi",
    brandColor: "#00E266",
    brandIconEmoji: "✨",
    techTitle: "Kimi.ai 智能扩写",
    castSteps: [
      "扫描原始日报文本...",
      "提取核心交付物...",
      "注入‘底层逻辑’等大厂黑话...",
      "生成深度工作复盘..."
    ],
    actionBtn: "生成周报",
    resultType: "file",
    resultTitle: "本周工作复盘.docx",
    resultDesc: "字数: 3,420 | 查重率: 0% | 黑话浓度: 极高",
    link: "https://kimi.moonshot.cn/",
    targetAppId: "wx4984641680c131dc",
    strategy: "价值锚点放大法：把单点修复提升为关键链路优化与系统性收益。",
    masterPrompt:
      "[角色设定] 你是资深技术负责人，擅长从工程价值与业务影响角度复盘工作。\n" +
      "[任务目标] 将“修复一个 Bug”扩写为“底层链路优化”的周报段落。\n" +
      "[约束条件] 强调稳定性提升、故障率下降、扩展性收益；避免空话；字数 150-220 字；可量化处请给出合理区间。\n" +
      "[输出格式] 输出一段周报正文，不要标题。"
  }
];

const SKILL_LINKAGE = { b1: ["e1"], b2: ["e2"] };

Page({
  data: {
    officeBgUrl: OFFICE_BG_URL,
    scene: "start",
    bossSkills: BOSS_SKILLS,
    allEmpSkills: ALL_EMP_SKILLS,
    availableEmpSkills: [],
    isEmpLocked: true,
    selected: { boss: [], emp: [] },
    currentBossSkill: null,
    currentEmpSkill: null,
    turnState: "loop",
    isBossAngry: false,
    isBossDefeated: false,
    castStepIndex: 0,
    currentCastStepText: "",
    isCastingDone: false,
    bossAttackText: "",
    empResultText: "",
    bossSatisfiedText: "",
    isSatisfiedTypingDone: false,
    scrollIntoView: "scroll-anchor",
    empSkillShortName: ""
  },

  onLoad() {
    this.updateAvailableEmpSkills();
  },

  onUnload() {
    this.clearAllTimers();
  },

  goSelect() {
    this.setScene("select");
  },

  goStart() {
    this.setScene("start");
  },

  goBattle() {
    if (!this.data.selected.emp.length) return;
    this.setScene("battle");
    this.initBattle();
  },

  setScene(scene) {
    if (scene !== "battle") {
      this.clearBattleTimers();
    }
    this.setData({ scene });
  },

  onToggleSkill(e) {
    const { role, id } = e.currentTarget.dataset;
    const prev = this.data.selected;
    const isSet = prev[role].includes(id);
    if (role === "boss") {
      this.setData({
        selected: { boss: isSet ? [] : [id], emp: [] }
      });
    } else {
      this.setData({
        selected: { ...prev, emp: isSet ? [] : [id] }
      });
    }
    this.updateAvailableEmpSkills();
  },

  updateAvailableEmpSkills() {
    const bossId = this.data.selected.boss[0];
    const availableEmpSkills = bossId
      ? ALL_EMP_SKILLS.filter((skill) => SKILL_LINKAGE[bossId].includes(skill.id))
      : [];
    this.setData({
      availableEmpSkills,
      isEmpLocked: !bossId
    });
  },

  initBattle() {
    const bossId = this.data.selected.boss[0];
    const empId = this.data.selected.emp[0];
    const currentBossSkill = BOSS_SKILLS.find((s) => s.id === bossId);
    const currentEmpSkill = ALL_EMP_SKILLS.find((s) => s.id === empId);
    const empSkillShortName = currentEmpSkill.name.split("·")[1] || currentEmpSkill.name;

    this.setData({
      currentBossSkill,
      currentEmpSkill,
      empSkillShortName,
      turnState: "loop",
      isBossAngry: false,
      isBossDefeated: false,
      castStepIndex: 0,
      currentCastStepText: currentEmpSkill.castSteps[0],
      isCastingDone: false,
      bossAttackText: "",
      empResultText: "",
      bossSatisfiedText: "",
      isSatisfiedTypingDone: false
    });

    this.runTypewriter(currentBossSkill.attackText, "bossAttackText", 40, 0);
    this.updateBossAngryForState("loop");
  },

  handleStartCast() {
    if (this.data.turnState !== "loop") return;
    this.setTurnState("casting");
  },

  handleFire() {
    if (!this.data.isCastingDone) return;
    this.setTurnState("result_display");

    this.queueTimeout(() => {
      this.setTurnState("player_atk");
      this.queueTimeout(() => {
        this.setTurnState("boss_satisfied");
      }, 800);
    }, 800);
  },

  handleLearnMore() {
    const skillId = this.data.currentEmpSkill && this.data.currentEmpSkill.id;
    if (!skillId) return;
    wx.navigateTo({ url: "/pages/guide/guide?id=" + skillId });
  },

  setTurnState(state) {
    this.setData({
      turnState: state,
      isBossDefeated: state === "boss_satisfied"
    });
    this.updateBossAngryForState(state);

    if (state === "casting") {
      this.startCasting();
    }

    if (state === "result_display") {
      this.startEmpResultTyping();
    }

    if (state === "boss_satisfied") {
      this.startBossSatisfiedTyping();
    }
  },

  updateBossAngryForState(state) {
    this.clearBossAngryLoop();
    if (["casting", "player_atk", "boss_satisfied"].includes(state)) {
      this.setData({ isBossAngry: false });
      return;
    }

    this.queueTimeout(() => {
      this.setData({ isBossAngry: true });
      this.queueTimeout(() => this.setData({ isBossAngry: false }), 1200);
    }, 1000);

    this._bossAngryInterval = setInterval(() => {
      this.setData({ isBossAngry: true });
      this.queueTimeout(() => this.setData({ isBossAngry: false }), 1200);
    }, 3500);
  },

  startCasting() {
    this.clearCastInterval();
    const currentEmpSkill = this.data.currentEmpSkill;
    const totalSteps = currentEmpSkill.castSteps.length;

    this.setData({
      castStepIndex: 0,
      currentCastStepText: currentEmpSkill.castSteps[0],
      isCastingDone: false
    });

    let current = 0;
    this._castInterval = setInterval(() => {
      if (current < totalSteps - 1) {
        current += 1;
        this.setData({
          castStepIndex: current,
          currentCastStepText: currentEmpSkill.castSteps[current]
        });
      } else {
        clearInterval(this._castInterval);
        this._castInterval = null;
        this.setData({ isCastingDone: true });
      }
    }, 800);
  },

  startEmpResultTyping() {
    const currentEmpSkill = this.data.currentEmpSkill;
    if (currentEmpSkill.resultType !== "text") {
      this.setData({ empResultText: "" });
      return;
    }
    this.runTypewriter(currentEmpSkill.resultContent, "empResultText", 30, 0);
  },

  startBossSatisfiedTyping() {
    const currentBossSkill = this.data.currentBossSkill;
    this.setData({ isSatisfiedTypingDone: false });
    this.runTypewriter(
      currentBossSkill.satisfiedText,
      "bossSatisfiedText",
      40,
      500,
      () => this.setData({ isSatisfiedTypingDone: true })
    );
  },

  runTypewriter(text, field, speed, delay, onComplete) {
    this.clearTypewriter(field);
    this.setData({ [field]: "" });

    const timeoutId = setTimeout(() => {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          this.setData({ [field]: text.slice(0, i + 1) });
          this.scrollToBottom();
          i += 1;
        } else {
          clearInterval(intervalId);
          this._typewriterIntervals[field] = null;
          if (onComplete) onComplete();
        }
      }, speed);
      this._typewriterIntervals[field] = intervalId;
    }, delay);

    this._typewriterTimeouts[field] = timeoutId;
  },

  clearTypewriter(field) {
    if (!this._typewriterTimeouts) this._typewriterTimeouts = {};
    if (!this._typewriterIntervals) this._typewriterIntervals = {};

    const timeoutId = this._typewriterTimeouts[field];
    const intervalId = this._typewriterIntervals[field];

    if (timeoutId) clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);

    this._typewriterTimeouts[field] = null;
    this._typewriterIntervals[field] = null;
  },

  queueTimeout(fn, delay) {
    if (!this._timeouts) this._timeouts = [];
    const id = setTimeout(fn, delay);
    this._timeouts.push(id);
  },

  clearBossAngryLoop() {
    if (this._bossAngryInterval) {
      clearInterval(this._bossAngryInterval);
      this._bossAngryInterval = null;
    }
  },

  clearCastInterval() {
    if (this._castInterval) {
      clearInterval(this._castInterval);
      this._castInterval = null;
    }
  },

  clearBattleTimers() {
    this.clearBossAngryLoop();
    this.clearCastInterval();

    if (this._timeouts) {
      this._timeouts.forEach((id) => clearTimeout(id));
      this._timeouts = [];
    }

    if (this._typewriterTimeouts) {
      Object.keys(this._typewriterTimeouts).forEach((key) => this.clearTypewriter(key));
    }
  },

  clearAllTimers() {
    this.clearBattleTimers();
  },

  scrollToBottom() {
    this.setData({ scrollIntoView: "scroll-anchor" });
  }
});
