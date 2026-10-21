const $ = id => document.getElementById(id);
const SEGS = ["Main road", "Spine 2 road", "North road"];
const SCEN = {
  calm:{ water:22, rain:0, wx:"Clear", temp:31, gates:[0,0,0], clock:"7:30", road:"OK", maint:"None today",
    history:[18,19,20,21,22,22,22],
    das:["Normal","Normal","Normal"], dasNote:"No unusual vibration or soil-moisture changes under the roads.",
    forecast:[["8am","31°","Clear"],["10am","33°","Clear"],["12pm","34°","Sunny"],["2pm","33°","Cloudy"],["4pm","30°","Cloudy"]],
    alerts:[{id:"a0",lvl:"ok",t:"All clear",d:"Water levels normal and roads are healthy. Enjoy the shaded Linear Spine today.",time:"7:30"}] },
  erosion:{ water:24, rain:0, wx:"Clear", temp:32, gates:[0,0,0], clock:"9:20", road:"Check", maint:"Spine 2 repair tonight, 2:00 AM",
    history:[18,19,20,22,23,24,24],
    das:["Normal","Anomaly","Normal"], dasNote:"Abnormal vibration and rising soil moisture detected under Spine 2 road. Repair is scheduled off-peak.",
    forecast:[["10am","33°","Clear"],["12pm","35°","Sunny"],["2pm","34°","Cloudy"],["4pm","31°","Cloudy"],["6pm","29°","Clear"]],
    alerts:[{id:"a1",lvl:"warn",t:"Pothole risk detected on Spine 2 road",d:"DAS cables under the road picked up abnormal vibration, and bioswale sensors show rising soil moisture. A pothole is likely within days. A maintenance crew is booked for 2:00 AM so the road stays open at peak hours.",time:"9:20"}] },
  storm:{ water:78, rain:110, wx:"Storm", temp:26, gates:[1,1,0], clock:"3:10", road:"Watch", maint:"Crew on standby",
    history:[22,30,41,55,64,72,78],
    das:["Normal","Watch","Normal"], dasNote:"Water is shifting under the Spine 2 road base. Monitoring closely for erosion.",
    forecast:[["3pm","26°","Storm"],["4pm","25°","Storm"],["5pm","25°","Heavy rain"],["6pm","26°","Rain"],["8pm","27°","Showers"]],
    alerts:[
      {id:"a2",lvl:"crit",t:"Flood risk: move to higher ground",d:"Water at the Spine 2 bioswale is above the safe threshold and gates A and B have closed. Move vehicles and valuables to higher ground now.",time:"3:10",evac:true},
      {id:"a3",lvl:"warn",t:"Heavy storms for the next few hours",d:"Rain is expected to continue. Prepare for possible flooding and avoid low-lying roads.",time:"2:40"}] }
};
let st = {scen:"calm", screen:"login", alert:null, loggedIn:false, unit:"B-12-03"};

// ---- E-bike stations and resident QR codes ----
const STATIONS = [
  {id:"main-gate", name:"Main Gate", free:5, total:8},
  {id:"spine-1", name:"Linear Spine 1", free:3, total:6},
  {id:"spine-2", name:"Linear Spine 2", free:4, total:6},
  {id:"community-hall", name:"Community Hall", free:2, total:8},
  {id:"north-gate", name:"North Gate", free:6, total:8}
];
const CODE_SECONDS = 60;   // a resident's QR code changes every minute so screenshots stop working
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function hash(s){ let h = 2166136261; for(const c of s){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8,"0"); }
const codeWindow = () => Math.floor(Date.now() / 1000 / CODE_SECONDS);
function residentCode(unit, win){ return "GT-RES:" + unit + ":" + hash("golden-triangle|" + unit + "|" + win); }
// What a station does when it scans a code: recompute the expected code for this unit and compare.
function stationCheck(payload){
  const parts = payload.split(":");
  if(parts[0] !== "GT-RES" || parts.length < 3) return false;
  const unit = parts.slice(1, -1).join(":");
  const w = codeWindow();
  return payload === residentCode(unit, w) || payload === residentCode(unit, w - 1);
}
let staleCode = null;
const D = () => SCEN[st.scen];

function go(s){ st.screen = s; render(); }
function openAlert(id){ st.alert = id; st.screen = "detail"; render(); }
function openPush(){ const a = D().alerts[0]; $("push").classList.remove("show"); if(a) openAlert(a.id); }

function render(){
  const d = D(), el = $("screen");
  $("clock").textContent = d.clock;
  $("nav").hidden = !st.loggedIn;
  [...$("nav").children].forEach(b => b.classList.toggle("on", b.dataset.g === st.screen));
  el.scrollTop = 0;
  el.innerHTML = VIEWS[st.screen]();
  shownWindow = null; drawQR();
}

const topAlert = () => D().alerts[0];
const barColor = v => v>=70 ? "var(--alert)" : v>=50 ? "var(--gold)" : "var(--water)";

const VIEWS = {
  login: () => `
    <div class="logo"><svg viewBox="0 0 40 40"><polygon points="20,4 37,35 3,35" fill="#e0a526"/><polygon points="20,15 29,31 11,31" fill="#10302b"/></svg><div><b style="font-size:20px">Golden Triangle</b><br><small style="color:var(--muted)">Resident app</small></div></div>
    <h2 style="margin-top:28px">Welcome home</h2>
    <p class="sub">Log in to see live water, road and weather conditions for your township.</p>
    <label>Unit number</label><input id="unit" value="B-12-03" maxlength="24" aria-label="Unit number">
    <label>Password</label><input type="password" value="demo1234" aria-label="Password">
    <button class="btn" onclick="login()">Log in</button>
    <p class="hint">Demo account. No real data is used.</p>`,

  home: () => { const d=D(), a=topAlert(); return `
    <h2>Good ${d.clock.startsWith("3")?"afternoon":"morning"}, resident</h2>
    <p class="sub">Unit B-12-03 · live from township sensors</p>
    <div class="banner ${a.lvl}" onclick="openAlert('${a.id}')"><strong>${a.t}</strong>${a.lvl==="ok"?"Everything is running normally.":"Tap for details and what to do."}</div>
    <div class="grid3">
      <button class="tile" onclick="go('water')">Water level<b>${d.water}%</b></button>
      <button class="tile" onclick="go('roads')">Road health<b>${d.road}</b></button>
      <button class="tile" onclick="go('weather')">Weather<b>${d.temp}°</b>${d.wx}</button>
    </div>
    <div class="card"><b>Today on your street</b>
      <div class="row"><span>Linear Spine walkway</span><span class="pill ${d.water>=70?"bad":""}">${d.water>=70?"Wet, use with care":"Open, shaded"}</span></div>
      <div class="row" onclick="go('bike')" style="cursor:pointer"><span>E-bike stations</span><span class="pill">20 free</span></div>
      <div class="row"><span>Road maintenance</span><span>${d.maint}</span></div></div>
    <button class="btn alt" onclick="go('alerts')">See all alerts</button>`; },

  water: () => { const d=D(); return `
    <h2>Water level</h2><p class="sub">Linear Green Spine bioswale sensors</p>
    <div class="card"><div class="big" style="color:${barColor(d.water)}">${d.water}%</div>
      <div class="gauge"><i style="width:${d.water}%;background:${barColor(d.water)}"></i><u></u></div>
      <small style="color:var(--muted)">Dashed line = alert threshold (70%)</small></div>
    <div class="card"><b>Flood gates</b>
      ${["A","B","C"].map((g,i)=>`<div class="row"><span>Gate ${g}</span><span class="pill ${d.gates[i]?"bad":""}">${d.gates[i]?"Closed":"Open"}</span></div>`).join("")}</div>
    <div class="card"><b>Last 6 hours</b><svg viewBox="0 0 200 60" width="100%"><polyline fill="none" stroke="#2b7fbf" stroke-width="3" points="${d.history.map((v,i)=>`${i*33},${60-v*0.6}`).join(" ")}"/></svg></div>`; },

  bike: () => `
    <h2>E-bike</h2><p class="sub">Free for residents · unit ${esc(st.unit)}</p>
    <div class="qrbox">
      <div id="qr"></div>
      <b>Your personal unlock code</b>
      <div class="refresh"><i id="qrbar"></i></div>
      <div class="qrmeta">New code in <span id="qrsec">60</span>s · made only for unit ${esc(st.unit)}</div>
    </div>
    <p class="hint" style="margin:0 0 12px">Hold this code up to the reader on any charging station. It is generated from your unit and changes every minute, so a screenshot or a shared code stops working.</p>
    <div class="card"><b>Try it at a station</b>
      <select id="stn" aria-label="Charging station">${STATIONS.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select>
      <button class="btn" onclick="scanStation(false)">Scan my code</button>
      <button class="btn ghost" onclick="scanStation(true)">Scan an old screenshot</button>
      <div class="res" id="scanres"></div></div>
    <div class="card"><b>Charging stations</b>
      ${STATIONS.map(s=>`<div class="row"><span>${s.name}</span><span class="pill ${s.free<3?"bad":""}">${s.free} of ${s.total} free</span></div>`).join("")}
      <p class="hint">Charging stations run on solar panels.</p></div>
    <div class="card"><b>Visitors</b><p style="margin:6px 0 0;font-size:14px">Non-residents can't use a code. They pay RM 3 per 30 minutes on the guest rental page, before the bike unlocks.</p>
      <a class="btn alt" href="ebike-rental.html" target="_blank" rel="noopener">Open guest rental page</a></div>`,

  roads: () => { const d=D(); return `
    <h2>Road health</h2><p class="sub">DAS fibre-optic cables under the road</p>
    <div class="card"><div class="big" style="color:${d.road==="OK"?"var(--leaf)":"var(--alert)"}">${d.road}</div>
      <p style="margin:8px 0 0;font-size:14px">${d.dasNote}</p></div>
    <div class="card"><b>Road segments</b>
      ${SEGS.map((s,i)=>`<div class="row"><span>${s}</span><span class="pill ${d.das[i]==="Normal"?"":"bad"}">${d.das[i]}</span></div>`).join("")}</div>
    <div class="card"><b>Maintenance</b><p style="margin:6px 0 0;font-size:14px">${d.maint}. Repairs are booked off-peak so roads stay open when residents need them.</p></div>
    <p class="hint">DAS cables pick up tiny changes in road vibration. With bioswale moisture data, they predict potholes before they form.</p>`; },

  weather: () => { const d=D(); return `
    <h2>Weather</h2><p class="sub">Next few hours</p>
    <div class="card"><div class="big">${d.temp}°</div><b>${d.wx}</b><div class="hint">Rainfall now: ${d.rain} mm/h</div></div>
    <div class="hours">${d.forecast.map(f=>`<div class="hr">${f[0]}<b>${f[1]}</b>${f[2]}</div>`).join("")}</div>
    <p class="hint">${d.rain>=60?"Heavy storms are expected. The app will keep sending updates as conditions change.":"No heavy rain expected."}</p>`; },

  energy: () => `
    <h2>Power</h2><p class="sub">Where the township's power comes from</p>
    <div class="card"><b>Water-level sensors</b><p style="margin:4px 0 0;font-size:13px;color:var(--muted)">Run on a small solar panel with a battery for storms and nights.</p>
      <div class="big" style="margin-top:8px">80%</div><small style="color:var(--muted)">sensor battery charge</small>
      <div class="gauge"><i style="width:80%;background:var(--leaf)"></i></div>
      <div class="row" style="margin-top:8px"><span>Water-level sensors</span><span class="pill">Online</span></div></div>
    <div class="card"><b>E-bike charging stations</b><p style="margin:4px 0 0;font-size:13px;color:var(--muted)">Each station runs on its own solar panels.</p>
      ${STATIONS.map(s=>`<div class="row"><span>${s.name}</span><span class="pill">Online</span></div>`).join("")}</div>
    <p class="hint">Demo values for illustration.</p>`,

  alerts: () => `
    <h2>Alerts</h2><p class="sub">Warnings sent to your phone</p>
    ${D().alerts.map(a=>`<div class="banner ${a.lvl}" onclick="openAlert('${a.id}')"><strong>${a.t}</strong>${a.time} · tap to read</div>`).join("")}
    <div class="card"><b>Earlier today</b><div class="row"><span>DAS cable: routine road check</span><span class="pill">Resolved</span></div></div>`,

  detail: () => {
    const a = D().alerts.find(x=>x.id===st.alert) || topAlert();
    return `<button class="btn alt" style="margin:0 0 10px;width:auto;padding:6px 12px" onclick="go('alerts')">← Back</button>
    <div class="banner ${a.lvl}" style="cursor:default"><strong>${a.t}</strong>${a.time}</div>
    <p style="font-size:15px">${a.d}</p>
    ${a.evac?`<div class="card"><b>What to do now</b>
      <div class="step"><b>1</b>Move your car to the higher-ground car park.</div>
      <div class="step"><b>2</b>Avoid Spine 2 and low-lying roads. Gates A and B are closed.</div>
      <div class="step"><b>3</b>Stay indoors above ground level and keep this app open for updates.</div></div>
    <button class="btn" onclick="ack(this)">I'm safe, mark as read</button>`:`<button class="btn" onclick="ack(this)">Got it</button>`}`; }
};

function login(){
  const u = $("unit") ? $("unit").value.trim() : "";
  st.unit = (u || "B-12-03").slice(0, 24); staleCode = null;
  st.loggedIn = true; go("home");
}

// ---- QR display and station scan demo ----
let shownWindow = null;
function drawQR(){
  const box = $("qr"); if(!box || st.screen !== "bike") return;
  const w = codeWindow();
  if(w !== shownWindow || !box.firstChild){ shownWindow = w; box.innerHTML = GTQR.svg(residentCode(st.unit, w), 190); }
  const left = CODE_SECONDS - (Math.floor(Date.now()/1000) % CODE_SECONDS);
  $("qrsec").textContent = left; $("qrbar").style.width = (left / CODE_SECONDS * 100) + "%";
}
setInterval(drawQR, 500);
function scanStation(useOld){
  const stn = STATIONS.find(s => s.id === $("stn").value), res = $("scanres");
  if(useOld && !staleCode) staleCode = residentCode(st.unit, codeWindow() - 5);   // a code from 5 minutes ago
  const payload = useOld ? staleCode : residentCode(st.unit, codeWindow());
  const ok = stationCheck(payload), n = String(100 + Math.floor(Math.random()*400));
  res.className = "res show " + (ok ? "good" : "bad");
  res.innerHTML = ok
    ? "<b>✓ Unlocked bike GT-" + n + "</b><br>" + stn.name + " station verified the code for unit " + esc(st.unit) + ". Ride is free for residents."
    : "<b>✗ Code expired</b><br>" + stn.name + " station rejected it. Codes only work for a minute. Open the app for a fresh one.";
}
function ack(b){ b.textContent = "Thanks, marked as read ✓"; b.disabled = true; }

function notify(){
  const a = topAlert();
  if(!st.loggedIn || a.lvl==="ok") return;
  const p = $("push");
  p.innerHTML = `<small>GOLDEN TRIANGLE · now</small><b>${a.t}</b><br>${a.d.split(".")[0]}.`;
  p.classList.add("show");
  setTimeout(()=>p.classList.remove("show"), 6000);
}

$("demo").addEventListener("click", e => {
  const s = e.target.dataset.s; if(!s) return;
  st.scen = s;
  [...$("demo").children].forEach(b => b.classList.toggle("on", b.dataset.s===s));
  if(st.screen==="detail") st.screen = "home";
  render(); notify();
});
$("nav").addEventListener("click", e => { const b = e.target.closest("button"); if(b) go(b.dataset.g); });
render();
