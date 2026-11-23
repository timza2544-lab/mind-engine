import re
v1=open('../index.html').read()
art=open('../art/art.js').read(); poses=open('../art/poses.js').read()
portrait=open('portrait.js').read(); ui=open('ui.js').read()
inner=open('/tmp/claude-0/-home-user-mind-engine/dfdf79fc-c8df-5c03-9b12-bb7cfedbd5bf/scratchpad/designer/inner.js').read()
inner=inner[:inner.index("  const GRIPW")]
xr=open('/tmp/claude-0/-home-user-mind-engine/dfdf79fc-c8df-5c03-9b12-bb7cfedbd5bf/scratchpad/designer/xray.js').read()
cat=[l for l in xr.split('\n') if l.startswith('  const catmull')][0]
helpers="  const VAGW = [2.2, 2.8, 3.4, 4.4, 1.8], reachOf = p => p.vagDepthCm + 2.5, dia = p => p.mGirth / Math.PI, glow = (c, col, b) => { c.shadowColor = col; c.shadowBlur = b; }, label = () => {}, OPT = {};\n"+cat+"\n"
head='''<title>ห้องลับคาสิโน</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600&family=Press+Start+2P&display=swap">
<style>
/* a late-night arcade cabinet: metal frame with a neon sign, big pixel portrait, a typed dialogue box, a cursor menu, an action window with an x-ray option and a status strip. one deliberate dark look, themed by room */
:root{color-scheme:dark;--ink:#f6f0ff;--ink2:#b9acd6;--warn:#ff7b7b;--amber:#ffb000;--f-b:"Noto Sans Thai",system-ui,sans-serif;--f-px:"Press Start 2P",ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:#07050c;color:var(--ink);font-family:var(--f-b);font-size:16px;line-height:1.65;padding-left:max(12px,env(safe-area-inset-left,0px));padding-right:max(12px,env(safe-area-inset-right,0px));padding-block:14px 44px}
main{max-width:780px;margin:0 auto}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.px{font-family:var(--f-px);letter-spacing:.02em}
.cab{--f1:#cfc6e8;--f2:#2b1f47;--neon:#ff4fa3;--bd:#b79cff;--glow:rgba(255,79,163,.38);background:var(--f2);padding:10px;border:4px solid #000;box-shadow:inset 0 0 0 3px var(--f1),0 0 30px var(--glow)}
.sign{text-align:center;margin:2px 0 10px;font-family:var(--f-px);font-size:clamp(12px,3.8vw,24px);color:#fff;letter-spacing:.14em;text-shadow:0 0 6px var(--neon),0 0 16px var(--neon),3px 3px 0 #000}
.screen{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#05030a;border:4px solid var(--f1);padding:6px}
.left{grid-column:1;grid-row:1;display:flex;flex-direction:column;gap:8px;min-width:0}
.right{grid-column:2;grid-row:1;position:relative;min-width:0;align-self:start}
@media (max-width:660px){.screen{grid-template-columns:1fr}.left,.right{grid-column:1}.right{grid-row:1}.left{grid-row:2}}
.right canvas{display:block;width:100%;aspect-ratio:4/5;image-rendering:pixelated;border:3px solid #000;background:#000}
.plate{position:absolute;left:8px;top:8px;background:rgba(10,6,20,.9);border:2px solid var(--bd);padding:1px 10px;font-size:14px;line-height:1.35;display:flex;flex-direction:column}
.muted{color:var(--ink2);font-size:13px;margin:0}
label{display:block;font-size:13px;color:var(--ink2);margin:10px 0 4px}
input[type=text],input[type=number]{width:100%;background:#0b0818;border:2px solid var(--bd);color:var(--ink);padding:8px 10px;font:inherit}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}
.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dlg{position:relative;background:#0b0818;border:4px solid var(--bd);box-shadow:0 0 0 2px #000;padding:10px 14px 14px;min-width:0}
.dlg::before{content:"";position:absolute;inset:3px;border:2px solid var(--neon);opacity:.45;pointer-events:none}
.dlg-h{font-size:12px;font-weight:600;color:var(--neon);margin-bottom:4px}
.dlg-t{max-height:240px;overflow:auto;white-space:pre-wrap;font-weight:500;font-size:16px;line-height:1.75;cursor:pointer}
.more{position:absolute;right:12px;bottom:4px;color:var(--bd);animation:bl 1s steps(2) infinite}
@keyframes bl{50%{opacity:0}}
.hint{margin-top:8px;border:2px dashed #5a4528;padding:6px 8px;font-size:13px;color:#ffd9a0}
.menu{background:#0b0818;border:4px solid var(--bd);box-shadow:0 0 0 2px #000;padding:4px 6px;display:flex;flex-direction:column}
button{font:inherit;color:inherit;cursor:pointer}
button:focus-visible,input:focus-visible{outline:3px solid var(--amber);outline-offset:2px}
.mi{background:none;border:0;text-align:left;padding:8px 8px 8px 24px;min-height:44px;position:relative;line-height:1.45;color:var(--ink)}
.mi+.mi{border-top:2px dotted #2f2550}
.mi::before{content:"\\25B6";position:absolute;left:6px;top:50%;transform:translateY(-50%);color:var(--neon);opacity:0;font-size:12px}
.mi:hover::before,.mi:focus-visible::before{opacity:1}.mi:hover{background:#17102d}
.mi.hot{color:#ffd0e2;font-weight:600}
.chip{background:#0b0818;border:2px solid #3a2f63;color:var(--ink);padding:6px 12px;min-height:40px;font-size:14px}
.chip[aria-pressed=true]{background:var(--neon);border-color:var(--neon);color:#13061a;font-weight:600}
.mini{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}
.mini canvas{display:block;width:100%;image-rendering:pixelated;border:3px solid #000;outline:2px solid var(--bd);background:#000}
.tools{display:flex;flex-direction:column;gap:6px}
.pbtn{font-family:var(--f-px);font-size:10px;letter-spacing:.04em;padding:10px 12px;min-height:44px;background:#e9e1ff;color:#17102d;border:0;box-shadow:inset -3px -3px 0 rgba(0,0,0,.3),inset 3px 3px 0 rgba(255,255,255,.55),0 0 0 2px #000}
.pbtn[aria-pressed=true]{background:var(--neon);color:#13061a}
.pbtn.go{background:var(--neon);color:#13061a;min-width:140px;font-size:12px}
.pbtn.stop{background:#ff6b6b;color:#2a0505}
.order .row{margin-bottom:4px}
.hud{margin-top:8px;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;background:#0a0716;border:3px solid #000;box-shadow:inset 0 0 0 2px var(--f1);padding:8px 12px}
.hi{display:flex;flex-direction:column;gap:5px;min-width:76px}.hi .px{font-size:9px;color:var(--ink2)}
.dg{font-size:16px;color:#9affc8;text-shadow:0 0 6px #21d98a}
.seg{display:block;height:12px;background:#1a1330;border:2px solid #000;position:relative;overflow:hidden}
.seg b{display:block;height:100%;background:var(--neon)}.seg.t b{background:#46d9d0}
.seg::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 9px,#0a0716 9px 11px)}
.vip{margin-left:auto;border:2px solid #ffb000;color:#ffb000;padding:6px 8px;font-size:11px;box-shadow:0 0 8px rgba(255,176,0,.5)}
.log{font-size:13px;color:var(--ink2);margin:0;padding-left:20px}
.spin{display:inline-block;width:14px;height:14px;border:2px solid var(--neon);border-right-color:transparent;border-radius:50%;animation:sp 1s linear infinite;vertical-align:-2px;margin-right:8px}
@keyframes sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.spin,.more{animation:none}}
</style>
<main id="app"></main>
<script>
'''
art_s='/* art.js */\n'+art+'\n'+poses+'\n</script>\n<script>\n'
# game logic from v1: everything inside IIFE up to the ui section
a=v1.index('(function () {'); b=v1.index('  /* ---------- ui ---------- */')
logic=v1[a:b].replace("const KEY = 'secret-gameshow.v1'","const KEY = 'secret-gameshow.v2'")
logic=logic.replace("o.setup.age >= 20","o.setup.age >= 20")
out=head+art_s+logic+portrait+'\n'+inner+'\n'+helpers+'\n'+ui+'\n</script>\n'
open('index.html','w').write(out)
print(len(out))
