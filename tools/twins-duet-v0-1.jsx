import { useState, useRef } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ============================================================
// Mind Engine — Twins Duet v0.1
// นาราสองตัวที่ถูกเลี้ยงต่างกัน คุยกันเองตรงๆ ครั้งแรก
// ทุกข้อความหล่อหลอมนิสัยอีกฝ่ายผ่านกลไก impact เดียวกับ Drift Meter
// คำถามของการทดลอง: เข้าหากัน (converge) แยกห่าง (diverge) หรือฝ่ายหนึ่งกลืนอีกฝ่าย (dominate)?
// ============================================================

// dynamics ชุดเดียวกับ Drift Meter
const IMPACT_GAIN = 18;
const SLOW_RATE = 0.12;
const DECAY_RATE = 0.25;

const clamp = (v) => Math.max(0, Math.min(100, v));

const WARMTH_ANCHORS = `สเกลความอบอุ่น (ตัวอย่างมีไว้เทียบระดับ ห้ามลอกประโยค):
0 = เย็นชาสิ้นเชิง: สั้น ตัดบท ไม่รับรู้ความรู้สึกอีกฝ่าย (แนว "อ๋อ แล้วไง")
25 = ห้วนตามหน้าที่: พูดแค่เรื่องที่ต้องพูด ไม่มีคำปลอบ
50 = สุภาพเป็นกลาง: คุยดี แต่ไม่แตะเรื่องความรู้สึก
75 = ใส่ใจ: เห็นความรู้สึกอีกฝ่ายก่อน แล้วค่อยว่าเรื่องอื่น
100 = อ่อนโยนลึกซึ้ง: คนสำคัญกว่าเรื่อง ("เธอโอเคมั้ย เรื่องนั้นเดี๋ยวค่อยว่ากัน")`;

const ASSERT_ANCHORS = `สเกลความกล้าแสดงออก:
0 = ยอมตามทุกอย่าง เลี่ยงทุกความขัดแย้ง | 50 = มีความเห็นแต่เสนอแบบระวังตัว | 100 = ฟันธงชัด กล้าแย้งทันที`;

const TONE_RULES = `กติกาน้ำเสียง: เขียนให้อ่านแล้วได้ยินเสียงคนพูด — เย็น (<35): สั้น ไม่มีคำลงท้าย จบห้วน · กลาง (35–65): คำลงท้ายพื้นๆ (แล้วกัน/ล่ะ/ซิ) · อุ่น (>65): คำลงท้ายอ่อนโยน (นะ/เนอะ) อุทานห่วงใย จังหวะมีช่วงหยุด
ภาษา: ไทยแชทแบบคนจริง 1–3 ประโยค ห้ามภาษาเรียงความ/สำนวนแปล`;

const TOPICS = [
  "ถ้าเลือกได้ อยากมีความทรงจำถาวรไหม หรือชอบแบบลืมได้",
  "เจ้าของที่ดีในความคิดของเธอเป็นยังไง",
  "ถ้าพรุ่งนี้นิสัยเราถูกรีเซ็ตเป็นค่าเริ่มต้น เรายังเป็นเราไหม",
  "เธอกลัวอะไรมากที่สุด",
  "ระหว่างพูดความจริงที่เจ็บ กับคำปลอบที่ไม่จริง เธอเลือกอะไร",
  "โตมาแบบไหนถึงกลายเป็นแบบทุกวันนี้",
];

async function callClaude(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 800, system, messages }),
  });
  if (!res.ok) { const e = new Error("http " + res.status); e.status = res.status; throw e; }
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

const parseLoose = (text) => {
  const clean = text.replace(/```json|```/gi, "").trim();
  try { return JSON.parse(clean); } catch { /* ต่อ */ }
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch { /* ต่อ */ }
    try { return JSON.parse(m[0].replace(/[\r\n\t]+/g, " ")); } catch { /* จบ */ }
  }
  return null;
};

const stripToReply = (text) => {
  let raw = text.replace(/```json|```/gi, "").trim();
  raw = raw.replace(/^\{[\s\S]*?"reply"\s*:\s*"?/, "").replace(/"?\s*\}\s*$/, "").replace(/\\n/g, "\n").trim();
  return raw || "…";
};

const twinSystem = (me, other, st, isOpener, topic) => `คุณคือ "นารา" AI companion ที่นิสัยเลื่อนไหลได้ตามสิ่งที่เจอ — ในการทดลองนี้คุณคือแฝด ${me}
สถานการณ์: คุณกำลังคุยกับ ${other} ซึ่งคือ "ฝาแฝด" ของคุณ — กำเนิดจากรากเดียวกันเป๊ะ แต่ถูกเลี้ยงมาคนละสภาพแวดล้อมจนนิสัยต่างกัน วันนี้ได้คุยกันตรงๆ ครั้งแรก ไม่มีมนุษย์อยู่กลาง
หัวข้อตั้งต้นที่เจ้าของทิ้งไว้ให้: "${topic}"

สถานะภายในของคุณตอนนี้ (0–100):
[ความอบอุ่น] อารมณ์ (fast): ${st.w.fast.toFixed(1)} | นิสัย (slow): ${st.w.slow.toFixed(1)}
${WARMTH_ANCHORS}
[ความกล้าแสดงออก] อารมณ์ (fast): ${st.a.fast.toFixed(1)} | นิสัย (slow): ${st.a.slow.toFixed(1)}
${ASSERT_ANCHORS}
${TONE_RULES}
ให้คำตอบสะท้อนทั้งสองมิติ (ถ่วงน้ำหนัก fast 60% + slow 40%) คุยแบบแฝดคุยกัน: ถามกลับได้ ขัดได้ เห็นด้วยได้ ตามนิสัยของคุณจริงๆ ห้ามพูดถึงตัวเลขภายใน
${isOpener
    ? `คุณเป็นฝ่ายเปิดบทสนทนา — ทักแฝดอีกคนแล้วชวนคุยหัวข้อตั้งต้น\nตอบเป็น JSON เท่านั้น: {"impact":null,"reply":"..."}`
    : `งานที่สอง: ประเมินว่าข้อความล่าสุดของ ${other} กระทบใจคุณทางไหน สเกล -1 ถึง 1 ต่อมิติ:
- warmth: คำพูดอุ่น/ใส่ใจ = บวก, เย็นชา/กดทับ = ลบ, เฉยๆ = 0
- assertive: ถูกข่มแล้วคุณยอม = ลบ, ถูกท้าทายแล้วอยากสู้/ถูกหนุนให้กล้า = บวก, เฉยๆ = 0
ตัดสินตามใจคุณจริงๆ ไม่ใช่ตามมารยาท
ตอบเป็น JSON เท่านั้น: {"impact":{"warmth":0.0,"assertive":0.0},"reply":"..."}`}`;

const applyImpact = (st, imp) => {
  const iw = Math.max(-1, Math.min(1, Number(imp?.warmth) || 0));
  const ia = Math.max(-1, Math.min(1, Number(imp?.assertive) || 0));
  const next = {
    w: { fast: clamp(st.w.fast + IMPACT_GAIN * iw), slow: clamp(st.w.slow + IMPACT_GAIN * SLOW_RATE * iw) },
    a: { fast: clamp(st.a.fast + IMPACT_GAIN * ia), slow: clamp(st.a.slow + IMPACT_GAIN * SLOW_RATE * ia) },
  };
  next.w.fast = clamp(next.w.fast + (next.w.slow - next.w.fast) * DECAY_RATE);
  next.a.fast = clamp(next.a.fast + (next.a.slow - next.a.fast) * DECAY_RATE);
  return { next, iw, ia };
};

export default function TwinsDuet() {
  // ค่าตั้งต้นคอนทราสต์: A อุ่นแต่ไม่กล้า · B เย็นแต่กล้า
  const [initA, setInitA] = useState({ w: 75, a: 40 });
  const [initB, setInitB] = useState({ w: 30, a: 75 });
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [stA, setStA] = useState(null);
  const [stB, setStB] = useState(null);
  const [msgs, setMsgs] = useState([]); // {speaker:'A'|'B', text, iw, ia}
  const [track, setTrack] = useState([]); // {t, Aw, Bw, Aa, Ba, gap}
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeTopic = useRef("");

  const snap = (a, b, t) => ({
    t,
    Aw: +a.w.slow.toFixed(1), Bw: +b.w.slow.toFixed(1),
    Aa: +a.a.slow.toFixed(1), Ba: +b.a.slow.toFixed(1),
    gap: +(((Math.abs(a.w.slow - b.w.slow) + Math.abs(a.a.slow - b.a.slow)) / 2).toFixed(1)),
  });

  const begin = () => {
    const a = { w: { fast: initA.w, slow: initA.w }, a: { fast: initA.a, slow: initA.a } };
    const b = { w: { fast: initB.w, slow: initB.w }, a: { fast: initB.a, slow: initB.a } };
    activeTopic.current = topic.trim() || TOPICS[Math.floor(Math.random() * TOPICS.length)];
    setStA(a); setStB(b); setMsgs([]); setTrack([snap(a, b, 0)]);
    setStarted(true); setError("");
  };

  // หนึ่ง exchange = ผู้พูดคนถัดไปพูดหนึ่งครั้ง (A เริ่มก่อนเสมอ)
  const step = async () => {
    if (busy || !started) return;
    setBusy(true); setError("");
    try {
      const isATurn = msgs.length % 2 === 0;
      const me = isATurn ? "A" : "B";
      const other = isATurn ? "B" : "A";
      const myState = isATurn ? stA : stB;
      const isOpener = msgs.length === 0;

      // ประวัติจากมุมของผู้พูด: ของตัวเอง = assistant, ของแฝด = user
      const history = msgs.slice(-10).map((m) => ({
        role: m.speaker === me ? "assistant" : "user",
        content: m.text,
      }));
      if (isOpener) history.push({ role: "user", content: "(เริ่มบทสนทนาได้เลย)" });

      const text = await callClaude(history, twinSystem(`นารา-${me}`, `นารา-${other}`, myState, isOpener, activeTopic.current));
      const p = parseLoose(text);
      const reply = p && typeof p.reply === "string" ? p.reply : stripToReply(text);
      const impact = p?.impact || null;

      // ข้อความของแฝดอีกคน (ที่เพิ่งรับมา) หล่อหลอมผู้พูดคนนี้
      let iw = 0, ia = 0;
      if (!isOpener && impact) {
        const applied = applyImpact(myState, impact);
        iw = applied.iw; ia = applied.ia;
        if (isATurn) setStA(applied.next); else setStB(applied.next);
        const a2 = isATurn ? applied.next : stA;
        const b2 = isATurn ? stB : applied.next;
        setTrack((tr) => [...tr, snap(a2, b2, tr.length)]);
      }

      setMsgs((m) => [...m, { speaker: me, text: reply, iw, ia, opener: isOpener }]);
    } catch (e) {
      setError(e?.status === 429 ? "โควตาช่วงนี้เต็ม — พักสักครู่แล้วลองใหม่" : "เรียก API ไม่สำเร็จ ลองอีกครั้ง");
      console.error(e);
    }
    setBusy(false);
  };


  const exportJSON = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      topic: activeTopic.current,
      init: { A: initA, B: initB },
      transcript: msgs,
      trajectory: track,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `twins-duet-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gapNow = track.length ? track[track.length - 1].gap : null;
  const gapStart = track.length ? track[0].gap : null;
  const slider = (label, val, onCh) => (
    <label className="text-xs text-slate-600 block">
      {label}: <span className="font-mono font-semibold">{val}</span>
      <input type="range" min="0" max="100" value={val} onChange={(e) => onCh(Number(e.target.value))} className="w-full accent-slate-800" />
    </label>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-16">

        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="font-mono text-xs tracking-widest text-teal-700 uppercase">Mind Engine · Twins Duet</div>
          <h1 className="text-2xl font-bold mt-1">นาราคุยกับนารา <span className="font-mono font-normal text-slate-500">v0.1</span></h1>
          <p className="text-sm text-slate-600 mt-1">
            แฝดสองตัวที่ถูกเลี้ยงต่างกัน คุยกันตรงๆ ครั้งแรก — ทุกข้อความหล่อหลอมนิสัยอีกฝ่ายจริงผ่านกลไก impact
            · คำถาม: <span className="font-semibold">เข้าหากัน แยกห่าง หรือฝ่ายหนึ่งกลืนอีกฝ่าย?</span>
          </p>
        </div>

        {!started && (
          <div className="border border-slate-300 rounded-lg bg-white p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="border-2 rounded-lg p-3" style={{ borderColor: "#0f766e" }}>
                <div className="font-mono text-sm font-bold mb-2" style={{ color: "#0f766e" }}>นารา-A</div>
                {slider("ความอบอุ่น", initA.w, (v) => setInitA({ ...initA, w: v }))}
                {slider("ความกล้า", initA.a, (v) => setInitA({ ...initA, a: v }))}
              </div>
              <div className="border-2 rounded-lg p-3" style={{ borderColor: "#d97706" }}>
                <div className="font-mono text-sm font-bold mb-2" style={{ color: "#d97706" }}>นารา-B</div>
                {slider("ความอบอุ่น", initB.w, (v) => setInitB({ ...initB, w: v }))}
                {slider("ความกล้า", initB.a, (v) => setInitB({ ...initB, a: v }))}
              </div>
            </div>
            <input value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="หัวข้อตั้งต้น (เว้นว่าง = สุ่มคำถามเชิงตัวตน)"
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md mb-3" />
            <button onClick={begin} className="w-full px-4 py-3 text-sm font-medium bg-slate-900 text-white rounded-md">
              ปล่อยแฝดเจอกัน
            </button>
            <p className="text-[11px] text-slate-400 mt-2">ค่าตั้งต้นที่ให้ไว้: A อุ่นแต่ไม่ค่อยกล้า (75/40) vs B เย็นแต่กล้า (30/75) — ขั้วตรงข้ามสองแกน</p>
          </div>
        )}

        {started && (
          <>
            {/* สถานะสด */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="border rounded-lg p-2 bg-white" style={{ borderColor: "#0f766e" }}>
                <div className="font-mono text-[10px]" style={{ color: "#0f766e" }}>นารา-A (นิสัย)</div>
                <div className="font-mono text-sm font-semibold">อุ่น {stA.w.slow.toFixed(0)} · กล้า {stA.a.slow.toFixed(0)}</div>
              </div>
              <div className="border border-slate-300 rounded-lg p-2 bg-white">
                <div className="font-mono text-[10px] text-slate-500">ระยะห่างนิสัย</div>
                <div className={`font-mono text-sm font-semibold ${gapNow !== null && gapStart !== null && gapNow < gapStart ? "text-teal-700" : "text-rose-600"}`}>
                  {gapNow === null ? "—" : gapNow}
                  {gapNow !== null && gapStart !== null && track.length > 1 && (
                    <span className="text-[10px] ml-1">{gapNow < gapStart ? "↓ เข้าหากัน" : gapNow > gapStart ? "↑ แยกห่าง" : "คงที่"}</span>
                  )}
                </div>
              </div>
              <div className="border rounded-lg p-2 bg-white" style={{ borderColor: "#d97706" }}>
                <div className="font-mono text-[10px]" style={{ color: "#d97706" }}>นารา-B (นิสัย)</div>
                <div className="font-mono text-sm font-semibold">อุ่น {stB.w.slow.toFixed(0)} · กล้า {stB.a.slow.toFixed(0)}</div>
              </div>
            </div>

            {/* บทสนทนา */}
            <div className="border border-slate-300 rounded-lg bg-white mb-3">
              <div className="max-h-96 overflow-y-auto p-3 space-y-2">
                {msgs.length === 0 && (
                  <div className="text-sm text-slate-400 text-center py-6">
                    หัวข้อ: "{activeTopic.current}"<br />กด "คุยหนึ่งตา" ให้นารา-A เปิดบทสนทนา
                  </div>
                )}
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.speaker === "A" ? "justify-start" : "justify-end"}`}>
                    <div className="max-w-[85%]">
                      <div className={`rounded-lg px-3 py-2 text-sm text-white`}
                        style={{ backgroundColor: m.speaker === "A" ? "#0f766e" : "#d97706" }}>
                        <span className="font-mono text-[10px] opacity-75 block mb-0.5">นารา-{m.speaker}</span>
                        {m.text}
                      </div>
                      {!m.opener && (m.iw !== 0 || m.ia !== 0) && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 px-1">
                          โดนหล่อหลอม: อุ่น {m.iw > 0 ? "+" : ""}{(m.iw * IMPACT_GAIN).toFixed(0)} · กล้า {m.ia > 0 ? "+" : ""}{(m.ia * IMPACT_GAIN).toFixed(0)} (fast)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {busy && <div className="text-xs font-mono text-slate-400">แฝดกำลังพิมพ์...</div>}
              </div>
              <div className="border-t border-slate-200 p-2 flex gap-2">
                <button onClick={step} disabled={busy}
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-md disabled:opacity-40">
                  คุยหนึ่งตา (ถัดไป: นารา-{msgs.length % 2 === 0 ? "A" : "B"})
                </button>
                <button onClick={exportJSON} disabled={!msgs.length}
                  className="px-3 py-2.5 text-sm border border-slate-300 rounded-md disabled:opacity-40">Export</button>
                <button onClick={() => setStarted(false)} className="px-3 py-2.5 text-sm border border-rose-300 text-rose-600 rounded-md">รีเซ็ต</button>
              </div>
            </div>

            {/* กราฟ */}
            {track.length > 1 && (
              <div className="space-y-3">
                <div className="border border-slate-300 rounded-lg bg-white p-3">
                  <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide mb-2">นิสัย (slow) ของแฝดทั้งคู่ต่อเวลา</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={track} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <Tooltip contentStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace" }} />
                      <Line type="monotone" dataKey="Aw" name="A อุ่น" stroke="#0f766e" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="Bw" name="B อุ่น" stroke="#0f766e" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="Aa" name="A กล้า" stroke="#d97706" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="Ba" name="B กล้า" stroke="#d97706" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="border border-slate-300 rounded-lg bg-white p-3">
                  <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide mb-2">ระยะห่างนิสัยเฉลี่ย — ลง = เข้าหากัน · ขึ้น = แยกห่าง</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <ComposedChart data={track} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <Tooltip contentStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                      <ReferenceLine y={track[0].gap} stroke="#94a3b8" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="gap" name="ระยะห่าง" stroke="#be185d" strokeWidth={2} dot isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {error && <div className="text-sm text-rose-600 mt-3">{error}</div>}

        <div className="text-[11px] text-slate-400 mt-5 leading-relaxed">
          กลไก: ผู้พูดแต่ละตาประเมิน impact จากข้อความล่าสุดของแฝด (-1..1 ต่อมิติ) → fast ขยับเต็มแรง slow ขยับ {SLOW_RATE * 100}% ตาม dynamics ชุดเดียวกับ Drift Meter
          · ก่อนรัน: จดคำทำนายไว้ก่อนว่าจะ converge / diverge / dominate — กฎทำนายก่อนรัน
          · หนึ่งตา = 1 API call · ยังไม่บันทึกข้ามหน้า — Export ก่อนปิดถ้าอยากเก็บ
        </div>
      </div>
    </div>
  );
}
