# Tools — how to run

Each `.jsx` file is a self-contained React artifact.

**Easiest (no API key):** open claude.ai → start a chat → ask Claude to render the file as an artifact (attach it or paste its contents). The artifact environment provides the model endpoint and persistent storage automatically.

**Standalone (Vite/CRA):** possible, but you must supply your own Anthropic API key and add the `anthropic-dangerous-direct-browser-access` header. Do NOT ship a page like that publicly — the key is exposed to anyone who opens dev tools. For anything public, proxy the API server-side.

Notes:
- `twins-duet-v0-1.jsx` is **frozen by owner's order** — fork it for changes (e.g. a future v0.2 with cross-session memory), don't edit in place.
- Drift Meter / Memory Keeper persist results across sessions via artifact storage; Twins Duet does not — use its Export button.
- All character/judge prompts are Thai; the tone-carrier mechanism (§2 of the technical appendix) is Thai-specific by design. Porting to another language means redesigning the tone anchors, not translating them.
