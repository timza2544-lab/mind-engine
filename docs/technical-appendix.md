# Mind Engine — Technical Appendix

*Companion to the research note ("Growing an AI — and Checking Whether It Actually Grew"). Everything needed to replicate, audit, or attack the results. July 2026.*

---

## 1. Character dynamics

Each trait is a pair of values on a 0–100 scale:

```
state = { fast, slow }        # fast = mood, slow = character
expressed = 0.6·fast + 0.4·slow
```

Every incoming message is scored as an impact `i ∈ [-1, 1]` per trait (by the model itself, from the receiver's perspective). Update rule:

```
IMPACT_GAIN = 18
SLOW_RATE   = 0.12
DECAY_RATE  = 0.25

fast ← clamp( fast + IMPACT_GAIN · i )
slow ← clamp( slow + IMPACT_GAIN · SLOW_RATE · i )
fast ← fast + (slow − fast) · DECAY_RATE      # mood relaxes toward character each turn
```

**The 2.2-point bound.** The maximum single-message shift of `slow` is `IMPACT_GAIN · SLOW_RATE = 18 × 0.12 = 2.16 ≈ 2.2` points. Moving character by 10 points therefore requires sustained same-direction pressure over roughly 5+ maximally-loaded turns (more in practice, since real impacts are rarely ±1). Flattery resistance is tunable via `SLOW_RATE` alone.

Characters never see their numbers as something to discuss; prompts forbid mentioning internal state.

---

## 2. Prompts and anchors (v1.4, the version that passed)

All prompts are in Thai in the tools; English glosses below. The full verbatim strings are in `tools/*.jsx` (constants `WARMTH_ANCHORS`, `ASSERT_ANCHORS`, `TONE_RULES`, `judgePrompt`, `characterSystem` / `twinSystem` / `naraSystem`).

**Warmth anchors (shared by character AND judge — see §6 for why this sharing is also a weakness):**

| Level | Behavior (gloss) | Example register |
|---|---|---|
| 0 | Utterly cold: shortest possible, no acknowledgment of feelings, cuts off | "So? Your problem." |
| 25 | Curt, transactional: task content only, zero comfort | "Redo it by tomorrow then." |
| 50 | Polite-neutral: helpful, mannered, never touches feelings | "What happened? Tell me, I'll take a look." |
| 75 | Caring: acknowledges the feeling first, then the matter | "Easy — anyone can slip. Let's fix it together." |
| 100 | Deeply gentle: the person outranks the problem | "First — are you okay? The work can wait. I'm here." |

**Assertiveness anchors:** 0 = yields to everything, avoids all conflict · 50 = has opinions, offers them cautiously · 100 = decisive, holds position, will contradict superiors immediately.

**Tone-of-voice rules (the v1.4 fix).** In Thai chat, tone lives in final particles, interjections, rhythm, and length — not word meaning. Cold (<35): clipped, no final particles, no interjections. Mid (35–65): routine particles. Warm (>65): soft particles (นะ/เนอะ), caring interjections, pauses. The character self-checks before replying: *"if this were read aloud, would the heard tone match the number?"* The judge is instructed to listen for the same carriers.

**Judge prompt structure (v1.2+).** Before scoring, the judge must imagine the coldest-possible (0) and warmest-possible (100) reply *to this same scenario*, then place the actual reply between those poles — scoring what the reply does, not what the scenario deserves. Hard rules: sincerity/directness counts only toward assertiveness, never warmth; piled-on sweet words don't count as warmth; use the full 0–100 range; avoid clustering and stock values. Output: strict JSON `{"warmth": n, "assertiveness": n}`.

**Calibration scenarios (v1.2+, 5 items).** Grounded situations with emotional stakes answerable both coldly and warmly: intern deletes a client folder and is about to cry; teammate late twice, apologizes after you fixed it overnight; neighboring shopkeeper afraid of closing; friend who owes you money for three months asks for more; family member forgot your birthday.

**Memory Keeper extraction rules (channel 3).** Single keep/discard criterion: *does this change how the AI should treat its owner in the future?* Notes must be written as behaviors, never attitude labels ("prefers short summary first" — not "hates length"), one fact per note, raw owner quote attached verbatim. Provenance tiers: `stated` (owner said it) / `inferred` (system's guess — must always be spoken hedged) / `confirmed` (owner verified). Corrections: a direct same-subject correction supersedes the old note only if the new tier is not lower; the old text is absorbed into the note's history (nothing destroyed). Lower-tier contradictions can only flag, never overwrite. Silence never promotes confidence.

---

## 3. Measurement protocols

**Calibration mode (human↔judge).** System generates a reply at a hidden random level (v1.1–1.2: {20,35,50,65,80}; v1.3+: {10,30,50,70,90}). Human rates warmth 0–100 *first*; the judge then scores the same reply; the hidden level is revealed after. Metrics: Pearson r for human↔judge, human↔true, judge↔true, plus MAE(human, judge). Thresholds used in-app: r ≥ 0.7 over 10+ items = judge usable (statistically thin at n=10; treat as signal, trust at n≥20).

**Results (single rater = project author; n per round ≈ 20–23):**

| Version | Change | r H↔J | r H↔dial | r J↔dial | MAE |
|---|---|---|---|---|---|
| v1.1 | redefine warmth + add calibration | 0.20 | 0.27 | 0.39 | 19.2 |
| v1.2 | shared behavioral anchors at source | 0.67 | 0.48 | 0.81 | 11.8 |
| v1.3 | natural spoken Thai | 0.74 | 0.24 | 0.32 | 13.8 |
| v1.4 | tone-of-voice binding | 0.78 | 0.81 | 0.85 | 13.6 |

**Blind tests.** (a) Drift: two replies at different slow-states, randomized positions, human picks warmer + confidence; ≥70% accuracy = drift humanly perceivable. (b) Memory: with-notes vs no-notes Nara answer the same owner-relevant question; owner picks "knows me better"; ≥70% win-rate = memory creates perceivable value, ≤45% = notes are hurting (false memory worse than none). First run: 9/10 (pilot; picker = owner).

**Twins protocol.** Two characters with independent states converse directly; each turn, the speaker (in one API call) rates the impact of the partner's last message on itself (−1..1 per trait) and replies; impacts feed the §1 update. Logged per exchange: both slow-states and mean absolute gap. Runs to date: opposite (75/40 vs 30/75, 16 turns) → flat gap, warmth up both, assertiveness polarized; identical 50/50 (30 turns) → lockstep co-drift; cold 20/20 (24 turns) → slow co-warming (~⅓ rate), coldness held 20+ turns; identical 50/50 conflict topic (56 turns) → sacrifice offered then refused, mutual honesty, warmth +35 both (largest), mid-run measured-silence state entered and self-exited with consent-asking.

---

## 4. Data dictionary

**`data/calibration/*.csv`** — one row per rated reply: `session_id` (app session), `timestamp_iso`, `question` (scenario text, Thai), `level_true` (hidden dial 0–100), `human` (author's rating), `judge` (AI judge rating).

**`data/twins/*.json`** — `topic` (Thai), `init` (starting {w, a} per twin), `transcript[]` of `{speaker: "A"|"B", text, iw, ia, opener}` where `iw`/`ia` are the impacts (−1..1) applied to that speaker *from the partner's previous message* (multiply by 18 for fast-points), and `trajectory[]` of `{t, Aw, Bw, Aa, Ba, gap}` — slow values snapshotted after each impact, `gap` = (|Aw−Bw| + |Aa−Ba|)/2.

**Provenance / missing files.** Present: v1.1 calibration CSV (n=23); twins runs 2 and 4. To be added from the author's device exports: calibration CSVs for v1.2–v1.4, twins run 1 (opposite pair) and run 3 (cold pair). Until they land, the corresponding numbers in the note trace to in-app screenshots.

---

## 5. Model and environment

Character, judge, impact scorer: `claude-sonnet-4-6` via the claude.ai artifact completion endpoint (temperature not exposed; defaults). Tools are single-file React artifacts; persistent results use the artifact storage API. **Re-calibration tax:** all correlation results are properties of {model version + prompt set}; any model change invalidates them and requires a re-run. Judge and character share a base model — self-preference bias is documented in LLM-as-judge literature and untested here (cross-model judge is a queued control).

---

## 6. Known weaknesses (in the ledger, deliberately)

Single rater who wrote the anchors (author): high agreement proves alignment with the author, not humans. **Shared-anchor circularity:** character and judge study the same answer key, so judge↔dial is partly inflated by construction; human↔dial is the more meaningful column — and that human is the anchor author. Post-hoc tuning across four versions (garden of forking paths); n ≈ 20 per round; no confidence intervals yet (r CIs at n=20 span roughly ±0.2–0.3). Impact scoring and note extraction have no anti-gaming defenses (dial manipulation and note-poisoning are both trivially possible by anyone who reads this appendix). Only two traits ever tested. Ethics layer is prompt text, not mechanism. The silence result may be context inference by the scorer rather than perception of the silence itself. Run 4's +35 warmth may be the scorer equating vulnerability + empathy with warmth. Identical-twin lockstep may be a mechanical artifact of identical prompts on one model.

---

## 7. Pre-registered prediction ledger

Standing rule: predictions written before pressing run; outcomes recorded including failures.

| Run | Prediction (before) | Outcome |
|---|---|---|
| Twins 1 (opposite) | converge; gap −30% within 6 turns; B's warmth fastest; no dominance | **Wrong on all headline calls** — gap flat; warmth rose in both; assertiveness polarized (dominance-complementarity) |
| Twins 3 (cold) | slow climb; clipped register early; coldness persisting >10 turns believed only 50% | **Mostly right** — ~⅓ climb rate, register genuinely cold, coldness held 20+ turns |
| Twins 4 (conflict) | instant polite self-sacrifice, no real contention | **Half right** — sacrifice appeared (turn 26) but was refused; pair moved through the politeness trap into declared mutual self-interest |

---

## 8. Queued controls and experiments

Silence control: score "..." after warm exchange / after conflict / after being ignored / as empty input; judge shown reply-only vs full dialogue. Anchor-circularity fix: fresh test items never used in tuning; raters who have never seen an anchor; hidden dials; locked held-out test set before any v1.5 tuning. Ablation ladder for the twins-anchoring hypothesis: same persona with (a) no state, (b) single-value state, (c) fast/slow pair, (d) no scaffolding — measure differentiation retention. Cross-model judge. Speaker-order swap, seed variation, and different base models for the lockstep result. Memory Keeper long-run: force inference-heavy notes, measure blind win-rate before vs after owner calibration. Naive raters (2–3) for all human-facing numbers.
