import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:        process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:    "japan2026-4bc58.firebaseapp.com",
  databaseURL:   process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId:     process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "japan2026-4bc58.firebasestorage.app",
  messagingSenderId: "47495279395",
  appId:         process.env.REACT_APP_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

function fbSet(key, val) {
  set(ref(db, `japan2026/${key}`), val).catch(console.error);
}
function fbSetItem(dayKey, itemId, item) {
  set(ref(db, `japan2026/jp-custom/${dayKey}/${itemId}`), item).catch(console.error);
}
function fbRemoveItem(dayKey, itemId) {
  remove(ref(db, `japan2026/jp-custom/${dayKey}/${itemId}`)).catch(console.error);
}
function fbSetExpense(catId, expId, exp) {
  set(ref(db, `japan2026/jp-expenses/${catId}/${expId}`), exp).catch(console.error);
}
function fbRemoveExpense(catId, expId) {
  remove(ref(db, `japan2026/jp-expenses/${catId}/${expId}`)).catch(console.error);
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  primary:    "#8f0020",
  primary2:   "#bc002d",
  surface:    "#f9f9f9",
  surfaceLow: "#f3f3f3",
  surfaceHigh:"#e8e8e8",
  surfaceLowest: "#ffffff",
  onSurface:  "#1a1c1c",
  onSurfaceV: "#5c403f",
  outline:    "#906f6f",
  outlineV:   "#e4bdbc",
  charcoal:   "#2d2d2d",
};

const serif = "'Noto Serif', serif";
const sans  = "'Plus Jakarta Sans', sans-serif";

// ─── TYPE COLOURS (light editorial palette) ────────────────────────────────────
const typeConfig = {
  sight:  { dot:"#3b82f6", label:"Sightseeing",    labelColor:"#1d4ed8" },
  food:   { dot:"#f59e0b", label:"Food & Markets",  labelColor:"#92400e" },
  coffee: { dot:"#a16207", label:"Coffee",           labelColor:"#a16207" },
  travel: { dot:"#10b981", label:"Transport",        labelColor:"#047857" },
  hotel:  { dot:"#6366f1", label:"Hotel",            labelColor:"#4338ca" },
  book:   { dot:"#8f0020", label:"Needs Booking",   labelColor:"#8f0020" },
};

const urgencyConfig = {
  critical: { color:"#8f0020", label:"CRITICAL", bg:"rgba(143,0,32,0.07)" },
  high:     { color:"#b45309", label:"HIGH",     bg:"rgba(180,83,9,0.07)" },
  medium:   { color:"#6366f1", label:"MEDIUM",   bg:"rgba(99,102,241,0.07)" },
  low:      { color:"#047857", label:"LOW",       bg:"rgba(4,120,87,0.07)" },
};

// ─── DEPARTURE & HELPERS ──────────────────────────────────────────────────────
const DEPARTURE = new Date("2026-04-20");

function getCountdown() {
  const today = new Date(); today.setHours(0,0,0,0);
  const dep = new Date(DEPARTURE); dep.setHours(0,0,0,0);
  return Math.round((dep - today) / 86400000);
}
function getTodayIso() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}

// ─── BUDGET DATA ──────────────────────────────────────────────────────────────
const BUDGET_CATEGORIES = [
  { id:"flights",     label:"Flights",          emoji:"✈️",  total:1118, paid:true,  note:"Budapest → Kansai → Narita → Budapest via Shanghai" },
  { id:"hotels",      label:"Accommodation",    emoji:"🏨", total:1885, paid:false, note:"Osaka · Kyoto · Kanazawa · Takayama · Tokyo — all booked" },
  { id:"transport",   label:"Local Transport",  emoji:"🚅", total:500,  paid:false, note:"Trains, buses, subway, Haruka, Romancecar + Free Pass, highway buses" },
  { id:"attractions", label:"Attractions",      emoji:"🎟", total:696,  paid:false, note:"USJ, teamLab ×3, Shibuya Sky, museums, Hakone, Kawaguchiko" },
  { id:"food",        label:"Food & Drinks",    emoji:"🍜", total:1600, paid:false, note:"Restaurants, markets, coffee — ~€80/day for two" },
  { id:"souvenirs",   label:"Souvenirs & Other",emoji:"🎁", total:200,  paid:false, note:"Shopping, gifts, incidentals" },
  { id:"esim",        label:"eSIM",             emoji:"📶", total:44,   paid:false, note:"~€44 for 20-day data plan, buy before departure" },
  { id:"parking",     label:"Parking Budapest", emoji:"🅿️", total:60,   paid:false, note:"Airport parking for the duration of the trip" },
];

// ─── PRE-TRIP TASKS ───────────────────────────────────────────────────────────
const PRE_TRIP_TASKS = [
  { id:"pt-1",  urgency:"critical", city:"OSAKA",    text:"Book USJ tickets (Studio Pass) via Klook or usj.co.jp — no Express Pass needed, Wizarding World is walkable", url:"https://www.usj.co.jp/web/en/us" },
  { id:"pt-19", urgency:"critical", city:"OSAKA",    text:"Book teamLab Botanical Garden Osaka — evening slot Apr 21 at Nagai Botanical Garden", url:"https://www.teamlab.art/e/botanicalgarden-osaka/" },
  { id:"pt-3",  urgency:"critical", city:"KYOTO",    text:"Book teamLab Biovortex Kyoto — evening slot Apr 25", url:"https://www.teamlab.art/e/kyoto/" },
  { id:"pt-4",  urgency:"critical", city:"TOKYO",    text:"Book Shibuya Sky sunset slot — tickets release ~2 weeks ahead", url:"https://www.shibuya-scramble-square.com/sky/" },
  { id:"pt-6",  urgency:"high",     city:"KYOTO",    text:"Book Kyoto → Kanazawa train (Thunderbird + Hakutaka, Apr 28)", url:"https://www.westjr.co.jp/global/en/ticket/" },
  { id:"pt-7",  urgency:"high",     city:"TAKAYAMA", text:"Book Nohi Bus to Shirakawa-go round-trip (Apr 30)", url:"https://www.nouhibus.co.jp/en/" },
  { id:"pt-8",  urgency:"high",     city:"TAKAYAMA", text:"Book Kanazawa → Takayama train (Hida Ltd Express, Apr 29)", url:"https://www.westjr.co.jp/global/en/ticket/" },
  { id:"pt-9",  urgency:"high",     city:"TOKYO",    text:"Book teamLab Planets Tokyo (May 7)", url:"https://www.teamlab.art/e/planets/" },
  { id:"pt-10", urgency:"high",     city:"TOKYO",    text:"Book Takayama → Tokyo train (Hida + Shinkansen, May 1)", url:"https://www.westjr.co.jp/global/en/ticket/" },
  { id:"pt-20", urgency:"high",     city:"TOKYO",    text:"Buy Hakone Free Pass 2-day from Shinjuku (¥7,100pp) — goes on sale ~Apr 5 via Klook or Odakyu EMot", url:"https://odakyu-global.com/passes/hakone-freepass/" },
  { id:"pt-11", urgency:"high",     city:"TOKYO",    text:"Book Romancecar surcharge (¥1,150pp each way) on top of Free Pass — May 5. Book via Odakyu EMot", url:"https://www.odakyu.jp/english/romancecar/" },
  { id:"pt-12", urgency:"medium",   city:"TOKYO",    text:"Book Kawaguchiko highway bus from Busta Shinjuku (May 6)", url:"https://highwaybus.com/gp/index" },
  { id:"pt-13", urgency:"medium",   city:"TOKYO",    text:"Book farewell dinner in Ginza (May 8)" },
  { id:"pt-14", urgency:"low",      city:"ALL",      text:"Set up Visit Japan Web (immigration pre-registration)", url:"https://vjw-lp.digital.go.jp/en/" },
  { id:"pt-15", urgency:"low",      city:"ALL",      text:"Buy Japan eSIM before departure (~€44 budgeted)" },
  { id:"pt-16", urgency:"low",      city:"ALL",      text:"Set up Suica or PASMO in Apple or Google Wallet" },
  { id:"pt-17", urgency:"low",      city:"ALL",      text:"Download apps: USJ, Google Maps, Google Translate, teamLab, Klook" },
  { id:"pt-18", urgency:"low",      city:"ALL",      text:"Notify bank of travel to Japan & China (Shanghai transit)" },
];

// ─── ITINERARY DATA ───────────────────────────────────────────────────────────
const cities = [
  {
    name:"OSAKA", dates:"Apr 20 – 24", nights:"4 nights",
    hotel:"Henn na Hotel Shinsaibashi", color:"#bc002d", kanji:"大阪",
    days:[
      { date:"Apr 20", day:"Sun", isoDate:"2026-04-20", label:"Arrival", items:[
        { id:"o0-0", type:"travel", text:"Arrive Kansai Airport → Haruka Express to Namba (~50 min)" },
        { id:"o0-1", type:"hotel",  text:"Check in · Henn na Hotel · robot dinosaur welcome 🦕", map:"https://maps.google.com/?cid=17543935335039745722" },
        { id:"o0-2", type:"sight",  text:"Dotonbori night walk — Glico Man, takoyaki, neon reflections on the canal", map:"https://maps.google.com/?cid=16446419638008461065" },
      ]},
      { date:"Apr 21", day:"Mon", isoDate:"2026-04-21", label:"Classic Osaka + teamLab 🌿", items:[
        { id:"o1-0", type:"sight", text:"Osaka Castle (9am) — moat walk, free park, optional museum ¥600", map:"https://maps.google.com/?cid=1081374622389182017" },
        { id:"o1-1", type:"food",  text:"Kuromon Market (11am) — wagyu skewers, fresh seafood, tamagoyaki. Bring cash!", map:"https://maps.google.com/?cid=12402117845945925953" },
        { id:"o1-2", type:"sight", text:"Shinsekai district (5:30pm) — retro neon, kushikatsu restaurants, arcades", map:"https://maps.google.com/?cid=3941168473429300987" },
        { id:"o1-3", type:"book",  text:"teamLab Botanical Garden Osaka (evening) — light art installations in Nagai Botanical Garden. BOOK AHEAD", map:"https://www.google.com/maps/search/teamLab+Botanical+Garden+Osaka+Nagai" },
      ]},
      { date:"Apr 22", day:"Tue", isoDate:"2026-04-22", label:"Universal Studios Japan 🧙", items:[
        { id:"o2-0", type:"book",  text:"USJ Studio Pass — arrive 8:30am, head straight to Wizarding World. No Express Pass needed — Hogsmeade + Butterbeer + Ollivanders is all walkable", map:"https://maps.google.com/?cid=3892796888607511210" },
        { id:"o2-2", type:"sight", text:"Super Nintendo World — grab timed entry via USJ app on arrival", map:"https://maps.google.com/?cid=3892796888607511210" },
        { id:"o2-3", type:"sight", text:"Full park day — leave 7–8pm exhausted and happy" },
      ]},
      { date:"Apr 23", day:"Wed", isoDate:"2026-04-23", label:"Himeji Castle + Kobe 🏯", items:[
        { id:"o3-0", type:"travel", text:"JR Shinkaisoku from Osaka → Himeji (~60 min). No reservation needed" },
        { id:"o3-1", type:"coffee", text:"Hamamoto Coffee on Miyuki Street — famous almond toast, local Himeji favourite", map:"https://www.google.com/maps/search/Hamamoto+Coffee+Himeji" },
        { id:"o3-2", type:"sight",  text:"Himeji Castle (9am) — UNESCO World Heritage, Japan's most intact original castle. White Heron. Allow 2.5 hrs for castle + grounds. ¥2,500pp from 2026", map:"https://www.google.com/maps/search/Himeji+Castle" },
        { id:"o3-3", type:"sight",  text:"Kokoen Garden (11:30am) — traditional garden directly adjacent to castle, 30 min. ¥300 combined ticket available", map:"https://www.google.com/maps/search/Kokoen+Garden+Himeji" },
        { id:"o3-4", type:"food",   text:"Lunch near castle — try Himeji oden (soy-based hot pot) or Anago-meshi (grilled conger eel rice)", map:"https://www.google.com/maps/search/restaurant+near+Himeji+Castle" },
        { id:"o3-5", type:"travel", text:"Train Himeji → Kobe (~30 min via San'yo/JR line)" },
        { id:"o3-6", type:"sight",  text:"Kobe Harborland (3pm) — waterfront walk, Ferris wheel, Rainbow Bridge views. Great at sunset", map:"https://maps.google.com/?cid=12749193704110128037" },
        { id:"o3-7", type:"travel", text:"Return to Osaka from Kobe (~25 min via Hanshin/JR)" },
      ]},
      { date:"Apr 24", day:"Thu", isoDate:"2026-04-24", label:"Shinsaibashi → Kyoto", items:[
        { id:"o4-0", type:"sight",  text:"Shinsaibashi covered arcade (10am) — souvenirs, cosmetics, bakeries", map:"https://maps.google.com/?cid=7087755665176380195" },
        { id:"o4-1", type:"sight",  text:"Amerika Mura (11:15am) — vintage clothing, street art, Triangle Park", map:"https://maps.google.com/?cid=7984796630724712892" },
        { id:"o4-2", type:"travel", text:"Check out · Shin-Osaka → Kyoto Shinkansen (13 min)" },
      ]},
    ]
  },
  {
    name:"KYOTO", dates:"Apr 24 – 28", nights:"4 nights",
    hotel:"Hotel Tavinos Kyoto", color:"#4338ca", kanji:"京都",
    days:[
      { date:"Apr 24", day:"Thu", isoDate:"2026-04-24", label:"Arrival & Gion", items:[
        { id:"k0-0", type:"hotel",  text:"Check in · Hotel Tavinos · near Kyoto Station", map:"https://maps.google.com/?cid=9422392276212255335" },
        { id:"k0-1", type:"coffee", text:"Walden Woods Kyoto or Blue Bottle Coffee — settle in afternoon", map:"https://www.google.com/maps/place/Walden+Woods+Kyoto/data=!4m2!3m1!1s0x600108bb1d97aaab:0xf34fa8baf809718d" },
        { id:"k0-2", type:"sight",  text:"Gion evening walk (7pm) — Hanamikoji Street, watch for maiko at dusk", map:"https://maps.google.com/?cid=993893271285067700" },
      ]},
      { date:"Apr 25", day:"Fri", isoDate:"2026-04-25", label:"Fushimi Inari + teamLab ✨", items:[
        { id:"k1-0", type:"sight",  text:"Fushimi Inari Taisha (6:00am!) — dawn gates in total silence, hike 45–120 min up", map:"https://maps.google.com/?cid=8870624639634301673" },
        { id:"k1-1", type:"coffee", text:"WIFE & HUSBAND coffee (late morning) — charming neighbourhood café", map:"https://www.google.com/maps/place/WIFE+%26+HUSBAND/data=!4m2!3m1!1s0x6001081003cad7e5:0xd7cb725a4cbf7492" },
        { id:"k1-2", type:"coffee", text:"Stumptown Coffee Roasters or Slō — afternoon recharge", map:"https://www.google.com/maps/place/Stumptown+Coffee+Roasters/data=!4m2!3m1!1s0x600109de38f945a9:0x54013b28b688b161" },
        { id:"k1-3", type:"book",   text:"teamLab Biovortex Kyoto (6–7pm slot) — 50+ installations, 2.5 hrs. BOOK NOW", map:"https://maps.google.com/?cid=755170767874408507" },
      ]},
      { date:"Apr 26", day:"Sat", isoDate:"2026-04-26", label:"Nara Day Trip 🦌", items:[
        { id:"k2-0", type:"travel", text:"Kintetsu Limited Express: Kyoto → Nara (45 min)" },
        { id:"k2-1", type:"sight",  text:"Nara Deer Park (9am) — bow to the deer, they bow back. Shika senbei ¥200", map:"https://maps.google.com/?cid=17972930374069941334" },
        { id:"k2-2", type:"sight",  text:"Tōdai-ji (10am) — Japan's largest Buddha (15m). Squeeze through the pillar for luck!", map:"https://maps.google.com/?cid=17911005107283377295" },
        { id:"k2-3", type:"sight",  text:"Kasuga Taisha Shrine (11:30am) — forest lantern path, late April wisteria possible", map:"https://maps.google.com/?cid=5519134420388517270" },
        { id:"k2-4", type:"coffee", text:"nadoya no katte or Le Labo Kyoto Machiya on return", map:"https://www.google.com/maps/place/nadoya+no+katte/data=!4m2!3m1!1s0x6018f36fd56d2b7f:0x98ffe56e834f133e" },
      ]},
      { date:"Apr 27", day:"Sun", isoDate:"2026-04-27", label:"Kinkakuji + Arashiyama by Bike 🚲", items:[
        { id:"k3-0", type:"sight",  text:"Kinkakuji Golden Pavilion (9am) — arrive at opening, gold reflected in the pond", map:"https://maps.google.com/?cid=1073025677330113631" },
        { id:"k3-1", type:"travel", text:"Bus 101/102: Kinkakuji → Arashiyama (~30 min), then rent a bike near the station" },
        { id:"k3-2", type:"coffee", text:"% ARABICA Kyoto Arashiyama — iconic café by the bamboo grove", map:"https://www.google.com/maps/place/%25+ARABICA+Kyoto+Arashiyama/data=!4m2!3m1!1s0x6001a9ffffef6009:0xec55dccfaa9eb7c0" },
        { id:"k3-3", type:"sight",  text:"Arashiyama Bamboo Forest — Tenryu-ji garden, Togetsukyo bridge, Oi River boat ride", map:"https://maps.google.com/?cid=18131488233213033693" },
        { id:"k3-6", type:"sight",  text:"Sagano Chikurin no Michi by bike — quieter bamboo paths north of the main grove, far fewer tourists", map:"https://www.google.com/maps/search/Sagano+Chikurin+no+Michi+Kyoto" },
        { id:"k3-7", type:"sight",  text:"Adashino Nenbutsu-ji Temple — 8,000 stone Buddha figures on a mossy hillside. End of the Sagano cycling path, deeply atmospheric", map:"https://www.google.com/maps/search/Adashino+Nenbutsu-ji+Kyoto" },
        { id:"k3-4", type:"coffee", text:"Bread, Espresso and Arashiyama Garden — riverside garden café", map:"https://www.google.com/maps/place/Bread,+Espresso+and+Arashiyama+Garden/data=!4m2!3m1!1s0x6001ab7bfd55e025:0x110aa429a33d33d9" },
        { id:"k3-5", type:"food",   text:"HIGUMA Doughnuts & Coffee Wrights Kyoto — matcha + donut on the way back", map:"https://www.google.com/maps/place/HIGUMA+Doughnuts+%26+Coffee+Wrights%E7%AB%8B%E8%AA%A0%E3%82%AC%E3%83%BC%E3%83%87%E3%83%B3%E3%83%92%E3%83%A5%E3%83%BC%E3%83%AA%E3%83%83%E3%82%AF%E4%BA%AC%E9%83%BD" },
      ]},
      { date:"Apr 28", day:"Mon", isoDate:"2026-04-28", label:"Kiyomizudera → Kanazawa", items:[
        { id:"k4-0", type:"sight",  text:"Kiyomizudera (6:00am!) — sunrise wooden stage, mist over Kyoto. Back by 8:30am", map:"https://maps.google.com/?cid=7111013964196361402" },
        { id:"k4-1", type:"hotel",  text:"Pack & checkout · Head to Kyoto Station by 11am" },
        { id:"k4-2", type:"book",   text:"Thunderbird → Hakutaka to Kanazawa (~2.5 hrs) · Book by Mar 29, Golden Week -1 day!" },
      ]},
    ]
  },
  {
    name:"KANAZAWA", dates:"Apr 28 – 29", nights:"1 night",
    hotel:"Hotel Torifito Kanazawa", color:"#047857", kanji:"金沢",
    days:[
      { date:"Apr 28", day:"Mon", isoDate:"2026-04-28", label:"Arrive & Full Afternoon", items:[
        { id:"kz0-0", type:"hotel",  text:"Check in · Hotel Torifito · breakfast included · onsen tonight!", map:"https://maps.google.com/?cid=7248822591702183339" },
        { id:"kz0-1", type:"food",   text:"Omicho Market (2:30pm) — snow crab, botan ebi, sea urchin kaisendon. Bring cash!", map:"https://maps.google.com/?cid=13831724870425457829" },
        { id:"kz0-2", type:"sight",  text:"Kanazawa Castle Park (3:45pm) — free, white tiled rooflines and stone walls", map:"https://maps.google.com/?cid=12116680391895948874" },
        { id:"kz0-3", type:"sight",  text:"Kenrokuen Garden (4:30pm) — one of Japan's 3 great gardens. Kotoji lantern photo shot", map:"https://maps.google.com/?cid=10883646955444237028" },
        { id:"kz0-4", type:"sight",  text:"Higashi Chaya District (6:15pm) — Edo teahouses at dusk, gold leaf soft cream", map:"https://maps.google.com/?cid=13514310865568533876" },
        { id:"kz0-5", type:"hotel",  text:"Hotel onsen ♨️ — well deserved after a marathon travel + sightseeing day", map:"https://maps.google.com/?cid=7248822591702183339" },
      ]},
      { date:"Apr 29", day:"Tue", isoDate:"2026-04-29", label:"Morning → Takayama", items:[
        { id:"kz1-0", type:"sight",  text:"Nagamachi Samurai District (8:30am) — Nomura-ke mansion garden ¥550. Go early!", map:"https://maps.google.com/?cid=11384741629417725499" },
        { id:"kz1-1", type:"sight",  text:"21st Century Museum of Contemporary Art (10am) — 'Swimming Pool' installation", map:"https://maps.google.com/?cid=5848489108542154945" },
        { id:"kz1-2", type:"book",   text:"Kanazawa → Toyama → Takayama (Hida Ltd Express) · Golden Week Day 1 — book now!" },
      ]},
    ]
  },
  {
    name:"TAKAYAMA", dates:"Apr 29 – May 1", nights:"2 nights",
    hotel:"Hotel around Takayama Ascend Collection", color:"#92400e", kanji:"高山",
    days:[
      { date:"Apr 29", day:"Tue", isoDate:"2026-04-29", label:"Arrive & Old Town", items:[
        { id:"t0-0", type:"hotel",  text:"Check in · Hotel around Takayama · onsen + lounge access", map:"https://maps.google.com/?cid=3262508364740780920" },
        { id:"t0-1", type:"sight",  text:"Sanmachi Suji (3pm) — Edo merchant street, sake breweries (sugidama balls!), Hida beef bun", map:"https://maps.google.com/?cid=9208866768243964046" },
        { id:"t0-2", type:"food",   text:"Sake tasting + mitarashi dango at the historic breweries along the canal", map:"https://maps.google.com/?cid=9208866768243964046" },
        { id:"t0-3", type:"sight",  text:"Miyagawa riverside walk (5:30pm) — scope out tomorrow's morning market", map:"https://maps.google.com/?cid=5487124927485698262" },
      ]},
      { date:"Apr 30", day:"Wed", isoDate:"2026-04-30", label:"Shirakawa-go + Village Walk 🏔", items:[
        { id:"t1-0", type:"food",   text:"Miyagawa Morning Market (7:00am) — riverside stalls, local coffee, handmade crafts", map:"https://maps.google.com/?cid=5487124927485698262" },
        { id:"t1-1", type:"book",   text:"Nohi Bus → Shirakawa-go (depart 8:30am) · UNESCO Heritage · BOOK — Golden Week!" },
        { id:"t1-2", type:"sight",  text:"Shirakawa-go — thatched gassho-zukuri farmhouses. Hike to Shiroyama Hill viewpoint!", map:"https://maps.google.com/?cid=14755289620389823992" },
        { id:"t1-3", type:"travel", text:"Return bus ~1:30pm" },
        { id:"t1-4", type:"sight",  text:"Higashiyama Promenade (3pm) — 3.5km free walk through 12 temples & shrines", map:"https://maps.google.com/?cid=18177616014009134586" },
        { id:"t1-5", type:"sight",  text:"Hida Folk Village Museum (4:45pm) — open-air gassho farmhouses, very peaceful", map:"https://maps.google.com/?cid=15466683148941065284" },
      ]},
      { date:"May 1", day:"Thu", isoDate:"2026-05-01", label:"Morning Market → Tokyo 🚅", items:[
        { id:"t2-0", type:"food",   text:"Miyagawa Morning Market (7am) — riverside breakfast, final Takayama morning", map:"https://maps.google.com/?cid=5487124927485698262" },
        { id:"t2-1", type:"sight",  text:"Takayama Jinya (8:45am) — Japan's only surviving Edo govt. building, ¥440, 45 min", map:"https://maps.google.com/?cid=11021987317374357985" },
        { id:"t2-2", type:"book",   text:"Hida Ltd Express → Nagoya → Shinkansen to Tokyo · Book now — Golden Week!" },
      ]},
    ]
  },
  {
    name:"TOKYO", dates:"May 1 – 9", nights:"8 nights",
    hotel:"Hotel Metropolitan Edmont", color:"#0369a1", kanji:"東京",
    days:[
      { date:"May 1", day:"Thu", isoDate:"2026-05-01", label:"Arrive & Akihabara", items:[
        { id:"tk0-0", type:"hotel",  text:"Check in · Hotel Metropolitan Edmont · Iidabashi. Skytree visible from high floors!", map:"https://maps.google.com/?cid=1907153616724399869" },
        { id:"tk0-1", type:"coffee", text:"Donish Coffee Company 神楽坂 — 10 min walk from hotel, your neighbourhood café all week", map:"https://www.google.com/maps/place/Donish+Coffee+Company+%E7%A5%9E%E6%A5%BD%E5%9D%82%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%89/data=!4m2!3m1!1s0x60188da1f0609ab3:0x4c6da5443a130276" },
        { id:"tk0-2", type:"sight",  text:"Akihabara Electric Town evening — multi-floor game/anime shops, maid cafés", map:"https://maps.google.com/?cid=8588181514563389831" },
      ]},
      { date:"May 2", day:"Fri", isoDate:"2026-05-02", label:"East Tokyo: Tsukiji + Asakusa + Ueno", items:[
        { id:"tk1-0", type:"food",   text:"Tsukiji Outer Market (8am) — tuna sushi, tamagoyaki, grilled scallops. Bring cash!", map:"https://maps.google.com/?cid=11704332758705177180" },
        { id:"tk1-1", type:"coffee", text:"FUGLEN ASAKUSA — Norwegian waffle ⭐ Must try", map:"https://www.google.com/maps/place/FUGLEN+ASAKUSA/data=!4m2!3m1!1s0x60188f94c3ce55cd:0xba4fa108446d25ef" },
        { id:"tk1-2", type:"coffee", text:"ARC coffee — compact, good for on the go", map:"https://www.google.com/maps/place/ARC/data=!4m2!3m1!1s0x60188fa1d273803f:0x737fb67f3409e7bd" },
        { id:"tk1-3", type:"food",   text:"Benitsuru Pancake — Asakusa area", map:"https://www.google.com/maps/place/Benitsuru+Pancake/data=!4m2!3m1!1s0x60188ebf0cf89e69:0x568d9c65e1e9da71" },
        { id:"tk1-4", type:"sight",  text:"Senso-ji Temple (10:30am) — Nakamise shopping street, incense, fortune draws", map:"https://maps.google.com/?cid=7785923974874169613" },
        { id:"tk1-5", type:"sight",  text:"Ueno Park (1pm) — lotus pond, temples, street performers", map:"https://maps.google.com/?cid=12811393089244390490" },
        { id:"tk1-6", type:"sight",  text:"Tokyo National Museum (2pm) — open until 8pm Fridays! World's best Japanese art collection", map:"https://maps.google.com/?cid=2535480516976146397" },
      ]},
      { date:"May 3", day:"Sat", isoDate:"2026-05-03", label:"Shinjuku + Nakameguro", items:[
        { id:"tk2-0", type:"sight",  text:"Shinjuku Gyoen National Garden (9am) — late-bloom cherry varieties possible, ¥500", map:"https://maps.google.com/?cid=7646744610971579015" },
        { id:"tk2-1", type:"coffee", text:"ONIBUS COFFEE Nakameguro — Nakameguro detour en route", map:"https://www.google.com/maps/place/ONIBUS+COFFEE+Nakameguro+3+Chome/data=!4m2!3m1!1s0x60188b5e38940a75:0xdf3b552f5851b2f7" },
        { id:"tk2-2", type:"coffee", text:"little cloud coffee Nakameguro — cookies are amazing ⭐", map:"https://www.google.com/maps/place/little+cloud+coffee+NAKAMEGURO/data=!4m2!3m1!1s0x60188b098aa7ccdb:0xaed8b9f0cdc9db3d" },
        { id:"tk2-3", type:"food",   text:"Seirinkan pizza — Nakameguro, dinner", map:"https://www.google.com/maps/place/Seirinkan/data=!4m2!3m1!1s0x60188b4855c58539:0x3c843f6645d24cd0" },
        { id:"tk2-4", type:"sight",  text:"Shibuya Crossing (8pm) — join the 3,000-person scramble OR watch from Starbucks 2nd floor", map:"https://maps.google.com/?cid=2370410330085837161" },
      ]},
      { date:"May 4", day:"Sun", isoDate:"2026-05-04", label:"Harajuku + Shibuya Sky 🌅", items:[
        { id:"tk3-0", type:"coffee", text:"Coffee Supreme Tokyo + Camelback breakfast sandwiches next door ⭐", map:"https://www.google.com/maps/place/Coffee+Supreme+Tokyo/data=!4m2!3m1!1s0x60188cad5f88c001:0x44a6e1bd31a54818" },
        { id:"tk3-1", type:"sight",  text:"Meiji Jingu (9am) — cedar forest shrine, peaceful even on Sundays if you go early", map:"https://maps.google.com/?cid=10361244767556222835" },
        { id:"tk3-2", type:"sight",  text:"Takeshita Street Harajuku — crepes, quirky fashion, people-watching", map:"https://maps.google.com/?cid=14032878377351675573" },
        { id:"tk3-3", type:"coffee", text:"Higuma Doughnuts × Coffee Wrights Omotesando — mid-morning treat", map:"https://www.google.com/maps/place/Higuma+Doughnuts+%C3%97+Coffee+Wrights+Omotesando/data=!4m2!3m1!1s0x60188db7fdd78907:0xff6c26a2dfe0f772" },
        { id:"tk3-4", type:"coffee", text:"KOFFEE MAMEYA — buy beans to bring home as gifts ⭐", map:"https://www.google.com/maps/place/KOFFEE+MAMEYA/data=!4m2!3m1!1s0x60188ca378255a07:0x464a32ea35065dff" },
        { id:"tk3-5", type:"food",   text:"Spontini Cascade Harajuku — pizza slice lunch", map:"https://www.google.com/maps/place/Spontini+Cascade+Harajuku/data=!4m2!3m1!1s0x60188ca52a8130cf:0x6aec1483f3f4094c" },
        { id:"tk3-6", type:"coffee", text:"LAMBERT — coffee + matcha, Shibuya area afternoon", map:"https://www.google.com/maps/place/LAMBERT/data=!4m2!3m1!1s0x60188d002676159b:0xd25a5a2889e8e8ba" },
        { id:"tk3-7", type:"book",   text:"Shibuya Sky sunset (5:30pm) — 360° open-air rooftop, Mt Fuji on clear days. BOOK ~Apr 20", map:"https://maps.google.com/?cid=8067212359343678579" },
      ]},
      { date:"May 5", day:"Mon", isoDate:"2026-05-05", label:"Hakone Day Trip 🏔️", items:[
        { id:"tk4-0", type:"book",   text:"Romancecar from Shinjuku → Hakone-Yumoto (~75 min, no transfer). Buy Free Pass + ¥1,150pp surcharge via Odakyu EMot", map:"https://www.google.com/maps/search/Hakone-Yumoto+Station" },
        { id:"tk4-1", type:"sight",  text:"Hakone Open-Air Museum — sculpture park with foot onsen ♨️ Bring a towel. Picasso pavilion!", map:"https://maps.google.com/?cid=6381101115362667615" },
        { id:"tk4-2", type:"sight",  text:"Hakone Ropeway over Owakudani volcanic valley — sulphur vents, steaming earth. All covered by Free Pass", map:"https://www.google.com/maps/search/Hakone+Ropeway+Owakudani" },
        { id:"tk4-3", type:"sight",  text:"Lake Ashi Pirate Ship cruise — Mt Fuji views on clear days. Free Pass covers this too!", map:"https://www.google.com/maps/search/Lake+Ashi+Hakone" },
        { id:"tk4-4", type:"travel", text:"Return Romancecar to Shinjuku evening" },
      ]},
      { date:"May 6", day:"Tue", isoDate:"2026-05-06", label:"Lake Kawaguchi / Mt Fuji 🗻", items:[
        { id:"tk5-0", type:"book",   text:"Highway bus Busta Shinjuku → Kawaguchiko (~1h 45min). Book 2–3 weeks ahead", map:"https://www.google.com/maps/search/Busta+Shinjuku" },
        { id:"tk5-1", type:"sight",  text:"Lake Kawaguchi (9am) — best Fuji visibility in the morning before clouds build", map:"https://maps.google.com/?cid=3011696811526290759" },
        { id:"tk5-2", type:"sight",  text:"Oishi Park — classic Fuji + lakeside shot with flower fields (20 min walk east)", map:"https://www.google.com/maps/search/Oishi+Park+Kawaguchiko" },
        { id:"tk5-3", type:"food",   text:"Lunch: Local Hoto noodle soup — thick flat noodles in miso, a Fujisan specialty", map:"https://www.google.com/maps/search/Hoto+noodle+Kawaguchiko" },
        { id:"tk5-4", type:"travel", text:"Return bus ~3–4pm" },
      ]},
      { date:"May 7", day:"Wed", isoDate:"2026-05-07", label:"teamLab Planets + Odaiba 🌊", items:[
        { id:"tk6-0", type:"book",   text:"teamLab Planets Tokyo (10am) — barefoot water rooms, very different from Biovortex. BOOK NOW", map:"https://maps.google.com/?cid=7918542870314997282" },
        { id:"tk6-1", type:"travel", text:"Yurikamome monorail → Odaiba (the ride itself is spectacular)" },
        { id:"tk6-2", type:"sight",  text:"Odaiba Seaside Park — Statue of Liberty, Rainbow Bridge, Tokyo skyline", map:"https://maps.google.com/?cid=9066800158489327401" },
        { id:"tk6-3", type:"food",   text:"Lunch: DiverCity or Decks mall ramen/sushi options", map:"https://www.google.com/maps/search/DiverCity+Tokyo+Plaza" },
      ]},
      { date:"May 8", day:"Thu", isoDate:"2026-05-08", label:"Ginza + Final Evening 🌆", items:[
        { id:"tk7-0", type:"food",   text:"Tsukiji Outer Market (8am) — one last seafood breakfast. Try sea urchin or a toro bowl!", map:"https://maps.google.com/?cid=11704332758705177180" },
        { id:"tk7-1", type:"coffee", text:"Glitch Coffee & Roasters GINZA — arrive 30 min before open ⭐ Worth the wait", map:"https://www.google.com/maps/place/Glitch+Coffee+and+Roasters+GINZA/data=!4m2!3m1!1s0x60188bfa45634c13:0x6abbdc48213cb890" },
        { id:"tk7-2", type:"sight",  text:"Ginza — Ginza Six food hall, flagship stores, gallery hopping", map:"https://www.google.com/maps/search/Ginza+Six+Tokyo" },
        { id:"tk7-3", type:"book",   text:"Special farewell dinner — tasting menu or Sukiyabashi Jiro area. BOOK AHEAD!", map:"https://www.google.com/maps/search/fine+dining+Ginza+Tokyo" },
      ]},
      { date:"May 9", day:"Fri", isoDate:"2026-05-09", label:"Departure ✈️", items:[
        { id:"tk8-0", type:"travel", text:"Narita Express from Tokyo Station → Narita Airport (~60 min). Allow 3 hrs at airport!" },
        { id:"tk8-1", type:"travel", text:"Tokyo Narita → Shanghai Pudong → Budapest (China Eastern)" },
        { id:"tk8-2", type:"coffee", text:"Last Japanese coffee at the airport — take your Koffee Mameya beans home!" },
      ]},
    ]
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function JapanItinerary() {
  const [activeCity, setActiveCity]     = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [checkedTasks, setCheckedTasks] = useState({});
  const [paidCats,    setPaidCats]      = useState({});
  const [spentAmts,   setSpentAmts]     = useState({});
  const [notes,       setNotes]         = useState({});
  const [customItems, setCustomItems]   = useState({});
  const [hiddenItems, setHiddenItems]   = useState({});
  const [customTasks,    setCustomTasks]    = useState([]);
  const [customBudget,   setCustomBudget]   = useState([]);
  const [taskOverrides,  setTaskOverrides]  = useState({});
  const [deletedTaskIds, setDeletedTaskIds] = useState({});
  const [budgetOverrides, setBudgetOverrides] = useState({});
  const [deletedBudgetIds,setDeletedBudgetIds] = useState({});
  const [openNotes,   setOpenNotes]     = useState({});
  const [openActions, setOpenActions]   = useState({});
  const [addingTo,    setAddingTo]      = useState(null);
  const [draft,       setDraft]         = useState({ text:"", type:"sight", map:"" });
  const [addingTask,  setAddingTask]    = useState(false);
  const [taskDraft,   setTaskDraft]     = useState({ text:"", urgency:"medium", city:"ALL", url:"" });
  const [editingTask, setEditingTask]   = useState(null); // id of task being edited
  const [addingBudget,setAddingBudget]  = useState(false);
  const [budgetDraft, setBudgetDraft]   = useState({ label:"", emoji:"💴", total:"", note:"" });
  const [editingBudget,setEditingBudget]= useState(null); // id of budget cat being edited
  const [editingItem,  setEditingItem]  = useState(null); // id of itinerary item being edited
  const [editingItemType,setEditingItemType] = useState("sight"); // tracks type during edit
  const [itemOverrides,setItemOverrides]= useState({});   // text/type overrides for hardcoded items
  const [itemOrder,    setItemOrder]    = useState({});   // per-day item ordering { dayKey: [id1, id2, ...] }
  const [dragOverTarget, setDragOverTarget] = useState(null); // { dayKey, index } for drop indicator
  const [draggingItemId, setDraggingItemId] = useState(null); // id of item currently being dragged
  const dragItemRef    = useRef(null); // { itemId, fromDayKey, item } — ref avoids stale closure in handlers
  const touchDragRef   = useRef(null); // touch drag state { itemId, fromDayKey, item, clone, offX, offY }
  const dragOverRef    = useRef(null); // mirrors dragOverTarget for document-level touch handlers
  const dropFnRef      = useRef(null); // always-fresh drop executor (avoids stale closure in useEffect)
  const [activeTab,   setActiveTab]     = useState("itinerary");
  const [taskFilter,  setTaskFilter]    = useState("all");
  const [synced,      setSynced]        = useState(false);
  const [jpyAmount,   setJpyAmount]     = useState("");
  const [eurAmount,   setEurAmount]     = useState("");
  const [jpyRate,     setJpyRate]       = useState(null);
  const [rateDate,    setRateDate]      = useState("");
  const [converterDir,setConverterDir]  = useState("jpy-to-eur"); // or "eur-to-jpy"
  const [packingItems,  setPackingItems]  = useState({});  // { id: { id, text, checked } }
  const [packingDraft,  setPackingDraft]  = useState("");
  const [expenses,      setExpenses]      = useState({});  // { catId: { expId: { id, name, amountEur, amountJpy? } } }
  const [openExpenses,  setOpenExpenses]  = useState({});  // { catId: bool }
  const [expDraft,      setExpDraft]      = useState({});  // { catId: { name, amount, currency } }
  const [editingExp,    setEditingExp]    = useState(null); // { catId, expId }
  const [expEditDraft,  setExpEditDraft]  = useState({ name:"", amount:"", currency:"eur" });

  const todayRef  = useRef(null);
  const todayIso  = getTodayIso();
  const countdown = getCountdown();

  useEffect(() => {
    const bindings = [
      ["jp-items",        setCheckedItems],
      ["jp-tasks",        setCheckedTasks],
      ["jp-paid",         setPaidCats],
      ["jp-spent",        setSpentAmts],
      ["jp-notes",        setNotes],
      ["jp-hidden",       setHiddenItems],
      ["jp-custom-tasks",    setCustomTasks],
      ["jp-custom-budget",   setCustomBudget],
      ["jp-task-overrides",  setTaskOverrides],
      ["jp-deleted-tasks",   setDeletedTaskIds],
      ["jp-budget-overrides",setBudgetOverrides],
      ["jp-deleted-budget",  setDeletedBudgetIds],
      ["jp-item-overrides",  setItemOverrides],
      ["jp-item-order",      setItemOrder],
      ["jp-packing",         setPackingItems],
    ];
    const unsubs = bindings.map(([key, setter]) =>
      onValue(ref(db, `japan2026/${key}`), snap => { if (snap.exists()) setter(snap.val()); })
    );
    const customUnsub = onValue(ref(db, `japan2026/jp-custom`), snap => {
      if (snap.exists()) setCustomItems(snap.val());
    });
    const expUnsub = onValue(ref(db, `japan2026/jp-expenses`), snap => {
      if (snap.exists()) setExpenses(snap.val());
    });
    const t = setTimeout(() => setSynced(true), 1000);
    return () => { unsubs.forEach(u => u()); customUnsub(); expUnsub(); clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (activeTab === "itinerary" && todayRef.current) {
      setTimeout(() => todayRef.current?.scrollIntoView({ behavior:"smooth", block:"center" }), 150);
    }
  }, [activeTab]);

  // Fetch live JPY→EUR exchange rate
  useEffect(() => {
    fetch("https://api.frankfurter.app/latest?from=JPY&to=EUR")
      .then(r => r.json())
      .then(data => { setJpyRate(data.rates.EUR); setRateDate(data.date); })
      .catch(() => { setJpyRate(0.0059); setRateDate("fallback"); });
  }, []);

  // Touch drag-and-drop (mobile) — document-level handlers to support finger movement across elements
  useEffect(() => {
    const onMove = (e) => {
      if (!touchDragRef.current) return;
      e.preventDefault(); // prevents scroll while dragging
      const t = e.touches[0];
      const { clone, offX, offY } = touchDragRef.current;
      clone.style.top  = (t.clientY - offY) + "px";
      clone.style.left = (t.clientX - offX) + "px";
      // Find which item the finger is over
      clone.style.visibility = "hidden";
      const el = document.elementFromPoint(t.clientX, t.clientY);
      clone.style.visibility = "";
      if (!el) return;
      let node = el;
      while (node && node !== document.body) {
        if (node.dataset.dItem) {
          const rect = node.getBoundingClientRect();
          const idx  = t.clientY < rect.top + rect.height / 2 ? +node.dataset.dIdx : +node.dataset.dIdx + 1;
          const next = { dayKey: node.dataset.dDay, index: idx };
          dragOverRef.current = next;
          setDragOverTarget(next);
          return;
        }
        node = node.parentElement;
      }
    };
    const onEnd = () => {
      if (!touchDragRef.current) return;
      const { clone, itemId: fromId, fromDayKey, item: data } = touchDragRef.current;
      if (clone.parentNode) clone.parentNode.removeChild(clone);
      if (dropFnRef.current && dragOverRef.current) {
        const { dayKey: toKey, index: toIdx } = dragOverRef.current;
        dropFnRef.current(fromDayKey, toKey, fromId, toIdx, data);
      }
      touchDragRef.current = null;
      dragOverRef.current  = null;
      setDraggingItemId(null);
      setDragOverTarget(null);
      dragItemRef.current = null;
    };
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend",  onEnd);
    return () => {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onEnd);
    };
  }, []);

  const toggleItem = (id) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next); fbSet("jp-items", next);
  };
  const toggleTask = (id) => {
    const next = { ...checkedTasks, [id]: !checkedTasks[id] };
    setCheckedTasks(next); fbSet("jp-tasks", next);
  };
  const toggleNote = (id) => setOpenNotes(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleDay  = (key) => setExpandedDays(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  const saveNote   = (id, val) => { const n = {...notes,[id]:val}; setNotes(n); fbSet("jp-notes",n); };

  const openAddForm = (key) => { setDraft({ text:"", type:"sight", map:"" }); setAddingTo(key); };
  const cancelAdd   = () => setAddingTo(null);
  const commitAdd   = (key) => {
    if (!draft.text.trim()) return;
    const id = `custom-${Date.now()}`;
    const newItem = { id, type:draft.type, text:draft.text.trim(), custom:true };
    if (draft.map.trim()) newItem.map = draft.map.trim();
    fbSetItem(key, id, newItem);
    setCustomItems(prev => ({ ...prev, [key]: { ...(prev[key]||{}), [id]: newItem } }));
    setAddingTo(null);
  };
  const deleteCustomItem = (key, id) => {
    fbRemoveItem(key, id);
    setCustomItems(prev => { const d = {...(prev[key]||{})}; delete d[id]; return {...prev,[key]:d}; });
    setCheckedItems(prev => { const n={...prev}; delete n[id]; fbSet("jp-items",n); return n; });
    setNotes(prev => { const n={...prev}; delete n[id]; fbSet("jp-notes",n); return n; });
  };
  const hideItem  = (id) => { const n={...hiddenItems,[id]:true}; setHiddenItems(n); fbSet("jp-hidden",n); };
  const unhideAll = (key, items) => {
    const n={...hiddenItems}; items.forEach(i=>delete n[i.id]);
    setHiddenItems(n); fbSet("jp-hidden",n);
  };
  // Edit any itinerary item (custom or hardcoded)
  const updateItem = (dayKey, id, patch) => {
    const customBase = customItems[dayKey] || {};
    if (customBase[id]) {
      // Custom item — update directly in Firebase
      const updated = { ...customBase[id], ...patch };
      fbSetItem(dayKey, id, updated);
      setCustomItems(prev => ({ ...prev, [dayKey]: { ...(prev[dayKey]||{}), [id]: updated } }));
    } else {
      // Hardcoded item — store override
      const next = { ...itemOverrides, [id]: { ...(itemOverrides[id]||{}), ...patch } };
      setItemOverrides(next); fbSet("jp-item-overrides", next);
    }
    setEditingItem(null);
  };
  // Get items for a day in the correct order
  const getOrderedDayItems = (dayKey, baseItems, customArr) => {
    const merged = [
      ...baseItems.map(i => itemOverrides[i.id] ? {...i, ...itemOverrides[i.id]} : i),
      ...customArr
    ].filter(i => !hiddenItems[i.id]);
    const stored = itemOrder[dayKey];
    if (!stored) return merged;
    const orderArr = Array.isArray(stored) ? stored : Object.values(stored);
    const byId = {};
    merged.forEach(i => { byId[i.id] = i; });
    const ordered = [];
    orderArr.forEach(id => { if (byId[id]) { ordered.push(byId[id]); delete byId[id]; } });
    // Append any new items not yet in the stored order
    Object.values(byId).forEach(i => ordered.push(i));
    return ordered;
  };
  // Move an item up or down within a day
  const moveItem = (dayKey, baseItems, customArr, itemId, direction) => {
    const items = getOrderedDayItems(dayKey, baseItems, customArr);
    const ids = items.map(i => i.id);
    const idx = ids.indexOf(itemId);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    // Swap
    [ids[idx], ids[targetIdx]] = [ids[targetIdx], ids[idx]];
    const next = { ...itemOrder, [dayKey]: ids };
    setItemOrder(next);
    fbSet("jp-item-order", next);
  };
  // Reorder item within the same day via drag-and-drop
  const reorderItemDrag = (dayKey, baseItems, customArr, fromId, toIndex) => {
    const items = getOrderedDayItems(dayKey, baseItems, customArr);
    const ids = items.map(i => i.id);
    const fromIndex = ids.indexOf(fromId);
    if (fromIndex < 0) return;
    ids.splice(fromIndex, 1);
    const insertAt = Math.max(0, Math.min(toIndex > fromIndex ? toIndex - 1 : toIndex, ids.length));
    ids.splice(insertAt, 0, fromId);
    const next = { ...itemOrder, [dayKey]: ids };
    setItemOrder(next);
    fbSet("jp-item-order", next);
  };

  // Move item to a different day via drag-and-drop
  const moveItemToDay = (fromDayKey, toDayKey, fromId, toIndex, item) => {
    // Hide original item in source day
    const newHidden = { ...hiddenItems, [fromId]: true };
    setHiddenItems(newHidden);
    fbSet("jp-hidden", newHidden);

    // Create new custom item in target day
    const newId = `moved-${Date.now()}`;
    const newItem = { id: newId, type: item.type, text: item.text, custom: true };
    if (item.map) newItem.map = item.map;
    fbSetItem(toDayKey, newId, newItem);
    const updatedCustom = { ...customItems, [toDayKey]: { ...(customItems[toDayKey] || {}), [newId]: newItem } };
    setCustomItems(updatedCustom);

    // Copy checked state to new item
    if (checkedItems[fromId]) {
      const newChecked = { ...checkedItems, [newId]: true };
      setCheckedItems(newChecked);
      fbSet("jp-items", newChecked);
    }

    // Find target day base items
    let toBaseItems = [];
    for (const city of cities) {
      for (let dIdx = 0; dIdx < city.days.length; dIdx++) {
        if (`${city.name}-${dIdx}` === toDayKey) { toBaseItems = city.days[dIdx].items; break; }
      }
    }
    const toCustomArr = Object.values(updatedCustom[toDayKey] || {});
    const targetOrdered = getOrderedDayItems(toDayKey, toBaseItems, toCustomArr).filter(i => i.id !== newId);
    const targetIds = targetOrdered.map(i => i.id);
    targetIds.splice(Math.min(toIndex, targetIds.length), 0, newId);
    const next = { ...itemOrder, [toDayKey]: targetIds };
    setItemOrder(next);
    fbSet("jp-item-order", next);
  };

  const addPackingItem = () => {
    const text = packingDraft.trim();
    if (!text) return;
    const id = `pk-${Date.now()}`;
    const next = { ...packingItems, [id]: { id, text, checked: false } };
    setPackingItems(next); fbSet("jp-packing", next);
    setPackingDraft("");
  };
  const togglePackingItem = (id) => {
    const next = { ...packingItems, [id]: { ...packingItems[id], checked: !packingItems[id].checked } };
    setPackingItems(next); fbSet("jp-packing", next);
  };
  const deletePackingItem = (id) => {
    const next = { ...packingItems }; delete next[id];
    setPackingItems(next); fbSet("jp-packing", next);
  };
  const clearPackingChecks = () => {
    const next = {};
    Object.values(packingItems).forEach(i => { next[i.id] = { ...i, checked: false }; });
    setPackingItems(next); fbSet("jp-packing", next);
  };

  const expTotalForCat = (catId, updatedExps) => {
    const src = updatedExps || expenses[catId] || {};
    return Object.values(src).reduce((s, e) => s + (e.amountEur || 0), 0);
  };
  const addExpense = (catId) => {
    const d = expDraft[catId] || {};
    if (!d.amount || !d.name?.trim()) return;
    const id = `exp-${Date.now()}`;
    const amtNum = Number(d.amount);
    const exp = { id, name: d.name.trim() };
    if (d.currency === "jpy") { exp.amountJpy = amtNum; exp.amountEur = jpyRate ? Math.round(amtNum * jpyRate * 100) / 100 : 0; }
    else { exp.amountEur = amtNum; }
    const catExps = { ...(expenses[catId] || {}), [id]: exp };
    setExpenses(prev => ({ ...prev, [catId]: catExps }));
    fbSetExpense(catId, id, exp);
    setExpDraft(prev => ({ ...prev, [catId]: { name:"", amount:"", currency: d.currency || "eur" } }));
    updateSpent(catId, expTotalForCat(catId, catExps).toFixed(2));
  };
  const deleteExpense = (catId, expId) => {
    const catExps = { ...(expenses[catId] || {}) }; delete catExps[expId];
    setExpenses(prev => ({ ...prev, [catId]: catExps }));
    fbRemoveExpense(catId, expId);
    const newTotal = expTotalForCat(catId, catExps);
    updateSpent(catId, Object.keys(catExps).length > 0 ? newTotal.toFixed(2) : "");
  };
  const saveExpense = (catId, expId) => {
    const d = expEditDraft;
    if (!d.amount || !d.name?.trim()) return;
    const amtNum = Number(d.amount);
    const exp = { id: expId, name: d.name.trim() };
    if (d.currency === "jpy") { exp.amountJpy = amtNum; exp.amountEur = jpyRate ? Math.round(amtNum * jpyRate * 100) / 100 : 0; }
    else { exp.amountEur = amtNum; }
    const catExps = { ...(expenses[catId] || {}), [expId]: exp };
    setExpenses(prev => ({ ...prev, [catId]: catExps }));
    fbSetExpense(catId, expId, exp);
    updateSpent(catId, expTotalForCat(catId, catExps).toFixed(2));
    setEditingExp(null);
  };

  const markPaid    = (catId, val) => { const n={...paidCats,[catId]:val}; setPaidCats(n); fbSet("jp-paid",n); };
  const updateSpent = (catId, val) => { const n={...spentAmts,[catId]:val}; setSpentAmts(n); fbSet("jp-spent",n); };

  const commitTask = () => {
    if (!taskDraft.text.trim()) return;
    const id = `ct-${Date.now()}`;
    const newTask = { id, urgency:taskDraft.urgency, city:taskDraft.city||"ALL", text:taskDraft.text.trim(), custom:true };
    if (taskDraft.url.trim()) newTask.url = taskDraft.url.trim();
    const base = typeof customTasks==='object'&&!Array.isArray(customTasks)?customTasks:{};
    const next = { ...base, [id]: newTask };
    setCustomTasks(next); fbSet("jp-custom-tasks", next);
    setTaskDraft({ text:"", urgency:"medium", city:"ALL", url:"" });
    setAddingTask(false);
  };
  // Works for BOTH built-in and custom tasks
  const updateTask = (id, patch) => {
    const customBase = typeof customTasks==='object'&&!Array.isArray(customTasks)?customTasks:{};
    if (customBase[id]) {
      const updated = { ...customBase[id], ...patch };
      if (!updated.url) delete updated.url;
      setCustomTasks({...customBase,[id]:updated}); fbSet("jp-custom-tasks", {...customBase,[id]:updated});
    } else {
      const next = { ...taskOverrides, [id]: { ...patch } };
      if (!next[id].url) delete next[id].url;
      setTaskOverrides(next); fbSet("jp-task-overrides", next);
    }
    setEditingTask(null);
  };
  const deleteTask = (id) => {
    const customBase = typeof customTasks==='object'&&!Array.isArray(customTasks)?customTasks:{};
    if (customBase[id]) {
      const next = { ...customBase }; delete next[id];
      setCustomTasks(next); fbSet("jp-custom-tasks", next);
    } else {
      const next = { ...deletedTaskIds, [id]: true };
      setDeletedTaskIds(next); fbSet("jp-deleted-tasks", next);
    }
    setCheckedTasks(prev => { const n={...prev}; delete n[id]; fbSet("jp-tasks",n); return n; });
  };

  const commitBudgetCat = () => {
    if (!budgetDraft.label.trim() || !budgetDraft.total) return;
    const id = `cb-${Date.now()}`;
    const newCat = { id, label:budgetDraft.label.trim(), emoji:budgetDraft.emoji||"💴", total:Number(budgetDraft.total), paid:false, custom:true };
    if (budgetDraft.note.trim()) newCat.note = budgetDraft.note.trim();
    const base = typeof customBudget==='object'&&!Array.isArray(customBudget)?customBudget:{};
    const next = { ...base, [id]: newCat };
    setCustomBudget(next); fbSet("jp-custom-budget", next);
    setBudgetDraft({ label:"", emoji:"💴", total:"", note:"" });
    setAddingBudget(false);
  };
  // Works for BOTH built-in and custom budget categories
  const updateBudgetCat = (id, patch) => {
    const customBase = typeof customBudget==='object'&&!Array.isArray(customBudget)?customBudget:{};
    if (customBase[id]) {
      const updated = { ...customBase[id], ...patch, total:Number(patch.total||customBase[id].total) };
      if (!updated.note) delete updated.note;
      setCustomBudget({...customBase,[id]:updated}); fbSet("jp-custom-budget", {...customBase,[id]:updated});
    } else {
      const next = { ...budgetOverrides, [id]: { ...patch, total:Number(patch.total) } };
      if (!next[id].note) delete next[id].note;
      setBudgetOverrides(next); fbSet("jp-budget-overrides", next);
    }
    setEditingBudget(null);
  };
  const deleteBudgetCat = (id) => {
    const customBase = typeof customBudget==='object'&&!Array.isArray(customBudget)?customBudget:{};
    if (customBase[id]) {
      const next = { ...customBase }; delete next[id];
      setCustomBudget(next); fbSet("jp-custom-budget", next);
    } else {
      const next = { ...deletedBudgetIds, [id]: true };
      setDeletedBudgetIds(next); fbSet("jp-deleted-budget", next);
    }
  };

  // Currency converter handlers
  const handleJpyInput = (val) => {
    setJpyAmount(val);
    if (val && jpyRate) setEurAmount((Number(val) * jpyRate).toFixed(2));
    else setEurAmount("");
  };
  const handleEurInput = (val) => {
    setEurAmount(val);
    if (val && jpyRate) setJpyAmount(Math.round(Number(val) / jpyRate).toString());
    else setJpyAmount("");
  };
  const flipConverter = () => {
    setConverterDir(prev => prev === "jpy-to-eur" ? "eur-to-jpy" : "jpy-to-eur");
    setJpyAmount(""); setEurAmount("");
  };
  // Quick-convert presets (common amounts in JPY)
  const jpyPresets = [500, 1000, 3000, 5000, 10000];

  const customTasksArr  = Object.values(typeof customTasks  === 'object' && !Array.isArray(customTasks)  ? customTasks  : {});
  const customBudgetArr = Object.values(typeof customBudget === 'object' && !Array.isArray(customBudget) ? customBudget : {});
  // Apply overrides and filter deleted for built-in tasks
  const allTasks = [
    ...PRE_TRIP_TASKS
      .filter(t => !deletedTaskIds[t.id])
      .map(t => taskOverrides[t.id] ? { ...t, ...taskOverrides[t.id] } : t),
    ...customTasksArr,
  ];
  // Apply overrides and filter deleted for built-in budget cats
  const allBudgetCats = [
    ...BUDGET_CATEGORIES
      .filter(c => !deletedBudgetIds[c.id])
      .map(c => budgetOverrides[c.id] ? { ...c, ...budgetOverrides[c.id] } : c),
    ...customBudgetArr,
  ];
  const filteredCities = activeCity ? cities.filter(c => c.name === activeCity) : cities;
  const totalTasks     = allTasks.length;
  const doneTasks      = allTasks.filter(t => checkedTasks[t.id]).length;
  const criticalLeft   = allTasks.filter(t => t.urgency==="critical" && !checkedTasks[t.id]).length;
  const allCustomItems = Object.entries(customItems).flatMap(([, dayItems]) => Object.values(dayItems || {}));
  const allItems       = [...cities.flatMap(c => c.days.flatMap(d => d.items)), ...allCustomItems];
  const doneItems      = allItems.filter(i => checkedItems[i.id]).length;
  const filteredTasks  = allTasks.filter(t =>
    taskFilter==="pending" ? !checkedTasks[t.id] : taskFilter==="done" ? checkedTasks[t.id] : true
  );
  const totalBudget    = allBudgetCats.reduce((s,c) => s+c.total, 0);
  const totalSpent     = allBudgetCats.reduce((s,c) => s+(Number(spentAmts[c.id])||(paidCats[c.id]?c.total:0)), 0);
  const tripProgress = Math.round((doneItems / allItems.length) * 100);

  // Always-fresh drop executor — read by the touch useEffect to avoid stale closure
  dropFnRef.current = (fromDayKey, toDayKey, fromId, dropIdx, dragData) => {
    let toBase = [];
    for (const city of cities) {
      for (let di2 = 0; di2 < city.days.length; di2++) {
        if (`${city.name}-${di2}` === toDayKey) { toBase = city.days[di2].items; break; }
      }
    }
    const toCustom = Object.values(customItems[toDayKey] || {});
    if (fromDayKey === toDayKey) reorderItemDrag(toDayKey, toBase, toCustom, fromId, dropIdx);
    else moveItemToDay(fromDayKey, toDayKey, fromId, dropIdx, dragData);
  };

  const cdColor = countdown > 30 ? "#047857" : countdown > 14 ? "#b45309" : "#8f0020";
  const inTrip  = new Date() >= DEPARTURE && new Date() <= new Date("2026-05-09");

  return (
    <div style={{ minHeight:"100vh", background:C.surface, color:C.onSurface, fontFamily:sans }}>

      {/* ── BACKGROUND IMAGE + OVERLAY ── */}
      <div style={{
        position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:0,
        backgroundImage:`url(${process.env.PUBLIC_URL}/bg-illustration.png)`,
        backgroundSize:"cover", backgroundPosition:"center top", backgroundRepeat:"no-repeat",
      }} />
      <div style={{
        position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:0,
        backgroundColor:"rgba(249, 249, 249, 0.88)",
      }} />

      {/* ── TOP APP BAR ── */}
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50, height:"64px",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"0 24px",
        background:"rgba(249,249,249,0.85)", backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${C.outlineV}33`,
      }}>
        <div style={{ fontFamily:serif, fontSize:"22px", color:C.primary, letterSpacing:"3px" }}>日本</div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ paddingTop:"80px", paddingBottom:"96px", maxWidth:"680px", margin:"0 auto", padding:"80px 20px 96px", position:"relative", zIndex:1 }}>

        {/* Hero */}
        <section style={{ marginBottom:"32px" }}>
          {/* Countdown */}
          {countdown > 0 && (
            <div style={{ fontSize:"11px", letterSpacing:"3px", color:cdColor, marginBottom:"8px", fontFamily:sans, fontWeight:600, textTransform:"uppercase" }}>
              ✈ {countdown} {countdown===1?"day":"days"} to departure
            </div>
          )}
          {inTrip && <div style={{ fontSize:"11px", letterSpacing:"3px", color:C.primary, marginBottom:"8px", fontWeight:600 }}>🇯🇵 YOU ARE IN JAPAN</div>}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"12px" }}>
            <h1 style={{ fontFamily:serif, fontSize:"clamp(28px,6vw,40px)", fontWeight:700, lineHeight:1.15, color:C.onSurface }}>
              Japan<br />Itinerary
            </h1>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"10px", letterSpacing:"3px", color:C.onSurfaceV, fontWeight:600, textTransform:"uppercase" }}>Apr 20 – May 9</div>
              <div style={{ fontSize:"10px", letterSpacing:"1px", color: synced ? "#047857" : "#b45309", marginTop:"4px" }}>
                {synced ? "🔗 synced" : "⏳ connecting…"}
              </div>
            </div>
          </div>
          <div style={{ height:"1px", background:`${C.outlineV}55`, marginBottom:"24px" }} />

          {/* Stats bento */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"24px" }}>
            {[
              { label:"Bookings", val:`${doneTasks}/${totalTasks}`, highlight: criticalLeft > 0 },
              { label:"To Do",    val:`${doneItems}/${allItems.length}`, highlight: false },
              { label:"Budget",   val:`€${Math.round(totalSpent/1000*10)/10}k/${Math.round(totalBudget/1000*10)/10}k`, highlight: false },
            ].map(s => (
              <div key={s.label} style={{
                background:"rgba(255,255,255,0.6)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                padding:"14px 12px", borderRadius:"8px",
                border:`1px solid ${C.outlineV}15`,
                display:"flex", flexDirection:"column", alignItems:"center", gap:"4px",
              }}>
                <span style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600 }}>{s.label}</span>
                <span style={{ fontFamily:serif, fontSize:"18px", color: s.highlight ? C.primary : C.onSurface, fontWeight:700 }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <nav style={{ display:"flex", gap:"24px", borderBottom:`1px solid ${C.outlineV}33`, marginBottom:"28px" }}>
            {[
              ["itinerary","Day by Day"],
              ["tasks", `Bookings${criticalLeft>0?` · ${criticalLeft}`:""}`],
              ["budget","Budget"],
              ["packing","Packing"],
            ].map(([val,lbl]) => (
              <button key={val} onClick={() => setActiveTab(val)} style={{
                paddingBottom:"12px", fontSize:"11px", fontWeight:700, letterSpacing:"2px",
                textTransform:"uppercase", border:"none", background:"transparent", cursor:"pointer",
                color: activeTab===val ? C.primary : C.onSurfaceV,
                borderBottom: activeTab===val ? `2px solid ${C.primary}` : "2px solid transparent",
                fontFamily:sans, transition:"all 0.2s",
              }}>{lbl}</button>
            ))}
          </nav>
        </section>

        {/* ── ITINERARY TAB ── */}
        {activeTab === "itinerary" && (
          <>
            {/* City filter pills */}
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"24px" }}>
              {[{name:"ALL", color:C.charcoal}, ...cities].map(c => (
                <button key={c.name}
                  onClick={() => setActiveCity(c.name==="ALL" ? null : (c.name===activeCity ? null : c.name))}
                  style={{
                    padding:"4px 12px", borderRadius:"999px", fontSize:"9px", letterSpacing:"2px",
                    fontWeight:700, textTransform:"uppercase", cursor:"pointer", fontFamily:sans,
                    border:`1px solid ${(c.name==="ALL"&&!activeCity)||(c.name===activeCity) ? c.color : C.outlineV}`,
                    background:`${(c.name==="ALL"&&!activeCity)||(c.name===activeCity) ? c.color : "transparent"}`,
                    color: (c.name==="ALL"&&!activeCity)||(c.name===activeCity) ? "#fff" : C.onSurfaceV,
                    transition:"all 0.15s",
                  }}>{c.name==="ALL" ? "ALL" : c.name}</button>
              ))}
            </div>

            {filteredCities.map(city => {
              const cityCustomItems = city.days.flatMap((d, di) => Object.values(customItems[`${city.name}-${di}`] || {}));
              const cityItems = [...city.days.flatMap(d => d.items), ...cityCustomItems];
              const cityDone  = cityItems.filter(i => checkedItems[i.id]).length;
              return (
                <div key={city.name} style={{ marginBottom:"40px" }}>
                  {/* City header */}
                  <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"4px" }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:"12px" }}>
                      <span style={{ fontFamily:serif, fontSize:"11px", letterSpacing:"5px", color:city.color, textTransform:"uppercase" }}>{city.name}</span>
                      <span style={{ fontFamily:serif, fontSize:"28px", color:`${city.color}20`, lineHeight:1 }}>{city.kanji}</span>
                    </div>
                    <span style={{ fontSize:"9px", letterSpacing:"1px", color:C.onSurfaceV }}>
                      {cityDone}/{cityItems.length} · {city.nights}
                    </span>
                  </div>
                  <div style={{ height:"2px", background:`linear-gradient(90deg, ${city.color}, ${city.color}00)`, marginBottom:"6px" }} />
                  <div style={{ fontSize:"10px", color:C.onSurfaceV, marginBottom:"16px" }}>🏨 {city.hotel}</div>

                  {city.days.map((d, di) => {
                    const key     = `${city.name}-${di}`;
                    const isOpen  = expandedDays[key] !== false;
                    const customArr = Object.values(customItems[key]||{});
                    const allDayItems = [...d.items, ...customArr];
                    const dayDone = allDayItems.filter(i => checkedItems[i.id]).length;
                    const allDone = dayDone === allDayItems.length;
                    const hasBook = d.items.some(i => i.type==="book" && !checkedItems[i.id]);
                    const isToday = d.isoDate === todayIso;

                    return (
                      <div key={di} ref={isToday ? todayRef : null} style={{
                        marginBottom:"4px", borderRadius:"2px",
                        background: isToday ? `${city.color}08` : "transparent",
                        border: isToday ? `1px solid ${city.color}30` : "1px solid transparent",
                        transition:"all 0.2s",
                      }}>
                        {/* Day header row */}
                        <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px" }}>
                          <div onClick={() => toggleDay(key)} style={{ display:"flex", alignItems:"center", gap:"10px", flex:1, cursor:"pointer" }}>
                            {isToday && (
                              <span style={{ fontSize:"8px", background:city.color, color:"#fff", padding:"2px 7px", borderRadius:"2px", letterSpacing:"1px", fontWeight:700, flexShrink:0 }}>TODAY</span>
                            )}
                            <span style={{ fontFamily:serif, fontSize:"14px", fontWeight:700, color:city.color, minWidth:"48px" }}>{d.date}</span>
                            <span style={{ fontSize:"9px", color:C.onSurfaceV, background:C.surfaceHigh, padding:"1px 6px", borderRadius:"2px", letterSpacing:"1px", fontWeight:600 }}>{d.day.toUpperCase()}</span>
                            <span style={{ fontFamily:serif, fontSize:"13px", color: allDone ? C.onSurfaceV : C.onSurface, flex:1, textDecoration: allDone ? "line-through" : "none" }}>{d.label}</span>
                          </div>
                          {hasBook && <span style={{ fontSize:"8px", color:C.primary, background:`${C.primary}10`, padding:"2px 7px", borderRadius:"2px", letterSpacing:"1px", fontWeight:700, flexShrink:0 }}>BOOK</span>}
                          <span style={{ fontSize:"9px", color:city.color, background:`${city.color}12`, padding:"1px 7px", borderRadius:"2px", fontWeight:600, flexShrink:0 }}>{dayDone}/{allDayItems.length}</span>
                          {/* Add button */}
                          <span
                            onClick={() => addingTo===key ? cancelAdd() : openAddForm(key)}
                            style={{
                              display:"inline-flex", alignItems:"center", justifyContent:"center",
                              width:"22px", height:"22px", borderRadius:"50%",
                              background: addingTo===key ? `${city.color}20` : C.surfaceLow,
                              border:`1px solid ${addingTo===key ? city.color : C.outlineV}`,
                              color: addingTo===key ? city.color : C.onSurfaceV,
                              fontSize:"16px", cursor:"pointer", flexShrink:0, transition:"all 0.15s",
                            }}>+</span>
                          <span onClick={() => toggleDay(key)} style={{ color:C.onSurfaceV, fontSize:"10px", cursor:"pointer", flexShrink:0 }}>{isOpen?"▲":"▼"}</span>
                        </div>

                        {/* Items — timeline layout */}
                        {isOpen && (
                          <div style={{ paddingLeft:"12px", paddingRight:"12px", paddingBottom:"10px" }}>
                            <div style={{ position:"relative", paddingLeft:"24px" }}>
                              {/* Timeline vertical line */}
                              <div style={{
                                position:"absolute", left:"6px", top:"8px", bottom:"8px",
                                width:"1px", background:`${C.outlineV}60`,
                              }} />

                              {(() => { const orderedItems = getOrderedDayItems(key, d.items, customArr); const itemCount = orderedItems.length; const itemNodes = orderedItems.map((item, ii) => {
                                const tc     = typeConfig[item.type] || typeConfig.sight;
                                const done   = !!checkedItems[item.id];
                                const noteOn = openNotes[item.id];
                                const noteVal= notes[item.id] || "";
                                const isEditing = editingItem === item.id;
                                const isDragOver = dragOverTarget?.dayKey === key && dragOverTarget?.index === ii;
                                const isBeingDragged = draggingItemId === item.id;
                                return (
                                  <div key={item.id}>
                                    {isDragOver && <div style={{ height:"2px", background:city.color, borderRadius:"2px", margin:"2px 0 4px -24px", opacity:0.75 }} />}
                                    <div
                                      data-d-item={item.id}
                                      data-d-day={key}
                                      data-d-idx={ii}
                                      draggable
                                      onDragStart={e => { dragItemRef.current = { itemId: item.id, fromDayKey: key, item }; setDraggingItemId(item.id); e.dataTransfer.effectAllowed = "move"; }}
                                      onDragEnd={() => { dragItemRef.current = null; setDraggingItemId(null); setDragOverTarget(null); }}
                                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; const rect = e.currentTarget.getBoundingClientRect(); const idx = e.clientY < rect.top + rect.height / 2 ? ii : ii + 1; if (!dragOverTarget || dragOverTarget.dayKey !== key || dragOverTarget.index !== idx) setDragOverTarget({ dayKey: key, index: idx }); }}
                                      onDrop={e => { e.preventDefault(); e.stopPropagation(); if (!dragItemRef.current) return; const { itemId: fromId, fromDayKey, item: dragData } = dragItemRef.current; const dropIdx = dragOverTarget?.index ?? itemCount; if (fromDayKey === key) reorderItemDrag(key, d.items, customArr, fromId, dropIdx); else moveItemToDay(fromDayKey, key, fromId, dropIdx, dragData); dragItemRef.current = null; setDraggingItemId(null); setDragOverTarget(null); }}
                                      style={{ position:"relative", paddingBottom:"14px", opacity: isBeingDragged ? 0.35 : 1, transition:"opacity 0.15s" }}
                                    >
                                    {/* Timeline dot */}
                                    <div style={{
                                      position:"absolute", left:"-18px", top:"4px",
                                      width:"13px", height:"13px", borderRadius:"50%",
                                      background: done ? C.surfaceLow : tc.dot,
                                      border:`3px solid ${C.surface}`,
                                      outline:`1px solid ${done ? C.outlineV : tc.dot}33`,
                                      transition:"all 0.2s",
                                    }} />

                                    {isEditing ? (
                                      /* ── Inline edit form ── */
                                      <div style={{
                                        padding:"12px", borderRadius:"2px",
                                        background:C.surfaceLowest, border:`1px solid ${C.primary}33`,
                                      }}>
                                        <div style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600, marginBottom:"10px" }}>Edit Item</div>
                                        {/* Type pills */}
                                        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"10px" }}>
                                          {Object.entries({ sight:"Sight", food:"Food", coffee:"Coffee", travel:"Travel", hotel:"Hotel", book:"Book" }).map(([val, lbl]) => (
                                            <button key={val} onClick={() => setEditingItemType(val)}
                                            style={{
                                              padding:"3px 10px", borderRadius:"999px", fontSize:"9px", cursor:"pointer",
                                              fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", fontFamily:sans,
                                              background: editingItemType===val ? typeConfig[val].dot : "transparent",
                                              border:`1px solid ${editingItemType===val ? typeConfig[val].dot : C.outlineV}`,
                                              color: editingItemType===val ? "#fff" : C.onSurfaceV,
                                              transition:"all 0.15s",
                                            }}>{lbl}</button>
                                          ))}
                                        </div>
                                        <input autoFocus type="text" defaultValue={item.text} id={`edit-item-text-${item.id}`}
                                          style={{
                                            width:"100%", boxSizing:"border-box", marginBottom:"8px",
                                            background:"transparent", border:"none",
                                            borderBottom:`1px solid ${C.outline}`,
                                            padding:"6px 0", color:C.onSurface, fontSize:"13px",
                                            fontFamily:sans, outline:"none",
                                          }} />
                                        <input type="text" defaultValue={item.map||""} id={`edit-item-map-${item.id}`}
                                          placeholder="Google Maps URL (optional)"
                                          style={{
                                            width:"100%", boxSizing:"border-box", marginBottom:"10px",
                                            background:"transparent", border:"none",
                                            borderBottom:`1px solid ${C.outlineV}`,
                                            padding:"4px 0", color:C.onSurfaceV, fontSize:"11px",
                                            fontFamily:sans, outline:"none",
                                          }} />
                                        <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                                          <button onClick={() => setEditingItem(null)} style={{
                                            padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer",
                                            background:"transparent", border:`1px solid ${C.outlineV}`,
                                            color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px",
                                          }}>CANCEL</button>
                                          <button onClick={() => {
                                            const newText = document.getElementById(`edit-item-text-${item.id}`)?.value || item.text;
                                            const newMap  = document.getElementById(`edit-item-map-${item.id}`)?.value || "";
                                            const patch = { text: newText, type: editingItemType };
                                            if (newMap) patch.map = newMap; else patch.map = null;
                                            updateItem(key, item.id, patch);
                                          }} style={{
                                            padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer",
                                            background:C.primary, border:"none", color:"#fff",
                                            fontFamily:sans, fontWeight:700, letterSpacing:"1px",
                                          }}>SAVE</button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* ── Normal display ── */
                                      <>
                                    <div style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        {/* Type label */}
                                        <div style={{ fontSize:"9px", letterSpacing:"2px", color: done ? C.onSurfaceV : tc.labelColor, fontWeight:700, textTransform:"uppercase", marginBottom:"2px" }}>
                                          {tc.label}
                                        </div>
                                        {/* Item text */}
                                        <div
                                          onClick={() => toggleItem(item.id)}
                                          style={{
                                            fontSize:"13px", color: done ? C.onSurfaceV : C.onSurface,
                                            textDecoration: done ? "line-through" : "none",
                                            lineHeight:1.5, cursor:"pointer", transition:"all 0.18s",
                                            opacity: done ? 0.55 : 1,
                                          }}>
                                          {item.text}
                                        </div>
                                      </div>
                                      {/* Action toggle + map pin */}
                                      <div style={{ flexShrink:0, paddingTop:"2px", display:"flex", gap:"4px", alignItems:"center" }}>
                                        {item.type==="book" && !done && (
                                          <span style={{ fontSize:"7px", color:C.primary, background:`${C.primary}10`, padding:"2px 5px", borderRadius:"2px", letterSpacing:"1px", fontWeight:700 }}>BOOK</span>
                                        )}
                                        {noteVal && !openActions[item.id] && (
                                          <span style={{ fontSize:"9px", opacity:0.5 }}>📝</span>
                                        )}
                                        {/* Map — always visible */}
                                        {item.map && (
                                          <a href={item.map} target="_blank" rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            style={{ textDecoration:"none" }}>
                                            <span style={{
                                              width:"20px", height:"20px", borderRadius:"50%",
                                              display:"inline-flex", alignItems:"center", justifyContent:"center",
                                              fontSize:"11px", cursor:"pointer",
                                            }}>📍</span>
                                          </a>
                                        )}
                                        {/* Touch drag handle — mobile only */}
                                        <span
                                          onTouchStart={e => {
                                            e.stopPropagation();
                                            const touch = e.touches[0];
                                            const itemEl = e.currentTarget.closest("[data-d-item]");
                                            const rect = itemEl ? itemEl.getBoundingClientRect() : { top: touch.clientY - 20, left: touch.clientX - 100 };
                                            const clone = document.createElement("div");
                                            clone.textContent = item.text;
                                            clone.style.cssText = `position:fixed;z-index:9999;pointer-events:none;background:#fff;border-radius:6px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,0.2);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#1a1c1c;max-width:260px;opacity:0.95;border-left:3px solid ${tc.dot};`;
                                            clone.style.top  = rect.top  + "px";
                                            clone.style.left = rect.left + "px";
                                            document.body.appendChild(clone);
                                            touchDragRef.current = { itemId: item.id, fromDayKey: key, item, clone, offX: touch.clientX - rect.left, offY: touch.clientY - rect.top };
                                            dragItemRef.current  = { itemId: item.id, fromDayKey: key, item };
                                            setDraggingItemId(item.id);
                                          }}
                                          style={{
                                            display:"inline-flex", alignItems:"center", justifyContent:"center",
                                            fontSize:"14px", touchAction:"none", userSelect:"none",
                                            color: C.outlineV, padding:"0 2px", opacity:0.55, cursor:"grab",
                                          }}
                                        >⠿</span>
                                        {/* Pencil toggle */}
                                        <span
                                          onClick={e => { e.stopPropagation(); setOpenActions(prev => ({...prev, [item.id]: !prev[item.id]})); }}
                                          style={{
                                            display:"inline-flex", alignItems:"center", justifyContent:"center",
                                            fontSize:"12px", cursor:"pointer",
                                            color: openActions[item.id] ? C.primary : C.onSurfaceV,
                                            opacity: openActions[item.id] ? 1 : 0.45,
                                            transition:"all 0.15s",
                                          }}
                                        >{openActions[item.id] ? "✕" : "✎"}</span>
                                      </div>
                                    </div>

                                    {/* Expanded action tray */}
                                    {openActions[item.id] && (
                                      <div style={{
                                        display:"flex", gap:"6px", alignItems:"center", flexWrap:"wrap",
                                        marginTop:"8px", padding:"8px 10px",
                                        background:C.surfaceLowest, border:`1px solid ${C.outlineV}44`,
                                        borderRadius:"4px",
                                      }}>
                                        {/* Edit text */}
                                        <span
                                          onClick={e => { e.stopPropagation(); setEditingItem(item.id); setEditingItemType(item.type); setOpenActions(prev => ({...prev, [item.id]: false})); }}
                                          title="Edit"
                                          style={{
                                            padding:"4px 10px", borderRadius:"4px",
                                            display:"inline-flex", alignItems:"center", gap:"4px",
                                            fontSize:"10px", fontWeight:600, cursor:"pointer",
                                            color:C.onSurfaceV, background:C.surfaceHigh,
                                            border:`1px solid ${C.outlineV}`,
                                            fontFamily:sans, letterSpacing:"1px",
                                            transition:"all 0.15s",
                                          }}
                                        >✎ EDIT</span>
                                        {/* Move up */}
                                        <span
                                          onClick={e => { e.stopPropagation(); moveItem(key, d.items, customArr, item.id, -1); }}
                                          style={{
                                            padding:"4px 10px", borderRadius:"4px",
                                            display:"inline-flex", alignItems:"center",
                                            fontSize:"10px", fontWeight:600, cursor: ii === 0 ? "default" : "pointer",
                                            color: ii === 0 ? `${C.onSurfaceV}40` : C.onSurfaceV,
                                            background:C.surfaceHigh, border:`1px solid ${C.outlineV}`,
                                            fontFamily:sans, letterSpacing:"1px",
                                            transition:"all 0.15s",
                                          }}
                                        >▲</span>
                                        {/* Move down */}
                                        <span
                                          onClick={e => { e.stopPropagation(); moveItem(key, d.items, customArr, item.id, 1); }}
                                          style={{
                                            padding:"4px 10px", borderRadius:"4px",
                                            display:"inline-flex", alignItems:"center",
                                            fontSize:"10px", fontWeight:600, cursor: ii === itemCount - 1 ? "default" : "pointer",
                                            color: ii === itemCount - 1 ? `${C.onSurfaceV}40` : C.onSurfaceV,
                                            background:C.surfaceHigh, border:`1px solid ${C.outlineV}`,
                                            fontFamily:sans, letterSpacing:"1px",
                                            transition:"all 0.15s",
                                          }}
                                        >▼</span>
                                        {/* Note */}
                                        <span
                                          onClick={e => { e.stopPropagation(); toggleNote(item.id); }}
                                          style={{
                                            padding:"4px 10px", borderRadius:"4px",
                                            display:"inline-flex", alignItems:"center", gap:"4px",
                                            fontSize:"10px", fontWeight:600, cursor:"pointer",
                                            color: noteVal ? C.primary : C.onSurfaceV,
                                            background: noteVal ? `${C.primary}08` : C.surfaceHigh,
                                            border:`1px solid ${noteVal ? C.primary+"33" : C.outlineV}`,
                                            fontFamily:sans, letterSpacing:"1px",
                                            transition:"all 0.15s",
                                          }}
                                        >📝 NOTE</span>
                                        {/* Remove */}
                                        <span
                                          onClick={e => { e.stopPropagation(); item.custom ? deleteCustomItem(key,item.id) : hideItem(item.id); setOpenActions(prev => ({...prev, [item.id]: false})); }}
                                          style={{
                                            padding:"4px 10px", borderRadius:"4px", marginLeft:"auto",
                                            display:"inline-flex", alignItems:"center", gap:"4px",
                                            fontSize:"10px", fontWeight:600, cursor:"pointer",
                                            color:C.primary, background:`${C.primary}08`,
                                            border:`1px solid ${C.primary}22`,
                                            fontFamily:sans, letterSpacing:"1px",
                                            transition:"all 0.15s",
                                          }}
                                        >{item.custom ? "DELETE" : "REMOVE"}</span>
                                      </div>
                                    )}
                                    {/* Note textarea */}
                                    {noteOn && (
                                      <textarea autoFocus value={noteVal} onChange={e => saveNote(item.id, e.target.value)}
                                        placeholder="Confirmation ref, tip, phone number…" rows={2}
                                        style={{
                                          width:"100%", marginTop:"6px", boxSizing:"border-box",
                                          background:C.surfaceLowest, border:`1px solid ${C.outlineV}`,
                                          borderRadius:"2px", padding:"8px 10px", color:C.onSurface,
                                          fontSize:"11px", fontFamily:sans, outline:"none", resize:"vertical",
                                          lineHeight:1.5,
                                        }} />
                                    )}
                                      </>
                                    )}
                                    </div>
                                  </div>
                                );
                              }); const finalDropShown = dragOverTarget?.dayKey === key && dragOverTarget?.index === itemCount; return [...itemNodes, finalDropShown ? <div key="__drop-end" style={{ height:"2px", background:city.color, borderRadius:"2px", margin:"2px 0 4px -24px", opacity:0.75 }} /> : null]; })()}

                              {/* Restore hidden */}
                              {d.items.some(i => hiddenItems[i.id]) && (
                                <div onClick={() => unhideAll(key, d.items)} style={{
                                  fontSize:"10px", color:C.outline, cursor:"pointer", padding:"4px 0", letterSpacing:"1px",
                                }}
                                onMouseEnter={e => e.currentTarget.style.color=C.onSurface}
                                onMouseLeave={e => e.currentTarget.style.color=C.outline}
                                >↩ restore {d.items.filter(i=>hiddenItems[i.id]).length} hidden item(s)</div>
                              )}
                            </div>

                            {/* Add item form */}
                            {addingTo === key && (
                              <div style={{
                                marginTop:"8px", padding:"12px", borderRadius:"2px",
                                background:C.surfaceLowest, border:`1px solid ${C.outlineV}`,
                              }}>
                                {/* Type pills */}
                                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"10px" }}>
                                  {Object.entries({ sight:"Sight", food:"Food", coffee:"Coffee", travel:"Travel", hotel:"Hotel", book:"Book" }).map(([val, lbl]) => (
                                    <button key={val} onClick={() => setDraft(p=>({...p,type:val}))} style={{
                                      padding:"3px 10px", borderRadius:"999px", fontSize:"9px", cursor:"pointer",
                                      fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", fontFamily:sans,
                                      background: draft.type===val ? typeConfig[val].dot : "transparent",
                                      border:`1px solid ${draft.type===val ? typeConfig[val].dot : C.outlineV}`,
                                      color: draft.type===val ? "#fff" : C.onSurfaceV,
                                      transition:"all 0.15s",
                                    }}>{lbl}</button>
                                  ))}
                                </div>
                                <input autoFocus type="text"
                                  placeholder="What did you discover? e.g. 🍣 Sushi Saito — hidden alley, incredible omakase"
                                  value={draft.text}
                                  onChange={e => setDraft(p=>({...p,text:e.target.value}))}
                                  onKeyDown={e => { if(e.key==="Enter") commitAdd(key); if(e.key==="Escape") cancelAdd(); }}
                                  style={{
                                    width:"100%", boxSizing:"border-box", marginBottom:"8px",
                                    background:"transparent", border:"none",
                                    borderBottom:`1px solid ${C.outline}`,
                                    padding:"6px 0", color:C.onSurface, fontSize:"13px",
                                    fontFamily:sans, outline:"none",
                                  }} />
                                <input type="text"
                                  placeholder="Google Maps URL (optional)"
                                  value={draft.map}
                                  onChange={e => setDraft(p=>({...p,map:e.target.value}))}
                                  style={{
                                    width:"100%", boxSizing:"border-box", marginBottom:"10px",
                                    background:"transparent", border:"none",
                                    borderBottom:`1px solid ${C.outlineV}`,
                                    padding:"4px 0", color:C.onSurfaceV, fontSize:"11px",
                                    fontFamily:sans, outline:"none",
                                  }} />
                                <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                                  <button onClick={cancelAdd} style={{
                                    padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer",
                                    background:"transparent", border:`1px solid ${C.outlineV}`,
                                    color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px",
                                  }}>CANCEL</button>
                                  <button onClick={() => commitAdd(key)} disabled={!draft.text.trim()} style={{
                                    padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer",
                                    background: draft.text.trim() ? C.primary : C.surfaceHigh,
                                    border:"none", color: draft.text.trim() ? "#fff" : C.onSurfaceV,
                                    fontFamily:sans, fontWeight:700, letterSpacing:"1px", transition:"all 0.15s",
                                  }}>ADD ↵</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Progress bar */}
            <div style={{ borderTop:`1px solid ${C.outlineV}33`, paddingTop:"20px", marginTop:"8px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                <span style={{ fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600 }}>Itinerary Progress</span>
                <span style={{ fontSize:"9px", letterSpacing:"2px", color:C.primary, fontWeight:700 }}>{tripProgress}% Complete</span>
              </div>
              <div style={{ height:"2px", background:C.surfaceHigh, borderRadius:"2px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${tripProgress}%`, background:C.primary, transition:"width 0.5s ease" }} />
              </div>
            </div>
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === "tasks" && (
          <div>
            {/* Filter pills */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"24px", alignItems:"center" }}>
              {[["all","All"],["pending","Pending"],["done","Done"]].map(([val,lbl]) => (
                <button key={val} onClick={() => setTaskFilter(val)} style={{
                  padding:"4px 12px", borderRadius:"999px", fontSize:"9px", letterSpacing:"2px",
                  fontWeight:700, textTransform:"uppercase", cursor:"pointer", fontFamily:sans,
                  background: taskFilter===val ? C.primary : "transparent",
                  border:`1px solid ${taskFilter===val ? C.primary : C.outlineV}`,
                  color: taskFilter===val ? "#fff" : C.onSurfaceV,
                  transition:"all 0.15s",
                }}>{lbl}</button>
              ))}
              <span style={{ marginLeft:"auto", fontSize:"10px", color:C.onSurfaceV }}>{doneTasks} / {totalTasks} complete</span>
            </div>

            {["critical","high","medium","low"].map(urg => {
              const items = filteredTasks.filter(t => t.urgency===urg);
              if (!items.length) return null;
              const cfg = urgencyConfig[urg];
              const pending = items.filter(t => !checkedTasks[t.id]).length;
              return (
                <div key={urg} style={{ marginBottom:"28px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                    <span style={{ fontSize:"8px", letterSpacing:"3px", color:cfg.color, fontWeight:700, textTransform:"uppercase" }}>{cfg.label}</span>
                    <div style={{ flex:1, height:"1px", background:`${cfg.color}25` }} />
                    <span style={{ fontSize:"9px", color:`${cfg.color}99` }}>
                      {pending > 0 ? `${pending} pending` : "all done ✓"}
                    </span>
                  </div>
                  {items.map(task => {
                    const done = !!checkedTasks[task.id];
                    const base = typeof customTasks==='object'&&!Array.isArray(customTasks)?customTasks:{};
                    if (editingTask === task.id) return (
                      <div key={task.id} onClick={e => e.stopPropagation()} style={{ padding:"12px 14px", marginBottom:"3px", background:C.surfaceLowest, border:`1px solid ${C.primary}33`, borderRadius:"2px" }}>
                        <div style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600, marginBottom:"10px" }}>Edit Task</div>
                        <div style={{ display:"flex", gap:"6px", marginBottom:"8px", flexWrap:"wrap" }}>
                          {["critical","high","medium","low"].map(u => (
                            <button key={u} onClick={() => {
                              const customBase = typeof customTasks==='object'&&!Array.isArray(customTasks)?customTasks:{};
                              const src = customBase[task.id] || taskOverrides[task.id] || task;
                              const updated = { ...src, urgency:u };
                              if (customBase[task.id]) { setCustomTasks({...customBase,[task.id]:updated}); }
                              else { setTaskOverrides(prev => ({...prev,[task.id]:{...prev[task.id],urgency:u}})); }
                            }} style={{
                              padding:"2px 8px", borderRadius:"999px", fontSize:"9px", fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", cursor:"pointer", fontFamily:sans,
                              background: (taskOverrides[task.id]?.urgency||task.urgency)===u ? urgencyConfig[u].color : "transparent",
                              border:`1px solid ${(taskOverrides[task.id]?.urgency||task.urgency)===u ? urgencyConfig[u].color : C.outlineV}`,
                              color: (taskOverrides[task.id]?.urgency||task.urgency)===u ? "#fff" : C.onSurfaceV,
                            }}>{u}</button>
                          ))}
                        </div>
                        <input type="text" defaultValue={task.text} id={`edit-task-text-${task.id}`}
                          style={{ width:"100%", boxSizing:"border-box", marginBottom:"6px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"4px 0", color:C.onSurface, fontSize:"13px", fontFamily:sans, outline:"none" }} />
                        <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
                          <input type="text" defaultValue={task.city} id={`edit-task-city-${task.id}`} placeholder="City"
                            style={{ flex:1, background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", color:C.onSurface, fontSize:"11px", fontFamily:sans, outline:"none" }} />
                          <input type="text" defaultValue={task.url||""} id={`edit-task-url-${task.id}`} placeholder="URL (optional)"
                            style={{ flex:2, background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", color:C.onSurface, fontSize:"11px", fontFamily:sans, outline:"none" }} />
                        </div>
                        <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end" }}>
                          <button onClick={() => setEditingTask(null)} style={{ padding:"4px 12px", borderRadius:"2px", fontSize:"9px", cursor:"pointer", background:"transparent", border:`1px solid ${C.outlineV}`, color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px" }}>CANCEL</button>
                          <button onClick={() => updateTask(task.id, {
                            text: document.getElementById(`edit-task-text-${task.id}`)?.value || task.text,
                            city: document.getElementById(`edit-task-city-${task.id}`)?.value || task.city,
                            url:  document.getElementById(`edit-task-url-${task.id}`)?.value || "",
                            urgency: taskOverrides[task.id]?.urgency || task.urgency,
                          })} style={{ padding:"4px 12px", borderRadius:"2px", fontSize:"9px", cursor:"pointer", background:C.primary, border:"none", color:"#fff", fontFamily:sans, fontWeight:700, letterSpacing:"1px" }}>SAVE</button>
                        </div>
                      </div>
                    );
                    return (
                      <div key={task.id} onClick={() => toggleTask(task.id)} style={{
                        display:"flex", alignItems:"flex-start", gap:"12px",
                        padding:"12px 14px", marginBottom:"3px", cursor:"pointer",
                        background: done ? C.surfaceLow : cfg.bg,
                        border:`1px solid ${done ? C.outlineV+"33" : cfg.color+"20"}`,
                        borderRadius:"2px", transition:"all 0.18s", opacity: done ? 0.5 : 1,
                      }}>
                        <div style={{ width:"16px", height:"16px", borderRadius:"2px", flexShrink:0, marginTop:"1px", border:`2px solid ${done ? cfg.color : cfg.color+"55"}`, background: done ? cfg.color : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {done && <span style={{ color:"#fff", fontSize:"10px", fontWeight:700 }}>✓</span>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"13px", color: done ? C.onSurfaceV : C.onSurface, textDecoration: done ? "line-through" : "none", lineHeight:1.5 }}>{task.text}</div>
                          <div style={{ display:"flex", gap:"10px", marginTop:"4px", alignItems:"center" }}>
                            <span style={{ fontSize:"9px", letterSpacing:"1px", color:`${cfg.color}88`, fontWeight:600 }}>{task.city}</span>
                            {task.url && !done && (
                              <a href={task.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize:"10px", color:C.outline, textDecoration:"none" }}>→ open link</a>
                            )}
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:"4px", flexShrink:0 }}>
                            <span onClick={e => { e.stopPropagation(); setEditingTask(task.id); }}
                              title="Edit"
                              style={{
                                fontSize:"13px", cursor:"pointer", width:"26px", height:"26px",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                borderRadius:"4px", transition:"all 0.15s",
                                color: editingTask===task.id ? C.primary : C.onSurfaceV,
                                background: editingTask===task.id ? `${C.primary}12` : C.surfaceHigh,
                                border:`1px solid ${editingTask===task.id ? C.primary+"44" : C.outlineV}`,
                              }}
                            >✎</span>
                            <span onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                              title="Delete"
                              style={{
                                fontSize:"14px", cursor:"pointer", width:"26px", height:"26px",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                borderRadius:"4px", transition:"all 0.15s",
                                color: C.primary, background:`${C.primary}08`,
                                border:`1px solid ${C.primary}22`,
                              }}
                            >×</span>
                          </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Add booking item */}
            {addingTask ? (
              <div style={{ marginTop:"16px", padding:"16px", background:C.surfaceLowest, border:`1px solid ${C.outlineV}`, borderRadius:"2px" }}>
                <div style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600, marginBottom:"12px" }}>New Booking Task</div>
                <div style={{ display:"flex", gap:"6px", marginBottom:"10px", flexWrap:"wrap" }}>
                  {["critical","high","medium","low"].map(u => (
                    <button key={u} onClick={() => setTaskDraft(p=>({...p,urgency:u}))} style={{
                      padding:"3px 10px", borderRadius:"999px", fontSize:"9px", fontWeight:700,
                      letterSpacing:"1px", textTransform:"uppercase", cursor:"pointer", fontFamily:sans,
                      background: taskDraft.urgency===u ? urgencyConfig[u].color : "transparent",
                      border:`1px solid ${taskDraft.urgency===u ? urgencyConfig[u].color : C.outlineV}`,
                      color: taskDraft.urgency===u ? "#fff" : C.onSurfaceV, transition:"all 0.15s",
                    }}>{u}</button>
                  ))}
                </div>
                <input type="text" placeholder="What needs to be booked?" value={taskDraft.text}
                  onChange={e => setTaskDraft(p=>({...p,text:e.target.value}))}
                  onKeyDown={e => { if(e.key==="Enter") commitTask(); if(e.key==="Escape") setAddingTask(false); }}
                  style={{ width:"100%", boxSizing:"border-box", marginBottom:"8px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"6px 0", color:C.onSurface, fontSize:"13px", fontFamily:sans, outline:"none" }} />
                <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                  <input type="text" placeholder="City (e.g. TOKYO)" value={taskDraft.city}
                    onChange={e => setTaskDraft(p=>({...p,city:e.target.value.toUpperCase()}))}
                    style={{ flex:1, background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", color:C.onSurface, fontSize:"11px", fontFamily:sans, outline:"none" }} />
                  <input type="text" placeholder="Booking URL (optional)" value={taskDraft.url}
                    onChange={e => setTaskDraft(p=>({...p,url:e.target.value}))}
                    style={{ flex:2, background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", color:C.onSurface, fontSize:"11px", fontFamily:sans, outline:"none" }} />
                </div>
                <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                  <button onClick={() => setAddingTask(false)} style={{ padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer", background:"transparent", border:`1px solid ${C.outlineV}`, color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px" }}>CANCEL</button>
                  <button onClick={commitTask} disabled={!taskDraft.text.trim()} style={{ padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer", background: taskDraft.text.trim() ? C.primary : C.surfaceHigh, border:"none", color: taskDraft.text.trim() ? "#fff" : C.onSurfaceV, fontFamily:sans, fontWeight:700, letterSpacing:"1px", transition:"all 0.15s" }}>ADD ↵</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingTask(true)} style={{
                marginTop:"16px", width:"100%", padding:"10px", borderRadius:"2px",
                background:"transparent", border:`1px dashed ${C.outlineV}`,
                color:C.onSurfaceV, fontSize:"10px", cursor:"pointer", letterSpacing:"2px",
                fontWeight:700, textTransform:"uppercase", fontFamily:sans, transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.outlineV; e.currentTarget.style.color=C.onSurfaceV; }}
              >+ Add Booking Task</button>
            )}
          </div>
        )}

        {/* ── BUDGET TAB ── */}
        {activeTab === "budget" && (
          <div>
            {/* Summary */}
            <div style={{
              background:C.surfaceLowest, border:`1px solid ${C.outlineV}33`,
              borderRadius:"4px", padding:"20px", marginBottom:"20px",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px" }}>
                <div>
                  <div style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, marginBottom:"4px", fontWeight:600 }}>Total Budget</div>
                  <div style={{ fontFamily:serif, fontSize:"26px", color:C.onSurface, fontWeight:700 }}>€{totalBudget.toLocaleString()}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, marginBottom:"4px", fontWeight:600 }}>Spent / Committed</div>
                  <div style={{ fontFamily:serif, fontSize:"26px", color:C.primary, fontWeight:700 }}>€{totalSpent.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ height:"2px", background:C.surfaceHigh, borderRadius:"2px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(100,(totalSpent/totalBudget)*100)}%`, background:C.primary, transition:"width 0.4s" }} />
              </div>
              <div style={{ fontSize:"10px", color:C.onSurfaceV, marginTop:"6px", textAlign:"right" }}>
                €{(totalBudget-totalSpent).toLocaleString()} remaining
              </div>
            </div>

            {/* Currency Converter */}
            <div style={{
              background:C.surfaceLowest, border:`1px solid ${C.outlineV}33`,
              borderRadius:"4px", padding:"16px 20px", marginBottom:"20px",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                <div style={{ fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600 }}>
                  💴 Currency Converter
                </div>
                {jpyRate && (
                  <div style={{ fontSize:"10px", color:C.onSurfaceV }}>
                    1€ = ¥{Math.round(1/jpyRate).toLocaleString()}
                    {rateDate !== "fallback" && <span style={{ marginLeft:"6px", fontSize:"9px", color:C.outline }}>· {rateDate}</span>}
                  </div>
                )}
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                {/* Left input */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"9px", letterSpacing:"1px", color:C.onSurfaceV, fontWeight:600, marginBottom:"4px" }}>
                    {converterDir === "jpy-to-eur" ? "JPY ¥" : "EUR €"}
                  </div>
                  <input
                    type="number" min="0" inputMode="decimal"
                    placeholder={converterDir === "jpy-to-eur" ? "1000" : "10"}
                    value={converterDir === "jpy-to-eur" ? jpyAmount : eurAmount}
                    onChange={e => converterDir === "jpy-to-eur" ? handleJpyInput(e.target.value) : handleEurInput(e.target.value)}
                    style={{
                      width:"100%", boxSizing:"border-box",
                      background:"transparent", border:"none",
                      borderBottom:`2px solid ${C.primary}33`,
                      padding:"8px 0", color:C.onSurface,
                      fontSize:"20px", fontFamily:serif, fontWeight:700,
                      outline:"none",
                    }}
                  />
                </div>

                {/* Flip button */}
                <div
                  onClick={flipConverter}
                  style={{
                    width:"32px", height:"32px", borderRadius:"50%",
                    background:C.surfaceHigh, border:`1px solid ${C.outlineV}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", fontSize:"14px", flexShrink:0,
                    transition:"all 0.15s", marginTop:"14px",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background=`${C.primary}12`; e.currentTarget.style.borderColor=C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.background=C.surfaceHigh; e.currentTarget.style.borderColor=C.outlineV; }}
                >⇄</div>

                {/* Right output */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"9px", letterSpacing:"1px", color:C.onSurfaceV, fontWeight:600, marginBottom:"4px" }}>
                    {converterDir === "jpy-to-eur" ? "EUR €" : "JPY ¥"}
                  </div>
                  <div style={{
                    padding:"8px 0",
                    fontSize:"20px", fontFamily:serif, fontWeight:700,
                    color: (converterDir === "jpy-to-eur" ? eurAmount : jpyAmount) ? C.primary : C.outlineV,
                    borderBottom:`2px solid ${C.outlineV}33`,
                    minHeight:"29px",
                  }}>
                    {converterDir === "jpy-to-eur"
                      ? (eurAmount ? `€${eurAmount}` : "—")
                      : (jpyAmount ? `¥${Number(jpyAmount).toLocaleString()}` : "—")}
                  </div>
                </div>
              </div>

              {/* Quick presets */}
              <div style={{ display:"flex", gap:"6px", marginTop:"12px", flexWrap:"wrap" }}>
                {(converterDir === "jpy-to-eur" ? jpyPresets : [5, 10, 20, 50, 100]).map(amt => (
                  <button key={amt}
                    onClick={() => converterDir === "jpy-to-eur" ? handleJpyInput(amt.toString()) : handleEurInput(amt.toString())}
                    style={{
                      padding:"4px 10px", borderRadius:"999px", fontSize:"10px",
                      fontWeight:600, cursor:"pointer", fontFamily:sans,
                      background:"transparent", border:`1px solid ${C.outlineV}`,
                      color:C.onSurfaceV, transition:"all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.outlineV; e.currentTarget.style.color=C.onSurfaceV; }}
                  >
                    {converterDir === "jpy-to-eur" ? `¥${amt.toLocaleString()}` : `€${amt}`}
                  </button>
                ))}
              </div>
            </div>

            {allBudgetCats.map(cat => {
              const isPaid = paidCats[cat.id] !== undefined ? paidCats[cat.id] : cat.paid;
              const catExps = Object.values(expenses[cat.id] || {});
              const expsTotal = catExps.reduce((s, e) => s + (e.amountEur || 0), 0);
              const spent  = catExps.length > 0 ? expsTotal : (Number(spentAmts[cat.id]) || (isPaid ? cat.total : 0));
              const pct    = Math.min(100, (spent/cat.total)*100);
              const expOpen = openExpenses[cat.id];
              const isEditing = editingBudget === cat.id;
              return (
                <div key={cat.id} style={{
                  background:C.surfaceLowest,
                  border:`1px solid ${isEditing ? C.primary+"33" : C.outlineV+"22"}`,
                  borderRadius:"2px", padding:"14px 16px", marginBottom:"8px",
                }}>
                  {isEditing ? (
                    // ── Inline edit form ──
                    <div>
                      <div style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600, marginBottom:"10px" }}>Edit Category</div>
                      <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                        <input type="text" defaultValue={cat.emoji} id={`edit-bgt-emoji-${cat.id}`}
                          style={{ width:"52px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", fontSize:"20px", fontFamily:sans, outline:"none", textAlign:"center" }} />
                        <input type="text" defaultValue={cat.label} id={`edit-bgt-label-${cat.id}`}
                          style={{ flex:1, background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"4px 0", color:C.onSurface, fontSize:"13px", fontFamily:sans, outline:"none" }} />
                        <span style={{ fontSize:"12px", color:C.onSurfaceV, alignSelf:"flex-end", paddingBottom:"4px" }}>€</span>
                        <input type="number" defaultValue={cat.total} id={`edit-bgt-total-${cat.id}`}
                          style={{ width:"80px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"4px 0", color:C.onSurface, fontSize:"13px", fontFamily:sans, outline:"none" }} />
                      </div>
                      <input type="text" defaultValue={cat.note||""} id={`edit-bgt-note-${cat.id}`}
                        placeholder="Note (optional)"
                        style={{ width:"100%", boxSizing:"border-box", marginBottom:"10px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", color:C.onSurfaceV, fontSize:"11px", fontFamily:sans, outline:"none" }} />
                      <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end" }}>
                        <button onClick={() => setEditingBudget(null)} style={{ padding:"4px 12px", borderRadius:"2px", fontSize:"9px", cursor:"pointer", background:"transparent", border:`1px solid ${C.outlineV}`, color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px" }}>CANCEL</button>
                        <button onClick={() => updateBudgetCat(cat.id, {
                          emoji: document.getElementById(`edit-bgt-emoji-${cat.id}`)?.value || cat.emoji,
                          label: document.getElementById(`edit-bgt-label-${cat.id}`)?.value || cat.label,
                          total: document.getElementById(`edit-bgt-total-${cat.id}`)?.value || cat.total,
                          note:  document.getElementById(`edit-bgt-note-${cat.id}`)?.value || "",
                        })} style={{ padding:"4px 12px", borderRadius:"2px", fontSize:"9px", cursor:"pointer", background:C.primary, border:"none", color:"#fff", fontFamily:sans, fontWeight:700, letterSpacing:"1px" }}>SAVE</button>
                      </div>
                    </div>
                  ) : (
                    <>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                    <span style={{ fontSize:"16px" }}>{cat.emoji}</span>
                    <span style={{ fontFamily:serif, fontSize:"14px", color:C.onSurface, flex:1 }}>{cat.label}</span>
                    <span style={{ fontSize:"11px", color:C.onSurfaceV }}>€{cat.total.toLocaleString()}</span>
                    <div onClick={() => markPaid(cat.id, !isPaid)} style={{
                      padding:"3px 10px", borderRadius:"2px", fontSize:"9px", letterSpacing:"1px",
                      fontWeight:700, textTransform:"uppercase", cursor:"pointer", fontFamily:sans,
                      background: isPaid ? "#04785710" : "transparent",
                      border:`1px solid ${isPaid ? "#047857" : C.outlineV}`,
                      color: isPaid ? "#047857" : C.onSurfaceV, transition:"all 0.2s",
                    }}>{isPaid ? "✓ PAID" : "MARK PAID"}</div>
                    <div style={{ display:"flex", gap:"4px" }}>
                        <span onClick={() => setEditingBudget(cat.id)}
                          title="Edit"
                          style={{
                            fontSize:"13px", cursor:"pointer", width:"26px", height:"26px",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            borderRadius:"4px", transition:"all 0.15s",
                            color: editingBudget===cat.id ? C.primary : C.onSurfaceV,
                            background: editingBudget===cat.id ? `${C.primary}12` : C.surfaceHigh,
                            border:`1px solid ${editingBudget===cat.id ? C.primary+"44" : C.outlineV}`,
                          }}
                        >✎</span>
                        <span onClick={() => deleteBudgetCat(cat.id)}
                          title="Delete"
                          style={{
                            fontSize:"14px", cursor:"pointer", width:"26px", height:"26px",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            borderRadius:"4px", transition:"all 0.15s",
                            color: C.primary, background:`${C.primary}08`,
                            border:`1px solid ${C.primary}22`,
                          }}
                        >×</span>
                      </div>
                  </div>
                  <div style={{ height:"2px", background:C.surfaceHigh, borderRadius:"2px", overflow:"hidden", marginBottom:"8px" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background: isPaid ? "#047857" : C.primary, transition:"width 0.4s" }} />
                  </div>
                  {cat.note && <div style={{ fontSize:"10px", color:C.onSurfaceV, marginBottom:"8px" }}>{cat.note}</div>}
                  {/* Expenses accordion */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}
                    onClick={() => setOpenExpenses(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}>
                    <span style={{ fontSize:"9px", letterSpacing:"1px", fontWeight:700, textTransform:"uppercase", color: expOpen ? C.primary : C.onSurfaceV, flex:1 }}>
                      {catExps.length > 0 ? `Expenses (${catExps.length})` : "Expenses"} {expOpen ? "▲" : "▼"}
                    </span>
                    {catExps.length > 0 && <span style={{ fontSize:"11px", fontWeight:700, color:C.primary }}>€{expsTotal.toFixed(2)}</span>}
                    {catExps.length === 0 && !expOpen && (
                      <span style={{ fontSize:"10px", color:C.onSurfaceV }}>spent € <input type="number" min="0"
                        value={spentAmts[cat.id]!==undefined ? spentAmts[cat.id] : (isPaid ? cat.total : "")}
                        placeholder="0" onClick={e => e.stopPropagation()}
                        onChange={e => updateSpent(cat.id, e.target.value)}
                        style={{ width:"60px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"2px 0", color:C.onSurface, fontSize:"11px", fontFamily:sans, outline:"none", textAlign:"right" }} /></span>
                    )}
                  </div>
                  {expOpen && (
                    <div style={{ marginTop:"10px", borderTop:`1px solid ${C.outlineV}22`, paddingTop:"10px" }}>
                      {catExps.length === 0 && <div style={{ fontSize:"11px", color:C.onSurfaceV, opacity:0.5, padding:"4px 0 8px", textAlign:"center" }}>No expenses yet</div>}
                      {catExps.map(exp => {
                        const isEditThis = editingExp?.catId === cat.id && editingExp?.expId === exp.id;
                        return (
                          <div key={exp.id} style={{ borderBottom:`1px solid ${C.outlineV}11` }}>
                            {isEditThis ? (
                              <div style={{ padding:"8px 0", display:"flex", flexDirection:"column", gap:"6px" }}>
                                <div style={{ display:"flex", gap:"6px", alignItems:"flex-end" }}>
                                  <input type="text" value={expEditDraft.name} onChange={e => setExpEditDraft(p=>({...p,name:e.target.value}))}
                                    style={{ flex:2, background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"4px 0", fontSize:"12px", color:C.onSurface, fontFamily:sans, outline:"none" }} />
                                  <input type="number" min="0" value={expEditDraft.amount} onChange={e => setExpEditDraft(p=>({...p,amount:e.target.value}))}
                                    style={{ flex:1, background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"4px 0", fontSize:"12px", color:C.onSurface, fontFamily:sans, outline:"none", textAlign:"right" }} />
                                  <div onClick={() => setExpEditDraft(p=>({...p, currency: p.currency==="jpy"?"eur":"jpy"}))}
                                    style={{ padding:"3px 8px", borderRadius:"2px", fontSize:"10px", fontWeight:700, cursor:"pointer", border:`1px solid ${C.outlineV}`, color:C.onSurfaceV, whiteSpace:"nowrap", flexShrink:0 }}>
                                    {expEditDraft.currency==="jpy"?"¥ JPY":"€ EUR"}</div>
                                </div>
                                {expEditDraft.currency==="jpy" && expEditDraft.amount && jpyRate && (
                                  <div style={{ fontSize:"10px", color:C.onSurfaceV }}>= €{(Number(expEditDraft.amount)*jpyRate).toFixed(2)}</div>
                                )}
                                <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end" }}>
                                  <button onClick={() => setEditingExp(null)} style={{ padding:"3px 10px", borderRadius:"2px", fontSize:"9px", cursor:"pointer", background:"transparent", border:`1px solid ${C.outlineV}`, color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px" }}>CANCEL</button>
                                  <button onClick={() => saveExpense(cat.id, exp.id)} style={{ padding:"3px 10px", borderRadius:"2px", fontSize:"9px", cursor:"pointer", background:C.primary, border:"none", color:"#fff", fontFamily:sans, fontWeight:700, letterSpacing:"1px" }}>SAVE</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 0" }}>
                                <span style={{ flex:1, fontSize:"12px", color:C.onSurface }}>{exp.name}</span>
                                {exp.amountJpy && <span style={{ fontSize:"10px", color:C.onSurfaceV }}>¥{exp.amountJpy.toLocaleString()}</span>}
                                <span style={{ fontSize:"12px", fontWeight:600, color:C.onSurface, minWidth:"52px", textAlign:"right" }}>€{(exp.amountEur||0).toFixed(2)}</span>
                                <span onClick={() => { setEditingExp({ catId:cat.id, expId:exp.id }); setExpEditDraft({ name:exp.name, amount: exp.amountJpy ? String(exp.amountJpy) : String(exp.amountEur||""), currency: exp.amountJpy ? "jpy" : "eur" }); }}
                                  style={{ fontSize:"12px", cursor:"pointer", color:C.onSurfaceV, opacity:0.6, padding:"2px 4px" }}>✎</span>
                                <span onClick={() => deleteExpense(cat.id, exp.id)}
                                  style={{ fontSize:"15px", cursor:"pointer", color:C.primary, opacity:0.7, padding:"2px 4px" }}>×</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Add expense row */}
                      <div style={{ marginTop:"8px" }}>
                        <div style={{ display:"flex", gap:"6px", alignItems:"flex-end" }}>
                          <input type="text" placeholder="Expense name"
                            value={(expDraft[cat.id]||{}).name||""}
                            onChange={e => setExpDraft(prev => ({ ...prev, [cat.id]: { ...(prev[cat.id]||{}), name: e.target.value } }))}
                            onKeyDown={e => { if (e.key==="Enter") addExpense(cat.id); }}
                            style={{ flex:2, background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", fontSize:"12px", color:C.onSurface, fontFamily:sans, outline:"none" }} />
                          <input type="number" min="0" placeholder="0"
                            value={(expDraft[cat.id]||{}).amount||""}
                            onChange={e => setExpDraft(prev => ({ ...prev, [cat.id]: { ...(prev[cat.id]||{}), amount: e.target.value } }))}
                            onKeyDown={e => { if (e.key==="Enter") addExpense(cat.id); }}
                            style={{ flex:1, background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", fontSize:"12px", color:C.onSurface, fontFamily:sans, outline:"none", textAlign:"right" }} />
                          <div onClick={() => setExpDraft(prev => ({ ...prev, [cat.id]: { ...(prev[cat.id]||{}), currency: (prev[cat.id]||{}).currency==="jpy"?"eur":"jpy" } }))}
                            style={{ padding:"3px 8px", borderRadius:"2px", fontSize:"10px", fontWeight:700, cursor:"pointer", border:`1px solid ${C.outlineV}`, color:C.onSurfaceV, whiteSpace:"nowrap", flexShrink:0 }}>
                            {(expDraft[cat.id]||{}).currency==="jpy"?"¥ JPY":"€ EUR"}</div>
                          <button onClick={() => addExpense(cat.id)}
                            style={{ padding:"4px 10px", borderRadius:"2px", fontSize:"10px", fontWeight:700, cursor:"pointer", background:C.primary, border:"none", color:"#fff", fontFamily:sans, letterSpacing:"1px", whiteSpace:"nowrap", flexShrink:0 }}>ADD</button>
                        </div>
                        {(expDraft[cat.id]||{}).currency==="jpy" && (expDraft[cat.id]||{}).amount && jpyRate && (
                          <div style={{ fontSize:"10px", color:C.onSurfaceV, marginTop:"4px" }}>
                            = €{(Number((expDraft[cat.id]||{}).amount)*jpyRate).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Add budget category */}
            {addingBudget ? (
              <div style={{ marginTop:"8px", padding:"16px", background:C.surfaceLowest, border:`1px solid ${C.outlineV}`, borderRadius:"2px" }}>
                <div style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600, marginBottom:"12px" }}>New Budget Category</div>
                <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                  <input type="text" placeholder="Emoji" value={budgetDraft.emoji}
                    onChange={e => setBudgetDraft(p=>({...p,emoji:e.target.value}))}
                    style={{ width:"52px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"6px 0", fontSize:"20px", fontFamily:sans, outline:"none", textAlign:"center" }} />
                  <input type="text" placeholder="Category name" value={budgetDraft.label}
                    onChange={e => setBudgetDraft(p=>({...p,label:e.target.value}))}
                    style={{ flex:1, background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"6px 0", color:C.onSurface, fontSize:"13px", fontFamily:sans, outline:"none" }} />
                  <span style={{ fontSize:"12px", color:C.onSurfaceV, alignSelf:"flex-end", paddingBottom:"6px" }}>€</span>
                  <input type="number" placeholder="Budget" value={budgetDraft.total}
                    onChange={e => setBudgetDraft(p=>({...p,total:e.target.value}))}
                    style={{ width:"80px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outline}`, padding:"6px 0", color:C.onSurface, fontSize:"13px", fontFamily:sans, outline:"none" }} />
                </div>
                <input type="text" placeholder="Note (optional)" value={budgetDraft.note}
                  onChange={e => setBudgetDraft(p=>({...p,note:e.target.value}))}
                  style={{ width:"100%", boxSizing:"border-box", marginBottom:"10px", background:"transparent", border:"none", borderBottom:`1px solid ${C.outlineV}`, padding:"4px 0", color:C.onSurfaceV, fontSize:"11px", fontFamily:sans, outline:"none" }} />
                <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                  <button onClick={() => setAddingBudget(false)} style={{ padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer", background:"transparent", border:`1px solid ${C.outlineV}`, color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px" }}>CANCEL</button>
                  <button onClick={commitBudgetCat} disabled={!budgetDraft.label.trim()||!budgetDraft.total} style={{ padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer", background: (budgetDraft.label.trim()&&budgetDraft.total) ? C.primary : C.surfaceHigh, border:"none", color: (budgetDraft.label.trim()&&budgetDraft.total) ? "#fff" : C.onSurfaceV, fontFamily:sans, fontWeight:700, letterSpacing:"1px", transition:"all 0.15s" }}>ADD ↵</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingBudget(true)} style={{
                marginTop:"8px", width:"100%", padding:"10px", borderRadius:"2px",
                background:"transparent", border:`1px dashed ${C.outlineV}`,
                color:C.onSurfaceV, fontSize:"10px", cursor:"pointer", letterSpacing:"2px",
                fontWeight:700, textTransform:"uppercase", fontFamily:sans, transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.outlineV; e.currentTarget.style.color=C.onSurfaceV; }}
              >+ Add Budget Category</button>
            )}
          </div>
        )}
        {/* ── PACKING TAB ── */}
        {activeTab === "packing" && (() => {
          const items = Object.values(packingItems);
          const total = items.length;
          const packed = items.filter(i => i.checked).length;
          const allPacked = total > 0 && packed === total;
          return (
            <div>
              {/* Header row */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                <div>
                  <div style={{ fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", color:C.onSurfaceV, fontWeight:600, marginBottom:"4px" }}>Packing List</div>
                  {total > 0 && (
                    <div style={{ fontSize:"12px", color: allPacked ? "#047857" : C.onSurfaceV }}>
                      {packed}/{total} packed{allPacked ? " ✓" : ""}
                    </div>
                  )}
                </div>
                {packed > 0 && (
                  <button onClick={clearPackingChecks} style={{
                    padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer",
                    background:"transparent", border:`1px solid ${C.outlineV}`,
                    color:C.onSurfaceV, fontFamily:sans, fontWeight:600, letterSpacing:"1px",
                  }}>CLEAR CHECKS</button>
                )}
              </div>

              {/* Progress bar */}
              {total > 0 && (
                <div style={{ marginBottom:"24px" }}>
                  <div style={{ height:"2px", background:C.surfaceHigh, borderRadius:"2px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.round((packed/total)*100)}%`, background: allPacked ? "#047857" : C.primary, transition:"width 0.4s ease" }} />
                  </div>
                </div>
              )}

              {/* Items */}
              <div style={{ marginBottom:"16px" }}>
                {total === 0 && (
                  <div style={{ textAlign:"center", padding:"32px 0", color:C.onSurfaceV, fontSize:"13px", opacity:0.6 }}>
                    No items yet — add something below
                  </div>
                )}
                {items.map(item => (
                  <div key={item.id} style={{
                    display:"flex", alignItems:"center", gap:"12px",
                    padding:"10px 0", borderBottom:`1px solid ${C.outlineV}22`,
                  }}>
                    {/* Checkbox */}
                    <div onClick={() => togglePackingItem(item.id)} style={{
                      width:"18px", height:"18px", borderRadius:"3px", flexShrink:0, cursor:"pointer",
                      border:`2px solid ${item.checked ? C.primary : C.outlineV}`,
                      background: item.checked ? C.primary : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.15s",
                    }}>
                      {item.checked && <span style={{ color:"#fff", fontSize:"11px", lineHeight:1, fontWeight:700 }}>✓</span>}
                    </div>
                    {/* Text */}
                    <span onClick={() => togglePackingItem(item.id)} style={{
                      flex:1, fontSize:"14px", cursor:"pointer",
                      color: item.checked ? C.onSurfaceV : C.onSurface,
                      textDecoration: item.checked ? "line-through" : "none",
                      opacity: item.checked ? 0.5 : 1,
                      transition:"all 0.18s",
                    }}>{item.text}</span>
                    {/* Delete */}
                    <span onClick={() => deletePackingItem(item.id)} style={{
                      fontSize:"16px", cursor:"pointer", color:C.outlineV, flexShrink:0,
                      lineHeight:1, padding:"2px 4px",
                      transition:"color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color=C.primary}
                    onMouseLeave={e => e.currentTarget.style.color=C.outlineV}
                    >×</span>
                  </div>
                ))}
              </div>

              {/* Add item input */}
              <div style={{
                display:"flex", gap:"8px", alignItems:"center",
                padding:"10px 12px", borderRadius:"2px",
                background:C.surfaceLowest, border:`1px solid ${C.outlineV}`,
              }}>
                <input
                  type="text"
                  placeholder="Add item… e.g. Passport, adapter, yen cash"
                  value={packingDraft}
                  onChange={e => setPackingDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addPackingItem(); }}
                  style={{
                    flex:1, background:"transparent", border:"none", outline:"none",
                    fontSize:"13px", color:C.onSurface, fontFamily:sans,
                  }}
                />
                <button onClick={addPackingItem} disabled={!packingDraft.trim()} style={{
                  padding:"5px 14px", borderRadius:"2px", fontSize:"10px", cursor:"pointer",
                  background: packingDraft.trim() ? C.primary : C.surfaceHigh,
                  border:"none", color: packingDraft.trim() ? "#fff" : C.onSurfaceV,
                  fontFamily:sans, fontWeight:700, letterSpacing:"1px", flexShrink:0,
                  transition:"all 0.15s",
                }}>ADD ↵</button>
              </div>
            </div>
          );
        })()}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:50,
        background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
        borderTop:`1px solid ${C.outlineV}33`,
        boxShadow:`0 -12px 32px rgba(143,0,32,0.06)`,
        display:"flex", justifyContent:"space-around", alignItems:"center", height:"72px",
      }}>
        {[
          { tab:"itinerary", icon:"calendar_today",       label:"Day by Day" },
          { tab:"tasks",     icon:"confirmation_number",  label:"Bookings"   },
          { tab:"budget",    icon:"payments",             label:"Budget"     },
          { tab:"packing",   icon:"luggage",              label:"Packing"    },
        ].map(item => {
          const active = activeTab === item.tab;
          return (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:"3px",
              background:"transparent", border:"none", cursor:"pointer",
              color: active ? C.primary : `${C.charcoal}55`,
              transition:"all 0.2s", padding:"8px 16px",
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize:"22px",
                fontVariationSettings: active ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
              }}>{item.icon}</span>
              <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", fontFamily:sans }}>
                {item.label}{item.tab==="tasks" && criticalLeft>0 ? ` · ${criticalLeft}` : ""}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
