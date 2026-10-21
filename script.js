// ---------- state ----------
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

// Illustrative assumptions (not measured values)
const PANEL_W = 5;          // solar panel for the water-level sensors, at full sun
const SENSOR_W = 0.5;       // water-level sensors
const BATT_WH = 5;          // sensor battery capacity
const STATION_LOAD = 0.25;  // % of a station's battery used per minute
const STATION_SOLAR = 1.2;  // % of a station's battery gained per minute in full sun

const STATIONS = [
  {id:"main-gate", name:"Main Gate", free:5, total:8},
  {id:"spine-1", name:"Linear Spine 1", free:3, total:6},
  {id:"spine-2", name:"Linear Spine 2", free:4, total:6},
  {id:"community-hall", name:"Community Hall", free:2, total:8},
  {id:"north-gate", name:"North Gate", free:6, total:8}
];

let S;
function freshState(){
  return {cl:0, gl:0, batt:4, flags:{}, minute:0, gates:false, erosionUntil:0,
          st: STATIONS.map(s => ({free:s.free, power:80}))};
}
S = freshState();

// ---------- sliders ----------
const sliders = {rain:"", clog:"%", thr:"%", sun:"%"};
const labelMap = {rain:"v_rain", clog:"v_clog", thr:"v_thr", sun:"v_sun"};
function val(id){ return Number($(id).value); }
function refreshLabels(){
  for(const id in sliders){ $(labelMap[id]).textContent = val(id) + sliders[id]; }
  $("thr_line").style.top = (100 - val("thr")) + "%";
}
for(const id in sliders){ $(id).addEventListener("input", refreshLabels); }

// ---------- scenarios ----------
function setVals(o){ for(const k in o){ $(k).value = o[k]; } refreshLabels(); }
function scenario(name){
  if(name==="calm")  setVals({rain:0,   clog:30, sun:100});
  if(name==="storm") setVals({rain:110, clog:45, sun:8});
  if(name==="night") setVals({rain:0,   clog:30, sun:0});
}
function resetSim(){
  S = freshState(); $("feed").innerHTML = ""; $("sign").textContent = "ALL CLEAR"; scenario("calm"); drawStations(); log("App reset. Sensors online.", "");
}

// ---------- app feed ----------
function log(text, level){
  const m = document.createElement("div");
  m.className = "msg " + level;
  const mins = S.minute, hh = String(7 + Math.floor(mins/60)%12).padStart(2,"0"), mm = String(mins%60).padStart(2,"0");
  m.innerHTML = "<time>" + hh + ":" + mm + "</time>" + text;
  $("feed").prepend(m);
}
function trigger(key, cond, clearCond, text, level, sign){
  if(cond && !S.flags[key]){ S.flags[key]=true; log(text, level); if(sign) $("sign").textContent = sign; }
  if(clearCond) S.flags[key]=false;
}

// ---------- potholes (DAS cables, optional) ----------
function pothole(){
  S.erosionUntil = S.minute + 20;
  log("DAS cable detected abnormal vibration and rising soil moisture beside Spine 2. Pothole likely within days. Maintenance crew booked for 2:00 AM so the road stays open at peak hours.", "warn");
  $("sign").textContent = "ROAD WORKS TONIGHT 2AM - NO PEAK CLOSURE";
}

// ---------- e-bike stations ----------
function drawStations(){
  $("stations").innerHTML = STATIONS.map((s, i) => {
    const st = S.st[i], p = Math.round(st.power), sun = val("sun");
    const mode = p <= 0 ? "Out of power" : sun >= 40 ? "Charging from the sun" : sun > 0 ? "Charging slowly (low sunlight)" : "Running on battery";
    return `<div class="station">
      <b>${s.name}</b>
      <div class="free">${st.free} of ${s.total} bikes free</div>
      <div class="bar small"><i style="width:${p}%;background:${p < 25 ? "var(--alert)" : "var(--gold)"}"></i></div>
      <small>${p}% battery · ${mode}</small>
      <div class="btns">
        <button ${st.free <= 0 || p <= 0 ? "disabled" : ""} onclick="takeBike(${i})">Take one</button>
        <button ${st.free >= s.total ? "disabled" : ""} onclick="returnBike(${i})">Return one</button>
      </div></div>`;
  }).join("");
}
function takeBike(i){ if(S.st[i].free > 0){ S.st[i].free--; log("Bike unlocked at " + STATIONS[i].name + ".", ""); drawStations(); } }
function returnBike(i){ if(S.st[i].free < STATIONS[i].total){ S.st[i].free++; log("Bike returned to " + STATIONS[i].name + ".", ""); drawStations(); } }

// ---------- simulation tick (1 tick = 1 simulated minute) ----------
function tick(){
  S.minute++;
  const rain = val("rain"), clog = val("clog")/100, thr = val("thr"), sun = val("sun")/100;

  // Solar power for the water-level sensors
  const solarW = PANEL_W * sun;
  S.batt = clamp(S.batt + (solarW - SENSOR_W)/60, 0, BATT_WH);
  const sensorsOn = S.batt > 0;
  $("solarw").textContent = solarW.toFixed(1);
  $("batt").textContent = Math.round(S.batt / BATT_WH * 100) + "%";
  $("battbar").style.width = (S.batt / BATT_WH * 100) + "%";
  $("sens").textContent = sensorsOn ? "ON" : "OFF";
  $("sens").className = sensorsOn ? "ok" : "bad";
  $("backup").textContent = solarW >= SENSOR_W
    ? "The panel makes more than the sensors use, so the battery stays charged."
    : sensorsOn ? "Running on the battery: about " + (S.batt / (SENSOR_W - solarW)).toFixed(1) + " hours left at this sunlight level."
    : "The battery is empty and there is not enough sunlight.";

  // E-bike stations: each has its own solar panels and battery
  S.st.forEach(st => { st.power = clamp(st.power + STATION_SOLAR * sun - STATION_LOAD, 0, 100); });
  if(S.minute % 4 === 0) drawStations();

  // Pillar 1: water
  const inflow = rain*0.02;
  S.cl = clamp(S.cl + inflow - 0.9*(1-clog), 0, 100);
  S.gates = sensorsOn && S.gl >= thr;
  const inflowG = S.gates ? inflow*0.7 : inflow;
  const outG = 0.9 + 0.9*(1-clog/2);            // pavers + bioswale infiltration + drain
  S.gl = clamp(S.gl + inflowG - outG, 0, 100);
  $("w_c").style.height = S.cl + "%";
  $("w_g").style.height = S.gl + "%";
  $("s_c").textContent = S.cl>=100 ? "FLOODED" : Math.round(S.cl) + "% full";
  $("s_c").className = "status " + (S.cl>=100 ? "bad" : "ok");
  $("s_g").textContent = S.gl>=100 ? "FLOODED" : Math.round(S.gl) + "% full";
  $("s_g").className = "status " + (S.gl>=100 ? "bad" : "ok");

  // Pillar 2: gates, app, alerts
  ["g1","g2","g3"].forEach((g,i)=>{
    const closed = S.gates && (i < (S.gl >= thr+15 ? 3 : 2));
    $(g).classList.toggle("closed", closed);
    $(g).textContent = "Gate " + "ABC"[i] + ": " + (closed ? "closed" : "open");
  });
  const wx = rain>=60 ? "Storm" : rain>0 ? "Rain" : "Clear";
  $("t_water").textContent = sensorsOn ? Math.round(S.gl)+"%" : "--";
  $("t_wx").textContent = wx;
  const erosion = S.minute < S.erosionUntil || (sensorsOn && S.gl >= thr + 10);
  $("t_road").textContent = erosion ? "Check" : "OK";
  $("das").textContent = erosion ? "DAS road monitoring: ANOMALY near Spine 2 (vibration + soil moisture)" : "DAS road monitoring: normal";

  if(!sensorsOn){
    trigger("off", true, false, "Water-level sensors offline: the battery is empty and there is not enough sunlight.", "crit", "SENSORS OFFLINE");
    return;
  } else { S.flags.off = false; }

  trigger("storm", rain>=60, rain<30, "Heavy rain expected to continue. Prepare for possible floods.", "warn", "HEAVY RAIN - STAY ALERT");
  trigger("water", S.gl>=thr, S.gl<thr-15, "Water level above threshold. Gates closing. Move vehicles to higher ground.", "crit", "FLOOD RISK - MOVE TO HIGHER GROUND");
  trigger("road", S.gl>=thr+10, S.gl<thr-5, "DAS cables and bioswale sensors detect water shifting under the road base. Pothole risk: crew alerted for off-peak repair.", "warn", null);
  if(!S.flags.storm && !S.flags.water && S.minute >= S.erosionUntil && S.minute%10===0) $("sign").textContent = "ALL CLEAR";
}

refreshLabels();
drawStations();
log("Sensors online. Choose a scenario above.", "");
setInterval(tick, 500);
