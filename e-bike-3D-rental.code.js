<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Golden Triangle: 3D E-bike and Station</title>
<style>
  :root{--ink:#10302b;--leaf:#1f7a4d;--gold:#e0a526;--water:#2b7fbf;--alert:#c2412d;--bg:#e9f0ea;--muted:#5c726c;--line:#cfdcd3}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:"Avenir Next","Segoe UI",system-ui,sans-serif;line-height:1.45}
  header{background:var(--ink);color:#fff;padding:20px 16px}
  .wrap{max-width:1100px;margin:0 auto}
  header h1{margin:0 0 4px;font-size:clamp(22px,4vw,30px)}
  header p{margin:0;color:#b8d0c7;max-width:70ch;font-size:14px}
  header nav{margin-top:10px;font-size:13px}
  header nav a{color:var(--gold);margin-right:14px}
  main{max-width:1100px;margin:0 auto;padding:16px}
  .tabs{display:flex;gap:8px;margin-bottom:12px}
  .tabs button{font:inherit;font-weight:700;cursor:pointer;border-radius:10px;border:2px solid var(--ink);background:#fff;color:var(--ink);padding:9px 16px}
  .tabs button.on{background:var(--ink);color:#fff}
  .layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:14px}
  @media(max-width:860px){.layout{grid-template-columns:1fr}}
  .card{background:#fff;border-radius:14px;padding:12px;box-shadow:0 1px 3px #0001}
  canvas{display:block;width:100%;height:clamp(340px,62vh,560px);border-radius:10px;touch-action:none;cursor:grab;background:#dff0e6}
  canvas:active{cursor:grabbing}
  .hint{font-size:12px;color:var(--muted);margin:8px 2px}
  .tools{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;font-size:13px}
  .tools button{font:inherit;font-size:13px;font-weight:600;cursor:pointer;border-radius:8px;border:2px solid var(--line);background:#fff;color:var(--ink);padding:5px 10px}
  .tools button:hover,.tools button:focus-visible{border-color:var(--leaf);outline:none}
  .tools label{display:flex;align-items:center;gap:5px;cursor:pointer}
  .tools input[type=range]{width:110px}
  .side h2{margin:2px 0 8px;font-size:18px}
  #parts{list-style:none;margin:0 0 10px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}
  #parts button{width:100%;text-align:left;font:inherit;font-size:13px;cursor:pointer;border:2px solid var(--line);background:#fff;border-radius:9px;padding:6px 8px;display:flex;gap:7px;align-items:center;color:var(--ink)}
  #parts button b{background:var(--ink);color:#fff;min-width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px}
  #parts button.on{border-color:var(--gold);background:#fdf3d8}
  #parts button.on b{background:var(--gold);color:var(--ink)}
  #detail{background:var(--bg);border-radius:10px;padding:12px;font-size:14px;min-height:120px}
  #detail h3{margin:0 0 4px;font-size:16px}
  #live{font-size:13px;margin:10px 0 0;display:grid;gap:4px}
  #live div{display:flex;justify-content:space-between;background:var(--bg);border-radius:8px;padding:6px 10px}
  #how{font-size:13px;padding-left:20px;margin:10px 0 0}
  #how li{margin:4px 0}
  .note{font-size:12px;color:var(--muted);margin:14px 2px}
  footer{max-width:1100px;margin:0 auto;padding:4px 16px 28px;font-size:12px;color:var(--muted)}
</style>
</head>
<body>
<header><div class="wrap">
  <h1>The Golden Triangle in 3D</h1>
  <p>Turn the e-bike and the solar charging station around with your mouse or finger. Tap a numbered dot to see what each part does.</p>
  <nav><a href="index.html">Simulation</a><a href="app.html">Resident app</a><a href="ebike-rental.html">Guest rental page</a></nav>
</div></header>

<main>
  <div class="tabs" role="tablist">
    <button id="tab_bike" class="on" role="tab">E-bike</button>
    <button id="tab_station" role="tab">Charging station</button>
  </div>
  <div class="layout">
    <section class="card">
      <canvas id="cv" aria-label="Interactive 3D model. Drag to rotate, scroll or pinch to zoom."></canvas>
      <div class="hint">Drag to rotate · scroll or pinch to zoom · tap a numbered dot or a part name</div>
      <div class="tools">
        <button id="b_side">Side</button>
        <button id="b_front">Front</button>
        <button id="b_top">Top</button>
        <button id="b_reset">Reset view</button>
        <label><input type="checkbox" id="c_auto" checked> Auto-rotate</label>
        <label id="l_spin"><input type="checkbox" id="c_spin" checked> Spin wheels</label>
        <label><input type="checkbox" id="c_dots" checked> Numbered dots</label>
        <label><input type="checkbox" id="c_night"> Night</label>
        <label id="l_sun">Sunlight <input type="range" id="r_sun" min="0" max="100" value="100"> <span id="v_sun">100%</span></label>
        <label id="l_flow"><input type="checkbox" id="c_flow" checked> Show charging flow</label>
        <button id="b_restart">Restart charging</button>
        <label id="l_dock">Bikes docked <input type="range" id="r_dock" min="0" max="6" value="4"> <span id="v_dock">4</span></label>
      </div>
    </section>
    <aside class="card side">
      <h2 id="s_title">E-bike parts</h2>
      <ol id="parts"></ol>
      <div id="detail"></div>
      <div id="live"></div>
      <ol id="how"></ol>
    </aside>
  </div>
  <p class="note">This is a concept illustration made for the competition prototype, not an engineering drawing. Sizes, battery and motor figures are illustrative assumptions. The station and bike match the rules in the rest of the prototype: residents unlock with their personal QR code, visitors pay RM 3 per 30 minutes first.</p>
</main>
<footer>Prototype for the Sime Darby township challenge. The 3D view is drawn by the code in this file, so it works offline with no extra downloads.</footer>

<script>
(() => {
"use strict";
const $ = id => document.getElementById(id);

// ---------- tiny vector helpers ----------
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
const lerpv=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const TAU=Math.PI*2;

// ---------- scene builder: faces (polygons) and lines in 3D ----------
class Scene{
  constructor(){this.faces=[];this.lines=[];this.tf=null;}
  T(p){return this.tf?this.tf(p):p;}
  poly(pts,col,part,ref,o){
    o=o||{};
    this.faces.push({p:pts.map(p=>this.T(p)),c:hex(col),part,ref:this.T(ref),emit:!!o.emit,bg:!!o.bg,
      at:o.at?this.T(o.at):null,layer:o.layer||0});
  }
  line(a,b,col,w,part,bg){this.lines.push({a:this.T(a),b:this.T(b),c:hex(col),w,part,bg:!!bg});}
  obox(c,ax,ay,az,col,part,o){
    const k=[];
    for(let i=0;i<8;i++){
      const sx=i&4?1:-1,sy=i&2?1:-1,sz=i&1?1:-1;
      k.push(add(add(add(c,mul(ax,sx)),mul(ay,sy)),mul(az,sz)));
    }
    [[4,5,7,6],[0,1,3,2],[2,3,7,6],[0,1,5,4],[1,3,7,5],[0,2,6,4]].forEach(f=>this.poly(f.map(i=>k[i]),col,part,c,o));
  }
  box(c,sx,sy,sz,col,part,o){this.obox(c,[sx/2,0,0],[0,sy/2,0],[0,0,sz/2],col,part,o);}
  cyl(a,b,r1,r2,n,col,part,o){
    const d=norm(sub(b,a));
    const u=Math.abs(d[1])<.9?norm(cross(d,[0,1,0])):norm(cross(d,[1,0,0]));
    const w=cross(d,u),A=[],B=[],m=mul(add(a,b),.5);
    for(let i=0;i<n;i++){
      const th=TAU*i/n,dir=add(mul(u,Math.cos(th)),mul(w,Math.sin(th)));
      A.push(add(a,mul(dir,r1)));B.push(add(b,mul(dir,r2)));
    }
    for(let i=0;i<n;i++){const j=(i+1)%n;this.poly([A[i],A[j],B[j],B[i]],col,part,m,o);}
    if(r1>0)this.poly(A,col,part,m,o);
    if(r2>0)this.poly(B,col,part,m,o);
  }
  torus(c,R,r,nM,nm,col,part){
    const g=[];
    for(let i=0;i<nM;i++){
      const th=TAU*i/nM,row=[];
      for(let j=0;j<nm;j++){
        const ph=TAU*j/nm,rr=R+r*Math.cos(ph);
        row.push([c[0]+rr*Math.cos(th),c[1]+rr*Math.sin(th),c[2]+r*Math.sin(ph)]);
      }
      g.push(row);
    }
    for(let i=0;i<nM;i++){
      const i1=(i+1)%nM,thm=TAU*(i+.5)/nM,ref=[c[0]+R*Math.cos(thm),c[1]+R*Math.sin(thm),c[2]];
      for(let j=0;j<nm;j++){const j1=(j+1)%nm;this.poly([g[i][j],g[i1][j],g[i1][j1],g[i][j1]],col,part,ref);}
    }
  }
  // flat rectangle lying on a surface (a decal). u and v are unit vectors in the surface plane.
  quad(c,u,v,hw,hh,col,part,ref,o){
    this.poly([sub(sub(c,mul(u,hw)),mul(v,hh)),sub(add(c,mul(u,hw)),mul(v,hh)),add(add(c,mul(u,hw)),mul(v,hh)),add(sub(c,mul(u,hw)),mul(v,hh))],col,part,ref,o);
  }
  // pseudo QR code sticker (looks like one, is not scannable)
  qr(c,n,u,v,size,part,ref,at,layer){
    const N=9,m=size/N;
    this.quad(add(c,mul(n,.12)),u,v,size/2+.8,size/2+.8,'#ffffff',part,ref,{at,layer});
    const o0=sub(sub(c,mul(u,size/2)),mul(v,size/2));
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      const inF=(i<3&&j<3)||(i>=N-3&&j<3)||(i<3&&j>=N-3);
      let on;
      if(inF){const ci=i<3?i:i-(N-3),cj=j<3?j:j-(N-3);on=!(ci===1&&cj===1);}
      else on=((i*5+j*3+i*j)%7)<3;
      if(!on)continue;
      const p=add(add(add(o0,mul(u,(i+.5)*m)),mul(v,(j+.5)*m)),mul(n,.24));
      this.quad(p,u,v,m/2*.97,m/2*.97,'#10302b',part,ref,{at,layer:layer+1});
    }
  }
}

// ---------- the e-bike (units are centimetres; x = forward, y = up, z = sideways) ----------
function wheel(S,cx,cy,phase,lod,P){
  S.torus([cx,cy,0],30.5,3.6,lod?20:32,lod?5:8,'#1f2724',P('tyre'));
  S.torus([cx,cy,0],27,0.9,lod?20:32,4,'#c9d1cd',P('tyre'));
  S.cyl([cx,cy,-5],[cx,cy,5],3.2,3.2,lod?6:10,'#9aa5a0',P('tyre'));
  const n=lod?10:20;
  for(let k=0;k<n;k++){
    const a=phase+TAU*k/n,s=(k%2?1:-1)*2.5,a2=a+.35;
    S.line([cx+3*Math.cos(a),cy+3*Math.sin(a),s],[cx+27*Math.cos(a2),cy+27*Math.sin(a2),0],'#aeb7b3',.45,P('tyre'));
  }
}
function buildBike(S,phase,lod,G){
  const P=id=>G||id,n=lod?6:8,green='#1f7a4d',dark='#17603c',alu='#8a9792';
  const BB=[-8,26,0];
  const tube=(a,b,r,col,part)=>S.cyl(a,b,r,r,n,col||green,P(part||'frame'));
  wheel(S,-55,34,phase,lod,P);wheel(S,55,34,phase,lod,P);
  // rear hub motor
  S.cyl([-55,34,-6.5],[-55,34,6.5],7.5,7.5,lod?8:14,'#e0a526',P('motor'));
  // frame
  tube(BB,[-22,90,0],2.2);
  tube([-20.7,84,0],[36.8,84,0],2.2);
  tube([-7,27,0],[42.6,68,0],2.7);
  tube([42.6,68,0],[35.4,88,0],2.9);
  for(const s of [-1,1]){
    tube([-8,26,s*4],[-55,34,s*6],1.6);
    tube([-21,80,s*3],[-55,34,s*6],1.4);
    tube([42,69,s*5.5],[55,34,s*6],1.8,dark);
    tube([-40,75,s*7],[-56,36,s*7],.9,'#7d8a85','rack');
  }
  tube([-14,25,-3],[-20,2,-9],1,'#555555','frame');
  // seat
  tube([-22,90,0],[-24.6,103,0],1.6,alu,'seat');
  S.box([-22.5,105,0],27,4.5,14,'#2a2a2a',P('seat'));
  S.box([-6,105.8,0],10,3.5,6,'#2a2a2a',P('seat'));
  // steering, handlebar, handlebar unit
  tube([35.4,88,0],[33,99,0],1.8,alu,'frame');
  tube([33,99,0],[30,104,0],1.5,alu,'frame');
  S.cyl([31,101,-28],[31,101,28],1.2,1.2,n,alu,P('bar'));
  S.cyl([31,101,19],[31,101,29],1.8,1.8,n,'#151515',P('bar'));
  S.cyl([31,101,-29],[31,101,-19],1.8,1.8,n,'#151515',P('bar'));
  const hc=[29.5,106,0];
  S.box(hc,9,9,17,'#10302b',P('hbunit'));
  if(!lod){
    const rf=[29.5,106,0];
    const fr=[34,106,0];
    S.quad([29.5-4.62,106,0],[0,0,1],[0,1,0],6.6,2.6,'#8fe3b5',P('hbunit'),rf,{emit:true,at:[29.5-4.5,106,0],layer:1});
    S.qr(fr,[1,0,0],[0,0,1],[0,1,0],7.6,P('hbunit'),rf,[34.5,106,0],1);
  }
  // lights
  S.box([39,93,0],5,5,7,'#ffe38a',P('lights'),{emit:true});
  S.box([-70,76,0],3,4.5,9,'#e5392b',P('lights'),{emit:true});
  // rear carrier
  S.box([-52,76,0],36,2,15,'#7d8a85',P('rack'));
  // lock and GPS tracker
  S.box([-38,56,0],8,7,9,'#3a4a45',P('lock'));
  S.box([-38,59.8,0],2,.8,2,'#ff4a3a',P('lock'),{emit:true});
  // battery on the down tube
  const dA=[-7,27,0],dB=[42.6,68,0];
  S.cyl(lerpv(dA,dB,.22),lerpv(dA,dB,.8),5.2,5.2,lod?6:8,'#2b3b37',P('battery'));
  S.cyl(lerpv(dA,dB,.47),lerpv(dA,dB,.53),5.5,5.5,lod?6:8,'#e0a526',P('battery'));
  // chainring, cranks, pedals
  S.cyl([-8,26,6],[-8,26,7.4],9.5,9.5,lod?8:16,'#aeb8b3',P('pedals'));
  const ca=phase*.6;
  for(const [s,off] of [[1,0],[-1,Math.PI]]){
    const ang=ca+off,ex=-8+17*Math.cos(ang),ey=26+17*Math.sin(ang);
    S.cyl([-8,26,s*9],[ex,ey,s*9],1.3,1.3,6,'#aeb8b3',P('pedals'));
    S.box([ex,ey,s*13],10,2,7,'#222222',P('pedals'));
  }
}

// ---------- the charging station (x = along the dock, y = up, z = depth) ----------
const BAYS=[-175,-105,-35,35,105,175];
const roofY=z=>215+(z+100)*(35/210);
function buildStation(S,N){
  // ground works (drawn first)
  S.box([0,3,5],540,6,240,'#c3cbc6','slab',{bg:true});
  S.box([0,3,168],540,6,70,'#5aa36f','green',{bg:true});
  for(let x=-210;x<=210;x+=70)S.line([x,6.4,-72],[x,6.4,108],'#f6f8f6',1.4,'slab',true);
  // trees
  for(const x of [-200,-70,70,200]){
    S.cyl([x,6,168],[x,40,168],4,3,6,'#6b4a2f','green');
    S.cyl([x,28,168],[x,100,168],26,0,10,'#2f8f55','green');
    S.cyl([x,62,168],[x,125,168],18,0,10,'#3aa064','green');
  }
  // docking rail
  for(const x of BAYS)S.box([x,10,-92],69,16,12,'#34443f','dock');
  for(const x of [-217.5,217.5])S.box([x,10,-92],15,16,12,'#34443f','dock');
  BAYS.forEach((x,i)=>{
    S.box([x,12,-85.5],6,4,2,'#e0a526','dock');
    for(const s of [-1,1])S.box([x+s*7.5,14,-82],2,16,10,'#6b7a75','dock');
  });
  // docked bikes (front wheel in the clamp)
  for(let i=0;i<N;i++){
    S.tf=p=>[BAYS[i]+p[2],p[1],10-p[0]];
    buildBike(S,i*.7,true,'dockedbike');
    S.tf=null;
  }
  // roof posts and beams
  for(const x of [-248,248]){
    S.cyl([x,6,-100],[x,roofY(-100)-6,-100],4.5,4.5,8,'#5b6a65','canopy');
    S.cyl([x,6,110],[x,roofY(110)-6,110],4.5,4.5,8,'#5b6a65','canopy');
  }
  S.cyl([-250,roofY(-100)-9,-100],[250,roofY(-100)-9,-100],2.5,2.5,6,'#5b6a65','canopy');
  S.cyl([-250,roofY(110)-9,110],[250,roofY(110)-9,110],2.5,2.5,6,'#5b6a65','canopy');
  S.box([0,roofY(-100)-12,-96],480,2,3,'#fff4c2','canopy',{emit:true});
  // solar roof
  const C=[0,roofY(5),5],u=norm([0,35,210]),nn=norm([0,210,-35]);
  S.obox(C,[250,0,0],mul(nn,2),mul(u,106.5),'#46544f','solar',{at:C,layer:0});
  for(let ci=0;ci<9;ci++)for(let ri=0;ri<3;ri++){
    const c=add(add(add(C,[(ci-4)*55.5,0,0]),mul(u,(ri-1)*71)),mul(nn,3.4));
    S.obox(c,[26.5,0,0],mul(nn,1.4),mul(u,33.5),'#1d4f8a','solar',{at:C,layer:1});
  }
  // QR kiosk
  S.box([-232,4,-70],34,8,34,'#243a35','kiosk');
  S.box([-232,55,-70],26,110,26,'#2c4b45','kiosk');
  const t=Math.PI/9,fn=[0,Math.sin(t),Math.cos(t)],fv=[0,Math.cos(t),-Math.sin(t)],hcn=[-232,125,-70];
  S.obox(hcn,[15,0,0],mul(fv,14),mul(fn,6),'#2c4b45','kiosk');
  const fc=add(hcn,mul(fn,6));
  S.quad(add(fc,mul(fn,.12)),[1,0,0],fv,13,12.4,'#0c2a24','kiosk',hcn,{at:fc,layer:1});
  S.qr(add(fc,mul(fv,-1.2)),fn,[1,0,0],fv,15,'kiosk',hcn,fc,2);
  // status beacon
  S.cyl([-232,137,-74],[-232,146,-74],6,6,10,'#4a5b56','beacon');
  S.cyl([-232,146,-74],[-232,155,-74],5.2,3,10,'#35c46a','beacon',{emit:true});
  // battery cabinet
  S.box([232,45,60],50,90,40,'#3b4a45','cabinet');
  S.box([232,45,80.4],40,80,.8,'#2f3d39','cabinet');
  S.box([232,88,80.9],4,2.4,.8,'#35c46a','cabinet',{emit:true});
  for(let k=0;k<5;k++)S.box([232,14+k*5,80.9],30,1.6,.6,'#1f2b28','cabinet');
  S.cyl([232,roofY(60)-4,60],[232,91,60],1.8,1.8,6,'#3b4a45','cabinet');
}

// ---------- scene descriptions and hot spots ----------
const SCENES={
  bike:{
    title:'E-bike parts',R:88,T:[0,52,0],ground:125,grid:25,
    view:{yaw:.55,pitch:.2},
    hot:[
      {id:'battery',name:'Battery pack',at:[20,52,6],text:'A removable lithium-ion battery sits on the down tube. It charges while the bike is docked at a station. Illustrative size: 36 V, about 10 Ah.'},
      {id:'motor',name:'Hub motor',at:[-55,48,8],text:'A small motor in the rear wheel gives pedal assist, so a short trip in the heat feels easy. Illustrative: 250 W, assist stops at about 25 km/h. Local rules should be checked before a real launch.'},
      {id:'hbunit',name:'Handlebar unit',at:[31,114,0],text:'A small screen shows the time left. The speaker gives the beeps and the voice reminders at 10, 5 and 1 minute. A code on the front lets visitors open the rental page for this bike.'},
      {id:'lights',name:'Lights',at:[39,98,5],text:'A front light and a rear light for evening rides along the Linear Green Spines. They run from the main battery.'},
      {id:'lock',name:'Lock and GPS',at:[-38,64,6],text:'A smart lock holds the rear wheel until the bike is unlocked. A GPS tracker records the last known station, so guards know where to look if a bike is not returned after the grace period.'},
      {id:'seat',name:'Seat',at:[-22,113,0],text:'An adjustable seat post fits different riders, from students to older residents.'},
      {id:'rack',name:'Rear carrier',at:[-52,84,0],text:'A rear carrier takes a bag or shopping, so everyday errands do not need a car.'},
      {id:'pedals',name:'Pedals',at:[-8,26,18],text:'Pedal assist: the motor helps while you pedal. Riders still get some exercise and the battery lasts longer.'},
      {id:'tyre',name:'Tyres and wheels',at:[55,68,5],text:'Wide tyres cope with permeable pavers and wet paths along the spines. The spokes are drawn so you can see the wheel turning.'},
      {id:'frame',name:'Frame',at:[10,87,0],text:'An aluminium frame in township green. A low step-through frame could be added for easier mounting.'}
    ]
  },
  station:{
    title:'Charging station parts',R:290,T:[0,115,50],ground:380,grid:50,
    view:{yaw:.45,pitch:.42},
    hot:[
      {id:'solar',name:'Solar roof',at:[0,246,5],text:'Solar panels on the roof power the whole station: the dock, the lights, the QR reader and the chargers. Yellow rays show sunlight arriving. The electricity runs down a cable to the battery cabinet. Use the sunlight slider to see what happens at night or in a storm.'},
      {id:'canopy',name:'Shade roof',at:[248,130,-100],text:'The roof shades riders and parked bikes from sun and rain. Shade keeps batteries cooler and the stop more comfortable.'},
      {id:'dock',name:'Dock and chargers',at:[0,30,-92],text:'Each bay clamps the front wheel, and a connector in the clamp charges the bike battery. Gold pulses show electricity travelling along the rail and into the bike. The bar and percentage show the charge: amber is charging, green is ready to ride, red means no power, grey is an empty bay.'},
      {id:'kiosk',name:'QR reader',at:[-232,122,-60],text:'Residents hold up the personal QR code from the app (it refreshes every minute). Visitors are sent to the rental page to choose a start and end station and pay RM 3 per 30 minutes before the bike unlocks.'},
      {id:'beacon',name:'Status beacon',at:[-232,164,-74],text:'A design idea: the beacon is green when bikes are available and could turn red when an overdue bike has been reported, so guards can see which station needs attention.'},
      {id:'cabinet',name:'Battery cabinet',at:[232,100,60],text:'Stores solar energy so the station keeps working at night and in storms. Gold pulses show power leaving the cabinet for the dock. Try the sunlight slider at 0% and watch the cabinet charge fall. Values are illustrative and sped up.'},
      {id:'dockedbike',name:'Docked e-bikes',at:[-105,110,35],text:'Bikes sit with the front wheel in the clamp and charge while they wait. Use the slider to change how many are docked.'},
      {id:'green',name:'Green strip',at:[0,132,168],text:'Trees and a planted strip beside the station connect it to the Linear Green Spine. They shade the paths and soak up rain.'}
    ]
  }
};

// ---------- state ----------
const cv=$('cv'),ctx=cv.getContext('2d');
let cur='bike',sc=SCENES.bike,S=null,W=300,H=300,dpr=1;
let yaw=sc.view.yaw,pitch=sc.view.pitch,zoom=1,auto=true,spin=true,dots=true,night=false,docked=4;
let phase=0,sel=null,dirty=true,hotPos=[];

function rebuild(){
  S=new Scene();
  if(cur==='bike')buildBike(S,phase,false,null);
  else buildStation(S,docked);
}
function resize(){
  const r=cv.getBoundingClientRect();
  dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.max(1,Math.round(r.width*dpr));cv.height=Math.max(1,Math.round(r.height*dpr));
  W=r.width;H=r.height;
}

// ---------- charging demo (illustrative, sped up so you can watch it) ----------
let levels=[35,72,18,96,50,64],cab=80,sun=100,flow=true,simT=0,st={chg:0,solarW:1500,loadW:0,avail:1};
function simStep(dt){
  simT+=dt;
  let chg=0;for(let i=0;i<docked;i++)if(levels[i]<100)chg++;
  const solarW=1500*sun/100,loadW=150*chg,net=solarW-loadW-20;
  cab=Math.max(0,Math.min(100,cab+net/700*dt));
  let avail=1;if(cab<=0&&net<0)avail=Math.max(0,solarW/(loadW+20));
  for(let i=0;i<docked;i++)if(levels[i]<100)levels[i]=Math.min(100,levels[i]+4*avail*dt);
  st={chg,solarW,loadW,avail};
}
function pulses(D,path,speed,gap,len,col,w,bias,t){
  const tot=[0];
  for(let i=1;i<path.length;i++)tot.push(tot[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1],path[i][2]-path[i-1][2]));
  const L=tot[tot.length-1];
  const at=q=>{q=Math.max(0,Math.min(L,q));let i=1;while(i<tot.length-1&&tot[i]<q)i++;return lerpv(path[i-1],path[i],(q-tot[i-1])/((tot[i]-tot[i-1])||1));};
  for(let q=(t*speed)%gap;q<L;q+=gap){
    D.line(at(q),at(Math.min(L,q+len)),col,w,'flow',false);D.lines[D.lines.length-1].bias=bias;
  }
}
function buildDyn(){
  const D=new Scene(),t=simT;D.labels=[];
  BAYS.forEach((x,i)=>{
    let col='#5d6b66',lit=0,emit=false;
    if(i<docked){
      emit=true;
      if(levels[i]>=100){col='#35c46a';lit=5;}
      else if(st.avail<=0){col='#e0503a';lit=0;}
      else{col=(Math.floor(t*2)%2)?'#f0a81f':'#ffd36a';lit=Math.ceil(levels[i]/20);}
      D.labels.push({at:[x,30,-98],text:Math.round(levels[i])+'%',col});
    }
    D.box([x,18.8,-92],8,2,4,col,'dock',{emit,at:[x,18,-92],layer:1});
    for(let k=0;k<5;k++){
      const on=i<docked&&k<lit;
      D.quad([x-14+k*7,10,-98.15],[1,0,0],[0,1,0],3,1.4,on?col:'#26332f','dock',[x,10,-92],{emit:on,at:[x,10,-98],layer:1});
    }
  });
  if(flow){
    const railPath=[[232,6.8,40],[232,6.8,-92],[232,25,-92],[-190,25,-92]];
    D.line([232,6.8,40],[232,6.8,-92],'#c9a227',1.2,'flow',true);
    for(let i=1;i<railPath.length;i++){D.line(railPath[i-1],railPath[i],'#c9a227',.6,'flow',false);D.lines[D.lines.length-1].bias=18;}
    if(sun>0)for(let k=0;k<6;k++){
      const x=-200+k*80,z=-40+(k%3)*60;
      pulses(D,[[x,360,z+70],[x,roofY(z)+7,z]],70,46,20,'#ffe066',1.7,40,t+k*.37);
    }
    if(st.solarW>0)pulses(D,[[232,roofY(60)-4,60],[232,91,60]],60,34,16,'#ffd34d',2.2,12,t);
    if(st.chg>0&&st.avail>0)pulses(D,railPath,120,46,18,'#ffd34d',2.4,18,t);
    BAYS.forEach((x,i)=>{
      if(i>=docked||levels[i]>=100||st.avail<=0)return;
      const path=[[x,25,-92],[x,14,-84],[x,34,-79.5],[x,34,-45],[x,69,-32],[x,47.5,-7.8]];
      for(let k=1;k<path.length;k++){D.line(path[k-1],path[k],'#c9a227',.5,'flow',false);D.lines[D.lines.length-1].bias=25;}
      pulses(D,path,90,34,14,'#ffd34d',2.2,25,t+i*.21);
    });
  }
  return D;
}

// ---------- rendering ----------
const GOLD=[255,207,64];
function render(time){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const g=ctx.createLinearGradient(0,0,0,H);
  if(night){g.addColorStop(0,'#08141a');g.addColorStop(1,'#1a3532');}else{g.addColorStop(0,'#cfe6ee');g.addColorStop(1,'#eef5ee');}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  const D=sc.R*3.2/zoom,F=Math.min(W,H*1.3)*1.0,T=sc.T;
  const cY=Math.cos(yaw),sY=Math.sin(yaw),cP=Math.cos(pitch),sP=Math.sin(pitch);
  const view=p=>{
    const x=p[0]-T[0],y=p[1]-T[1],z=p[2]-T[2];
    const x1=x*cY+z*sY,z1=-x*sY+z*cY;
    return [x1,y*cP+z1*sP,-y*sP+z1*cP+D];
  };
  const scr=v=>{const k=F/v[2];return [W/2+v[0]*k,H/2-v[1]*k];};

  // ground disc and grid
  const gr=sc.ground,cx0=T[0],cz0=T[2];
  ctx.beginPath();
  for(let i=0;i<64;i++){
    const a=TAU*i/64,s=scr(view([cx0+gr*Math.cos(a),0,cz0+gr*Math.sin(a)]));
    i?ctx.lineTo(s[0],s[1]):ctx.moveTo(s[0],s[1]);
  }
  ctx.closePath();ctx.fillStyle=night?'#1d322e':'#cbd9cf';ctx.fill();
  ctx.strokeStyle=night?'#2b4640':'#b7c8bc';ctx.lineWidth=1;
  const gs=sc.grid;
  for(let k=-Math.floor(gr/gs);k<=Math.floor(gr/gs);k++){
    const d=k*gs,h=Math.sqrt(Math.max(0,gr*gr-d*d));
    let a=scr(view([cx0+d,0,cz0-h])),b=scr(view([cx0+d,0,cz0+h]));
    ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    a=scr(view([cx0-h,0,cz0+d]));b=scr(view([cx0+h,0,cz0+d]));
    ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
  }
  if(cur==='bike'){ // soft shadow under the bike
    ctx.beginPath();
    for(let i=0;i<40;i++){const a=TAU*i/40,s=scr(view([100*Math.cos(a),.1,20*Math.sin(a)]));i?ctx.lineTo(s[0],s[1]):ctx.moveTo(s[0],s[1]);}
    ctx.closePath();ctx.fillStyle='rgba(0,0,0,.16)';ctx.fill();
  }

  // gather visible faces
  const amb=night?.26:.5,items=[],bgItems=[],Lv=norm([-.4,.7,-.6]);
  const DD=cur==='station'?buildDyn():null;
  const allF=DD?S.faces.concat(DD.faces):S.faces,allL=DD?S.lines.concat(DD.lines):S.lines;
  for(const f of allF){
    const vp=f.p.map(view);
    let bad=false;for(const v of vp)if(v[2]<20){bad=true;break;}
    if(bad)continue;
    const n=vp.length;let cx=0,cy=0,cz=0,nx=0,ny=0,nz=0;
    for(let i=0;i<n;i++){
      const a=vp[i],b=vp[(i+1)%n];
      cx+=a[0];cy+=a[1];cz+=a[2];
      nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1]);
    }
    cx/=n;cy/=n;cz/=n;
    const nl=Math.hypot(nx,ny,nz);if(nl<1e-9)continue;
    nx/=nl;ny/=nl;nz/=nl;
    const r=view(f.ref);
    if(nx*(cx-r[0])+ny*(cy-r[1])+nz*(cz-r[2])<0){nx=-nx;ny=-ny;nz=-nz;}
    if(nx*cx+ny*cy+nz*cz>=0)continue; // facing away
    let k=f.at?view(f.at)[2]:cz;k-=.5*f.layer;
    let col=f.c;
    if(f.emit){const e=night?1.15:.95;col=[col[0]*e,col[1]*e,col[2]*e];}
    else{
      const dif=Math.max(0,nx*Lv[0]+ny*Lv[1]+nz*Lv[2]),sh=amb+.68*dif;
      col=[col[0]*sh,col[1]*sh,col[2]*sh];
    }
    const isSel=sel&&f.part===sel;
    if(isSel)col=[col[0]+(GOLD[0]-col[0])*.4,col[1]+(GOLD[1]-col[1])*.4,col[2]+(GOLD[2]-col[2])*.4];
    const it={t:0,k,pts:vp.map(scr),fill:'rgb('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+')',
      stroke:isSel?'#ffcf40':'rgb('+((col[0]*.78)|0)+','+((col[1]*.78)|0)+','+((col[2]*.78)|0)+')',lw:isSel?1.8:.7};
    (f.bg?bgItems:items).push(it);
  }
  const lineItems=[],bgLines=[];
  for(const l of allL){
    const a=view(l.a),b=view(l.b);if(a[2]<20||b[2]<20)continue;
    const zm=(a[2]+b[2])/2,sa=scr(a),sb=scr(b),isSel=sel&&l.part===sel;
    const it={t:1,k:zm-(l.bias||0),a:sa,b:sb,col:isSel?'#ffcf40':'rgb('+l.c.join(',')+')',w:Math.max(.7,l.w*F/zm)};
    (l.bg?bgLines:items).push(it);
  }
  const draw=it=>{
    if(it.t===0){
      ctx.beginPath();ctx.moveTo(it.pts[0][0],it.pts[0][1]);
      for(let i=1;i<it.pts.length;i++)ctx.lineTo(it.pts[i][0],it.pts[i][1]);
      ctx.closePath();ctx.fillStyle=it.fill;ctx.fill();
      ctx.strokeStyle=it.stroke;ctx.lineWidth=it.lw;ctx.lineJoin='round';ctx.stroke();
    }else{
      ctx.beginPath();ctx.moveTo(it.a[0],it.a[1]);ctx.lineTo(it.b[0],it.b[1]);
      ctx.strokeStyle=it.col;ctx.lineWidth=it.w;ctx.stroke();
    }
  };
  bgItems.sort((a,b)=>b.k-a.k).forEach(draw);
  bgLines.forEach(draw);
  items.sort((a,b)=>b.k-a.k).forEach(draw);

  if(DD){
    ctx.font='bold 11px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    for(const lb of DD.labels){
      const v=view(lb.at);if(v[2]<20)continue;
      const s=scr(v),w=ctx.measureText(lb.text).width+12;
      ctx.fillStyle='rgba(16,48,43,.9)';ctx.fillRect(s[0]-w/2,s[1]-9,w,18);
      ctx.fillStyle=lb.col;ctx.fillText(lb.text,s[0],s[1]+.5);
    }
  }
  // numbered dots
  hotPos=[];
  if(dots){
    const pulse=.5+.5*Math.sin(time/220);
    sc.hot.forEach((h,i)=>{
      const v=view(h.at);if(v[2]<20)return;
      const s=scr(v),on=sel===h.id;
      hotPos.push({id:h.id,x:s[0],y:s[1]});
      if(on){ctx.beginPath();ctx.arc(s[0],s[1],14+4*pulse,0,TAU);ctx.strokeStyle='rgba(255,207,64,'+(.9-.5*pulse)+')';ctx.lineWidth=2;ctx.stroke();}
      ctx.beginPath();ctx.arc(s[0],s[1],11,0,TAU);
      ctx.fillStyle=on?'#ffcf40':'#10302b';ctx.fill();
      ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke();
      ctx.fillStyle=on?'#10302b':'#fff';ctx.font='bold 12px system-ui,sans-serif';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),s[0],s[1]+.5);
    });
  }
}

// ---------- side panel ----------
function drawList(){
  $('s_title').textContent=sc.title;
  $('parts').innerHTML=sc.hot.map((h,i)=>'<li><button data-id="'+h.id+'" class="'+(sel===h.id?'on':'')+'"><b>'+(i+1)+'</b>'+h.name+'</button></li>').join('');
  $('parts').querySelectorAll('button').forEach(b=>b.onclick=()=>select(b.dataset.id));
  const h=sc.hot.find(x=>x.id===sel);
  $('detail').innerHTML=h?'<h3>'+h.name+'</h3><p style="margin:0">'+h.text+'</p>'
    :'<h3>Tap a part</h3><p style="margin:0">Choose a numbered dot or a part name to see what it does. The part lights up in gold.</p>';
}
function select(id){sel=(sel===id)?null:id;drawList();}

// ---------- scene switching and controls ----------
function setScene(name){
  cur=name;sc=SCENES[name];sel=null;zoom=1;yaw=sc.view.yaw;pitch=sc.view.pitch;
  $('tab_bike').classList.toggle('on',name==='bike');
  $('tab_station').classList.toggle('on',name==='station');
  $('l_spin').style.display=name==='bike'?'':'none';
  for(const id of ['l_dock','l_sun','l_flow','b_restart','live','how'])$(id).style.display=name==='station'?'':'none';
  $('how').innerHTML=name==='station'?'<li><b>Sun to roof:</b> yellow rays hit the solar panels.</li><li><b>Roof to cabinet:</b> a cable carries the electricity down to the battery cabinet.</li><li><b>Cabinet to dock:</b> power runs under the paving to the docking rail.</li><li><b>Dock to bike:</b> the connector in the wheel clamp charges the bike battery. Amber is charging, green is ready to ride.</li><li><b>Night or storm:</b> slide sunlight to 0% and the cabinet keeps the bikes charging until it runs low.</li>':'';
  dirty=true;drawList();
}
$('tab_bike').onclick=()=>setScene('bike');
$('tab_station').onclick=()=>setScene('station');
const setView=(y,p)=>{yaw=y;pitch=p;auto=false;$('c_auto').checked=false;};
$('b_side').onclick=()=>setView(0,.06);
$('b_front').onclick=()=>setView(cur==='bike'?Math.PI/2:0,.06);
$('b_top').onclick=()=>setView(yaw,1.45);
$('b_reset').onclick=()=>{yaw=sc.view.yaw;pitch=sc.view.pitch;zoom=1;};
$('c_auto').onchange=e=>auto=e.target.checked;
$('c_spin').onchange=e=>{spin=e.target.checked;};
$('c_dots').onchange=e=>dots=e.target.checked;
$('c_night').onchange=e=>{night=e.target.checked;document.body.style.background=night?'#0f1f1d':'';setSun(night?0:100);};
function setSun(v){sun=v;$('r_sun').value=v;$('v_sun').textContent=v+'%';}
$('r_sun').oninput=e=>setSun(+e.target.value);
$('c_flow').onchange=e=>flow=e.target.checked;
$('b_restart').onclick=()=>{levels=[35,72,18,96,50,64];cab=80;};
$('r_dock').oninput=e=>{docked=+e.target.value;$('v_dock').textContent=docked;dirty=true;};

// ---------- mouse, touch and wheel ----------
const ptrs=new Map();let moved=0,pinch0=0,zoom0=1;
cv.addEventListener('pointerdown',e=>{
  cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;
  if(ptrs.size===2){const a=[...ptrs.values()];pinch0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);zoom0=zoom;}
});
cv.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===1){
    moved+=Math.abs(dx)+Math.abs(dy);
    if(moved>4){yaw+=dx*.008;pitch=Math.max(.02,Math.min(1.5,pitch+dy*.006));auto=false;$('c_auto').checked=false;}
  }else if(ptrs.size===2){
    const a=[...ptrs.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
    if(pinch0>0)zoom=Math.max(.8,Math.min(2.2,zoom0*d/pinch0));
    moved=99;
  }
});
const up=e=>{
  const wasTap=ptrs.size===1&&moved<=4;
  ptrs.delete(e.pointerId);
  if(wasTap){
    const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    let best=null,bd=18;
    for(const h of hotPos){const d=Math.hypot(h.x-x,h.y-y);if(d<bd){bd=d;best=h.id;}}
    if(best)select(best);
  }
};
cv.addEventListener('pointerup',up);
cv.addEventListener('pointercancel',e=>ptrs.delete(e.pointerId));
cv.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.8,Math.min(2.2,zoom*Math.exp(-e.deltaY*.0012)));},{passive:false});
window.addEventListener('resize',resize);

// ---------- main loop ----------
let last=performance.now(),lastLive=0;
function loop(t){
  const dt=Math.min(.05,(t-last)/1000);last=t;
  if(auto)yaw+=dt*.35;
  if(cur==='bike'&&spin){phase-=dt*2.2;dirty=true;}
  if(cur==='station'){
    simStep(dt);
    if(t-lastLive>150){
      lastLive=t;
      const src=st.solarW>=st.loadW+20?'Solar roof':st.solarW>0?'Roof + battery':cab>0?'Battery cabinet':'No power';
      $('live').innerHTML='<div><span>Power source</span><b>'+src+'</b></div><div><span>Solar output (illustrative)</span><b>'+Math.round(st.solarW)+' W</b></div><div><span>Battery cabinet</span><b>'+Math.round(cab)+'%</b></div><div><span>Bikes charging</span><b>'+st.chg+' of '+docked+'</b></div>';
    }
  }
  if(dirty){rebuild();dirty=false;}
  render(t);
  requestAnimationFrame(loop);
}
resize();setScene('bike');
window.__gt3d={setScene,select,state:()=>({cur,sel,yaw,pitch,zoom})};
requestAnimationFrame(loop);
})();
</script>
</body>
</html>
