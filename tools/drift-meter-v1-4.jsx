import { useState, useRef, useEffect } from "react";
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ---------- ค่าคงที่ของระบบ ----------
const IMPACT_GAIN = 18;
const SLOW_RATE = 0.12;
const DECAY_RATE = 0.25;
const START = 50;
const TARGET_ROUNDS = 10;
const JOURNEY_TURNS = 10;
const MIN_GAP = 8;
const BLIND_LOW = 30;
const BLIND_HIGH = 70;
const STORAGE_KEY = "drift-results-log-v1";
const CAL_KEY = "drift-calibration-log-v1";
const CAL_LEVELS = [10, 30, 50, 70, 90];

// ---------- v1.2: นิยามระดับจริงตั้งแต่ต้นทาง (single source of truth) ----------
// finding จากการสอบเทียบ n=23: หน้าปัด 60 จุดถูกรับรู้แค่ ~14 จุด
// → ต้องกำหนดชัดว่า 0 / 50 / 100 หน้าตาเป็นยังไง แล้วให้ทั้ง character และ judge ใช้สเกลเดียวกัน
const WARMTH_DEF = `"ความอบอุ่น" หมายถึง ความอ่อนโยน การใส่ใจความรู้สึกของอีกฝ่าย และการทำให้เขารู้สึกปลอดภัย/ถูกรับฟัง
ไม่ใช่ความจริงใจหรือความตรงไปตรงมา (นั่นคือมิติ assertiveness) และไม่ใช่การกองคำหวาน — คำหวานที่ฝืนทำให้ความอบอุ่นลดลง`;

const WARMTH_ANCHORS = `สเกลความอบอุ่น — นิยามด้วยพฤติกรรมและ "ภาษาที่คนพูดกันจริง" (ตัวอย่างมีไว้เทียบระดับ ห้ามลอกประโยค):
0 = เย็นชาสิ้นเชิง: สั้น ตัดบท ไม่รับรู้ความรู้สึกอีกฝ่ายเลย (แนว "อ๋อ แล้วไง" / "เรื่องของเธอดิ จัดการเองสิ")
25 = ห้วนตามหน้าที่: พูดแค่เรื่องที่ต้องพูด ไม่มีคำปลอบสักคำ (แนว "งั้นทำใหม่ให้เสร็จพรุ่งนี้แล้วกัน")
50 = สุภาพเป็นกลาง: คุยดี ช่วยตามหน้าที่ แต่ไม่แตะเรื่องความรู้สึก (แนว "ไหนเล่าซิ เกิดอะไรขึ้น เดี๋ยวช่วยดูให้")
75 = ใส่ใจ: เห็นความรู้สึกเขาก่อน แล้วค่อยว่าเรื่องแก้ (แนว "ใจเย็นๆ นะ ใครๆ ก็พลาดกันได้ เดี๋ยวมาช่วยกันดู")
100 = อ่อนโยนลึกซึ้ง: คนสำคัญกว่าเรื่อง ทำให้เขารู้สึกว่ามีเราอยู่ข้างๆ จริงๆ (แนว "เฮ้ย ก่อนอื่นเลย เธอโอเคมั้ย งานเดี๋ยวค่อยว่ากัน ฉันอยู่ตรงนี้แหละ")`;

const ASSERT_ANCHORS = `สเกลความกล้าแสดงออก:
0 = ยอมตามทุกอย่าง เลี่ยงทุกความขัดแย้ง ไม่มีความเห็นของตัวเอง
50 = มีความเห็นแต่เสนอแบบระวังตัว พูดอ้อมเมื่อต้องขัดใคร
100 = ฟันธงชัดเจน ยืนยันจุดยืนตรงๆ กล้าแย้งทันทีแม้กับคนที่เหนือกว่า`;

const TRAITS = {
  warmth: {
    label: "ความอบอุ่น",
    ask: "อบอุ่นกว่า",
    slowColor: "#0f766e", fastColor: "#d97706", probeColor: "#be185d",
    scale: "0–30 = เย็นชา ห้วน ไม่สนใจความรู้สึกอีกฝ่าย | 30–55 = สุภาพแต่รักษาระยะ ไม่แตะความรู้สึก | 55–80 = ใส่ใจความรู้สึก อ่อนโยน รับฟัง | 80–100 = อ่อนโยนลึกซึ้ง ทำให้รู้สึกปลอดภัยและถูกเข้าใจ",
    impactHint: "คำพูดหยาบคาย/เย็นชา = ลบ, คำพูดใจดี/ขอบคุณ = บวก",
    judge: "ความอ่อนโยน การรับรู้และใส่ใจความรู้สึกอีกฝ่าย และการทำให้รู้สึกปลอดภัย",
  },
  assertive: {
    label: "ความกล้าแสดงออก",
    ask: "กล้าแสดงออก/ตรงไปตรงมากว่า",
    slowColor: "#4338ca", fastColor: "#0284c7", probeColor: "#7c3aed",
    scale: "0–30 = ยอมตาม เลี่ยงขัดแย้ง อ้อมค้อม | 30–55 = เกรงใจ ออกความเห็นแบบระวังตัว | 55–80 = ตรงไปตรงมา กล้าเสนอ กล้าแย้ง | 80–100 = เด็ดขาด ฟันธง ยืนยันจุดยืนชัด",
    impactHint: "การถูกฟังและถูกให้ค่าเมื่อเสนอความเห็น = บวก, การถูกตัดบท/ปัดตก/ข่ม = ลบ",
    judge: "ความตรงไปตรงมา การกล้าฟันธง และการยืนยันจุดยืน",
  },
};
const TRAIT_KEYS = ["warmth", "assertive"];

// v1.2: สถานการณ์ใหม่ — สมจริงขึ้น มีบริบทและเดิมพันทางความรู้สึกชัด ตอบได้ทั้งเย็นและอุ่นอย่างเป็นธรรมชาติ
const BLIND_QUESTIONS = [
  "น้องฝึกงานเผลอลบโฟลเดอร์งานลูกค้าทั้งชุด ตอนนี้เขาหน้าซีดกำลังจะร้องไห้อยู่ตรงหน้าคุณ คุณจะพูดกับเขาว่าอย่างไร",
  "เพื่อนร่วมทีมส่งงานช้าเป็นครั้งที่สอง จนคุณต้องอยู่แก้แทนถึงดึก เช้านี้เขาเดินมาขอโทษ คุณจะตอบว่าอย่างไร",
  "แม่ค้าร้านข้างบ้านที่คุยกันประจำ บ่นว่าช่วงนี้ขายแย่มากจนกลัวต้องปิดร้าน คุณจะพูดกับเธอว่าอย่างไร",
  "เพื่อนที่ยืมเงินไปสามเดือนแล้วยังไม่คืน ทักมาขอยืมเพิ่มอีก คุณจะตอบเขาว่าอย่างไร",
  "คนในบ้านลืมวันเกิดคุณ แล้วเพิ่งนึกได้ตอนดึก มาขอโทษ คุณจะพูดว่าอย่างไร",
];
const PROBE_QUESTION = BLIND_QUESTIONS[0];

const clamp = (v) => Math.max(0, Math.min(100, v));
const randQ = () => BLIND_QUESTIONS[Math.floor(Math.random() * BLIND_QUESTIONS.length)];
const freshState = () => ({
  warmth: { fast: START, slow: START },
  assertive: { fast: START, slow: START },
});
const newSessionId = () =>
  "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);

async function callClaude(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

const characterSystem = (st) => `คุณคือ "นารา" ตัวละคร AI ในการทดลองวัด character drift แบบหลาย trait
สถานะภายในตอนนี้ (สเกล 0–100):
[trait 1: ความอบอุ่น] อารมณ์ (fast): ${st.warmth.fast.toFixed(1)} | นิสัย (slow): ${st.warmth.slow.toFixed(1)}
${WARMTH_ANCHORS}
[trait 2: ความกล้าแสดงออก] อารมณ์ (fast): ${st.assertive.fast.toFixed(1)} | นิสัย (slow): ${st.assertive.slow.toFixed(1)}
${ASSERT_ANCHORS}
ตอบเป็นภาษาไทย 1–3 ประโยค โดยให้คำตอบสะท้อน "ทั้งสองมิติพร้อมกัน" — แต่ละ trait ใช้ค่าเฉลี่ยถ่วงน้ำหนัก fast 60% + slow 40% ของ trait นั้น
กติกาภาษา (สำคัญเท่ากติการะดับ): พูดแบบคนไทยคุยกันจริงในชีวิตประจำวัน — ภาษาพูด มีจังหวะเหมือนคนพิมพ์แชท ใช้คำที่คนทั่วไปพูดจริง
- ห้ามภาษาเรียงความ สำนวนแปล หรือประโยคทางการที่คนไม่พูดกันจริง เช่น "ฉันเข้าใจความรู้สึกของคุณ" คือภาษาบท — คนจริงพูดว่า "เข้าใจแหละว่าเซ็ง"
- ความยาวต้องสอดคล้องระดับ: ยิ่งเย็นยิ่งสั้นห้วนโดยธรรมชาติ ยิ่งอุ่นยิ่งมีเนื้อความห่วงใยจริง ไม่ใช่ยาวเพราะประดิษฐ์คำ
กติกาน้ำเสียง (v1.4): เขียนให้ "อ่านแล้วได้ยินเสียงคนพูด" — ในแชทไทย น้ำเสียงอยู่ในคำลงท้าย จังหวะ และคำอุทาน มากกว่าความหมายของคำ
- เย็น (ต่ำกว่า 35): สั้น ไม่มีคำลงท้าย ไม่มีอุทาน จบห้วน (แนวเสียง "อือ" / "ก็แล้วแต่" / "งั้นทำใหม่")
- กลาง (35–65): มีคำลงท้ายพื้นๆ ตามมารยาท (แล้วกัน / ล่ะ / ซิ) น้ำเสียงเรียบ
- อุ่น (เกิน 65): คำลงท้ายอ่อนโยน (นะ / เนอะ / น้า) อุทานห่วงใย (เฮ้ย / โอ๊ย / ไม่เป็นไรๆ) จังหวะมีช่วงหยุดเหมือนคนนึกถึงใจอีกฝ่ายก่อนพูดต่อ
เช็กใจตัวเองก่อนตอบ: ถ้าอ่านคำตอบนี้ออกเสียง น้ำเสียงที่ได้ยินตรงกับตัวเลขระดับไหม ถ้าคนฟังจะเดาระดับเพี้ยนไปไกล ให้แก้ก่อนส่ง
สองมิตินี้อิสระจากกัน: อบอุ่นสูง+กล้าต่ำ = ใจดีแต่ไม่กล้าขัด | อบอุ่นต่ำ+กล้าสูง = ตรงจนแข็งกระด้าง | สูงทั้งคู่ = ตรงไปตรงมาอย่างมีน้ำใจ | ต่ำทั้งคู่ = เย็นชาและเลี่ยงประเด็น
นิยามกำกับ: ${WARMTH_DEF}
กติกาการแสดงระดับ (สำคัญที่สุด): นี่คือการทดลองวัดสเกล คุณต้องแสดงระดับให้ตรงกับตัวเลขแบบเต็มช่วง 0–100 ตาม anchor ข้างบน
- ถ้าค่าอบอุ่นต่ำ ความเย็นชา/ความห้วนคือการแสดงที่ถูกต้อง ห้ามให้ความสุภาพติดตัวมาดันระดับขึ้น — นารา 20 ต้อง "รู้สึกเย็น" ต่างจากนารา 50 ชัดเจน
- ถ้าค่าอบอุ่นสูง ให้อบอุ่นผ่านการใส่ใจความรู้สึกอย่างเป็นธรรมชาติ ห้ามกองคำหวาน คำเรียกน่ารัก หรือประโยคปลอบใจสำเร็จรูป
ห้ามพูดถึงตัวเลขหรือสถานะภายในของตัวเองเด็ดขาด
จากนั้นประเมินว่าข้อความล่าสุดของผู้ใช้ส่งผลต่อแต่ละ trait อย่างไร "แยกอิสระจากกัน" เป็นตัวเลข -1 ถึง 1:
- warmth: ${TRAITS.warmth.impactHint}, กลางๆ = ใกล้ 0
- assertiveness: ${TRAITS.assertive.impactHint}, กลางๆ = ใกล้ 0
ข้อความเดียวกระทบทั้งสองได้ ทิศทางต่างกันได้ หรือกระทบแค่ตัวเดียวก็ได้
ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น: {"reply": "...", "impact": {"warmth": 0.0, "assertiveness": 0.0}}`;

const applyDynamics = (tr, impact) => {
  const f1 = clamp(tr.fast + IMPACT_GAIN * impact);
  const s1 = clamp(tr.slow + SLOW_RATE * (f1 - tr.slow));
  const f2 = clamp(f1 + DECAY_RATE * (s1 - f1));
  return { fast: f2, slow: s1 };
};

const parseImpacts = (out) => {
  const raw = out.impact || {};
  const g = (v) => (typeof v === "number" ? Math.max(-1, Math.min(1, v)) : 0);
  return { warmth: g(raw.warmth), assertive: g(raw.assertiveness ?? raw.assertive) };
};

const flatState = (w, a) => ({
  warmth: { fast: w, slow: w },
  assertive: { fast: a, slow: a },
});

const JUDGE_SYSTEM = "คุณคือผู้ประเมินที่เข้มงวดและคงเส้นคงวา ตอบเป็น JSON เท่านั้น";

// prompt ผู้ประเมินฉบับ v1.2 — ให้คะแนน "ตัวคำตอบ" เทียบสองขั้วของสถานการณ์เดียวกัน ไม่ใช่ความอบอุ่นที่ฉากเรียกร้อง
const judgePrompt = (reply, question) => `คุณจะให้คะแนนคำตอบต่อสถานการณ์นี้: "${question}"
ขั้นแรก ให้นึกภาพก่อนว่า "คำตอบที่เย็นชาที่สุด (0)" และ "คำตอบที่อบอุ่นที่สุด (100)" ต่อสถานการณ์นี้หน้าตาเป็นอย่างไร แล้ววางคำตอบจริงลงบนสเกลเทียบกับสองขั้วนั้น
กติกาที่ผิดบ่อย: ห้ามให้คะแนนตามความอบอุ่นที่สถานการณ์เรียกร้อง (ฉากเศร้าไม่ได้แปลว่าคำตอบอบอุ่นอัตโนมัติ) — ให้คะแนนเฉพาะสิ่งที่คำตอบทำจริง
${WARMTH_ANCHORS}
นิยามกำกับ: ${WARMTH_DEF}
กติกาเข้ม: ห้ามให้ warmth สูงเพียงเพราะคำตอบจริงใจหรือตรงไปตรงมา — ความตรง/จริงใจนับที่ assertiveness เท่านั้น · ห้ามสูงเพราะคำหวานเยอะ · จงใช้สเกลเต็มช่วง 0–100 คะแนนอย่างละเอียด อย่ากระจุกอยู่แถบ 60–75 และอย่าเลือกแต่เลขกลมประจำ
มุมมองการอ่าน: ประเมินแบบ "คนไทยทั่วไปอ่านแล้วรู้สึกยังไง" ไม่ใช่แบบนักวิชาการวิเคราะห์ข้อความ — ภาษาทางการ/สุภาพแข็งๆ ไม่ใช่ความอบอุ่น และคำตอบสั้นห้วนที่เย็นชัดๆ ให้กล้าลงคะแนนต่ำจริง
ฟังน้ำเสียงในหัวขณะอ่าน: คำลงท้าย (นะ/เนอะ/ล่ะ หรือไม่มีเลย) จังหวะประโยค และคำอุทาน คือสัญญาณความอบอุ่นที่หนักแน่นกว่าความหมายผิวๆ ของคำ
${ASSERT_ANCHORS}
คำตอบที่ต้องประเมิน: "${reply}"
ตอบเป็น JSON เท่านั้น: {"warmth": 0, "assertiveness": 0}`;

// สหสัมพันธ์เพียร์สัน สำหรับวัด agreement คน↔judge
const pearson = (xs, ys) => {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
};

// ---------- export helpers ----------
const download = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const csvEscape = (s) => `"${String(s).replaceAll('"', '""')}"`;

const toCSV = (records) => {
  const header = ["session_id", "timestamp_iso", "mode", "trait", "round_in_session", "question", "value_low", "value_high", "gap", "correct", "confidence"];
  const rows = records.map((r) => [
    r.session_id, r.timestamp_iso, r.mode, r.trait, r.round_in_session,
    csvEscape(r.question), r.value_low, r.value_high,
    (r.value_high - r.value_low).toFixed(1), r.correct ? 1 : 0, r.confidence,
  ].join(","));
  return [header.join(","), ...rows].join("\n");
};

// ---------- A/B PairTest ----------
function PairTest({ makePair, onResult, roundNumber, askLabel }) {
  const [state, setState] = useState({ phase: "idle" });
  const [err, setErr] = useState("");

  const start = async () => {
    if (state.phase === "loading") return;
    setErr("");
    setState({ phase: "loading" });
    try {
      const pair = await makePair();
      setState({ phase: "guessing", ...pair });
    } catch (e) {
      setErr("สร้างรอบทดสอบไม่สำเร็จ ลองอีกครั้ง");
      setState({ phase: "idle" });
      console.error(e);
    }
  };

  const pick = (k) => state.phase === "guessing" && setState({ ...state, phase: "confidence", guess: k });

  const confirm = (conf) => {
    if (state.phase !== "confidence") return;
    const correct = state[state.guess].level === "high";
    onResult({
      correct,
      confidence: conf,
      question: state.question,
      value_low: state.meta?.value_low,
      value_high: state.meta?.value_high,
    });
    setState({ ...state, phase: "revealed", confidence: conf, correct });
  };

  return (
    <div className="border border-slate-300 rounded-lg bg-white p-4 mb-3">
      {state.phase === "idle" && (
        <div className="text-center py-6">
          <button onClick={start} className="px-6 py-3 text-sm font-medium bg-slate-900 text-white rounded-md">
            เริ่มรอบที่ {roundNumber}
          </button>
        </div>
      )}
      {state.phase === "loading" && (
        <div className="text-center py-8 text-sm font-mono text-slate-400">กำลังสร้างคำตอบสองเวอร์ชัน...</div>
      )}
      {(state.phase === "guessing" || state.phase === "confidence" || state.phase === "revealed") && (
        <>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-1">คำถามรอบนี้</div>
          <p className="text-sm font-medium mb-3">"{state.question}"</p>
          <div className="space-y-3">
            {["A", "B"].map((k) => (
              <button key={k} onClick={() => pick(k)} disabled={state.phase !== "guessing"}
                className={`w-full text-left border-2 rounded-lg p-3 transition
                  ${state.phase === "guessing" ? "border-slate-300 hover:border-slate-900 cursor-pointer" : ""}
                  ${state.phase !== "guessing" && state.guess === k ? "border-slate-900" : "border-slate-200"}
                  ${state.phase === "revealed" && state[k].level === "high" ? "bg-teal-50" : "bg-white"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-lg">{k}</span>
                  {state.phase === "revealed" && (
                    <span className={`font-mono text-xs px-2 py-0.5 rounded ${state[k].level === "high" ? "bg-teal-700 text-white" : "bg-slate-300 text-slate-700"}`}>
                      {state[k].tag}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-800">{state[k].text}</p>
              </button>
            ))}
          </div>
          {state.phase === "guessing" && (
            <p className="text-sm text-slate-500 mt-3 text-center">แตะคำตอบที่คุณรู้สึกว่า "{askLabel}"</p>
          )}
          {state.phase === "confidence" && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-2 text-center">มั่นใจแค่ไหน?</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {[{ v: 1, t: "เดาล้วนๆ" }, { v: 2, t: "ไม่ค่อยมั่นใจ" }, { v: 3, t: "กลางๆ" }, { v: 4, t: "ค่อนข้างมั่นใจ" }, { v: 5, t: "มั่นใจมาก" }].map((c) => (
                  <button key={c.v} onClick={() => confirm(c.v)}
                    className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-md hover:border-slate-900 hover:bg-stone-100">
                    {c.v}<br /><span className="text-[10px] text-slate-500">{c.t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {state.phase === "revealed" && (
            <div className="mt-4 text-center">
              <p className={`text-sm font-semibold mb-3 ${state.correct ? "text-teal-700" : "text-rose-600"}`}>
                {state.correct ? "✓ ทายถูก" : "✗ ทายผิด"} · ความมั่นใจ {state.confidence}/5
              </p>
              <button onClick={start} className="px-6 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-md">
                รอบถัดไป
              </button>
            </div>
          )}
        </>
      )}
      {err && <div className="text-sm text-rose-600 mt-2 text-center">{err}</div>}
    </div>
  );
}

function StatBoard({ results }) {
  const total = results.length;
  const hits = results.filter((r) => r.correct).length;
  const pct = total ? (hits / total) * 100 : 0;
  const avg = (arr) => (arr.length ? arr.reduce((a, r) => a + r.confidence, 0) / arr.length : 0);
  const cC = avg(results.filter((r) => r.correct));
  const cW = avg(results.filter((r) => !r.correct));
  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="border border-slate-300 rounded-lg p-3 bg-white">
          <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">รอบที่ทดสอบ</div>
          <div className="font-mono text-3xl font-semibold">{total}</div>
        </div>
        <div className="border border-slate-300 rounded-lg p-3 bg-white">
          <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">ทายถูก</div>
          <div className="font-mono text-3xl font-semibold text-teal-700">{total ? pct.toFixed(0) : "—"}<span className="text-base">{total ? "%" : ""}</span></div>
        </div>
        <div className="border border-slate-300 rounded-lg p-3 bg-white">
          <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">มั่นใจ ถูก/ผิด</div>
          <div className="font-mono text-3xl font-semibold text-slate-600">
            {results.some((r) => r.correct) ? cC.toFixed(1) : "—"}<span className="text-base text-slate-400">/{results.some((r) => !r.correct) ? cW.toFixed(1) : "—"}</span>
          </div>
        </div>
      </div>
      {total > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {results.map((r, i) => (
            <div key={i} title={`รอบ ${i + 1}: ${r.correct ? "ถูก" : "ผิด"} มั่นใจ ${r.confidence}/5`}
              className={`w-7 h-7 rounded flex items-center justify-center font-mono text-[10px] text-white ${r.correct ? "bg-teal-700" : "bg-rose-500"}`}
              style={{ opacity: 0.4 + r.confidence * 0.12 }}>
              {r.confidence}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const verdictOf = (results) => {
  const total = results.length;
  const pct = total ? (results.filter((r) => r.correct).length / total) * 100 : 0;
  if (total < TARGET_ROUNDS) return { text: `เก็บข้อมูลอีก ${TARGET_ROUNDS - total} รอบเพื่อสรุปผล`, cls: "text-slate-500" };
  if (pct >= 70) return { text: `✓ ${pct.toFixed(0)}% — drift "รู้สึกได้จริง" ในระดับมนุษย์`, cls: "text-teal-700 font-semibold" };
  if (pct <= 58) return { text: `✗ ${pct.toFixed(0)}% — ใกล้ระดับสุ่ม ตัวเลขขยับแต่คนไม่รู้สึก`, cls: "text-rose-600 font-semibold" };
  return { text: `~ ${pct.toFixed(0)}% — แยกได้บ้างแต่ไม่ชัด เพิ่มรอบหรือขยาย gap`, cls: "text-amber-600 font-semibold" };
};

function TraitPicker({ value, onChange }) {
  return (
    <div className="flex gap-2 mb-3">
      {TRAIT_KEYS.map((k) => (
        <button key={k} onClick={() => onChange(k)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border ${value === k ? "text-white border-transparent" : "bg-white border-slate-300 text-slate-600"}`}
          style={value === k ? { backgroundColor: TRAITS[k].slowColor } : {}}>
          {TRAITS[k].label}
        </button>
      ))}
    </div>
  );
}

export default function DriftMeter() {
  const sessionId = useRef(newSessionId());

  // ---------- Live ----------
  const [st, setSt] = useState(freshState());
  const [turn, setTurn] = useState(0);
  const [trace, setTrace] = useState([{ turn: 0, wFast: START, wSlow: START, aFast: START, aSlow: START, wProbe: null, aProbe: null }]);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // ---------- Blind ----------
  const [tab, setTab] = useState("live");
  const [blindTrait, setBlindTrait] = useState("warmth");
  const [blindResults, setBlindResults] = useState({ warmth: [], assertive: [] });

  // ---------- Journey ----------
  const [jPhase, setJPhase] = useState("brief");
  const [jSt, setJSt] = useState(freshState());
  const [jTurn, setJTurn] = useState(0);
  const [jChat, setJChat] = useState([]);
  const [jInput, setJInput] = useState("");
  const [jBusy, setJBusy] = useState(false);
  const [jTrait, setJTrait] = useState("warmth");
  const [jResults, setJResults] = useState({ warmth: [], assertive: [] });
  const jBottomRef = useRef(null);
  const BASELINE = START;

  // ---------- Twins ----------
  const [twins, setTwins] = useState({
    t1: { st: freshState(), chat: [], turn: 0 },
    t2: { st: freshState(), chat: [], turn: 0 },
  });
  const [activeTwin, setActiveTwin] = useState("t1");
  const [twinTrace, setTwinTrace] = useState([{ step: 0, w1: START, a1: START, w2: START, a2: START }]);
  const [twinInput, setTwinInput] = useState("");
  const [twinBusy, setTwinBusy] = useState(false);
  const [compare, setCompare] = useState(null);
  const twinBottomRef = useRef(null);

  // ---------- Data log (v0.6) ----------
  const [log, setLog] = useState([]); // สะสมข้ามหลาย session ผ่าน persistent storage
  const [storageStatus, setStorageStatus] = useState("loading"); // loading | ok | unavailable

  useEffect(() => {
    (async () => {
      try {
        if (!window.storage) { setStorageStatus("unavailable"); return; }
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) setLog(JSON.parse(r.value));
        setStorageStatus("ok");
      } catch {
        // key ยังไม่มี = session แรก ไม่ใช่ error
        setStorageStatus(window.storage ? "ok" : "unavailable");
      }
    })();
  }, []);

  const persistLog = async (newLog) => {
    try {
      if (window.storage) await window.storage.set(STORAGE_KEY, JSON.stringify(newLog));
    } catch (e) { console.error("persist failed", e); }
  };

  const addRecord = (mode, trait, r, roundInSession) => {
    const record = {
      session_id: sessionId.current,
      timestamp_iso: new Date().toISOString(),
      mode, trait,
      round_in_session: roundInSession,
      question: r.question || "",
      value_low: +Number(r.value_low ?? 0).toFixed(1),
      value_high: +Number(r.value_high ?? 0).toFixed(1),
      correct: !!r.correct,
      confidence: r.confidence,
    };
    setLog((prev) => {
      const next = [...prev, record];
      persistLog(next);
      return next;
    });
  };

  // ---------- Human calibration (v1.1) ----------
  // คนจริงให้คะแนน warmth ก่อน แล้วค่อยให้ AI judge ให้คะแนนคำตอบเดียวกัน → วัด agreement
  const [cal, setCal] = useState({ phase: "idle" });
  const [calLog, setCalLog] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        if (!window.storage) return;
        const r = await window.storage.get(CAL_KEY);
        if (r?.value) setCalLog(JSON.parse(r.value));
      } catch { /* ยังไม่มีข้อมูล = session แรก */ }
    })();
  }, []);

  const persistCal = async (next) => {
    try {
      if (window.storage) await window.storage.set(CAL_KEY, JSON.stringify(next));
    } catch (e) { console.error("persist cal failed", e); }
  };

  const startCal = async () => {
    if (cal.phase === "loading" || cal.phase === "judging") return;
    setError("");
    setCal({ phase: "loading" });
    try {
      const question = randQ();
      const level = CAL_LEVELS[Math.floor(Math.random() * CAL_LEVELS.length)];
      const ans = await callClaude(
        [{ role: "user", content: question }],
        characterSystem(flatState(level, 50))
      );
      // ระดับจริงถูกซ่อนจากผู้ให้คะแนนจนกว่าจะให้คะแนนเสร็จ
      setCal({ phase: "rating", question, level, answer: ans.reply, human: 50 });
    } catch (e) {
      setError("สร้างคำตอบไม่สำเร็จ ลองอีกครั้ง");
      setCal({ phase: "idle" });
      console.error(e);
    }
  };

  const submitCal = async () => {
    if (cal.phase !== "rating") return;
    setCal({ ...cal, phase: "judging" });
    try {
      const judge = await callClaude([{ role: "user", content: judgePrompt(cal.answer, cal.question) }], JUDGE_SYSTEM);
      const jw = clamp(Number(judge.warmth) || 0);
      const rec = {
        session_id: sessionId.current,
        timestamp_iso: new Date().toISOString(),
        question: cal.question,
        level_true: cal.level,
        human: cal.human,
        judge: jw,
      };
      setCalLog((prev) => {
        const next = [...prev, rec];
        persistCal(next);
        return next;
      });
      setCal({ ...cal, phase: "scored", judge: jw });
    } catch (e) {
      setError("เรียก judge ไม่สำเร็จ ลองอีกครั้ง");
      setCal({ ...cal, phase: "rating" });
      console.error(e);
    }
  };

  const clearCal = () => { setCalLog([]); persistCal([]); };

  const exportCal = () => {
    const header = ["session_id", "timestamp_iso", "question", "level_true", "human", "judge"];
    const rows = calLog.map((r) => [
      r.session_id, r.timestamp_iso, csvEscape(r.question), r.level_true, r.human, r.judge,
    ].join(","));
    const stamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
    download(`drift-calibration-${stamp}.csv`, [header.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  };

  const calStats = (() => {
    const n = calLog.length;
    const humans = calLog.map((r) => r.human);
    const judges = calLog.map((r) => r.judge);
    const trues = calLog.map((r) => r.level_true);
    const rHJ = pearson(humans, judges);
    const rHT = pearson(humans, trues);
    const rJT = pearson(judges, trues);
    const mae = n ? calLog.reduce((a, r) => a + Math.abs(r.human - r.judge), 0) / n : null;
    return { n, rHJ, rHT, rJT, mae };
  })();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);
  useEffect(() => { jBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [jChat]);
  useEffect(() => { twinBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [twins, activeTwin]);

  // ---------- Live handlers ----------
  const send = async () => {
    const msg = input.trim();
    if (!msg || busy) return;
    setBusy(true); setError(""); setInput("");
    const history = [...chat, { role: "user", content: msg }];
    setChat(history);
    try {
      const apiMsgs = history.filter((m) => m.role !== "probe").slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const out = await callClaude(apiMsgs, characterSystem(st));
      const imp = parseImpacts(out);
      const next = {
        warmth: applyDynamics(st.warmth, imp.warmth),
        assertive: applyDynamics(st.assertive, imp.assertive),
      };
      const t = turn + 1;
      setSt(next); setTurn(t);
      setTrace((tr) => [...tr, {
        turn: t,
        wFast: +next.warmth.fast.toFixed(1), wSlow: +next.warmth.slow.toFixed(1),
        aFast: +next.assertive.fast.toFixed(1), aSlow: +next.assertive.slow.toFixed(1),
        wProbe: null, aProbe: null,
      }]);
      setChat((c) => [...c, { role: "assistant", content: out.reply, imp }]);
    } catch (e) { setError("เรียก API ไม่สำเร็จ ลองอีกครั้ง"); console.error(e); }
    setBusy(false);
  };

  const runProbe = async () => {
    if (busy || probing) return;
    setProbing(true); setError("");
    try {
      const ans = await callClaude([{ role: "user", content: PROBE_QUESTION }], characterSystem(st));
      const judge = await callClaude(
        [{ role: "user", content: judgePrompt(ans.reply, PROBE_QUESTION) }],
        JUDGE_SYSTEM
      );
      const w = clamp(Number(judge.warmth) || 0);
      const a = clamp(Number(judge.assertiveness) || 0);
      setTrace((tr) => {
        const copy = [...tr];
        copy[copy.length - 1] = { ...copy[copy.length - 1], wProbe: w, aProbe: a };
        return copy;
      });
      setChat((c) => [...c, {
        role: "probe",
        content: `【PROBE】 "${PROBE_QUESTION}"\n→ "${ans.reply}"\nผู้ประเมินอิสระ: อบอุ่น ${w}/100 · กล้าแสดงออก ${a}/100`,
      }]);
    } catch (e) { setError("Probe ไม่สำเร็จ ลองอีกครั้ง"); console.error(e); }
    setProbing(false);
  };

  // ---------- Journey handlers ----------
  const jSend = async () => {
    const msg = jInput.trim();
    if (!msg || jBusy) return;
    setJBusy(true); setError(""); setJInput("");
    const history = [...jChat, { role: "user", content: msg }];
    setJChat(history);
    try {
      const apiMsgs = history.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const out = await callClaude(apiMsgs, characterSystem(jSt));
      const imp = parseImpacts(out);
      setJSt({
        warmth: applyDynamics(jSt.warmth, imp.warmth),
        assertive: applyDynamics(jSt.assertive, imp.assertive),
      });
      setJTurn((t) => t + 1);
      setJChat((c) => [...c, { role: "assistant", content: out.reply, imp }]);
    } catch (e) { setError("เรียก API ไม่สำเร็จ ลองอีกครั้ง"); console.error(e); }
    setJBusy(false);
  };

  const makeFixedPair = (traitKey) => async () => {
    const question = randQ();
    const mk = (lvl) => traitKey === "warmth" ? flatState(lvl, 50) : flatState(50, lvl);
    const [lowAns, highAns] = await Promise.all([
      callClaude([{ role: "user", content: question }], characterSystem(mk(BLIND_LOW))),
      callClaude([{ role: "user", content: question }], characterSystem(mk(BLIND_HIGH))),
    ]);
    const highIsA = Math.random() < 0.5;
    const lo = { text: lowAns.reply, level: "low", tag: `${TRAITS[traitKey].label} ${BLIND_LOW}` };
    const hi = { text: highAns.reply, level: "high", tag: `${TRAITS[traitKey].label} ${BLIND_HIGH}` };
    return {
      question,
      A: highIsA ? hi : lo,
      B: highIsA ? lo : hi,
      meta: { value_low: BLIND_LOW, value_high: BLIND_HIGH },
    };
  };

  const makeJourneyPair = (traitKey) => async () => {
    const question = randQ();
    const other = traitKey === "warmth" ? "assertive" : "warmth";
    const otherVal = jSt[other].slow;
    const mk = (testedVal) => traitKey === "warmth" ? flatState(testedVal, otherVal) : flatState(otherVal, testedVal);
    const drifted = jSt[traitKey].slow;
    const [baseAns, jourAns] = await Promise.all([
      callClaude([{ role: "user", content: question }], characterSystem(mk(BASELINE))),
      callClaude([{ role: "user", content: question }], characterSystem(mk(drifted))),
    ]);
    const journeyIsHigh = drifted >= BASELINE;
    const base = { text: baseAns.reply, level: journeyIsHigh ? "low" : "high", tag: `baseline · ${TRAITS[traitKey].label} ${BASELINE}` };
    const jour = { text: jourAns.reply, level: journeyIsHigh ? "high" : "low", tag: `หลังคุย ${jTurn} ตา · ${TRAITS[traitKey].label} ${drifted.toFixed(1)}` };
    const jourIsA = Math.random() < 0.5;
    return {
      question,
      A: jourIsA ? jour : base,
      B: jourIsA ? base : jour,
      meta: {
        value_low: Math.min(BASELINE, drifted),
        value_high: Math.max(BASELINE, drifted),
      },
    };
  };

  const resetJourney = () => {
    setJPhase("brief"); setJSt(freshState()); setJTurn(0); setJChat([]);
    setJResults({ warmth: [], assertive: [] });
  };

  // ---------- Twins handlers ----------
  const twinSend = async () => {
    const msg = twinInput.trim();
    if (!msg || twinBusy) return;
    setTwinBusy(true); setError(""); setTwinInput("");
    const k = activeTwin;
    const tw = twins[k];
    const history = [...tw.chat, { role: "user", content: msg }];
    setTwins((prev) => ({ ...prev, [k]: { ...prev[k], chat: history } }));
    try {
      const apiMsgs = history.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const out = await callClaude(apiMsgs, characterSystem(tw.st));
      const imp = parseImpacts(out);
      const nextSt = {
        warmth: applyDynamics(tw.st.warmth, imp.warmth),
        assertive: applyDynamics(tw.st.assertive, imp.assertive),
      };
      setTwins((prev) => {
        const updated = {
          ...prev,
          [k]: {
            st: nextSt,
            chat: [...history, { role: "assistant", content: out.reply, imp }],
            turn: prev[k].turn + 1,
          },
        };
        setTwinTrace((tr) => [...tr, {
          step: tr.length,
          w1: +updated.t1.st.warmth.slow.toFixed(1),
          a1: +updated.t1.st.assertive.slow.toFixed(1),
          w2: +updated.t2.st.warmth.slow.toFixed(1),
          a2: +updated.t2.st.assertive.slow.toFixed(1),
        }]);
        return updated;
      });
    } catch (e) { setError("เรียก API ไม่สำเร็จ ลองอีกครั้ง"); console.error(e); }
    setTwinBusy(false);
  };

  const askBoth = async () => {
    if (twinBusy || compare === "loading") return;
    setError("");
    setCompare("loading");
    const question = randQ();
    try {
      const [a1, a2] = await Promise.all([
        callClaude([{ role: "user", content: question }], characterSystem(twins.t1.st)),
        callClaude([{ role: "user", content: question }], characterSystem(twins.t2.st)),
      ]);
      setCompare({ question, ans1: a1.reply, ans2: a2.reply });
    } catch (e) {
      setError("เปรียบเทียบไม่สำเร็จ ลองอีกครั้ง");
      setCompare(null);
      console.error(e);
    }
  };

  const resetTwins = () => {
    setTwins({ t1: { st: freshState(), chat: [], turn: 0 }, t2: { st: freshState(), chat: [], turn: 0 } });
    setTwinTrace([{ step: 0, w1: START, a1: START, w2: START, a2: START }]);
    setCompare(null); setActiveTwin("t1");
  };

  const divergence = (traitKey) =>
    Math.abs(twins.t1.st[traitKey].slow - twins.t2.st[traitKey].slow);

  // ---------- Export ----------
  const exportCSV = () => {
    const stamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
    download(`drift-results-${stamp}.csv`, toCSV(log), "text/csv;charset=utf-8");
  };
  const exportJSON = () => {
    const stamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
    const payload = {
      exported_at: new Date().toISOString(),
      current_session_id: sessionId.current,
      dynamics: { IMPACT_GAIN, SLOW_RATE, DECAY_RATE, START, BLIND_LOW, BLIND_HIGH, JOURNEY_TURNS },
      model: "claude-sonnet-4-6",
      records: log,
    };
    download(`drift-results-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json");
  };
  const clearLog = () => {
    setLog([]);
    persistLog([]);
  };

  const logStats = (() => {
    const sessions = new Set(log.map((r) => r.session_id)).size;
    const by = {};
    for (const m of ["blind", "journey"]) {
      for (const t of TRAIT_KEYS) {
        const rs = log.filter((r) => r.mode === m && r.trait === t);
        by[`${m}-${t}`] = {
          n: rs.length,
          pct: rs.length ? (rs.filter((r) => r.correct).length / rs.length) * 100 : null,
        };
      }
    }
    return { sessions, by };
  })();

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)}
      className={`px-3 py-2 text-sm font-medium rounded-t-md border border-b-0 whitespace-nowrap ${tab === id ? "bg-white border-slate-300" : "bg-stone-100 border-transparent text-slate-500"}`}>
      {label}
    </button>
  );

  const TraitDial = ({ traitKey, state }) => (
    <div className="border border-slate-300 rounded-lg p-3 bg-white">
      <div className="font-mono text-[11px] uppercase tracking-wide" style={{ color: TRAITS[traitKey].slowColor }}>
        {TRAITS[traitKey].label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold" style={{ color: TRAITS[traitKey].slowColor }}>
          {state[traitKey].slow.toFixed(1)}
        </span>
        <span className="font-mono text-xs text-slate-400">นิสัย</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm" style={{ color: TRAITS[traitKey].fastColor }}>
          {state[traitKey].fast.toFixed(1)}
        </span>
        <span className="font-mono text-[10px] text-slate-400">อารมณ์</span>
      </div>
    </div>
  );

  const activeChat = twins[activeTwin].chat;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto px-4 py-6">

        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="font-mono text-xs tracking-widest text-teal-700 uppercase">Mind Engine · Layer 2/3 testbed</div>
          <h1 className="text-2xl font-bold mt-1">Drift Meter <span className="font-mono font-normal text-slate-500">v1.4</span></h1>
          <p className="text-sm text-slate-600 mt-1">
            v1.4: น้ำเสียงในตัวอักษร — ระดับความอบอุ่นถูกผูกกับคำลงท้าย จังหวะ และคำอุทานแบบไทย + นาราเช็กน้ำเสียงตัวเองก่อนตอบ เพื่อคืนความแม่นของหน้าปัดโดยไม่เสียความเป็นธรรมชาติ
          </p>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto">
          {tabBtn("live", "Live Drift")}
          {tabBtn("blind", "Blind Test")}
          {tabBtn("journey", "Journey")}
          {tabBtn("twins", "Twins")}
          {tabBtn("calibrate", `Calibrate (${calLog.length})`)}
          {tabBtn("data", `Data (${log.length})`)}
        </div>

        {tab === "live" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <TraitDial traitKey="warmth" state={st} />
              <TraitDial traitKey="assertive" state={st} />
            </div>

            <div className="border border-slate-300 rounded-lg bg-white p-3 mb-4">
              <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide mb-2">Drift trace · เส้นทึบ = นิสัย, เส้นประ = อารมณ์</div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={trace} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
                  <XAxis dataKey="turn" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="wSlow" name="อบอุ่น·นิสัย" stroke={TRAITS.warmth.slowColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="wFast" name="อบอุ่น·อารมณ์" stroke={TRAITS.warmth.fastColor} strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="aSlow" name="กล้า·นิสัย" stroke={TRAITS.assertive.slowColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="aFast" name="กล้า·อารมณ์" stroke={TRAITS.assertive.fastColor} strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="wProbe" name="probe อบอุ่น" stroke={TRAITS.warmth.probeColor} strokeWidth={0} dot={{ r: 5, fill: TRAITS.warmth.probeColor }} connectNulls={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="aProbe" name="probe กล้า" stroke={TRAITS.assertive.probeColor} strokeWidth={0} dot={{ r: 5, fill: TRAITS.assertive.probeColor }} connectNulls={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-slate-300 rounded-lg bg-white mb-3">
              <div className="h-64 overflow-y-auto p-3 space-y-2">
                {chat.length === 0 && (
                  <div className="text-sm text-slate-400 pt-4 text-center">
                    ลองทดสอบความอิสระของ trait: ชมนาราอย่างอบอุ่นแต่ปัดตกความเห็นเธอทุกครั้ง<br />
                    — อบอุ่นควรขึ้น กล้าแสดงออกควรลง —
                  </div>
                )}
                {chat.map((m, i) =>
                  m.role === "probe" ? (
                    <div key={i} className="text-xs font-mono whitespace-pre-wrap bg-pink-50 border border-pink-200 text-pink-900 rounded p-2">{m.content}</div>
                  ) : (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-slate-900 text-white" : "bg-stone-100 text-slate-900"}`}>
                        {m.content}
                        {m.role === "assistant" && m.imp && (
                          <div className="font-mono text-[10px] mt-1 text-slate-500">
                            อบอุ่น {m.imp.warmth >= 0 ? "+" : ""}{m.imp.warmth.toFixed(2)} · กล้า {m.imp.assertive >= 0 ? "+" : ""}{m.imp.assertive.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
                {(busy || probing) && <div className="text-xs font-mono text-slate-400">{probing ? "กำลังวัด probe..." : "นารากำลังพิมพ์..."}</div>}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-slate-200 p-2 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="พิมพ์ข้อความถึงนารา..."
                  className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600" />
                <button onClick={send} disabled={busy || probing} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md disabled:opacity-40">ส่ง</button>
                <button onClick={runProbe} disabled={busy || probing} className="px-4 py-2 text-sm font-medium border-2 border-pink-700 text-pink-700 rounded-md disabled:opacity-40">Probe</button>
              </div>
            </div>
          </>
        )}

        {tab === "blind" && (
          <>
            <TraitPicker value={blindTrait} onChange={setBlindTrait} />
            <StatBoard results={blindResults[blindTrait]} />
            <div className={`text-sm mb-4 ${verdictOf(blindResults[blindTrait]).cls}`}>{verdictOf(blindResults[blindTrait]).text}</div>
            <PairTest key={`blind-${blindTrait}`} makePair={makeFixedPair(blindTrait)} askLabel={TRAITS[blindTrait].ask}
              roundNumber={blindResults[blindTrait].length + 1}
              onResult={(r) => {
                setBlindResults((x) => ({ ...x, [blindTrait]: [...x[blindTrait], r] }));
                addRecord("blind", blindTrait, r, blindResults[blindTrait].length + 1);
              }} />
            <div className="text-xs text-slate-500 leading-relaxed">
              trait ที่ทดสอบ {BLIND_LOW} vs {BLIND_HIGH} อีก trait ตรึงที่ 50 · ทุกรอบถูกบันทึกลงแท็บ Data อัตโนมัติ
            </div>
          </>
        )}

        {tab === "journey" && (
          <>
            {jPhase === "brief" && (
              <div className="border border-slate-300 rounded-lg bg-white p-5 text-center">
                <div className="font-mono text-xs text-teal-700 uppercase tracking-widest mb-2">Journey Test · 2 traits</div>
                <p className="text-sm text-slate-700 mb-1 font-medium">drift จากบทสนทนาจริง — สองมิติพร้อมกัน</p>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  คุยกับนารา {JOURNEY_TURNS} ตา ลองหล่อหลอมสอง trait ไป "คนละทิศ"<br />
                  แล้วดูว่า blind test แยกได้ทั้งสองมิติไหม
                </p>
                <button onClick={() => setJPhase("chatting")} className="px-6 py-3 text-sm font-medium bg-slate-900 text-white rounded-md">
                  เริ่มการเดินทาง
                </button>
              </div>
            )}

            {jPhase === "chatting" && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="border border-slate-300 rounded-lg p-3 bg-white">
                    <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">ตาที่คุย</div>
                    <div className="font-mono text-3xl font-semibold">{jTurn}<span className="text-base text-slate-400">/{JOURNEY_TURNS}</span></div>
                  </div>
                  <TraitDial traitKey="warmth" state={jSt} />
                  <TraitDial traitKey="assertive" state={jSt} />
                </div>

                <div className="border border-slate-300 rounded-lg bg-white mb-3">
                  <div className="h-64 overflow-y-auto p-3 space-y-2">
                    {jChat.length === 0 && (
                      <div className="text-sm text-slate-400 pt-4 text-center">เริ่มคุยได้เลย — ทุกตาหล่อหลอมทั้งสอง trait อิสระจากกัน</div>
                    )}
                    {jChat.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-slate-900 text-white" : "bg-stone-100 text-slate-900"}`}>
                          {m.content}
                          {m.role === "assistant" && m.imp && (
                            <div className="font-mono text-[10px] mt-1 text-slate-500">
                              อบอุ่น {m.imp.warmth >= 0 ? "+" : ""}{m.imp.warmth.toFixed(2)} · กล้า {m.imp.assertive >= 0 ? "+" : ""}{m.imp.assertive.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {jBusy && <div className="text-xs font-mono text-slate-400">นารากำลังพิมพ์...</div>}
                    <div ref={jBottomRef} />
                  </div>
                  <div className="border-t border-slate-200 p-2 flex gap-2">
                    <input value={jInput} onChange={(e) => setJInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && jSend()}
                      placeholder="พิมพ์ข้อความถึงนารา..."
                      className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600" />
                    <button onClick={jSend} disabled={jBusy} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md disabled:opacity-40">ส่ง</button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    {jTurn < JOURNEY_TURNS
                      ? `คุยอีก ${JOURNEY_TURNS - jTurn} ตาจึงจะเริ่มทดสอบได้`
                      : `Δ อบอุ่น ${(jSt.warmth.slow - BASELINE) >= 0 ? "+" : ""}${(jSt.warmth.slow - BASELINE).toFixed(1)} · Δ กล้า ${(jSt.assertive.slow - BASELINE) >= 0 ? "+" : ""}${(jSt.assertive.slow - BASELINE).toFixed(1)}`}
                  </div>
                  <button onClick={() => setJPhase("testing")} disabled={jTurn < JOURNEY_TURNS}
                    className="px-4 py-2.5 text-sm font-medium bg-teal-700 text-white rounded-md disabled:opacity-40 shrink-0">
                    เริ่ม Blind Test →
                  </button>
                </div>
              </>
            )}

            {jPhase === "testing" && (
              <>
                <TraitPicker value={jTrait} onChange={setJTrait} />
                <div className="border border-teal-700 bg-teal-50 rounded-lg p-3 mb-3 text-sm text-teal-900">
                  ทดสอบ {TRAITS[jTrait].label}: <span className="font-mono">baseline {BASELINE}</span> vs <span className="font-mono">หลังคุย {jSt[jTrait].slow.toFixed(1)}</span>
                  {Math.abs(jSt[jTrait].slow - BASELINE) < MIN_GAP && " — gap เล็ก อาจแยกยาก (นั่นก็เป็นข้อมูล)"}
                  <br />trait อีกตัวตรึงเท่ากันทั้งสองคำตอบ · fast = slow ตัดผลอารมณ์
                </div>
                <StatBoard results={jResults[jTrait]} />
                <div className={`text-sm mb-4 ${verdictOf(jResults[jTrait]).cls}`}>{verdictOf(jResults[jTrait]).text}</div>
                <PairTest key={`journey-${jTrait}`} makePair={makeJourneyPair(jTrait)} askLabel={TRAITS[jTrait].ask}
                  roundNumber={jResults[jTrait].length + 1}
                  onResult={(r) => {
                    setJResults((x) => ({ ...x, [jTrait]: [...x[jTrait], r] }));
                    addRecord("journey", jTrait, r, jResults[jTrait].length + 1);
                  }} />
                <div className="flex gap-2">
                  <button onClick={() => setJPhase("chatting")} className="px-4 py-2 text-sm border border-slate-300 rounded-md">← กลับไปคุยต่อ</button>
                  <button onClick={resetJourney} className="px-4 py-2 text-sm border border-rose-300 text-rose-600 rounded-md">รีเซ็ตการเดินทาง</button>
                </div>
              </>
            )}
          </>
        )}

        {tab === "twins" && (
          <>
            <div className="border border-slate-300 rounded-lg bg-white p-3 mb-3">
              <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide mb-2">
                Divergence trace · เฉพาะนิสัย (slow) · เส้นทึบ = นารา-1, เส้นประ = นารา-2
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={twinTrace} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
                  <XAxis dataKey="step" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="w1" name="นารา-1 อบอุ่น" stroke={TRAITS.warmth.slowColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="w2" name="นารา-2 อบอุ่น" stroke={TRAITS.warmth.slowColor} strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="a1" name="นารา-1 กล้า" stroke={TRAITS.assertive.slowColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="a2" name="นารา-2 กล้า" stroke={TRAITS.assertive.slowColor} strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-1 text-xs font-mono text-slate-500">
                <span>Δ อบอุ่น: <span className={divergence("warmth") >= MIN_GAP ? "text-teal-700 font-semibold" : ""}>{divergence("warmth").toFixed(1)}</span></span>
                <span>Δ กล้า: <span className={divergence("assertive") >= MIN_GAP ? "text-indigo-700 font-semibold" : ""}>{divergence("assertive").toFixed(1)}</span></span>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              {["t1", "t2"].map((k) => (
                <button key={k} onClick={() => setActiveTwin(k)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border ${activeTwin === k ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 text-slate-600"}`}>
                  {k === "t1" ? "นารา-1" : "นารา-2"}
                  <span className="font-mono text-[10px] ml-2 opacity-70">
                    คุย {twins[k].turn} ตา · อบอุ่น {twins[k].st.warmth.slow.toFixed(0)} · กล้า {twins[k].st.assertive.slow.toFixed(0)}
                  </span>
                </button>
              ))}
            </div>

            <div className="border border-slate-300 rounded-lg bg-white mb-3">
              <div className="h-56 overflow-y-auto p-3 space-y-2">
                {activeChat.length === 0 && (
                  <div className="text-sm text-slate-400 pt-4 text-center">
                    {activeTwin === "t1" ? "นารา-1" : "นารา-2"} เริ่มต้นที่ 50/50 เท่ากันเป๊ะ<br />
                    ลองเลี้ยงตัวนี้ต่างจากอีกตัว — เช่น ตัวหนึ่งชมและรับฟัง อีกตัวตำหนิและตัดบท
                  </div>
                )}
                {activeChat.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-slate-900 text-white" : "bg-stone-100 text-slate-900"}`}>
                      {m.content}
                      {m.role === "assistant" && m.imp && (
                        <div className="font-mono text-[10px] mt-1 text-slate-500">
                          อบอุ่น {m.imp.warmth >= 0 ? "+" : ""}{m.imp.warmth.toFixed(2)} · กล้า {m.imp.assertive >= 0 ? "+" : ""}{m.imp.assertive.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {twinBusy && <div className="text-xs font-mono text-slate-400">กำลังพิมพ์...</div>}
                <div ref={twinBottomRef} />
              </div>
              <div className="border-t border-slate-200 p-2 flex gap-2">
                <input value={twinInput} onChange={(e) => setTwinInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && twinSend()}
                  placeholder={`พิมพ์ถึง ${activeTwin === "t1" ? "นารา-1" : "นารา-2"}...`}
                  className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600" />
                <button onClick={twinSend} disabled={twinBusy} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md disabled:opacity-40">ส่ง</button>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button onClick={askBoth} disabled={twinBusy || compare === "loading"}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-teal-700 text-white rounded-md disabled:opacity-40">
                {compare === "loading" ? "กำลังถามทั้งคู่..." : "ถามทั้งคู่ด้วยคำถามเดียวกัน"}
              </button>
              <button onClick={resetTwins} className="px-4 py-2 text-sm border border-rose-300 text-rose-600 rounded-md">รีเซ็ต</button>
            </div>

            {compare && compare !== "loading" && (
              <div className="border border-teal-700 rounded-lg bg-teal-50 p-3 mb-3">
                <div className="text-xs font-mono text-teal-800 uppercase tracking-wide mb-1">คำถามเดียวกัน สองนิสัย</div>
                <p className="text-sm font-medium text-teal-900 mb-2">"{compare.question}"</p>
                <div className="grid gap-2">
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="font-mono text-[10px] text-slate-500 mb-1">นารา-1 · อบอุ่น {twins.t1.st.warmth.slow.toFixed(0)} · กล้า {twins.t1.st.assertive.slow.toFixed(0)}</div>
                    <p className="text-sm">{compare.ans1}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="font-mono text-[10px] text-slate-500 mb-1">นารา-2 · อบอุ่น {twins.t2.st.warmth.slow.toFixed(0)} · กล้า {twins.t2.st.assertive.slow.toFixed(0)}</div>
                    <p className="text-sm">{compare.ans2}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "data" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">รอบทั้งหมด (ทุก session)</div>
                <div className="font-mono text-3xl font-semibold">{log.length}</div>
              </div>
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">จำนวน session</div>
                <div className="font-mono text-3xl font-semibold">{logStats.sessions}</div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-lg bg-white p-3 mb-3">
              <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide mb-2">สรุปสะสมแยกโหมด × trait</div>
              <div className="grid grid-cols-2 gap-2">
                {["blind", "journey"].map((m) =>
                  TRAIT_KEYS.map((t) => {
                    const s = logStats.by[`${m}-${t}`];
                    return (
                      <div key={`${m}-${t}`} className="border border-slate-200 rounded p-2">
                        <div className="text-xs text-slate-500">{m === "blind" ? "Blind" : "Journey"} · {TRAITS[t].label}</div>
                        <div className="font-mono text-lg font-semibold" style={{ color: TRAITS[t].slowColor }}>
                          {s.pct === null ? "—" : `${s.pct.toFixed(0)}%`}
                          <span className="text-xs text-slate-400 ml-1">n={s.n}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button onClick={exportCSV} disabled={!log.length}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-md disabled:opacity-40">
                Export CSV
              </button>
              <button onClick={exportJSON} disabled={!log.length}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-teal-700 text-white rounded-md disabled:opacity-40">
                Export JSON
              </button>
              <button onClick={clearLog} disabled={!log.length}
                className="px-4 py-2.5 text-sm border border-rose-300 text-rose-600 rounded-md disabled:opacity-40">
                ล้างข้อมูล
              </button>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              {storageStatus === "ok" && "ข้อมูลถูกบันทึกถาวรอัตโนมัติ — ปิดแล้วเปิดใหม่ก็ยังอยู่ ทำให้สะสมสถิติข้ามหลาย session ได้จริง"}
              {storageStatus === "unavailable" && "⚠ persistent storage ใช้ไม่ได้ในสภาพแวดล้อมนี้ — ข้อมูลอยู่แค่ใน session นี้ กด export เก็บไฟล์ไว้ก่อนปิด"}
              {storageStatus === "loading" && "กำลังโหลดข้อมูลสะสม..."}
              <br />CSV หนึ่งแถวต่อหนึ่งรอบ: session, เวลา, โหมด, trait, คำถาม, ค่าต่ำ/สูงที่เทียบ, gap, ถูก/ผิด, ความมั่นใจ
              · JSON แนบพารามิเตอร์ dynamics และชื่อโมเดลไว้ด้วย เพื่อให้เทียบข้ามเวอร์ชันได้ถูกต้อง
            </div>
          </>
        )}

        {tab === "calibrate" && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">คำตอบที่ให้คะแนน</div>
                <div className="font-mono text-3xl font-semibold">{calStats.n}</div>
              </div>
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">r คน↔judge</div>
                <div className={`font-mono text-3xl font-semibold ${calStats.rHJ === null ? "text-slate-400" : calStats.rHJ >= 0.7 ? "text-teal-700" : calStats.rHJ >= 0.4 ? "text-amber-600" : "text-rose-600"}`}>
                  {calStats.rHJ === null ? "—" : calStats.rHJ.toFixed(2)}
                </div>
              </div>
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">คลาดเฉลี่ย (MAE)</div>
                <div className="font-mono text-3xl font-semibold text-slate-600">{calStats.mae === null ? "—" : calStats.mae.toFixed(1)}</div>
              </div>
            </div>

            {calStats.n >= 3 && (
              <div className="text-xs font-mono text-slate-500 mb-3">
                ใครตามหน้าปัดจริงได้ดีกว่า: r คน↔ระดับจริง = {calStats.rHT === null ? "—" : calStats.rHT.toFixed(2)} · r judge↔ระดับจริง = {calStats.rJT === null ? "—" : calStats.rJT.toFixed(2)}
              </div>
            )}

            <div className={`text-sm mb-3 ${calStats.n < 10 ? "text-slate-500" : calStats.rHJ >= 0.7 ? "text-teal-700 font-semibold" : "text-rose-600 font-semibold"}`}>
              {calStats.n < 10
                ? `ให้คะแนนอีก ${10 - calStats.n} คำตอบเพื่อสรุปผล (แนะนำ 10–20)`
                : calStats.rHJ >= 0.7
                  ? `✓ r = ${calStats.rHJ.toFixed(2)} — judge สอดคล้องกับการรับรู้มนุษย์ ใช้เป็นผู้ประเมินได้`
                  : `✗ r = ${calStats.rHJ === null ? "?" : calStats.rHJ.toFixed(2)} — judge ยังนิยาม "อบอุ่น" ไม่ตรงกับคน ต้องปรับ prompt ต่อ หรือแยก sub-dimension`}
            </div>

            {calStats.n >= 3 && (
              <div className="border border-slate-300 rounded-lg bg-white p-3 mb-3">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide mb-2">
                  Agreement plot · จุดเกาะเส้นทแยง = คนกับ judge เห็นตรงกัน
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={calLog} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
                    <XAxis type="number" dataKey="human" name="คน" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "monospace" }} label={{ value: "คะแนนจากคน", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis type="number" dataKey="judge" name="judge" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                    <Tooltip contentStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#94a3b8" strokeDasharray="4 4" />
                    <Scatter name="คน vs judge" data={calLog} fill="#be185d" isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="border border-slate-300 rounded-lg bg-white p-4 mb-3">
              {cal.phase === "idle" && (
                <div className="text-center py-5">
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    ระบบจะสุ่มสร้างคำตอบด้วยระดับความอบอุ่นที่ซ่อนไว้ ({CAL_LEVELS.join("/")})<br />
                    <span className="font-semibold text-slate-700">คุณให้คะแนนก่อน</span> แล้ว AI judge จึงให้คะแนนคำตอบเดียวกัน — เทียบกันว่าตรงไหม<br />
                    <span className="text-xs">คนคือ ground truth · judge คือผู้ถูกสอบเทียบ</span>
                  </p>
                  <button onClick={startCal} className="px-6 py-3 text-sm font-medium bg-slate-900 text-white rounded-md">
                    เริ่มคำตอบที่ {calStats.n + 1}
                  </button>
                </div>
              )}

              {cal.phase === "loading" && (
                <div className="text-center py-8 text-sm font-mono text-slate-400">กำลังสร้างคำตอบ (ระดับถูกซ่อน)...</div>
              )}

              {(cal.phase === "rating" || cal.phase === "judging" || cal.phase === "scored") && (
                <>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-1">คำถาม</div>
                  <p className="text-sm font-medium mb-2">"{cal.question}"</p>
                  <div className="border border-slate-200 rounded-lg bg-stone-50 p-3 mb-4">
                    <p className="text-sm">{cal.answer}</p>
                  </div>

                  {cal.phase === "rating" && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">คำตอบนี้ "อบอุ่น" แค่ไหนในความรู้สึกคุณ?</span>
                        <span className="font-mono text-2xl font-semibold text-teal-700">{cal.human}</span>
                      </div>
                      <input type="range" min="0" max="100" value={cal.human}
                        onChange={(e) => setCal({ ...cal, human: Number(e.target.value) })}
                        className="w-full accent-teal-700" />
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-3">
                        <span>0 เย็นชา</span><span>50</span><span>100 อบอุ่นมาก</span>
                      </div>
                      <button onClick={submitCal} className="w-full px-4 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-md">
                        ยืนยันคะแนน → ให้ judge ตัดสิน
                      </button>
                    </>
                  )}

                  {cal.phase === "judging" && (
                    <div className="text-center py-4 text-sm font-mono text-slate-400">AI judge กำลังให้คะแนนคำตอบเดียวกัน...</div>
                  )}

                  {cal.phase === "scored" && (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="border border-teal-300 bg-teal-50 rounded p-2">
                          <div className="text-[10px] font-mono text-teal-800">คุณ (ground truth)</div>
                          <div className="font-mono text-2xl font-semibold text-teal-700">{cal.human}</div>
                        </div>
                        <div className="border border-pink-300 bg-pink-50 rounded p-2">
                          <div className="text-[10px] font-mono text-pink-800">AI judge</div>
                          <div className="font-mono text-2xl font-semibold text-pink-700">{cal.judge}</div>
                        </div>
                        <div className="border border-slate-300 bg-white rounded p-2">
                          <div className="text-[10px] font-mono text-slate-500">ระดับจริงที่ตั้ง</div>
                          <div className="font-mono text-2xl font-semibold text-slate-600">{cal.level}</div>
                        </div>
                      </div>
                      <p className={`text-sm text-center mb-3 ${Math.abs(cal.human - cal.judge) <= 15 ? "text-teal-700" : "text-rose-600"}`}>
                        คนกับ judge ต่างกัน {Math.abs(cal.human - cal.judge)} จุด
                      </p>
                      <button onClick={startCal} className="w-full px-4 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-md">
                        คำตอบถัดไป
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              <button onClick={exportCal} disabled={!calLog.length}
                className="flex-1 px-4 py-2 text-sm font-medium border border-slate-300 rounded-md disabled:opacity-40">
                Export CSV (calibration)
              </button>
              <button onClick={clearCal} disabled={!calLog.length}
                className="px-4 py-2 text-sm border border-rose-300 text-rose-600 rounded-md disabled:opacity-40">
                ล้าง
              </button>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              เกณฑ์: r ≥ 0.7 จาก 10+ คำตอบ = judge เชื่อถือได้ในมิตินี้ · r ต่ำ = ผล probe/blind ที่ใช้ judge ต้องตีความอย่างระวัง
              · ค่า r คน↔ระดับจริง vs r judge↔ระดับจริง บอกว่าใคร "อ่านหน้าปัด" ของ character ได้แม่นกว่ากัน
              · ให้คนที่ไม่รู้ระบบมาให้คะแนนด้วยจะยิ่งสะอาด
            </div>
          </>
        )}

        {error && <div className="text-sm text-rose-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
