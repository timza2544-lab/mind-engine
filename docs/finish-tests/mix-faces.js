// usage: node mix-faces.js <app dir>; faces/sounds follow the style's families and each sub-style phase gets its own face and sound
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const F=ANIMA.finishLib,o=[];
o.push('pool sizes '+['FACES','SOUNDS','INNER'].map(k=>k+' '+F.pools[k].length+'/'+F.POOL_TAGS[k].length).join(' '));
const loud=['burst','cling','plead','multi'],quiet=['quiet','held','delayed','silent'];
const score=(ids,tags)=>{let hit=0,n=0;for(const id of ids)for(let i=0;i<150;i++){F.recent.length=0;const f=F.pick({seed:id+i,n:1,came:1,w:null,buildup:60,forceId:id});}return 0};
// direct tpick through many picks: classify chosen face tags by whether style is loud/quiet
const stats={loudFacesWithLoud:0,loudN:0,quietFacesWithLoud:0,quietN:0};
for(let i=0;i<800;i++){F.recent.length=0;const f=F.pick({seed:'z'+i,n:1+i%3,came:1,w:null,buildup:60});const T=(F.TAGS[f.id]||'').split(' ');const fi=F.pools.FACES.indexOf(f.face),ft=(F.POOL_TAGS.FACES[fi]||'').split(' ');
 if(T.includes('loud')){stats.loudN++;if(ft.includes('loud'))stats.loudFacesWithLoud++}if(T.includes('quiet')){stats.quietN++;if(ft.includes('loud'))stats.quietFacesWithLoud++}}
o.push('loud styles -> loud face '+stats.loudFacesWithLoud+'/'+stats.loudN+' ; quiet styles -> loud face '+stats.quietFacesWithLoud+'/'+stats.quietN);
for(let i=0;i<60;i++){F.recent.length=0;const f=F.pick({seed:'y'+i,n:1,came:1,w:null,buildup:60});if(f.mix.length===2){o.push(F.mixLine(f));break}}
const f1=F.pick({seed:'same',n:1,came:1,w:null,buildup:50}),f2=F.pick({seed:'same',n:1,came:1,w:null,buildup:50});o.push('stable '+(JSON.stringify(f1)===JSON.stringify(f2)));
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
