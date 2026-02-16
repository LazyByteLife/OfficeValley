import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  Smile,
  FileText,
  ArrowLeft,
  Swords,
  Play,
  Lock,
  Cpu,
  Send,
  MessageCircle,
  Trophy,
  ExternalLink,
  Sparkles,
} from "lucide-react";

// --- 常量数据 ---
const OFFICE_BG_URL = "https://img.bytelife.ai/officevalley/background.jpg";

const BOSS_SKILLS = [
  { id: "b1", name: "下班·封印术", nickname: "17:59分的发起人", desc: "17:59 发起会议，锁定下班按钮", attackText: "快下班了，`简单`开个会，所有人进会议室！", satisfiedText: "既然你还有紧急交付，那这次会你先不用参加了，看纪要吧。", icon: PhoneCall },
  { id: "b2", name: "微操·周报催命", nickname: "对齐颗粒度的王总", desc: "要求精确到分钟的日报，体力减半", attackText: "这周产出不够饱和啊，发个周报看看？", satisfiedText: "这个总结非常有深度，看到你对底层架构的思考了，不错。", icon: FileText }
];

const ALL_EMP_SKILLS = [
  { 
    id: "e1", name: "AI 嘴替·礼貌回绝", nickname: "反卷链路突围者", desc: "LLM 生成高情商废话", icon: Smile, 
    brand: "DeepSeek", brandColor: "#007AFF", brandIcon: MessageCircle, 
    techTitle: "DeepSeek 教你怎么委婉拒绝中...", 
    castSteps: ["分析老板语气情绪...", "匹配‘委婉拒绝’大模型...", "正在构建高情商拒接话术...", "生成最终回复内容..."],
    actionBtn: "发送回复", resultType: "text", resultContent: "收到。但我手头有一个紧急需求必须在今晚交付，可能无法参加。我会看纪要，有需要我配合的随时同步。", link: "https://chatgpt.com/" 
  },
  { 
    id: "e2", name: "黑话·周报膨胀术", nickname: "底层逻辑架构师(自封)", desc: "把 1 个 Bug 吹成底层重构", icon: Cpu, 
    brand: "Kimi", brandColor: "#00E266", brandIcon: Sparkles, 
    techTitle: "Kimi.ai 智能扩写", 
    castSteps: ["扫描原始日报文本...", "提取核心交付物...", "注入‘底层逻辑’等大厂黑话...", "生成深度工作复盘..."],
    actionBtn: "生成周报", resultType: "file", resultTitle: "本周工作复盘.docx", resultDesc: "字数: 3,420 | 查重率: 0% | 黑话浓度: 极高", link: "https://kimi.moonshot.cn/" 
  }
];

const GUIDE_SKILLS = {
  e1: {
    id: "e1",
    brand: "DeepSeek",
    brandColor: "#007AFF",
    brandIcon: MessageCircle,
    strategy: "结构化拒绝法：先肯定价值，再陈述客观冲突，最后给出可执行替代方案。",
    masterPrompt:
      "[角色设定] 你是资深职场沟通顾问，语气专业克制、尊重上下级关系。\n" +
      "[任务目标] 生成一段礼貌拒绝参加 17:59 临时会议的回复。\n" +
      "[约束条件] 必须包含：肯定价值 + 客观冲突 + 替代方案；长度 80-120 字；不情绪化、不抱怨；可承诺补看纪要或提供书面输入。\n" +
      "[输出格式] 仅输出一段可直接发送的中文回复。",
    link: "https://deepseek.com/"
  },
  e2: {
    id: "e2",
    brand: "Kimi",
    brandColor: "#00E266",
    brandIcon: Sparkles,
    strategy: "价值锚点放大法：把零散事务上升为关键目标推进与可量化价值。",
    masterPrompt:
      "[角色设定] 你是资深职场沟通顾问，擅长将具体工作与业务目标对齐。\n" +
      "[任务目标] 把一条具体任务扩写为“关键目标推进”的周报段落，适用于任何行业。\n" +
      "[约束条件] 清晰说明背景、动作、结果与价值；给出1-2个可量化指标或合理区间；避免空话与夸大；字数 150-220 字。\n" +
      "[输出格式] 输出一段周报正文，不要标题。",
    link: "https://kimi.moonshot.cn/"
  }
};

const SKILL_LINKAGE = { b1: ["e1"], b2: ["e2"] };

// --- 2. 打字机组件 ---
function Typewriter({ text, speed = 30, delay = 0, onComplete, className = "" }) {
  const [displayedText, setDisplayedText] = useState("");
  const hasCompleted = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedText("");
    hasCompleted.current = false;
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          if (onCompleteRef.current && !hasCompleted.current) {
            hasCompleted.current = true;
            onCompleteRef.current();
          }
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return <span className={className}>{displayedText}</span>;
}

export default function App() {
  const [scene, setScene] = useState("start");
  const [selected, setSelected] = useState({ boss: [], emp: [] });
  const [guideSkillId, setGuideSkillId] = useState(null);
  const availableEmpSkills = useMemo(() => {
    const bossId = selected.boss[0];
    return bossId ? ALL_EMP_SKILLS.filter(s => SKILL_LINKAGE[bossId].includes(s.id)) : [];
  }, [selected.boss]);
  const guideSkill = guideSkillId ? GUIDE_SKILLS[guideSkillId] : null;

  const toggleSkill = (role, id) => {
    setSelected(prev => {
      const isSet = prev[role].includes(id);
      if (role === "boss") return { boss: isSet ? [] : [id], emp: [] };
      return { ...prev, emp: isSet ? [] : [id] };
    });
  };

  return (
    /* 使用 h-svh (Small Viewport Height) 适配移动端浏览器工具栏 */
    <div className="h-screen supports-[height:100svh]:h-[100svh] w-screen overflow-hidden relative bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${OFFICE_BG_URL})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
      
      <AnimatePresence mode="wait">
        {scene === "start" && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
            <h1 className="pixel-zh-title text-4xl sm:text-6xl md:text-8xl mb-4 tracking-widest">摸鱼谷物语</h1>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-700 drop-shadow-[2px_2px_0_#000] mb-12 uppercase">Office Valley</h2>
            <motion.button onClick={() => setScene("select")} whileHover={{ scale: 1.05 }} className="px-8 py-4 md:px-12 md:py-6 bg-green-500 text-black font-bold text-xl md:text-2xl border-2 border-black flex items-center gap-4 shadow-[4px_4px_0_#000]">
              <Play fill="currentColor" size={20} /> START GAME
            </motion.button>
          </motion.div>
        )}

        {scene === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 h-full flex flex-col p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 md:mb-6 bg-black/60 p-3 md:p-4 rounded-xl border border-white/10 backdrop-blur-xl">
              <button onClick={() => setScene("start")} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm md:text-base"><ArrowLeft size={18} /> BACK</button>
              <h2 className="text-lg md:text-2xl font-bold text-yellow-400">配置对局</h2>
              <div className="w-12 md:w-16"></div>
            </div>
            
            {/* 列表在移动端垂直排列，并增加滚动支持 */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 items-stretch justify-center max-w-7xl mx-auto w-full overflow-hidden">
              <SelectCard role="boss" title="BOSS" skills={BOSS_SKILLS} selectedIds={selected.boss} onToggle={toggleSkill} theme="red" />
              <div className="hidden md:flex items-center justify-center"><Swords className={`w-10 h-10 transition-colors ${selected.emp.length ? 'text-yellow-500 animate-bounce' : 'text-slate-700'}`} /></div>
              <SelectCard role="emp" title="YOU" skills={availableEmpSkills} selectedIds={selected.emp} onToggle={toggleSkill} theme="blue" isLocked={selected.boss.length === 0} />
            </div>

            <div className="mt-6 flex justify-center pb-4">
              <motion.button 
                disabled={selected.emp.length === 0} 
                onClick={() => setScene("battle")} 
                className="w-full md:w-auto px-12 py-4 bg-yellow-500 text-black font-bold text-lg rounded-xl disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
              >
                <Swords size={20} /> ENTER OFFICE
              </motion.button>
            </div>
          </motion.div>
        )}

        {scene === "battle" && (
          <BattleScene
            key="battle"
            bossSkill={BOSS_SKILLS.find(s => s.id === selected.boss[0])}
            empSkill={ALL_EMP_SKILLS.find(s => s.id === selected.emp[0])}
            onBack={() => setScene("select")}
            onLearnMore={(id) => {
              setGuideSkillId(id);
              setScene("guide");
            }}
          />
        )}

        {scene === "guide" && (
          <GuideScene
            key="guide"
            skill={guideSkill || GUIDE_SKILLS.e1}
            onBack={() => setScene("battle")}
          />
        )}
      </AnimatePresence>

      <style>{`
        .pixel-zh-title { font-family: "SimHei", "Microsoft YaHei", sans-serif; font-weight: 900; color: #facc15; text-shadow: 2px 2px 0px #a16207, 4px 4px 0px #000000; letter-spacing: 0.1em; }
        .shake-crazy { animation: shake-crazy 0.5s cubic-bezier(.36,.07,.19,.97) both infinite; }
        @keyframes shake-crazy { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .ko-glitch { animation: glitch 0.3s linear infinite; }
        @keyframes glitch { 0% { opacity: 1; } 50% { opacity: 0.4; transform: scale(1.1); } 100% { opacity: 1; } }
        .winner-aura { animation: winner-aura-pulse 2s infinite; }
        @keyframes winner-aura-pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); } 70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        .guide-grid { background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; }
        .glass-20 { backdrop-filter: blur(20px); }
        .prompt-frame { border: 2px dashed rgba(148, 163, 184, 0.35); box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.6); }
        .pulse-btn { animation: pulse-glow 2.2s ease-in-out infinite; }
        .breath-btn { animation: breathe 1.8s ease-in-out infinite; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); }
        @keyframes pulse-glow { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45); } 70% { transform: scale(1.02); box-shadow: 0 0 0 18px rgba(34, 197, 94, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        @keyframes breathe { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); } 60% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(59, 130, 246, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        .tag-role { color: #facc15; }
        .tag-goal { color: #22c55e; }
        .tag-constraint { color: #60a5fa; }
        .tag-format { color: #f97316; }
      `}</style>
    </div>
  );
}

// ================= 3. 战斗场景组件 (优化移动端对话与进度展示) =================
function BattleScene({ bossSkill, empSkill, onBack, onLearnMore }) {
  const [turnState, setTurnState] = useState("loop"); 
  const [isBossAngry, setIsBossAngry] = useState(false);
  const [castStepIndex, setCastStepIndex] = useState(0); 
  const [isCastingDone, setIsCastingDone] = useState(false);
  const [isSatisfiedTypingDone, setIsSatisfiedTypingDone] = useState(false); 
  const [isBossSpeechDone, setIsBossSpeechDone] = useState(false);
  const scrollRef = useRef(null);

  const isBossDefeated = turnState === "boss_satisfied";

  useEffect(() => {
    setIsBossSpeechDone(false);
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turnState, castStepIndex, isSatisfiedTypingDone]);

  useEffect(() => {
    setIsBossSpeechDone(false);
  }, [bossSkill.id]);

  useEffect(() => {
    if (["casting", "player_atk", "boss_satisfied"].includes(turnState)) {
      setIsBossAngry(false); return;
    }
    const initialDelay = setTimeout(() => {
      setIsBossAngry(true);
      setTimeout(() => setIsBossAngry(false), 1200);
    }, 1000); 

    const interval = setInterval(() => {
      setIsBossAngry(true);
      setTimeout(() => setIsBossAngry(false), 1200);
    }, 3500); 
    
    return () => { clearInterval(interval); clearTimeout(initialDelay); };
  }, [turnState]);

  useEffect(() => {
    if (turnState === "casting") {
      setCastStepIndex(0);
      setIsCastingDone(false);
      const totalSteps = empSkill.castSteps.length;
      let current = 0;
      const interval = setInterval(() => {
        if (current < totalSteps - 1) {
          current++;
          setCastStepIndex(current);
        } else {
          clearInterval(interval);
          setIsCastingDone(true);
        }
      }, 800); 
      return () => clearInterval(interval);
    }
  }, [turnState, empSkill]);

  const handleStartCast = () => setTurnState("casting");

  const handleFire = () => {
    setTurnState("result_display");
    setTimeout(() => {
      setTurnState("player_atk");
      setTimeout(() => {
        setTurnState("boss_satisfied"); 
      }, 800); 
    }, 800);
  };

  const handleLearnMore = () => onLearnMore && onLearnMore(empSkill.id);

  return (
    <div className="relative z-20 h-full w-full flex flex-col items-center justify-between p-4 md:p-6">
      {/* 顶部状态栏 - 移动端减小头像和间距 */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-black/60 p-3 md:p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 md:gap-5 flex-1">
          <motion.div animate={isBossDefeated ? { y: 5, rotate: 5, opacity: 0.7 } : {}} className="text-3xl md:text-5xl">{isBossDefeated ? '🫠' : '🧐'}</motion.div>
          <div className="min-w-0">
            <div className={`font-bold text-xs md:text-lg truncate ${isBossDefeated ? 'text-slate-500' : 'text-red-400'}`}>
              {bossSkill.nickname}
            </div>
            <div className="w-20 md:w-40 h-2 bg-red-900/40 rounded-full mt-1.5 overflow-hidden border border-red-500/10">
              <motion.div animate={{ width: isBossDefeated ? "0%" : "100%", backgroundColor: isBossDefeated ? "#475569" : "#ef4444" }} className="h-full shadow-[0_0_8px_#ef4444]" />
            </div>
          </div>
        </div>
        <div className="text-yellow-500 font-black text-lg md:text-2xl italic tracking-tighter opacity-40 px-2">VS</div>
        <div className="flex items-center gap-2 md:gap-5 text-right flex-1 justify-end">
          <div className="min-w-0">
            <div className={`font-bold text-xs md:text-lg truncate ${isBossDefeated ? 'text-green-400' : 'text-blue-400'}`}>
              {empSkill.nickname}
            </div>
            <div className="w-20 md:w-40 h-2 bg-green-900/50 rounded-full mt-1.5 overflow-hidden border border-green-500/20 ml-auto">
              <motion.div initial={{ width: "100%" }} className="h-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            </div>
          </div>
          <motion.div className={`text-3xl md:text-5xl rounded-full flex items-center justify-center ${isBossDefeated ? 'winner-aura bg-green-500/30' : ''}`} style={{ width: '40px', height: '40px' }}>
            {isBossDefeated ? '😎' : '🧑‍💻'}
          </motion.div>
        </div>
      </div>

      {/* 消息区域 - 移动端优化气泡最大宽度 */}
      <div ref={scrollRef} className="flex-1 w-full max-w-2xl overflow-y-auto px-2 py-6 md:py-10 space-y-8 md:space-y-12 no-scrollbar scroll-smooth">
        {/* 老板消息 */}
        {["loop", "casting", "result_display", "player_atk", "boss_satisfied"].includes(turnState) && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start">
             <div className={`p-4 md:p-6 rounded-2xl rounded-tl-none max-w-[85%] md:max-w-sm bg-white text-black shadow-2xl border-2 md:border-4 ${isBossAngry ? "shake-crazy border-red-500" : "border-transparent"}`}>
               <div className="text-[9px] md:text-[10px] font-black mb-1 md:mb-2 text-red-500 border-b pb-1.5">{bossSkill.nickname}</div>
               <div className="text-base md:text-xl font-black leading-snug">“<Typewriter text={bossSkill.attackText} speed={40} onComplete={() => setIsBossSpeechDone(true)} />”</div>
             </div>
          </motion.div>
        )}

        {/* 员工反击 */}
        {["result_display", "player_atk", "boss_satisfied"].includes(turnState) && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
             <div className="p-4 md:p-6 rounded-2xl rounded-tr-none max-w-[85%] md:max-w-sm border-2 md:border-4 border-blue-400 bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]">
               <div className="text-[9px] md:text-[10px] font-black mb-2 md:mb-3 opacity-70 uppercase tracking-widest">{empSkill.nickname}</div>
               {empSkill.resultType === 'text' ? (
                 <div className="text-sm md:text-lg font-bold italic leading-relaxed">"<Typewriter text={empSkill.resultContent} speed={30} />"</div>
               ) : (
                 <div className="flex items-center gap-3 bg-white/10 p-3 md:p-4 rounded-xl border border-white/20">
                    <div className="p-2 bg-white/10 rounded-lg"><empSkill.icon size={20}/></div>
                    <div className="min-w-0"><div className="font-black text-xs md:text-sm truncate">{empSkill.resultTitle}</div><div className="text-[9px] md:text-[10px] opacity-60 font-mono mt-0.5">{empSkill.resultDesc}</div></div>
                 </div>
               )}
             </div>
          </motion.div>
        )}

        {/* 结算 */}
        {isBossDefeated && (
          <>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start">
              <div className="p-4 md:p-6 rounded-2xl rounded-tl-none max-w-[85%] md:max-w-sm bg-green-50 text-green-900 border-2 md:border-4 border-green-500 shadow-2xl">
                <div className="text-[9px] md:text-[10px] font-black mb-1 md:mb-2 text-green-600 border-b border-green-200 pb-1.5">{bossSkill.nickname} (已安抚)</div>
                <div className="text-sm md:text-lg font-black leading-snug">
                  “{isSatisfiedTypingDone ? bossSkill.satisfiedText : <Typewriter text={bossSkill.satisfiedText} speed={40} delay={500} onComplete={() => setIsSatisfiedTypingDone(true)} />}”
                </div>
              </div>
            </motion.div>
            
            {isSatisfiedTypingDone && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 py-6">
                <div className="w-full max-w-xs md:max-w-sm bg-slate-900/90 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl shadow-2xl text-center space-y-4">
                  <Trophy size={40} className="mx-auto text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]" />
                  <h4 className="text-xl md:text-2xl font-black italic pixel-zh-title">对线大胜利!</h4>
                  <p className="text-xs md:text-sm text-slate-400">刚才化解危机的神器是 <b>{empSkill.brand}</b>。</p>
                  <button onClick={handleLearnMore} className="w-full bg-green-600 text-white py-3 md:py-4 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-lg">🚀 去学习 {empSkill.brand} <ExternalLink size={16} /></button>
                  <button onClick={onBack} className="w-full text-slate-500 hover:text-white text-[10px] md:text-xs font-bold underline">挑战下一关</button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* 底部按钮 - 移动端全宽并减小高度 */}
      <div className="w-full max-w-4xl h-24 md:h-32 bg-slate-900/90 rounded-2xl md:rounded-3xl border-2 md:border-4 border-slate-700 backdrop-blur-xl flex items-center justify-center p-4 shadow-2xl">
        <button 
          onClick={handleStartCast} 
          disabled={turnState !== "loop"} 
          className={`w-full md:w-auto md:px-16 py-3 md:py-4 rounded-xl font-black text-lg md:text-2xl flex items-center justify-center gap-3 border-b-4 md:border-b-8 transition-all active:translate-y-1 md:active:translate-y-2 active:border-b-0 ${turnState === "loop" ? "bg-blue-600 border-blue-800 text-white" : "bg-slate-800 border-slate-950 text-slate-600 opacity-40"} ${turnState === "loop" && isBossSpeechDone ? "breath-btn" : ""}`}
        >
          <empSkill.icon size={22} /> {empSkill.name.split('·')[1]}
        </button>
      </div>

      {/* 品牌拟态演示窗 - 移动端适配 */}
      <AnimatePresence>
        {turnState === "casting" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-2 md:border-4" style={{ borderColor: empSkill.brandColor }}>
              <div className="px-4 py-3 flex items-center justify-between border-b" style={{ backgroundColor: empSkill.brandColor + '20', borderColor: empSkill.brandColor + '40' }}>
                <div className="flex items-center gap-2">
                  <empSkill.brandIcon size={16} style={{ color: empSkill.brandColor }} />
                  <span className="font-black text-sm md:text-base">{empSkill.brand} AI Engine</span>
                </div>
                <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/50" /><div className="w-2 h-2 rounded-full bg-green-500/50" /></div>
              </div>

              <div className="bg-slate-950 p-5 md:p-8 min-h-[360px] md:min-h-[420px] flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <div className="min-w-0 pr-2">
                    <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Process</div>
                    <div className="text-lg md:text-3xl font-black truncate" style={{ color: empSkill.brandColor }}>{empSkill.techTitle}</div>
                  </div>
                  <div className="text-sm md:text-xl font-mono font-bold text-slate-600 bg-slate-900 px-3 py-1 md:px-4 md:py-2 rounded-lg">{castStepIndex + 1}/{empSkill.castSteps.length}</div>
                </div>

                <div className="flex-1 flex items-center justify-center mb-6">
                  <div className="space-y-4 w-full">
                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm md:text-base font-medium leading-relaxed" style={{ color: empSkill.brandColor }}>
                      {empSkill.castSteps[castStepIndex]}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col items-center">
                  {!isCastingDone ? (
                    <div className="w-full text-center">
                      <div className="text-sm md:text-lg font-black text-white italic mb-4">{empSkill.castSteps[castStepIndex]}</div>
                      <div className="flex justify-center gap-1">{empSkill.castSteps.map((_, i) => (<div key={i} className={`h-1 rounded-full transition-all duration-500 ${castStepIndex >= i ? 'w-6 md:w-8' : 'w-1.5 md:w-2 bg-white/10'}`} style={{ backgroundColor: castStepIndex >= i ? empSkill.brandColor : undefined }} />))}</div>
                    </div>
                  ) : (
                    <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={handleFire} className="w-full py-4 rounded-xl font-black text-base md:text-xl flex items-center justify-center gap-2 shadow-2xl" style={{ backgroundColor: empSkill.brandColor }}>
                      <Send size={20}/> {empSkill.actionBtn}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuideScene({ skill, onBack }) {
  const [typedText, setTypedText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let index = 0;
    let intervalId = null;
    setTypedText("");

    intervalId = setInterval(() => {
      index += 2;
      const snippet = skill.masterPrompt.slice(0, index);
      setTypedText(snippet);
      if (index >= skill.masterPrompt.length) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }, 20);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [skill]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(skill.masterPrompt);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = skill.masterPrompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const handleEnter = () => {
    if (skill.link) {
      window.open(skill.link, "_blank", "noopener");
    }
  };

  const renderPromptNodes = (text) => {
    const parts = text.split(/(\[(?:角色设定|任务目标|约束条件|输出格式)\])/);
    return parts
      .filter(Boolean)
      .map((part, index) => {
        if (part === "[角色设定]") return <span key={index} className="tag-role">{part}</span>;
        if (part === "[任务目标]") return <span key={index} className="tag-goal">{part}</span>;
        if (part === "[约束条件]") return <span key={index} className="tag-constraint">{part}</span>;
        if (part === "[输出格式]") return <span key={index} className="tag-format">{part}</span>;
        return <span key={index} className="text-slate-200">{part}</span>;
      });
  };

  return (
    <div className="relative z-10 h-full w-full flex flex-col bg-black text-white">
      <div className="absolute inset-0 guide-grid opacity-40"></div>

      <div className="relative z-10 h-full flex flex-col p-4 md:p-8 gap-6">
        <div className="flex items-center justify-between bg-slate-950/80 border border-white/10 rounded-2xl p-4 md:p-5 glass-20 shadow-2xl">
          <button onClick={onBack} className="text-slate-300 hover:text-white flex items-center gap-2 font-bold text-sm md:text-base">
            <ArrowLeft size={18} /> BACK
          </button>
          <div className="text-sm md:text-lg font-black text-yellow-400 tracking-widest">AI 攻略</div>
          <div className="w-12 md:w-16"></div>
        </div>

        <div className="flex flex-col gap-6 flex-1">
          <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-4 md:p-6 glass-20 shadow-2xl">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 flex items-center justify-center" style={{ borderColor: skill.brandColor }}>
              <skill.brandIcon size={24} style={{ color: skill.brandColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl md:text-2xl font-black tracking-wide">{skill.brand}</div>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-black border" style={{ color: skill.brandColor, borderColor: `${skill.brandColor}66`, backgroundColor: `${skill.brandColor}22` }}>
                获胜策略
              </div>
              <div className="mt-2 text-sm md:text-base text-slate-300 leading-relaxed">{skill.strategy}</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-4 md:p-6 glass-20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm md:text-base font-black text-blue-300 uppercase tracking-widest">Master Prompt</div>
              <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-black border border-blue-400/60 text-blue-200 bg-blue-500/10">
                {copied ? "已复制" : "📋 一键复制"}
              </button>
            </div>

            <div className="flex-1 bg-slate-950/80 rounded-2xl prompt-frame p-4 md:p-5 overflow-hidden">
              <div className="h-full overflow-y-auto pr-1 font-mono text-sm md:text-base leading-relaxed text-slate-200 whitespace-pre-wrap">
                {renderPromptNodes(typedText)}
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button onClick={handleEnter} className="w-full py-4 md:py-5 rounded-2xl font-black text-base md:text-xl text-black bg-gradient-to-r from-green-400 to-green-600 border-2 border-black shadow-[6px_6px_0_#000] pulse-btn">
              进入 {skill.brand} 开始实战
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= 选择卡片组件 (优化移动端卡片内滚动) =================
function SelectCard({ role, title, skills, selectedIds, onToggle, theme, isLocked }) {
  const c = theme === "red" ? "border-red-500/30 bg-red-500/10" : "border-blue-500/30 bg-blue-500/10";
  const active = theme === "red" ? "border-red-500 bg-red-500/30" : "border-blue-500 bg-blue-500/30";

  return (
    <div className={`flex-1 border-2 ${c} rounded-[24px] md:rounded-[32px] p-4 md:p-6 flex flex-col gap-3 md:gap-5 backdrop-blur-sm overflow-hidden shadow-2xl`}>
      <h3 className={`text-xl md:text-4xl font-black text-center ${theme === 'red' ? 'text-red-400' : 'text-blue-400'}`}>{title}</h3>
      {isLocked ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale py-10"><Lock size={32} /><p className="mt-2 text-xs font-black uppercase">Locked</p></div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar min-h-[140px]">
          {skills.map(s => (
            <div key={s.id} onClick={() => onToggle(role, s.id)} className={`p-3 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 md:gap-5 ${selectedIds.includes(s.id) ? active : "border-white/5 bg-white/5"}`}>
              <div className={`p-2 md:p-3 rounded-lg ${selectedIds.includes(s.id) ? 'bg-white/10' : 'bg-black/20'}`}><s.icon size={20} className="md:w-7 md:h-7" /></div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-black text-sm md:text-lg leading-tight truncate">{s.name}</div>
                {s.desc && <div className="text-[10px] md:text-sm opacity-80 leading-snug mt-1 font-medium line-clamp-2">{s.desc}</div>}
              </div>
              {selectedIds.includes(s.id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-2 h-2 rounded-full flex-shrink-0 ${theme === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}