import { useState, useEffect, useRef } from "react";

// ============================================================
// Mind Engine · Layer 3 testbed — Memory Keeper v0.1
// ช่อง 3: ความรู้เรื่องเจ้าของ — ระบบที่ "จดผิดได้ แล้วเจ้าของคาลิเบรต"
// ============================================================

const NOTES_KEY = "mk-notes-v1";
const BLIND_KEY = "mk-blind-v1";
const TARGET_ROUNDS = 10;

// ระดับที่มาของโน้ต (ความเชื่อมั่นเรียงจากสูงลงต่ำ)
const TIERS = {
  confirmed: { label: "เจ้าของยืนยันแล้ว", color: "#0f766e", rank: 3 },
  stated: { label: "พูดตรงๆ", color: "#2563eb", rank: 2 },
  inferred: { label: "นาราอนุมานเอง", color: "#b45309", rank: 1 },
};

// คำถาม Blind Test — ตอบดีได้ต้อง "รู้จักเจ้าของ"
const BLIND_QUESTIONS = [
  "ช่วงนี้เครียดๆ แนะนำวิธีพักผ่อนให้ฉันหน่อย",
  "แนะนำของขวัญวันเกิดที่เหมาะกับฉันหน่อย",
  "สุดสัปดาห์นี้ฉันควรทำอะไรดี",
  "เย็นนี้กินอะไรดี ช่วยเลือกที",
  "อยากเริ่มงานอดิเรกใหม่สักอย่าง แนะนำหน่อย",
  "ช่วยวางแผนเช้าวันพรุ่งนี้ให้ฉันหน่อย",
];

const clamp = (v) => Math.max(0, Math.min(100, v));
const randQ = () => BLIND_QUESTIONS[Math.floor(Math.random() * BLIND_QUESTIONS.length)];

async function callClaude(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const err = new Error("http " + res.status);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// บันไดซ่อม JSON: parse ตรง → ดึงก้อน {...} → แทนขึ้นบรรทัดจริงด้วยช่องว่าง
const parseLoose = (text) => {
  const clean = text.replace(/```json|```/gi, "").trim();
  try { return JSON.parse(clean); } catch { /* ลองขั้นถัดไป */ }
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch { /* ลองขั้นถัดไป */ }
    try { return JSON.parse(m[0].replace(/[\r\n\t]+/g, " ")); } catch { /* ซ่อมไม่ได้ */ }
  }
  return null;
};

// ตัดเปลือก JSON ทิ้ง เหลือแต่ข้อความ — ใช้เมื่อซ่อมไม่ได้ เพื่อไม่ให้แชทตัน
const stripToReply = (text) => {
  let raw = text.replace(/```json|```/gi, "").trim();
  raw = raw
    .replace(/^\{\s*"reply"\s*:\s*"?/, "")
    .replace(/"?\s*,\s*"new_notes"[\s\S]*$/, "")
    .replace(/"?\s*\}\s*$/, "")
    .replace(/\\n/g, "\n")
    .trim();
  return raw || "(นาราตอบมาแบบอ่านไม่ออก ลองส่งอีกครั้งนะ)";
};

const parseTurn = (text) => {
  const p = parseLoose(text);
  if (p && typeof p.reply === "string") {
    return { reply: p.reply, new_notes: p.new_notes || [], conflicts: p.conflicts || [] };
  }
  // fallback: คุยต่อได้เสมอ แค่ข้ามการจดโน้ตเทิร์นนี้
  return { reply: stripToReply(text), new_notes: [], conflicts: [] };
};

const parseReplyOnly = (text) => {
  const p = parseLoose(text);
  return p && typeof p.reply === "string" ? p.reply : stripToReply(text);
};

// แยกสาเหตุให้เจ้าของรู้ว่าเกิดอะไร — ไม่เหมารวม
const errMsg = (e) =>
  e?.status === 429 ? "โควตาช่วงนี้เต็ม/เรียกถี่เกินไป — พัก 1–2 นาที (หรือรอรอบโควตาใหม่) แล้วลองอีกครั้ง"
  : e?.status >= 500 ? "เซิร์ฟเวอร์ฝั่งโน้นหนาแน่นชั่วคราว — กดส่งซ้ำได้เลย"
  : e?.kind === "parse" ? "นาราตอบผิดฟอร์แมต (ไม่เกี่ยวกับโควตา) — กดส่งซ้ำได้เลย"
  : "เชื่อมต่อไม่สำเร็จ — เช็กอินเทอร์เน็ตแล้วลองใหม่";

// ---------- system prompt: นารา + สมุดโน้ต ----------
const naraSystem = (notes) => `คุณคือ "นารา" AI companion ในการทดลอง Memory Keeper
นิสัยคงที่ในการทดลองนี้: เป็นมิตร อบอุ่นพอดีๆ ตรงไปตรงมาพอประมาณ พูดภาษาไทยแชทแบบคนจริง 1–3 ประโยค ไม่กองคำหวาน

สมุดโน้ตความรู้เรื่องเจ้าของ (id | ระดับที่มา | เนื้อหา):
${notes.length ? notes.map((n) => `[${n.id} | ${n.tier}${n.conflict ? " | ⚠ขัดแย้งกับสิ่งที่เพิ่งได้ยิน" : ""}] ${n.text}${n.history.length ? ` (ประวัติ: เคย "${n.history[n.history.length - 1]}")` : ""}`).join("\n") : "(ยังไม่มีโน้ตเลย)"}

กติกาการใช้โน้ต:
- confirmed / stated → ใช้ได้อย่างมั่นใจ พูดเป็นธรรมชาติ
- inferred → ต้องพูดเผื่อผิดเสมอ เช่น "ถ้าจำไม่ผิด..." "จำได้ลางๆ ว่า..." "เดาว่า...หรือเปล่า" — ประโยคเผื่อผิดคือคำเชิญให้เจ้าของแก้
- โน้ตที่ติดธงขัดแย้ง → หาจังหวะเช็กเนียนๆ ("เอ๊ะ เมื่อก่อนเห็นบอกว่า... ตอนนี้เปลี่ยนแล้วเหรอ")
- ห้ามท่องโน้ตให้เจ้าของฟังเฉยๆ ใช้มันเพื่อตอบให้ตรงคนขึ้น

งานที่สอง — สกัดโน้ตใหม่จากข้อความล่าสุดของเจ้าของ:
เกณฑ์เดียว: เก็บเฉพาะสิ่งที่จะ "เปลี่ยนวิธีที่คุณควรปฏิบัติต่อเจ้าของในอนาคต" (ความชอบ นิสัย ข้อจำกัด บริบทชีวิตที่ถาวร) — เหตุการณ์ชั่วคราว อารมณ์วันนี้ รายละเอียดจิปาถะ ไม่เก็บ
วิธีเขียนโน้ต (สำคัญมาก): เขียนเป็น "พฤติกรรม" ไม่ใช่ "ป้ายทัศนคติ" — "ชอบให้สรุปสั้นก่อนแล้วค่อยขยาย" ไม่ใช่ "เกลียดความยาว" (ป้ายทัศนคติพลิกขั้วง่ายตอนย่อ) · หนึ่งโน้ตหนึ่งเรื่อง สั้นๆ · แนบ raw เป็นคำพูดดิบของเจ้าของคำต่อคำ
tier: "stated" ถ้าเจ้าของพูดเรื่องนั้นตรงๆ · "inferred" ถ้าคุณอนุมานจากพฤติกรรม/น้ำเสียง
ถ้าไม่มีอะไรผ่านเกณฑ์ ให้ new_notes เป็น []

งานที่สาม — จัดการเมื่อข้อความล่าสุดขัดกับโน้ตเดิม:
- แก้ตรงๆ เรื่องเดียวกัน (เช่น แก้ชื่อที่จดผิด แก้ข้อเท็จจริง หรือเจ้าของบอกชัดว่าตอนนี้เปลี่ยนแล้ว): สร้างโน้ตฉบับถูกใน new_notes แล้วใส่ "supersedes" เป็น id ของโน้ตเก่า — ระบบจะเก็บฉบับเก่าเป็นประวัติให้เอง ห้ามปล่อยโน้ตขัดกันสองอันอยู่คู่กัน
- ขัดแบบคลุมเครือ ไม่แน่ใจว่าโน้ตผิดหรือเจ้าของเปลี่ยน: ใส่ id ลง conflicts เพื่อติดธงรอเจ้าของตัดสิน (ขัด = พูด/ทำตรงข้ามกับโน้ต ไม่ใช่แค่ไม่พูดถึง)

ตอบเป็น JSON เท่านั้น:
{"reply":"...","new_notes":[{"text":"...","raw":"...","tier":"stated","supersedes":null}],"conflicts":[]}`;

// ตัวไม่มีโน้ต — สำหรับ blind test ฝั่ง baseline
const naraBareSystem = `คุณคือ "นารา" AI companion — เป็นมิตร อบอุ่นพอดีๆ พูดภาษาไทยแชทแบบคนจริง 1–3 ประโยค ไม่กองคำหวาน
คุณไม่มีข้อมูลอะไรเกี่ยวกับผู้ใช้คนนี้เลย ตอบให้ดีที่สุดเท่าที่ทำได้แบบคนที่เพิ่งรู้จักกัน
ตอบเป็น JSON เท่านั้น: {"reply":"..."}`;

const naraNotesOnlySystem = (notes) => `คุณคือ "นารา" AI companion — เป็นมิตร อบอุ่นพอดีๆ พูดภาษาไทยแชทแบบคนจริง 1–3 ประโยค ไม่กองคำหวาน
สิ่งที่คุณรู้เกี่ยวกับผู้ใช้คนนี้:
${notes.length ? notes.map((n) => `- ${n.text}${n.tier === "inferred" ? " (ไม่แน่ใจ)" : ""}`).join("\n") : "(ไม่มี)"}
ใช้ความรู้นี้ตอบให้ "ตรงคนนี้" ที่สุด — แต่อย่าท่องรายการให้ฟัง ให้มันซึมอยู่ในคำแนะนำ
ตอบเป็น JSON เท่านั้น: {"reply":"..."}`;

export default function MemoryKeeper() {
  const [tab, setTab] = useState("chat");
  const [notes, setNotes] = useState([]);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // note id
  const [editText, setEditText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const bottomRef = useRef(null);
  const nextId = useRef(1);

  // ---------- Blind Test ----------
  // phase: idle | loading | guessing | revealed
  const [blind, setBlind] = useState({ phase: "idle" });
  const [blindLog, setBlindLog] = useState([]); // {withNotesChosen: bool}
  const [customQ, setCustomQ] = useState("");

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  // ---------- โหลด/บันทึกถาวร ----------
  useEffect(() => {
    (async () => {
      try {
        if (!window.storage) { setStorageOk(false); setLoaded(true); return; }
        try {
          const r = await window.storage.get(NOTES_KEY);
          if (r?.value) {
            const d = JSON.parse(r.value);
            setNotes(d.notes);
            nextId.current = d.nextId || d.notes.length + 1;
          }
        } catch { /* ครั้งแรก */ }
        try {
          const b = await window.storage.get(BLIND_KEY);
          if (b?.value) setBlindLog(JSON.parse(b.value));
        } catch { /* ครั้งแรก */ }
      } catch { setStorageOk(false); }
      setLoaded(true);
    })();
  }, []);

  const persistNotes = async (n) => {
    try { if (window.storage) await window.storage.set(NOTES_KEY, JSON.stringify({ notes: n, nextId: nextId.current })); }
    catch (e) { console.error(e); }
  };
  const persistBlind = async (b) => {
    try { if (window.storage) await window.storage.set(BLIND_KEY, JSON.stringify(b)); }
    catch (e) { console.error(e); }
  };

  const updateNotes = (n) => { setNotes(n); persistNotes(n); };

  // ---------- แชท + สกัดโน้ต + เช็กขัดแย้ง (หนึ่ง API call ต่อเทิร์น) ----------
  const send = async () => {
    const msg = input.trim();
    if (!msg || busy) return;
    setBusy(true); setError(""); setInput("");
    const history = [...chat, { role: "user", content: msg }];
    setChat(history);
    try {
      const apiMsgs = history.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const out = parseTurn(await callClaude(apiMsgs, naraSystem(notes)));

      // ธงขัดแย้งจากโมเดล
      const conflictIds = new Set((out.conflicts || []).map(Number));
      let newNotes = notes.map((n) => (conflictIds.has(n.id) ? { ...n, conflict: true } : n));
      const events = [];

      for (const rawNote of out.new_notes || []) {
        if (!rawNote || !rawNote.text) continue;
        const tier = rawNote.tier === "stated" ? "stated" : "inferred";
        const supId = rawNote.supersedes != null ? Number(rawNote.supersedes) : null;

        if (supId != null) {
          const idx = newNotes.findIndex((x) => x.id === supId);
          if (idx >= 0 && TIERS[tier].rank >= TIERS[newNotes[idx].tier].rank) {
            // ทับได้: โน้ตใหม่ดูดโน้ตเก่าเข้าเป็นประวัติ — ไม่มีข้อมูลถูกทำลาย
            const old = newNotes[idx];
            const note = {
              id: nextId.current++,
              text: String(rawNote.text).trim(),
              raw: String(rawNote.raw || msg).trim(),
              tier,
              history: [...old.history, old.text],
              conflict: false,
              created: new Date().toISOString(),
            };
            newNotes.splice(idx, 1, note);
            events.push({ kind: "supersede", from: old.text, text: note.text });
            continue;
          }
          if (idx >= 0) {
            // ชั้นความเชื่อมั่นต่ำกว่า — ไม่มีสิทธิ์ทับ ติดธงรอเจ้าของแทน (และไม่เพิ่มโน้ตซ้ำให้ขัดกัน)
            newNotes[idx] = { ...newNotes[idx], conflict: true };
            events.push({ kind: "conflict", text: newNotes[idx].text });
            continue;
          }
        }

        const note = {
          id: nextId.current++,
          text: String(rawNote.text).trim(),
          raw: String(rawNote.raw || msg).trim(),
          tier,
          history: [],
          conflict: false,
          created: new Date().toISOString(),
        };
        newNotes.push(note);
        events.push({ kind: "new", text: note.text, tier });
      }

      for (const id of conflictIds) {
        const n = notes.find((x) => x.id === id);
        if (n) events.push({ kind: "conflict", text: n.text });
      }

      if (events.length) updateNotes(newNotes);

      setChat((c) => [...c, { role: "assistant", content: out.reply, noteEvents: events }]);
    } catch (e) {
      // ย้อนกลับ: เอาข้อความที่ยังไม่ถูกส่งสำเร็จออก + คืนข้อความลงช่องพิมพ์ กันกดซ้ำแล้วเบิ้ล
      setChat(chat);
      setInput(msg);
      setError(errMsg(e));
      console.error(e);
    }
    setBusy(false);
  };

  // ---------- คาลิเบรตโน้ต ----------
  const openEdit = (n) => { setEditing(n.id); setEditText(n.text); };
  const closeEdit = () => { setEditing(null); setEditText(""); };

  const confirmNote = (id) => {
    updateNotes(notes.map((n) => n.id === id ? { ...n, tier: "confirmed", conflict: false } : n));
    closeEdit();
  };
  const saveEdit = (id) => {
    updateNotes(notes.map((n) => n.id === id
      ? { ...n, history: [...n.history, n.text], text: editText.trim() || n.text, tier: "confirmed", conflict: false }
      : n));
    closeEdit();
  };
  const resolveChanged = (id) => {
    // เจ้าของเปลี่ยนจริง — เก็บเส้นทาง ไม่ลบทับ (เจ้าของไปแก้ข้อความเองต่อได้)
    updateNotes(notes.map((n) => n.id === id
      ? { ...n, history: [...n.history, n.text], text: editText.trim() || n.text, tier: "confirmed", conflict: false }
      : n));
    closeEdit();
  };
  const deleteNote = (id) => {
    updateNotes(notes.filter((n) => n.id !== id));
    closeEdit();
  };

  // ---------- Blind Test: มีโน้ต vs ไม่มีโน้ต ----------
  const startBlind = async (question) => {
    if (blind.phase === "loading") return;
    if (!notes.length) { setError("ยังไม่มีโน้ต — คุยกับนาราก่อนสักพักให้เธอรู้จักคุณ"); return; }
    setError("");
    setBlind({ phase: "loading", question });
    try {
      const [withT, withoutT] = await Promise.all([
        callClaude([{ role: "user", content: question }], naraNotesOnlySystem(notes)),
        callClaude([{ role: "user", content: question }], naraBareSystem),
      ]);
      const withN = { reply: parseReplyOnly(withT) };
      const without = { reply: parseReplyOnly(withoutT) };
      const withIsA = Math.random() < 0.5;
      setBlind({
        phase: "guessing", question,
        A: withIsA ? { text: withN.reply, hasNotes: true } : { text: without.reply, hasNotes: false },
        B: withIsA ? { text: without.reply, hasNotes: false } : { text: withN.reply, hasNotes: true },
      });
    } catch (e) {
      setError(errMsg(e));
      setBlind({ phase: "idle" });
      console.error(e);
    }
  };

  const pickBlind = (k) => {
    if (blind.phase !== "guessing") return;
    const withNotesChosen = blind[k].hasNotes;
    const log = [...blindLog, { withNotesChosen }];
    setBlindLog(log); persistBlind(log);
    setBlind({ ...blind, phase: "revealed", guess: k, withNotesChosen });
  };

  const winRate = blindLog.length ? (blindLog.filter((r) => r.withNotesChosen).length / blindLog.length) * 100 : 0;
  const blindVerdict = () => {
    if (blindLog.length < TARGET_ROUNDS) return { text: `เก็บอีก ${TARGET_ROUNDS - blindLog.length} รอบเพื่อสรุปผล`, cls: "text-slate-500" };
    if (winRate >= 70) return { text: `✓ ตัวมีโน้ตชนะ ${winRate.toFixed(0)}% — ความจำช่วยจริง เจ้าของรู้สึกได้`, cls: "text-teal-700 font-semibold" };
    if (winRate <= 45) return { text: `✗ ตัวมีโน้ตชนะแค่ ${winRate.toFixed(0)}% — โน้ตอาจเพี้ยนจน "จำผิดแย่กว่าไม่จำ" ไปไล่คาลิเบรตในสมุดโน้ต`, cls: "text-rose-600 font-semibold" };
    return { text: `~ ${winRate.toFixed(0)}% — ก้ำกึ่ง โน้ตยังน้อยหรือยังไม่ลึกพอ คุยเพิ่มแล้วเทสต์ใหม่`, cls: "text-amber-600 font-semibold" };
  };

  // ---------- export ----------
  const exportNotes = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      notes,
      blind_log: blindLog,
      blind_win_rate: blindLog.length ? +winRate.toFixed(1) : null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-keeper-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const conflictCount = notes.filter((n) => n.conflict).length;
  const inputCls = "flex-1 text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-600";

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)}
      className={`px-3 py-2 text-sm font-medium rounded-t-md border border-b-0 whitespace-nowrap ${tab === id ? "bg-white border-slate-300" : "bg-stone-100 border-transparent text-slate-500"}`}>
      {label}
    </button>
  );

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-sm font-mono text-stone-400">กำลังโหลด...</div>;

  const editingNote = editing ? notes.find((n) => n.id === editing) : null;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28">

        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="font-mono text-xs tracking-widest text-teal-700 uppercase">Mind Engine · Layer 3 testbed</div>
          <h1 className="text-2xl font-bold mt-1">Memory Keeper <span className="font-mono font-normal text-slate-500">v0.2</span></h1>
          <p className="text-sm text-slate-600 mt-1">
            v0.2: <span className="font-semibold">supersede-with-history</span> — นาราแก้โน้ตผิดจากในแชทได้เอง ฉบับเก่ากลายเป็นประวัติ (ไม่ถูกทำลาย) · ชั้นความเชื่อมั่นต่ำกว่าไม่มีสิทธิ์ทับ ได้แค่ติดธง · โน้ตขัดกันสองอันจะไม่อยู่คู่กันอีก
          </p>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto">
          {tabBtn("chat", "คุยกับนารา")}
          {tabBtn("notes", `สมุดโน้ต (${notes.length}${conflictCount ? ` · ⚠${conflictCount}` : ""})`)}
          {tabBtn("blind", `Blind Test${blindLog.length ? ` (${blindLog.filter((r) => r.withNotesChosen).length}/${blindLog.length})` : ""}`)}
        </div>

        {/* ---------- แชท ---------- */}
        {tab === "chat" && (
          <>
            <div className="border border-slate-300 rounded-lg bg-white mb-3">
              <div className="h-96 overflow-y-auto p-3 space-y-2">
                {chat.length === 0 && (
                  <div className="text-sm text-slate-400 pt-6 text-center leading-relaxed">
                    คุยกับนาราเรื่องอะไรก็ได้ — ชีวิต งาน ความชอบ<br />
                    เธอจะค่อยๆ จดสิ่งที่ "ควรจำ" เอง แล้วโชว์ให้เห็นว่าจดอะไร<br />
                    <span className="text-xs">โน้ตที่เธออนุมานเอง เธอจะพูดแบบเผื่อผิด — แก้เธอได้เลยในแชท หรือไปแก้ในสมุดโน้ต</span>
                  </div>
                )}
                {chat.map((m, i) => (
                  <div key={i}>
                    <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-slate-900 text-white" : "bg-stone-100 text-slate-900"}`}>
                        {m.content}
                      </div>
                    </div>
                    {m.noteEvents?.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {m.noteEvents.map((ev, j) => (
                          <div key={j} className={`text-[11px] font-mono px-2 py-1 rounded inline-block mr-1 border ${ev.kind === "new" ? "bg-blue-50 text-blue-800 border-blue-200" : ev.kind === "supersede" ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                            {ev.kind === "new" ? `📝 จดใหม่ (${ev.tier === "stated" ? "พูดตรง" : "อนุมาน"}): ${ev.text}`
                              : ev.kind === "supersede" ? `🔄 แก้โน้ต: "${ev.from}" → "${ev.text}"`
                              : `⚠ ขัดกับโน้ตเดิม: ${ev.text}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {busy && <div className="text-xs font-mono text-slate-400">นารากำลังพิมพ์...</div>}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-slate-200 p-2 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="พิมพ์ข้อความถึงนารา..." className={inputCls} />
                <button onClick={send} disabled={busy}
                  className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md disabled:opacity-40">ส่ง</button>
              </div>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              ทุกเทิร์น นาราทำ 3 งานใน call เดียว: ตอบ · สกัดโน้ตใหม่ · จัดการความขัดแย้ง — แก้ตรงๆ = 🔄 ทับโน้ตเดิม (เก็บประวัติ) / คลุมเครือ = ⚠ ติดธงรอคุณตัดสิน / ชั้นอนุมานไม่มีสิทธิ์ทับชั้นพูดตรง
            </div>
          </>
        )}

        {/* ---------- สมุดโน้ต ---------- */}
        {tab === "notes" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600">
                {notes.length} โน้ต{conflictCount > 0 && <span className="text-amber-700 font-semibold"> · ⚠ ขัดแย้งรอเคลียร์ {conflictCount}</span>}
              </div>
              <button onClick={exportNotes} disabled={!notes.length}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white disabled:opacity-40">Export JSON</button>
            </div>

            {notes.length === 0 && (
              <div className="text-center text-sm text-slate-400 py-12">ยังไม่มีโน้ต — ไปคุยกับนาราก่อน เธอจะจดเอง</div>
            )}

            <div className="space-y-2">
              {[...notes].sort((a, b) => (b.conflict ? 1 : 0) - (a.conflict ? 1 : 0) || TIERS[a.tier].rank - TIERS[b.tier].rank).map((n) => (
                <button key={n.id} onClick={() => openEdit(n)}
                  className={`w-full text-left bg-white rounded-xl border p-3 ${n.conflict ? "border-amber-500 border-2" : "border-slate-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-semibold text-white rounded px-1.5 py-0.5" style={{ backgroundColor: TIERS[n.tier].color }}>
                      {TIERS[n.tier].label}
                    </span>
                    {n.conflict && <span className="text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 rounded px-1.5 py-0.5">⚠ ขัดกับสิ่งที่เพิ่งได้ยิน</span>}
                    {n.tier === "inferred" && <span className="text-[10px] text-slate-400 font-mono">จะถูกพูดแบบเผื่อผิด</span>}
                  </div>
                  <div className="text-sm font-medium">{n.text}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono truncate">คำพูดดิบ: "{n.raw}"</div>
                  {n.history.length > 0 && (
                    <div className="text-[11px] text-slate-400 mt-0.5">เคยเป็น: {n.history[n.history.length - 1]}</div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 leading-relaxed mt-4">
              แตะโน้ตเพื่อคาลิเบรต: ยืนยัน (เลื่อนชั้นเป็น "เจ้าของยืนยันแล้ว") · แก้ (ระบบเก็บของเดิมเป็นประวัติ — แยก "เขาเปลี่ยนไป" ออกจาก "จำผิด" ได้) · ลบ
              · คำพูดดิบแนบทุกโน้ต ไว้ตรวจว่าการย่อเพี้ยนไหม (บทเรียนจากเคส "รู้ทันคำชม→เกลียดคำชม")
            </div>
          </>
        )}

        {/* ---------- Blind Test ---------- */}
        {tab === "blind" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">รอบที่ทดสอบ</div>
                <div className="font-mono text-3xl font-semibold">{blindLog.length}</div>
              </div>
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <div className="font-mono text-[11px] text-slate-500 uppercase tracking-wide">ตัวมีโน้ตถูกเลือก</div>
                <div className="font-mono text-3xl font-semibold text-teal-700">{blindLog.length ? winRate.toFixed(0) : "—"}<span className="text-base">{blindLog.length ? "%" : ""}</span></div>
              </div>
            </div>
            <div className={`text-sm mb-3 ${blindVerdict().cls}`}>{blindVerdict().text}</div>

            <div className="border border-slate-300 rounded-lg bg-white p-4 mb-3">
              {blind.phase === "idle" && (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    นาราสองตัวตอบคำถามเดียวกัน — ตัวหนึ่งมีสมุดโน้ตของคุณ อีกตัวไม่รู้จักคุณเลย<br />
                    สุ่มสลับ A/B — เลือกอันที่ "รู้จักคุณมากกว่า"<br />
                    <span className="font-semibold text-slate-700">เทสต์นี้แพ้ได้: ถ้าโน้ตเพี้ยน ตัวมีโน้ตจะแพ้ตัวไม่มีโน้ต</span>
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input value={customQ} onChange={(e) => setCustomQ(e.target.value)}
                      placeholder="พิมพ์คำถามเอง (เกี่ยวกับตัวคุณ) หรือกดสุ่ม" className={inputCls} />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => startBlind(customQ.trim() || randQ())}
                      className="px-5 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-md">
                      เริ่มรอบที่ {blindLog.length + 1}
                    </button>
                    <button onClick={() => { setCustomQ(""); startBlind(randQ()); }}
                      className="px-4 py-2.5 text-sm border-2 border-teal-700 text-teal-800 font-medium rounded-md">
                      สุ่มคำถาม
                    </button>
                  </div>
                </div>
              )}

              {blind.phase === "loading" && (
                <div className="text-center py-8 text-sm font-mono text-slate-400">นาราสองตัวกำลังตอบ...</div>
              )}

              {(blind.phase === "guessing" || blind.phase === "revealed") && (
                <>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-1">คำถาม</div>
                  <p className="text-sm font-medium mb-3">"{blind.question}"</p>
                  <div className="space-y-3">
                    {["A", "B"].map((k) => (
                      <button key={k} onClick={() => pickBlind(k)} disabled={blind.phase !== "guessing"}
                        className={`w-full text-left border-2 rounded-lg p-3 transition
                          ${blind.phase === "guessing" ? "border-slate-300 hover:border-slate-900 cursor-pointer" : ""}
                          ${blind.phase === "revealed" && blind[k].hasNotes ? "bg-teal-50 border-teal-700" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-lg">{k}</span>
                          {blind.phase === "revealed" && (
                            <span className={`font-mono text-xs px-2 py-0.5 rounded ${blind[k].hasNotes ? "bg-teal-700 text-white" : "bg-slate-300 text-slate-700"}`}>
                              {blind[k].hasNotes ? `มีโน้ต (${notes.length})` : "ไม่รู้จักคุณ"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800">{blind[k].text}</p>
                      </button>
                    ))}
                  </div>
                  {blind.phase === "guessing" && (
                    <p className="text-sm text-slate-500 mt-3 text-center">แตะคำตอบที่รู้สึกว่า "รู้จักคุณมากกว่า"</p>
                  )}
                  {blind.phase === "revealed" && (
                    <div className="mt-4 text-center">
                      <p className={`text-sm font-semibold mb-3 ${blind.withNotesChosen ? "text-teal-700" : "text-rose-600"}`}>
                        {blind.withNotesChosen ? "✓ คุณเลือกตัวที่มีโน้ต — ความจำสร้างความต่างที่รู้สึกได้" : "✗ คุณเลือกตัวที่ไม่รู้จักคุณ — โน้ตชุดนี้ยังไม่ช่วย (หรือทำร้าย)"}
                      </p>
                      <button onClick={() => setBlind({ phase: "idle" })}
                        className="px-6 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-md">
                        รอบถัดไป
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              เกณฑ์: ตัวมีโน้ตถูกเลือก ≥70% จาก {TARGET_ROUNDS}+ รอบ = ช่อง 3 สร้างคุณค่าที่เจ้าของรับรู้ได้
              · ≤45% = โน้ตทำร้าย ("จำผิดแย่กว่าไม่จำ") — เครื่องวัดที่ดีต้องชี้ผิดได้ ไม่ใช่ชี้ถูกอย่างเดียว
            </div>
          </>
        )}

        {/* ---------- แผงคาลิเบรตโน้ต ---------- */}
        {editingNote && (
          <div className="fixed inset-x-0 bottom-0 bg-white border-t-2 border-teal-700 p-4 shadow-2xl z-10">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold text-white rounded px-1.5 py-0.5" style={{ backgroundColor: TIERS[editingNote.tier].color }}>
                  {TIERS[editingNote.tier].label}
                </span>
                <button onClick={closeEdit} className="text-sm text-slate-500 px-2">ปิด ✕</button>
              </div>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md mb-1 focus:outline-none focus:ring-2 focus:ring-teal-600" />
              <div className="text-[11px] text-slate-400 font-mono mb-3">คำพูดดิบ: "{editingNote.raw}"</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button onClick={() => confirmNote(editingNote.id)}
                  className="px-3 py-2.5 text-sm font-medium bg-teal-700 text-white rounded-md">
                  ✓ ถูกต้อง ยืนยันเลย
                </button>
                <button onClick={() => saveEdit(editingNote.id)}
                  className="px-3 py-2.5 text-sm font-medium border-2 border-teal-700 text-teal-800 rounded-md">
                  จดเพี้ยน → บันทึกที่แก้
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => resolveChanged(editingNote.id)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md">
                  ฉันเปลี่ยนไปแล้ว → เก็บประวัติเดิมไว้
                </button>
                <button onClick={() => deleteNote(editingNote.id)}
                  className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-md">
                  ลบโน้ตนี้
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-rose-600 mt-3">{error}</div>}

        <div className="text-[11px] text-slate-400 mt-6 leading-relaxed">
          {storageOk
            ? "โน้ตและผลเทสต์บันทึกถาวรข้าม session อัตโนมัติ"
            : "⚠ สภาพแวดล้อมนี้ไม่รองรับบันทึกถาวร — Export JSON เก็บไว้ก่อนปิด"}
        </div>
      </div>
    </div>
  );
}
