The Golden Triangle: Township Simulation

A browser-based prototype for the Sime Darby township challenge. It simulates a township that tackles traffic congestion and flooding from clogged drains with three connected pillars.

The problem
- Traffic congestion: roads bottleneck as wide lanes merge into narrow ones, and residents drive for short trips because walking feels far, hot and tiring.
- Flooding: monsoon rain and waste clog concrete drains, so water overflows into roads and homes.

The solution: three pillars
1. Linear Green Spines
- Shaded, pedestrian-only corridors with permeable interlocking concrete pavers and bioswales. The road acts as a sponge that absorbs floodwater instead of relying only on drains, and the trees cool the walkway so short walks are more comfortable.

2. Dynamic IoT Road Networks
- Water-level sensors linked to the bioswales trigger signboards, automated flood gates and early alerts in the township app. They run on a small solar panel with a battery.
- Distributed Acoustic Sensing (DAS) cables are optional but efficient. They detect vibration changes under the road to predict potholes, so crews can repair them off-peak without closing the whole road at peak hours.
- Keeping sensors cool: the split-brain design keeps the sensing probe outside and buries the microprocessor underground, and the Venturi chimney effect uses a slatted hollow chimney so a breeze pulls hot air out.
- Township app: live water level and weather, with automatic alerts when a threshold is crossed (for example, an instruction to move to higher ground).

3. E-bike charging stations
- Short trips by e-bike instead of by car. Charging stations sit at checkpoints in each part of the township (Main Gate, Linear Spine 1 and 2, Community Hall, North Gate). Their main power source is solar panels. Bikes only unlock in two ways:

i. Residents (free):
- Every resident has a personal QR code inside the township app, made from their unit number.
- The code changes every 60 seconds, so a screenshot or a shared code stops working.
- The resident holds the code up to the reader on a station, the station checks it, and the bike unlocks.

ii. Visitors (RM 3 per 30 minutes, paid first):
- Scan the QR code on the station with a phone, which opens the guest rental page (ebike-rental.html).
- Choose the starting station and the final destination station.
- Choose how many 30-minute blocks to buy, and pay by card or e-wallet before the bike unlocks.
- At 10, 5 and 1 minute left, the bike beeps and says, for example, "You have 5 minutes left, please find the nearest charging station."
- When time is up, the rider is asked to return the bike to the nearest station. They can also pay for 30 more minutes.
- If it isn't docked within 5 minutes, the bike sounds a loud alarm to attract guards, and the guard post is alerted.

What the simulation shows
- Linear Green Spines	Raise the rainfall and compare the conventional road with the Golden Triangle road
- Solar power	Press Night or Monsoon storm and watch the sensor battery take over from the panel
- IoT Networks	Watch alerts, gates and the DAS road status react, then press the road erosion button
- E-bike stations	Take and return bikes, and watch each station's solar battery

Use the scenario buttons (Calm morning, Monsoon storm, Night) for a quick demo.

Resident app demo:
Open app.html to see what residents experience. Log in, then switch between Calm morning, Road erosion and Monsoon storm to watch the app update and send push notifications. The Bike tab shows the resident's personal QR code and lets you try scanning it at a station. The Power tab shows the solar power behind the sensors and the charging stations.

How to run it:
No installation needed. Download the folder and open index.html in any browser, or use the live demo link above.


Files
index.html, script.js: the township simulation, app.js, qrcode.js: the resident app demo (qrcode.js makes the QR codes and needs no internet), app-standalone.html: the app demo in a single file, ebike-rental.html: guest e-bike rental page (self-contained)
