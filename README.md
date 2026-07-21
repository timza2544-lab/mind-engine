# Mind Engine

**Growing an AI character — and checking whether it actually grew.**

A fertilizer seller's hobby project: an AI companion architecture where character *changes through experience* (never through settings), plus the measurement loop that checks whether the change is real to humans — built solo, on a phone, as prompt scaffolding over an off-the-shelf model. No weights access required; anyone with claude.ai can replicate everything here.

**Start with the research note:** [`docs/mind-engine-note-en.md`](docs/mind-engine-note-en.md) · ฉบับภาษาไทย (ร่างแรก): [`docs/mind-engine-note-th-draft1.md`](docs/mind-engine-note-th-draft1.md) · full methods: [`docs/technical-appendix.md`](docs/technical-appendix.md)

## The one table

Human↔judge calibration for perceived "warmth", across four instrument versions (single rater — see limitations):

| Version | Fix | r human↔judge | r human↔dial | r judge↔dial |
|---|---|---|---|---|
| v1.1 | redefine the construct | 0.20 | 0.27 | 0.39 |
| v1.2 | behavioral anchors at the source | 0.67 | 0.48 | 0.81 |
| v1.3 | natural spoken language | 0.74 | 0.24 | 0.32 |
| v1.4 | tone-of-voice binding | 0.78 | 0.81 | 0.85 |

The v1.3 dip is the honest heart of the project: naturalness broke dial fidelity, the instrument caught it, and binding trait level to tone carriers (particles, rhythm, interjections) restored both at once.

## What's in here

`tools/` — three single-file React artifacts, runnable by pasting into claude.ai:
- **drift-meter-v1-4.jsx** — dual-timescale character (fast mood / slow character), live drift, blind tests, and the human↔judge calibration mode that produced the table above.
- **memory-keeper-v0-2.jsx** — owner-knowledge memory designed to be *correctably wrong*: provenance tiers, hedged recall, raw quotes attached, supersede-with-history, and a with-notes vs no-notes blind test that can lose.
- **twins-duet-v0-1.jsx** — two differently-raised characters converse directly; every message shapes the other's traits. Frozen at v0.1 by owner's order. Four runs so far: complementarity in an opposite pair, lockstep co-drift in identical pairs, slow co-warming in a cold pair, and a conflict run where sacrifice was offered, refused, and replaced by declared mutual honesty — with a measured shared-silence state that the pair exited by themselves.

`data/` — raw experiment exports with a data dictionary (some runs pending upload from the author's device; see `docs/technical-appendix.md` §4).

## Design commitments

Character changes through experience only — no dials for the owner. The system never claims to love back, and never claims to feel time passing; it notices and responds to what actually changed. Every good result ships next to its own weaknesses (see the note's "What's weak" and appendix §6–§8), under two standing rules: *write the prediction before pressing run*, and after every piece of good news ask *"how does this break?"*

## How to help

The single most useful contribution right now: be a rater who has **never seen the anchors**. Open an issue or replicate the calibration with your own judgments. Refutations are as welcome as confirmations — the measurement loop exists to be attacked.

## Credits

A solo human project with three AI assistants in different seats — theory, thinking partner, engineering/measurement. This repo's documents were drafted by the engineering assistant from full experiment logs and edited by the human author, with cross-review between assistants (including citation fact-checks in both directions).

License: MIT (code and documents). Data files are experiment outputs shared for replication.
