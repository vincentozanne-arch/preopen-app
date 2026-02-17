import { useState, useEffect, createContext, useContext, useRef } from "react";

/* ═══ THEMES (Qonto-inspired) ═══ */
const themes = {
  dark: {
    bg:"#0E0E14",bgCard:"#17171F",bgEl:"#1E1E28",bgHov:"#262630",bgSb:"#0A0A10",
    brd:"rgba(255,255,255,0.07)",gold:"#C9A96E",goldL:"#E8D5A8",
    acc:"#6C5CE7",em:"#00D2A0",cor:"#FF6B6B",amb:"#FFC43D",
    vio:"#A78BFA",pink:"#F472B6",teal:"#2DD4BF",
    tx:"#EAECF0",txM:"#8B8FA3",txD:"#52556B",
    inBg:"#111118",shd:"0 1px 2px rgba(0,0,0,0.4)",
    grad:"linear-gradient(180deg,#0E0E14 0%,#111118 100%)",
    sbTx:"#C8CAD4",sbTxD:"#56586A",sbHov:"rgba(255,255,255,0.04)"
  },
  light: {
    bg:"#F5F5F7",bgCard:"#FFFFFF",bgEl:"#F0F0F4",bgHov:"#E8E8ED",bgSb:"#1A1625",
    brd:"rgba(0,0,0,0.06)",gold:"#9E7C3C",goldL:"#7A5F2A",
    acc:"#5B4CC4",em:"#0BB58A",cor:"#E04545",amb:"#D49A10",
    vio:"#7C5CC4",pink:"#D44F8A",teal:"#1AAA9A",
    tx:"#16161D",txM:"#5A5B6A",txD:"#8B8C99",
    inBg:"#FFFFFF",shd:"0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
    grad:"linear-gradient(180deg,#F5F5F7 0%,#EEEEF2 100%)",
    sbTx:"#C8CAD4",sbTxD:"#56586A",sbHov:"rgba(255,255,255,0.04)"
  }
};

const FN = "'Inter',sans-serif";
const FB = "'Inter',sans-serif";
const TC = createContext();
const uT = () => useContext(TC);
const AC = createContext();

/* ═══ UTILITIES ═══ */
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const fmt = (n, d=0) => {
  if (n == null || isNaN(n)) return "\u2014";
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fK = n => {
  if (n == null || isNaN(n)) return "\u2014";
  if (Math.abs(n) >= 1e6) return `${(n/1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n/1e3).toFixed(1)}K`;
  return fmt(n);
};
const fC = (n, c="SAR") => {
  if (n == null || isNaN(n)) return "\u2014";
  const s = { SAR:"SAR ", USD:"$", EUR:"\u20ac", AED:"AED ", GBP:"\u00a3" }[c] || c+" ";
  return s + fK(n);
};
const pct = n => n == null ? "\u2014" : `${(n*100).toFixed(1)}%`;
const ago = d => {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms/60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

/* ═══ MASTER DATA ═══ */
const GRADES = [
  {id:"10",label:"General Manager"},{id:"9",label:"Resident Manager"},
  {id:"8",label:"Executive Committee"},{id:"7a",label:"Director / HODs"},
  {id:"7b",label:"Asst Director"},{id:"6",label:"Manager II"},
  {id:"5",label:"Manager I"},{id:"4",label:"Asst. Manager"},
  {id:"3",label:"Supervisor"},{id:"2",label:"Front Line II"},{id:"1",label:"Front Line I"}
];

const SAL = {
  "10":{b:55000,h:16667,t:0,med:5558,sch:9667,meal:1550,ph:700,bon:.2,si:.02,sev:.0833,vac:.0833,air:5000,li:200,util:0,laun:500,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:15000},
  "9":{b:40000,h:12500,t:0,med:4275,sch:7733,meal:1550,ph:700,bon:.2,si:.02,sev:.0833,vac:.0833,air:4000,li:200,util:0,laun:400,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:12000},
  "8":{b:25000,h:9167,t:0,med:2992,sch:5800,meal:1550,ph:700,bon:.2,si:.02,sev:.0417,vac:.0417,air:3000,li:200,util:0,laun:300,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:10000},
  "7a":{b:15000,h:7917,t:0,med:1935,sch:5800,meal:1550,ph:700,bon:.2,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:200,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:8000},
  "7b":{b:10000,h:5417,t:0,med:1627,sch:0,meal:750,ph:350,bon:.15,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:150,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:6000},
  "6":{b:8000,h:5833,t:0,med:1627,sch:0,meal:750,ph:350,bon:.1,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:0,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:5000},
  "5":{b:6000,h:4583,t:0,med:1319,sch:0,meal:750,ph:350,bon:.1,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:0,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:4000},
  "4":{b:4500,h:2917,t:417,med:1011,sch:0,meal:500,ph:0,bon:.08,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:0,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:3000},
  "3":{b:3800,h:1750,t:417,med:856,sch:0,meal:350,ph:0,bon:.05,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:0,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:2500},
  "2":{b:3500,h:1167,t:417,med:740,sch:0,meal:250,ph:0,bon:.05,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:0,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:2000},
  "1":{b:2800,h:833,t:417,med:548,sch:0,meal:250,ph:0,bon:.05,si:.1125,sev:.0417,vac:.0833,air:83,li:200,util:0,laun:0,wc:.005,pen:0,etax:0,eoth:0,obon:0,supp:0,reloc:2000}
};

const DIVS = [
  {id:"A&G",color:"#5B8DEF"},{id:"Rooms",color:"#34D399"},{id:"F&B",color:"#FBBF24"},
  {id:"S&M",color:"#F472B6"},{id:"IT",color:"#A78BFA"},{id:"POM",color:"#2DD4BF"},
  {id:"Spa",color:"#38BDF8"},{id:"Golf",color:"#4ADE80"},{id:"Parking",color:"#94A3B8"},
  {id:"Utilities",color:"#78716C"},{id:"Non Op.",color:"#FB7185"}
];

const DEPTS = {
  "A&G":["General","Finance","Purchasing","Security","Talent & Culture","L&D"],
  "Rooms":["Front Office","Housekeeping","Laundry","Concierge","Guest Relations"],
  "F&B":["Culinary","Stewarding","Restaurant","Bar & Lounge","Room Service","Banquets"],
  "S&M":["Sales","Marketing","Digital","PR","Revenue Mgmt","Loyalty"],
  "IT":["IT"],"POM":["Engineering"],"Spa":["Health Club/Spa"],
  "Golf":["Golf/Pro Shop"],"Parking":["Parking"],"Utilities":["Utilities"],"Non Op.":["Non Op. I&E"]
};

const USALI = ["Agency Fees","Bank Charges","Contract Services","Human Resources","Information Systems",
  "Licenses and Permits","Media","Printing and Stationery","Security","Staff Transportation",
  "Supplies (Pre-opening set up)","Taskforce","Telecommunications","Training","Website",
  "Equipment Rental","Furniture and Equipment"];
const BASES = ["Per hotel","FTE count","# of FTE grade 5+","# of FTE grade 8+","Per key","# of A&G FTE","# of F&B FTE","Recruitment expenses","Project specific","Country","Segment"];
const RECS = ["Monthly","Annually","One-time (onboarded)","One-time M-1","One-time M-2","One-time M-3",
  "One-time M-4","One-time M-5","One-time M-6","One-time M-8","One-time M-10","One-time M-12","Manual"];

const getSalMatrix = (project) => {
  if (!project || !project.salaryOverrides) return SAL;
  const merged = {};
  for (const g of Object.keys(SAL)) {
    merged[g] = project.salaryOverrides[g] ? { ...SAL[g], ...project.salaryOverrides[g] } : SAL[g];
  }
  return merged;
};

const cPkg = (g, mx) => {
  const s = mx || SAL; const m = s[g]; if (!m) return 0;
  return m.b + m.h + m.t + (m.util||0) + m.sch + m.meal + (m.laun||0) + m.ph
    + m.med + m.li + m.b*(m.wc||0) + m.b*(m.pen||0) + m.b*m.si + m.b*(m.etax||0) + (m.eoth||0)
    + m.b*m.bon/12 + m.b*(m.obon||0)/12 + m.b*m.sev + m.b*m.vac + (m.supp||0) + m.air/12;
};
const cDet = (g, mx) => {
  const s = mx || SAL; const m = s[g]; if (!m) return {};
  return { basic:m.b, h:m.h, t:m.t, util:m.util||0, sch:m.sch, meal:m.meal, laun:m.laun||0, ph:m.ph,
    med:m.med, li:m.li, wc:m.b*(m.wc||0), pen:m.b*(m.pen||0), si:m.b*m.si, etax:m.b*(m.etax||0), eoth:m.eoth||0,
    bonus:m.b*m.bon/12, obon:m.b*(m.obon||0)/12, sev:m.b*m.sev, vac:m.b*m.vac, supp:m.supp||0, air:m.air/12,
    reloc:m.reloc||0 };
};

const calcManningCashflow = (position, preOpenMonths, matrix) => {
  const totalSlots = (preOpenMonths || 18) + 4 + 1;
  const flow = new Array(totalSlots).fill(0);
  const mx = matrix || SAL;
  const monthly = cPkg(position.grade, mx) * position.hc;
  const m = mx[position.grade];
  const relocTotal = (m ? (m.reloc || 0) : 0) * position.hc;
  const startIdx = (preOpenMonths || 18) - position.startM;
  if (startIdx < 0) return flow;
  for (let i = startIdx; i < totalSlots; i++) {
    flow[i] += monthly;
  }
  if (startIdx < totalSlots) flow[startIdx] += relocTotal;
  return flow;
};

const ROLES = {
  superadmin: { label:"Super Admin", color:"#F97316", icon:"\ud83d\udc51", desc:"Platform owner. Full access." },
  admin: { label:"Client Admin", color:"#A78BFA", icon:"\ud83d\udd10", desc:"Manages users, projects, settings." },
  budget_manager: { label:"Budget Manager", color:"#5B8DEF", icon:"\ud83d\udcca", desc:"Creates and edits budgets." },
  viewer: { label:"Viewer", color:"#34D399", icon:"\ud83d\udc41", desc:"Read-only budget access." },
  approver: { label:"Approver", color:"#FBBF24", icon:"\u2713", desc:"Reviews and approves budgets." }
};

/* ═══ SAMPLE DATA ═══ */
const initClients = () => [
  {id:"c1",name:"Red Sea Global",logo:"RSG",plan:"enterprise",seats:25,created:"2024-06-15",color:"#C9A96E",domain:"redsea.preopen.io",status:"active",country:"Saudi Arabia",contactName:"Ahmed Al-Rashid"},
  {id:"c2",name:"Marriott International",logo:"MAR",plan:"enterprise",seats:50,created:"2024-08-22",color:"#BE2026",domain:"marriott.preopen.io",status:"active",country:"United States",contactName:"Sarah Chen"},
  {id:"c3",name:"Aman Resorts",logo:"AMN",plan:"professional",seats:10,created:"2024-11-03",color:"#1A1A1A",domain:"aman.preopen.io",status:"active",country:"Singapore",contactName:"Yuki Tanaka"},
  {id:"c4",name:"Kerzner International",logo:"KER",plan:"professional",seats:15,created:"2025-01-10",color:"#00447C",domain:"kerzner.preopen.io",status:"trial",country:"UAE",contactName:"James Mitchell"}
];

const initUsers = () => [
  {id:"u1",name:"Ahmed Al-Rashid",email:"ahmed@rsg.sa",role:"admin",clientId:"c1",status:"active",lastActive:"2026-02-12T09:30:00",projects:["p1","p2","p3","p4"]},
  {id:"u2",name:"Nora Al-Faisal",email:"nora@rsg.sa",role:"budget_manager",clientId:"c1",status:"active",lastActive:"2026-02-12T08:15:00",projects:["p1","p2"]},
  {id:"u3",name:"Tariq Hassan",email:"tariq@rsg.sa",role:"budget_manager",clientId:"c1",status:"active",lastActive:"2026-02-11T16:40:00",projects:["p3","p4"]},
  {id:"u4",name:"David Park",email:"david@rsg.sa",role:"viewer",clientId:"c1",status:"active",lastActive:"2026-02-10T11:00:00",projects:["p1"]},
  {id:"u5",name:"Lisa Wang",email:"lisa@rsg.sa",role:"approver",clientId:"c1",status:"active",lastActive:"2026-02-12T07:45:00",projects:["p1","p2","p3","p4"]},
  {id:"u6",name:"Omar Khalil",email:"omar@rsg.sa",role:"budget_manager",clientId:"c1",status:"invited",lastActive:null,projects:["p2"]},
  {id:"u7",name:"Sarah Chen",email:"sarah@marriott.com",role:"admin",clientId:"c2",status:"active",lastActive:"2026-02-12T10:00:00",projects:["p5","p6"]},
  {id:"u8",name:"Yuki Tanaka",email:"yuki@aman.com",role:"admin",clientId:"c3",status:"active",lastActive:"2026-02-11T14:00:00",projects:["p7"]},
  {id:"su1",name:"You (Platform Owner)",email:"admin@preopen.io",role:"superadmin",clientId:null,status:"active",lastActive:"2026-02-12T10:30:00",projects:[]}
];

const initProjects = () => [
  {id:"p1",clientId:"c1",name:"Fairmont Red Sea",brand:"Fairmont",segment:"Luxury",keys:193,openingDate:"2025-11-01",country:"Saudi Arabia",city:"Red Sea",currency:"SAR",type:"New built",fxUSD:3.75,fxEUR:4.09,status:"active",phase:"manning",progress:72,preOpenMonths:18,salaryOverrides:{},outlets:[{name:"All Day Dining",seats:199},{name:"Lobby Lounge",seats:64},{name:"Specialty Restaurant",seats:122},{name:"Pool Bar",seats:116}],facilities:[{name:"Meeting Rooms",sqm:856},{name:"Spa",sqm:1284},{name:"Fitness",sqm:536},{name:"Pool",sqm:400}],created:"2024-07-01",updated:"2026-02-12T09:30:00"},
  {id:"p2",clientId:"c1",name:"Raffles Red Sea",brand:"Raffles",segment:"Luxury",keys:180,openingDate:"2025-12-01",country:"Saudi Arabia",city:"Red Sea",currency:"SAR",type:"New built",fxUSD:3.75,fxEUR:4.09,status:"active",phase:"expenses",progress:58,preOpenMonths:18,salaryOverrides:{},outlets:[{name:"All Day Dining",seats:160},{name:"Lobby Bar",seats:48},{name:"Fine Dining",seats:80}],facilities:[{name:"Ballroom",sqm:600},{name:"Spa",sqm:1500}],created:"2024-07-15",updated:"2026-02-11T14:00:00"},
  {id:"p3",clientId:"c1",name:"SLS Red Sea",brand:"SLS",segment:"Luxury",keys:150,openingDate:"2026-03-01",country:"Saudi Arabia",city:"Red Sea",currency:"SAR",type:"New built",fxUSD:3.75,fxEUR:4.09,status:"active",phase:"review",progress:45,preOpenMonths:18,salaryOverrides:{},outlets:[{name:"Restaurant",seats:180},{name:"Rooftop Bar",seats:90}],facilities:[{name:"Club",sqm:400},{name:"Pool",sqm:600}],created:"2024-09-01",updated:"2026-02-10T09:00:00"},
  {id:"p4",clientId:"c1",name:"Faena Red Sea",brand:"Faena",segment:"Luxury",keys:120,openingDate:"2026-06-01",country:"Saudi Arabia",city:"Red Sea",currency:"SAR",type:"New built",fxUSD:3.75,fxEUR:4.09,status:"draft",phase:"setup",progress:18,preOpenMonths:18,salaryOverrides:{},outlets:[{name:"Main Restaurant",seats:120},{name:"Beach Bar",seats:60}],facilities:[{name:"Theatre",sqm:300},{name:"Spa",sqm:800}],created:"2025-01-20",updated:"2026-02-08T11:00:00"},
  {id:"p5",clientId:"c2",name:"W Hotel Riyadh",brand:"W",segment:"Luxury",keys:280,openingDate:"2026-09-01",country:"Saudi Arabia",city:"Riyadh",currency:"SAR",type:"New built",fxUSD:3.75,fxEUR:4.09,status:"active",phase:"manning",progress:35,preOpenMonths:18,salaryOverrides:{},outlets:[{name:"Restaurant",seats:200},{name:"Bar",seats:100}],facilities:[{name:"Ballroom",sqm:1200},{name:"Spa",sqm:900}],created:"2025-03-01",updated:"2026-02-11T10:00:00"},
  {id:"p6",clientId:"c2",name:"St. Regis NEOM",brand:"St. Regis",segment:"Luxury",keys:220,openingDate:"2027-01-01",country:"Saudi Arabia",city:"NEOM",currency:"SAR",type:"New built",fxUSD:3.75,fxEUR:4.09,status:"draft",phase:"setup",progress:8,preOpenMonths:24,salaryOverrides:{},outlets:[{name:"All Day Dining",seats:180}],facilities:[{name:"Spa",sqm:2000}],created:"2025-06-01",updated:"2026-02-05T09:00:00"},
  {id:"p7",clientId:"c3",name:"Aman Diriyah",brand:"Aman",segment:"Luxury",keys:85,openingDate:"2026-04-01",country:"Saudi Arabia",city:"Diriyah",currency:"SAR",type:"Conversion",fxUSD:3.75,fxEUR:4.09,status:"active",phase:"expenses",progress:62,preOpenMonths:12,salaryOverrides:{},outlets:[{name:"Restaurant",seats:60},{name:"Pool Pavilion",seats:30}],facilities:[{name:"Spa",sqm:1800},{name:"Pool",sqm:300}],created:"2025-02-01",updated:"2026-02-12T06:00:00"}
];

const MBP = { p1: [
  {id:1,div:"A&G",dept:"General",pos:"General Manager",grade:"10",hc:0.5,startM:17,recAir:3000,recAgency:25000,recVisa:2000,accomNeeded:"yes",accomType:"2-bed",accomBeds:0},
  {id:2,div:"A&G",dept:"Finance",pos:"Director of Finance",grade:"8",hc:1,startM:10,recAir:2500,recAgency:15000,recVisa:1500,accomNeeded:"yes",accomType:"2-bed",accomBeds:0},
  {id:3,div:"A&G",dept:"Finance",pos:"Accountant",grade:"5",hc:2,startM:4,recAir:1500,recAgency:5000,recVisa:1000,accomNeeded:"shared",accomType:"shared",accomBeds:2},
  {id:4,div:"A&G",dept:"T&C",pos:"Director of T&C",grade:"7a",hc:1,startM:8,recAir:2000,recAgency:10000,recVisa:1500,accomNeeded:"yes",accomType:"1-bed",accomBeds:0},
  {id:5,div:"A&G",dept:"T&C",pos:"T&C Officer",grade:"2",hc:4,startM:3,recAir:800,recAgency:2000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:6,div:"A&G",dept:"Security",pos:"Security Officer",grade:"1",hc:5,startM:1,recAir:0,recAgency:1000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:7,div:"Rooms",dept:"Front Office",pos:"Director of Rooms",grade:"8",hc:1,startM:7,recAir:2500,recAgency:15000,recVisa:1500,accomNeeded:"yes",accomType:"2-bed",accomBeds:0},
  {id:8,div:"Rooms",dept:"Front Office",pos:"FO Manager",grade:"7a",hc:1,startM:4,recAir:2000,recAgency:8000,recVisa:1500,accomNeeded:"yes",accomType:"1-bed",accomBeds:0},
  {id:9,div:"Rooms",dept:"Front Office",pos:"Guest Service Agent",grade:"2",hc:12,startM:2,recAir:800,recAgency:2000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:10,div:"Rooms",dept:"Housekeeping",pos:"Exec Housekeeper",grade:"7a",hc:1,startM:5,recAir:2000,recAgency:8000,recVisa:1500,accomNeeded:"yes",accomType:"1-bed",accomBeds:0},
  {id:11,div:"Rooms",dept:"Housekeeping",pos:"Room Attendant",grade:"1",hc:45,startM:1,recAir:0,recAgency:1000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:12,div:"Rooms",dept:"Housekeeping",pos:"Public Area",grade:"1",hc:12,startM:1,recAir:0,recAgency:1000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:13,div:"F&B",dept:"Culinary",pos:"Executive Chef",grade:"8",hc:1,startM:6,recAir:2500,recAgency:18000,recVisa:1500,accomNeeded:"yes",accomType:"2-bed",accomBeds:0},
  {id:14,div:"F&B",dept:"Culinary",pos:"Sous Chef",grade:"5",hc:3,startM:3,recAir:1500,recAgency:5000,recVisa:1000,accomNeeded:"shared",accomType:"shared",accomBeds:2},
  {id:15,div:"F&B",dept:"Culinary",pos:"Chef de Partie",grade:"3",hc:8,startM:2,recAir:800,recAgency:2000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:16,div:"F&B",dept:"Culinary",pos:"Commis",grade:"1",hc:20,startM:1,recAir:0,recAgency:1000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:17,div:"F&B",dept:"Restaurant",pos:"Restaurant Manager",grade:"5",hc:4,startM:2,recAir:1500,recAgency:5000,recVisa:1000,accomNeeded:"shared",accomType:"shared",accomBeds:2},
  {id:18,div:"F&B",dept:"Restaurant",pos:"Waiter",grade:"1",hc:32,startM:1,recAir:0,recAgency:1000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:19,div:"F&B",dept:"Stewarding",pos:"Chief Steward",grade:"5",hc:1,startM:3,recAir:1500,recAgency:3000,recVisa:1000,accomNeeded:"shared",accomType:"shared",accomBeds:2},
  {id:20,div:"F&B",dept:"Stewarding",pos:"Steward",grade:"1",hc:15,startM:1,recAir:0,recAgency:1000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:21,div:"S&M",dept:"Sales",pos:"Dir. of S&M",grade:"8",hc:1,startM:8,recAir:2500,recAgency:15000,recVisa:1500,accomNeeded:"yes",accomType:"2-bed",accomBeds:0},
  {id:22,div:"S&M",dept:"Sales",pos:"Sales Manager",grade:"5",hc:2,startM:4,recAir:1500,recAgency:5000,recVisa:1000,accomNeeded:"shared",accomType:"shared",accomBeds:2},
  {id:23,div:"S&M",dept:"Marketing",pos:"Marketing Mgr",grade:"6",hc:1,startM:6,recAir:1500,recAgency:6000,recVisa:1000,accomNeeded:"yes",accomType:"1-bed",accomBeds:0},
  {id:24,div:"S&M",dept:"Revenue Mgmt",pos:"Revenue Mgr",grade:"6",hc:1,startM:5,recAir:1500,recAgency:6000,recVisa:1000,accomNeeded:"yes",accomType:"1-bed",accomBeds:0},
  {id:25,div:"IT",dept:"IT",pos:"IT Manager",grade:"6",hc:1,startM:6,recAir:1500,recAgency:6000,recVisa:1000,accomNeeded:"yes",accomType:"1-bed",accomBeds:0},
  {id:26,div:"IT",dept:"IT",pos:"IT Technician",grade:"2",hc:1.5,startM:2,recAir:800,recAgency:2000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:27,div:"POM",dept:"Engineering",pos:"Chief Engineer",grade:"7a",hc:1,startM:6,recAir:2000,recAgency:10000,recVisa:1500,accomNeeded:"yes",accomType:"1-bed",accomBeds:0},
  {id:28,div:"POM",dept:"Engineering",pos:"Technician",grade:"2",hc:4,startM:2,recAir:800,recAgency:2000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4},
  {id:29,div:"Spa",dept:"Health Club/Spa",pos:"Spa Manager",grade:"5",hc:1,startM:3,recAir:1500,recAgency:5000,recVisa:1000,accomNeeded:"yes",accomType:"studio",accomBeds:0},
  {id:30,div:"Spa",dept:"Health Club/Spa",pos:"Therapist",grade:"2",hc:8,startM:1,recAir:800,recAgency:2000,recVisa:800,accomNeeded:"shared",accomType:"shared",accomBeds:4}
]};

const EBP = { p1: [
  {id:1,div:"A&G",dept:"L&D",usali:"Training",item:"Luxury Leadership Workshop",basis:"Segment",rec:"One-time M-3",units:1,cost:8500,cur:"USD"},
  {id:2,div:"A&G",dept:"T&C",usali:"Human Resources",item:"Pre-opening onboarding kit",basis:"FTE count",rec:"One-time (onboarded)",units:1,cost:27,cur:"USD"},
  {id:3,div:"F&B",dept:"F&B",usali:"Contract Services",item:"Mixology consultant",basis:"Per hotel",rec:"One-time M-4",units:1,cost:30000,cur:"USD"},
  {id:4,div:"F&B",dept:"F&B",usali:"Contract Services",item:"Venue branding",basis:"Per hotel",rec:"One-time M-5",units:1,cost:18000,cur:"EUR"},
  {id:5,div:"F&B",dept:"F&B",usali:"Contract Services",item:"Menu design",basis:"Per hotel",rec:"One-time M-3",units:1,cost:12000,cur:"EUR"},
  {id:6,div:"F&B",dept:"F&B",usali:"Contract Services",item:"Photography",basis:"Per hotel",rec:"One-time M-2",units:1,cost:10000,cur:"USD"},
  {id:7,div:"Rooms",dept:"Rooms",usali:"Supplies (Pre-opening set up)",item:"Guest amenities",basis:"Per hotel",rec:"One-time M-1",units:193,cost:25,cur:"USD"},
  {id:8,div:"S&M",dept:"Marketing",usali:"Media",item:"Pre-opening media",basis:"Per hotel",rec:"One-time M-6",units:1,cost:150000,cur:"USD"},
  {id:9,div:"S&M",dept:"Digital",usali:"Website",item:"Website dev",basis:"Per hotel",rec:"One-time M-4",units:1,cost:25000,cur:"USD"},
  {id:10,div:"S&M",dept:"PR",usali:"Agency Fees",item:"PR agency retainer",basis:"Per hotel",rec:"Monthly",units:1,cost:8000,cur:"USD"},
  {id:11,div:"IT",dept:"IT",usali:"Information Systems",item:"PMS setup",basis:"Per hotel",rec:"One-time M-3",units:1,cost:45000,cur:"USD"},
  {id:12,div:"IT",dept:"IT",usali:"Telecommunications",item:"Network infra",basis:"Per hotel",rec:"One-time M-4",units:1,cost:35000,cur:"USD"},
  {id:13,div:"POM",dept:"Engineering",usali:"Contract Services",item:"Pre-opening maintenance",basis:"Per hotel",rec:"One-time M-2",units:1,cost:35000,cur:"USD"},
  {id:14,div:"POM",dept:"Engineering",usali:"Supplies (Pre-opening set up)",item:"Spare parts",basis:"Per hotel",rec:"One-time M-1",units:1,cost:50000,cur:"USD"},
  {id:15,div:"Spa",dept:"Health Club/Spa",usali:"Supplies (Pre-opening set up)",item:"Spa products",basis:"Per hotel",rec:"One-time M-1",units:1,cost:25000,cur:"USD"},
  {id:16,div:"Non Op.",dept:"Non Op. I&E",usali:"Bank Charges",item:"Bank charges",basis:"Per hotel",rec:"Monthly",units:1,cost:2000,cur:"USD"},
  {id:17,div:"Non Op.",dept:"Non Op. I&E",usali:"Licenses and Permits",item:"Pre-opening licenses",basis:"Per hotel",rec:"One-time M-6",units:1,cost:50000,cur:"USD"}
]};

/* ═══ SHARED COMPONENTS ═══ */
function Pill({ children, color }) {
  const { t } = uT();
  const c = color || t.gold;
  return <span style={{ display:"inline-flex", padding:"3px 10px", borderRadius:6, fontSize:10.5,
    fontWeight:600, background:c+"14", color:c, letterSpacing:"0.2px", whiteSpace:"nowrap" }}>{children}</span>;
}

function Badge({ n, color }) {
  const { t } = uT();
  const c = color || t.gold;
  return <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
    minWidth:22, height:22, borderRadius:6, background:c+"14", color:c, fontSize:11,
    fontWeight:600, padding:"0 6px" }}>{n}</span>;
}

function Btn({ children, primary, small, ghost, danger, onClick, style:sx, disabled, icon }) {
  const { t } = uT();
  return <button disabled={disabled} onClick={onClick} style={{
    display:"inline-flex", alignItems:"center", gap:7,
    padding: small ? "7px 14px" : "10px 22px", borderRadius:10,
    border: primary || ghost ? "none" : `1px solid ${danger ? t.cor+"30" : t.brd}`,
    cursor: disabled ? "default" : "pointer",
    background: primary ? t.gold : danger ? t.cor+"14" : ghost ? "transparent" : t.bgEl,
    color: primary ? "#0E0E14" : danger ? t.cor : t.tx,
    fontSize: small ? 12 : 13, fontWeight:600, fontFamily:FN,
    opacity: disabled ? .45 : 1, transition:"all 0.2s ease",
    boxShadow: primary ? "0 2px 8px rgba(201,169,110,0.2)" : "none", ...sx
  }}>{icon && <span style={{ fontSize: small ? 13 : 15 }}>{icon}</span>}{children}</button>;
}

function Input({ label, value, onChange, type="text", options, placeholder, span=1, disabled }) {
  const { t } = uT();
  return <div style={{ gridColumn:`span ${span}` }}>
    {label && <label style={{ display:"block", fontSize:11, color:t.txM, fontWeight:600,
      letterSpacing:"0.2px", marginBottom:6, fontFamily:FN }}>{label}</label>}
    {options
      ? <select value={value||""} onChange={e => onChange(e.target.value)} disabled={disabled} style={{
          width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.brd}`,
          background:t.inBg, color:t.tx, fontSize:13, fontFamily:FB, appearance:"none",
          cursor:"pointer", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" }}>
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      : <input type={type} value={value ?? ""} onChange={e => onChange(type === "number" ? +e.target.value : e.target.value)}
          placeholder={placeholder} disabled={disabled} style={{
          width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.brd}`,
          background:t.inBg, color:t.tx, fontSize:13, fontFamily:FB, outline:"none",
          boxSizing:"border-box", transition:"border-color 0.15s" }} />
    }
  </div>;
}

function Drawer({ open, onClose, title, width=560, children }) {
  const { t } = uT();
  if (!open) return null;
  return <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", justifyContent:"flex-end" }}>
    <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)" }} />
    <div style={{ position:"relative", width, maxWidth:"92vw", height:"100%", background:t.bgCard,
      borderLeft:`1px solid ${t.brd}`, display:"flex", flexDirection:"column",
      animation:"slideIn .25s cubic-bezier(0.16,1,0.3,1)", overflow:"hidden", boxShadow:"-4px 0 24px rgba(0,0,0,0.12)" }}>
      <div style={{ padding:"20px 28px", borderBottom:`1px solid ${t.brd}`, display:"flex",
        justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:t.tx, fontFamily:FN }}>{title}</h3>
        <button onClick={onClose} style={{ background:t.bgEl, border:"none", color:t.txM,
          cursor:"pointer", fontSize:14, width:32, height:32, borderRadius:8,
          display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}>&#10005;</button>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:"24px 28px" }}>{children}</div>
    </div>
    <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
  </div>;
}

function StatCard({ label, value, sub, color, icon }) {
  const { t } = uT();
  const c = color || t.gold;
  return <div style={{ background:t.bgCard, borderRadius:16, padding:"20px 22px",
    border:`1px solid ${t.brd}`, flex:1, minWidth:160, boxShadow:t.shd }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <div style={{ fontSize:11, color:t.txM, fontWeight:600, letterSpacing:"0.2px",
          marginBottom:8, fontFamily:FN }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:700, color:t.tx, letterSpacing:"-0.5px", fontFamily:FN }}>{value}</div>
        {sub && <div style={{ fontSize:11.5, color:t.txD, marginTop:4, fontFamily:FB }}>{sub}</div>}
      </div>
      {icon && <div style={{ width:40, height:40, borderRadius:12, background:c+"10",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>}
    </div>
  </div>;
}

function Avatar({ name, size=32, color }) {
  const { t } = uT();
  const c = color || t.gold;
  const ini = name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  return <div style={{ width:size, height:size, borderRadius:size*0.35, background:c+"18", color:c,
    display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.36,
    fontWeight:600, fontFamily:FN, flexShrink:0 }}>{ini}</div>;
}

function StatusDot({ status }) {
  const { t } = uT();
  const colors = { active:t.em, trial:t.amb, invited:t.acc, inactive:t.txD, draft:"#78716C", suspended:t.cor };
  return <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:7, height:7, borderRadius:4, background:colors[status] || t.txD }} />
    <span style={{ fontSize:11.5, color:t.txM, fontWeight:600, textTransform:"capitalize" }}>{status}</span>
  </div>;
}

function Empty({ icon, title, sub, action }) {
  const { t } = uT();
  return <div style={{ textAlign:"center", padding:"60px 20px" }}>
    <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
    <div style={{ fontSize:16, fontWeight:700, color:t.tx, fontFamily:FN }}>{title}</div>
    <div style={{ fontSize:13, color:t.txD, marginTop:6, maxWidth:360, margin:"6px auto 20px" }}>{sub}</div>
    {action}
  </div>;
}

function ThemeToggle() {
  const { mode, toggle, t } = uT();
  return <button onClick={toggle} style={{
    width:"100%", padding:"6px", borderRadius:10, border:"none",
    background:"rgba(255,255,255,0.06)", cursor:"pointer", display:"flex", alignItems:"center", overflow:"hidden"
  }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", position:"relative", height:28 }}>
      <span style={{ flex:1, fontSize:11.5, zIndex:1, color: mode === "light" ? "#EAECF0" : t.sbTxD,
        fontWeight: mode === "light" ? 600 : 500, fontFamily:FN, textAlign:"center" }}>&#9728; Light</span>
      <span style={{ flex:1, fontSize:11.5, zIndex:1, color: mode === "dark" ? "#EAECF0" : t.sbTxD,
        fontWeight: mode === "dark" ? 600 : 500, fontFamily:FN, textAlign:"center" }}>&#9790; Dark</span>
      <div style={{ position:"absolute", top:0, left: mode === "light" ? "0" : "50%", width:"50%",
        height:"100%", borderRadius:8, background:"rgba(255,255,255,0.10)",
        transition:"left 0.3s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  </button>;
}

/* ═══ SIDEBAR (Qonto: always dark) ═══ */
function Sidebar({ page, setPage, currentUser, currentClient, currentProject, projects }) {
  const { t } = uT();
  const isSA = currentUser?.role === "superadmin";
  const superNav = [
    {id:"sa_dash",label:"Dashboard",icon:"\u25c9"},{id:"sa_clients",label:"Clients",icon:"\ud83c\udfe2"},
    {id:"sa_users_global",label:"All Users",icon:"\ud83d\udc65"},{id:"sa_analytics",label:"Analytics",icon:"\ud83d\udcc8"},
    {id:"sa_settings",label:"Settings",icon:"\u2699"}
  ];
  const clientNav = [
    {id:"home",label:"Home",icon:"\u25c9"},{id:"sites",label:"Site Management",icon:"\ud83c\udfe8"},
    {id:"users",label:"User Management",icon:"\ud83d\udc65"}
  ];
  const projectNav = currentProject ? [
    {id:"overview",label:"Mission Control",icon:"\ud83d\udcca"},{id:"setup",label:"Project Setup",icon:"\u2699"},
    {id:"manning",label:"Manning",icon:"\ud83d\udc64"},{id:"expenses",label:"Expenses",icon:"\ud83d\udcb0"},
    {id:"budget",label:"Budget Summary",icon:"\ud83d\udccb"},{id:"analytics",label:"Analytics",icon:"\ud83d\udcc8"},
    {id:"timeline",label:"Timeline",icon:"\ud83d\udcc5"},{id:"ai",label:"AI Wizard",icon:"\u2726"}
  ] : [];

  const NB = ({ label, icon, active, onClick }) => (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 14px", borderRadius:8,
      border:"none", cursor:"pointer", marginBottom:2, transition:"all .15s ease",
      background: active ? "rgba(201,169,110,0.12)" : "transparent",
      color: active ? "#E8D5A8" : t.sbTx,
      fontSize:13, fontWeight: active ? 600 : 450, fontFamily:FN, textAlign:"left"
    }}><span style={{ fontSize:15, width:22, textAlign:"center", opacity: active ? 1 : 0.65 }}>{icon}</span>{label}</button>
  );

  return <div style={{ width:240, background:t.bgSb, display:"flex", flexDirection:"column",
    borderRight:"none", flexShrink:0, fontFamily:FN }}>
    {/* Logo */}
    <div style={{ padding:"24px 20px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:t.gold,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#0E0E14", fontWeight:800 }}>P</div>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EAECF0", letterSpacing:"-0.3px" }}>PreOpen</div>
          <div style={{ fontSize:9, color:t.sbTxD, fontWeight:500, letterSpacing:"1.2px", textTransform:"uppercase" }}>Budget Platform</div>
        </div>
      </div>
    </div>

    <nav style={{ flex:1, padding:"4px 10px", overflow:"auto" }}>
      {isSA && <>
        <div style={{ fontSize:10, color:t.sbTxD, fontWeight:600, letterSpacing:"0.5px", padding:"16px 14px 8px", textTransform:"uppercase" }}>Platform</div>
        {superNav.map(n => <NB key={n.id} {...n} active={page === n.id} onClick={() => setPage(n.id)} />)}
        <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"12px 14px" }} />
        <div style={{ fontSize:10, color:t.sbTxD, fontWeight:600, letterSpacing:"0.5px", padding:"4px 14px 8px", textTransform:"uppercase" }}>Client View</div>
      </>}
      {clientNav.map(n => <NB key={n.id} {...n} active={page === n.id} onClick={() => setPage(n.id)} />)}
      {currentProject && <>
        <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"12px 14px" }} />
        <div style={{ fontSize:10, color:t.sbTxD, fontWeight:600, letterSpacing:"0.5px", padding:"4px 14px 6px", textTransform:"uppercase" }}>Active Project</div>
        <div style={{ padding:"4px 14px 10px", fontSize:12.5, color:"#E8D5A8", fontWeight:600 }}>{currentProject.name}</div>
        {projectNav.map(n => <NB key={n.id} {...n} active={page === n.id} onClick={() => setPage(n.id)} />)}
      </>}
    </nav>

    <div style={{ padding:"14px 14px 18px" }}>
      <div style={{ marginBottom:12 }}><ThemeToggle /></div>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.04)" }}>
        <Avatar name={currentUser?.name} size={32} color={ROLES[currentUser?.role]?.color} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12.5, color:"#EAECF0", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentUser?.name}</div>
          <div style={{ fontSize:10.5, color:t.sbTxD }}>{ROLES[currentUser?.role]?.label}</div>
        </div>
      </div>
    </div>
  </div>;
}

/* ═══ SUPERADMIN DASHBOARD ═══ */
function SADash({ clients, users, projects }) {
  const { t } = uT();
  const ac = clients.filter(c => c.status === "active").length;
  const tu = users.filter(u => u.role !== "superadmin").length;
  const ap = projects.filter(p => p.status === "active").length;
  const tk = projects.reduce((s, p) => s + p.keys, 0);

  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:"0 0 4px", fontFamily:FN }}>Platform Dashboard</h1>
    <p style={{ color:t.txD, fontSize:13, marginTop:0, marginBottom:24, fontFamily:FB }}>SuperAdmin overview</p>
    <div style={{ display:"flex", gap:14, marginBottom:22, flexWrap:"wrap" }}>
      <StatCard label="Active Clients" value={ac} sub={`${clients.length} total`} color={t.gold} icon={"\ud83c\udfe2"} />
      <StatCard label="Total Users" value={tu} color={t.acc} icon={"\ud83d\udc65"} />
      <StatCard label="Active Projects" value={ap} sub={`${projects.length} total`} color={t.em} icon={"\ud83c\udfe8"} />
      <StatCard label="Total Keys" value={fmt(tk)} color={t.amb} icon={"\ud83d\udd11"} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      <div style={{ background:t.bgCard, borderRadius:16, padding:"20px 22px", border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
        <div style={{ fontSize:10, fontWeight:700, color:t.txM, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14, fontFamily:FN }}>Clients</div>
        {clients.map(c => <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${t.brd}` }}>
          <div style={{ width:36, height:36, borderRadius:8, background:c.color+"20", color:c.color,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, fontFamily:FN }}>{c.logo}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.tx }}>{c.name}</div>
            <div style={{ fontSize:11, color:t.txD }}>{projects.filter(p => p.clientId === c.id).length} projects</div>
          </div>
          <StatusDot status={c.status} />
        </div>)}
      </div>
      <div style={{ background:t.bgCard, borderRadius:16, padding:"20px 22px", border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
        <div style={{ fontSize:10, fontWeight:700, color:t.txM, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14, fontFamily:FN }}>Recent Activity</div>
        {[...projects].sort((a, b) => new Date(b.updated) - new Date(a.updated)).slice(0, 6).map(p => {
          const cl = clients.find(c => c.id === p.clientId);
          return <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:`1px solid ${t.brd}` }}>
            <div style={{ width:8, height:8, borderRadius:4, background:cl?.color || t.gold }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12.5, color:t.tx, fontWeight:600 }}>{p.name}</div>
              <div style={{ fontSize:11, color:t.txD }}>{cl?.name} &middot; {p.keys} keys</div>
            </div>
            <span style={{ fontSize:11, color:t.txD }}>{ago(p.updated)}</span>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

/* ═══ SUPERADMIN CLIENTS ═══ */
function SAClients({ clients, setClients, users, projects, setCurrentClient, setPage }) {
  const { t } = uT();
  const [drawer, setDrawer] = useState(null);
  const openAdd = () => setDrawer({ mode:"add", data:{ id:uid(), name:"", logo:"", plan:"professional", seats:10,
    created:new Date().toISOString().split("T")[0], color:"#5B8DEF", domain:"", status:"trial", country:"", contactName:"" }});
  const openEdit = c => setDrawer({ mode:"edit", data:{...c} });
  const save = d => {
    if (drawer.mode === "add") setClients(p => [...p, d]);
    else setClients(p => p.map(c => c.id === d.id ? d : c));
    setDrawer(null);
  };

  return <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>Client Management</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:4, fontFamily:FB }}>Manage organizations</p>
      </div>
      <Btn primary onClick={openAdd} icon="+">{" "}Add Client</Btn>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      {clients.map(c => {
        const cu = users.filter(u => u.clientId === c.id);
        const cp = projects.filter(p => p.clientId === c.id);
        return <div key={c.id} style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd }}>
          <div style={{ padding:"20px 22px", borderBottom:`1px solid ${t.brd}`, display:"flex", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:c.color+"18", color:c.color,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, fontFamily:FN }}>{c.logo}</div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:t.tx, fontFamily:FN }}>{c.name}</div>
                <div style={{ fontSize:11.5, color:t.txD, marginTop:2 }}>{c.country} &middot; {c.domain}</div>
              </div>
            </div>
            <StatusDot status={c.status} />
          </div>
          <div style={{ padding:"16px 22px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[{l:"Projects",v:cp.length,cl:t.acc},{l:"Users",v:`${cu.length}/${c.seats}`,cl:t.em},{l:"Keys",v:fmt(cp.reduce((s,p)=>s+p.keys,0)),cl:t.amb}].map(x =>
              <div key={x.l} style={{ textAlign:"center", padding:8, borderRadius:8, background:t.bgEl }}>
                <div style={{ fontSize:8, color:t.txD, fontWeight:700, textTransform:"uppercase" }}>{x.l}</div>
                <div style={{ fontSize:14, fontWeight:700, color:x.cl, fontFamily:FN, marginTop:2 }}>{x.v}</div>
              </div>)}
          </div>
          <div style={{ padding:"12px 22px", display:"flex", gap:8, borderTop:`1px solid ${t.brd}` }}>
            <Btn small onClick={() => { setCurrentClient(c); setPage("home"); }} icon={"\u2192"}>Enter</Btn>
            <Btn small ghost onClick={() => openEdit(c)}>Edit</Btn>
          </div>
        </div>;
      })}
    </div>
    <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.mode === "add" ? "New Client" : "Edit Client"}>
      {drawer && <CForm data={drawer.data} onSave={save} />}
    </Drawer>
  </div>;
}

function CForm({ data: init, onSave }) {
  const [d, setD] = useState(init);
  const up = (k, v) => setD(p => ({...p, [k]: v}));
  return <div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
      <Input label="Name" value={d.name} onChange={v => up("name", v)} span={2} />
      <Input label="Logo" value={d.logo} onChange={v => up("logo", v)} />
      <Input label="Color" value={d.color} onChange={v => up("color", v)} type="color" />
      <Input label="Country" value={d.country} onChange={v => up("country", v)} />
      <Input label="Domain" value={d.domain} onChange={v => up("domain", v)} />
      <Input label="Plan" value={d.plan} onChange={v => up("plan", v)} options={["trial","professional","enterprise"]} />
      <Input label="Seats" value={d.seats} onChange={v => up("seats", v)} type="number" />
      <Input label="Status" value={d.status} onChange={v => up("status", v)} options={["active","trial","suspended"]} />
      <Input label="Contact" value={d.contactName} onChange={v => up("contactName", v)} />
    </div>
    <Btn primary onClick={() => onSave(d)} style={{ width:"100%" }}>Save Client</Btn>
  </div>;
}

/* ═══ SUPERADMIN ALL USERS ═══ */
function SAUsers({ users, clients }) {
  const { t } = uT();
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? users.filter(u => u.role !== "superadmin") : users.filter(u => u.clientId === filter);

  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:"0 0 4px", fontFamily:FN }}>All Platform Users</h1>
    <p style={{ color:t.txD, fontSize:13, marginTop:0, marginBottom:20, fontFamily:FB }}>Cross-client user management</p>
    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
      <Btn small onClick={() => setFilter("all")} style={{ background: filter === "all" ? t.gold+"20" : "transparent", color: filter === "all" ? t.gold : t.txD, border:`1px solid ${filter === "all" ? t.gold+"40" : t.brd}` }}>All ({users.filter(u => u.role !== "superadmin").length})</Btn>
      {clients.map(c => <Btn key={c.id} small onClick={() => setFilter(c.id)} style={{ background: filter === c.id ? c.color+"20" : "transparent", color: filter === c.id ? c.color : t.txD, border:`1px solid ${filter === c.id ? c.color+"40" : t.brd}` }}>{c.logo} ({users.filter(u => u.clientId === c.id).length})</Btn>)}
    </div>
    <div style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5, fontFamily:FB }}>
        <thead><tr style={{ background:t.bgEl }}>
          {["User","Organization","Role","Status","Last Active"].map(h =>
            <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:t.txM, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.6px", borderBottom:`1px solid ${t.brd}`, fontFamily:FN }}>{h}</th>)}
        </tr></thead>
        <tbody>{filtered.map(u => {
          const cl = clients.find(c => c.id === u.clientId);
          const role = ROLES[u.role];
          return <tr key={u.id} style={{ borderBottom:`1px solid ${t.brd}` }}>
            <td style={{ padding:"10px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Avatar name={u.name} size={30} color={role?.color} />
              <div><div style={{ fontSize:12.5, fontWeight:600, color:t.tx }}>{u.name}</div>
              <div style={{ fontSize:11, color:t.txD }}>{u.email}</div></div></div></td>
            <td style={{ padding:"10px 14px", color:t.txM, fontSize:12 }}>{cl?.name || "Platform"}</td>
            <td style={{ padding:"10px 14px" }}><Pill color={role?.color}>{role?.label}</Pill></td>
            <td style={{ padding:"10px 14px" }}><StatusDot status={u.status} /></td>
            <td style={{ padding:"10px 14px", color:t.txD, fontSize:12 }}>{u.lastActive ? ago(u.lastActive) : "Never"}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}

/* ═══ CLIENT HOME ═══ */
function ClientHome({ client, projects, users, setCurrentProject, setPage }) {
  const { t } = uT();
  const cp = projects.filter(p => p.clientId === client?.id);
  const cu = users.filter(u => u.clientId === client?.id);
  const tk = cp.reduce((s, p) => s + p.keys, 0);

  return <div>
    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:(client?.color || t.gold)+"18",
        color:client?.color || t.gold, display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:18, fontWeight:800, fontFamily:FN }}>{client?.logo}</div>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>{client?.name}</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:2, fontFamily:FB }}>{client?.country} &middot; {client?.plan} plan</p>
      </div>
    </div>
    <div style={{ display:"flex", gap:14, marginBottom:22, flexWrap:"wrap" }}>
      <StatCard label="Projects" value={cp.length} color={t.em} icon={"\ud83c\udfe8"} />
      <StatCard label="Total Keys" value={fmt(tk)} color={t.amb} icon={"\ud83d\udd11"} />
      <StatCard label="Team" value={cu.length} sub={`of ${client?.seats} seats`} color={t.acc} icon={"\ud83d\udc65"} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      {cp.map(p => (
        <div key={p.id} onClick={() => { setCurrentProject(p); setPage("overview"); }}
          style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, padding:"20px 22px",
            cursor:"pointer", transition:"all .15s", boxShadow:t.shd }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:t.tx, fontFamily:FN }}>{p.name}</div>
              <div style={{ fontSize:12, color:t.txD, marginTop:2 }}>{p.brand} &middot; {p.keys} keys &middot; {p.city}</div>
            </div>
            <StatusDot status={p.status} />
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <Pill color={t.acc}>{p.segment}</Pill>
            <Pill color={t.amb}>{p.phase}</Pill>
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
              <span style={{ color:t.txD }}>Progress</span>
              <span style={{ color:t.gold, fontWeight:700 }}>{p.progress}%</span>
            </div>
            <div style={{ height:5, borderRadius:3, background:t.bgEl, overflow:"hidden" }}>
              <div style={{ width:`${p.progress}%`, height:"100%", borderRadius:3, background:`linear-gradient(90deg,${t.gold},${t.goldL})` }} />
            </div>
          </div>
          <div style={{ fontSize:11, color:t.txD }}>Opening: {p.openingDate}</div>
        </div>
      ))}
    </div>
  </div>;
}

/* ═══ SITE MANAGEMENT ═══ */
function SiteMgmt({ client, projects, setProjects, setCurrentProject, setPage }) {
  const { t } = uT();
  const cp = projects.filter(p => p.clientId === client?.id);
  const [drawer, setDrawer] = useState(null);
  const openAdd = () => setDrawer({ mode:"add", data:{ id:uid(), clientId:client?.id, name:"", brand:"", segment:"Luxury", keys:0,
    openingDate:"", country:client?.country || "", city:"", currency:"SAR", type:"New built", fxUSD:3.75, fxEUR:4.09,
    status:"draft", phase:"setup", progress:0, preOpenMonths:18, salaryOverrides:{},
    outlets:[], facilities:[], created:new Date().toISOString().split("T")[0],
    updated:new Date().toISOString() }});
  const save = d => {
    d.updated = new Date().toISOString();
    if (drawer.mode === "add") setProjects(prev => [...prev, d]);
    else setProjects(prev => prev.map(p => p.id === d.id ? d : p));
    setDrawer(null);
  };
  const del = id => { setProjects(prev => prev.filter(p => p.id !== id)); setDrawer(null); };

  return <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>Site Management</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:4, fontFamily:FB }}>Manage projects for {client?.name}</p>
      </div>
      <Btn primary onClick={openAdd} icon="+">New Project</Btn>
    </div>
    <div style={{ display:"flex", gap:14, marginBottom:22, flexWrap:"wrap" }}>
      <StatCard label="Projects" value={cp.length} color={t.acc} icon={"\ud83c\udfe8"} />
      <StatCard label="Total Keys" value={fmt(cp.reduce((s, p) => s + p.keys, 0))} color={t.amb} icon={"\ud83d\udd11"} />
      <StatCard label="Active" value={cp.filter(p => p.status === "active").length} color={t.em} icon={"\u2713"} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
      {cp.map(p => (
        <div key={p.id} style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd }}>
          <div style={{ padding:"18px 20px", borderBottom:`1px solid ${t.brd}` }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.tx, fontFamily:FN }}>{p.name}</div>
              <StatusDot status={p.status} />
            </div>
            <div style={{ fontSize:11.5, color:t.txD, marginTop:3 }}>{p.brand} &middot; {p.keys} keys</div>
          </div>
          <div style={{ padding:"14px 20px" }}>
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              <Pill color={t.acc}>{p.segment}</Pill>
              <Pill color={t.amb}>{p.phase}</Pill>
            </div>
            <div style={{ height:4, borderRadius:2, background:t.bgEl, overflow:"hidden", marginBottom:10 }}>
              <div style={{ width:`${p.progress}%`, height:"100%", borderRadius:2, background:t.gold }} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn small onClick={() => { setCurrentProject(p); setPage("overview"); }} icon={"\u2192"}>Open</Btn>
              <Btn small ghost onClick={() => setDrawer({ mode:"edit", data:{...p} })}>Edit</Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
    <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.mode === "add" ? "New Project" : "Edit Project"} width={620}>
      {drawer && <PForm data={drawer.data} onSave={save} onDelete={drawer?.mode === "edit" ? () => del(drawer.data.id) : null} />}
    </Drawer>
  </div>;
}

function PForm({ data: init, onSave, onDelete }) {
  const [d, setD] = useState(init);
  const up = (k, v) => setD(p => ({...p, [k]: v}));
  return <div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
      <Input label="Hotel Name" value={d.name} onChange={v => up("name", v)} span={2} />
      <Input label="Brand" value={d.brand} onChange={v => up("brand", v)} />
      <Input label="Segment" value={d.segment} onChange={v => up("segment", v)} options={["Luxury","Premium","Midscale","Economy"]} />
      <Input label="Keys" value={d.keys} onChange={v => up("keys", v)} type="number" />
      <Input label="Opening Date" value={d.openingDate} onChange={v => up("openingDate", v)} type="date" />
      <Input label="Country" value={d.country} onChange={v => up("country", v)} />
      <Input label="City" value={d.city} onChange={v => up("city", v)} />
      <Input label="Currency" value={d.currency} onChange={v => up("currency", v)} options={["SAR","USD","EUR","AED"]} />
      <Input label="Type" value={d.type} onChange={v => up("type", v)} options={["New built","Conversion","Renovation"]} />
      <Input label="FX USD" value={d.fxUSD} onChange={v => up("fxUSD", v)} type="number" />
      <Input label="FX EUR" value={d.fxEUR} onChange={v => up("fxEUR", v)} type="number" />
      <Input label="Pre-Open Months" value={d.preOpenMonths} onChange={v => up("preOpenMonths", v)} type="number" />
      <Input label="Status" value={d.status} onChange={v => up("status", v)} options={["draft","active","approved","archived"]} />
    </div>
    <div style={{ display:"flex", gap:10 }}>
      <Btn primary onClick={() => onSave(d)} style={{ flex:1 }}>Save Project</Btn>
      {onDelete && <Btn danger onClick={onDelete}>Delete</Btn>}
    </div>
  </div>;
}

/* ═══ USER MANAGEMENT ═══ */
function UserMgmt({ client, users, setUsers, projects }) {
  const { t } = uT();
  const cu = users.filter(u => u.clientId === client?.id);
  const cp = projects.filter(p => p.clientId === client?.id);
  const [drawer, setDrawer] = useState(null);
  const openAdd = () => setDrawer({ mode:"add", data:{ id:uid(), name:"", email:"", role:"budget_manager",
    clientId:client?.id, status:"invited", lastActive:null, projects:[] }});
  const save = d => {
    if (drawer.mode === "add") setUsers(prev => [...prev, d]);
    else setUsers(prev => prev.map(u => u.id === d.id ? d : u));
    setDrawer(null);
  };
  const del = id => { setUsers(prev => prev.filter(u => u.id !== id)); setDrawer(null); };

  return <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>User Management</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:4, fontFamily:FB }}>Team for {client?.name}</p>
      </div>
      <Btn primary onClick={openAdd} icon="+">Invite User</Btn>
    </div>
    <div style={{ display:"flex", gap:12, marginBottom:22, flexWrap:"wrap" }}>
      {Object.entries(ROLES).filter(([k]) => k !== "superadmin").map(([k, v]) => (
        <div key={k} style={{ background:t.bgCard, borderRadius:16, padding:"16px 20px", border:`1px solid ${t.brd}`,
          flex:1, minWidth:140, borderTop:`3px solid ${v.color}`, boxShadow:t.shd }}>
          <div style={{ fontSize:22, marginBottom:6 }}>{v.icon}</div>
          <div style={{ fontSize:20, fontWeight:800, color:t.tx, fontFamily:FN }}>{cu.filter(u => u.role === k).length}</div>
          <div style={{ fontSize:11, color:v.color, fontWeight:700, marginTop:2 }}>{v.label}</div>
        </div>
      ))}
    </div>
    <div style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5, fontFamily:FB }}>
        <thead><tr style={{ background:t.bgEl }}>
          {["User","Role","Status","Projects","Last Active",""].map(h =>
            <th key={h} style={{ padding:"11px 14px", textAlign:"left", color:t.txM, fontWeight:700, fontSize:10, textTransform:"uppercase", borderBottom:`1px solid ${t.brd}`, fontFamily:FN }}>{h}</th>)}
        </tr></thead>
        <tbody>{cu.map(u => {
          const role = ROLES[u.role];
          return <tr key={u.id} style={{ borderBottom:`1px solid ${t.brd}` }}>
            <td style={{ padding:"10px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Avatar name={u.name} size={32} color={role?.color} />
              <div><div style={{ fontSize:13, fontWeight:600, color:t.tx }}>{u.name}</div>
              <div style={{ fontSize:11, color:t.txD }}>{u.email}</div></div></div></td>
            <td style={{ padding:"10px 14px" }}><Pill color={role?.color}>{role?.label}</Pill></td>
            <td style={{ padding:"10px 14px" }}><StatusDot status={u.status} /></td>
            <td style={{ padding:"10px 14px" }}><Badge n={u.projects.length} color={t.acc} /></td>
            <td style={{ padding:"10px 14px", color:t.txD, fontSize:12 }}>{u.lastActive ? ago(u.lastActive) : "\u2014"}</td>
            <td style={{ padding:"10px 14px" }}><Btn small ghost onClick={() => setDrawer({ mode:"edit", data:{...u} })}>Edit</Btn></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.mode === "add" ? "Invite User" : "Edit User"}>
      {drawer && <UForm data={drawer.data} onSave={save} onDelete={drawer?.mode === "edit" ? () => del(drawer.data.id) : null} projects={cp} />}
    </Drawer>
  </div>;
}

function UForm({ data: init, onSave, onDelete, projects }) {
  const { t } = uT();
  const [d, setD] = useState(init);
  const up = (k, v) => setD(p => ({...p, [k]: v}));
  const toggleP = pid => setD(p => ({...p, projects: p.projects.includes(pid) ? p.projects.filter(x => x !== pid) : [...p.projects, pid] }));

  return <div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
      <Input label="Full Name" value={d.name} onChange={v => up("name", v)} span={2} />
      <Input label="Email" value={d.email} onChange={v => up("email", v)} span={2} />
      <Input label="Role" value={d.role} onChange={v => up("role", v)} options={Object.keys(ROLES).filter(r => r !== "superadmin")} />
      <Input label="Status" value={d.status} onChange={v => up("status", v)} options={["active","invited","inactive"]} />
    </div>
    <div style={{ marginBottom:20 }}>
      <label style={{ display:"block", fontSize:10, color:t.txM, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8, fontFamily:FN }}>Project Access</label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {projects.map(pr => (
          <div key={pr.id} onClick={() => toggleP(pr.id)} style={{
            padding:"12px 14px", borderRadius:8, cursor:"pointer",
            border:`1px solid ${d.projects.includes(pr.id) ? t.gold+"50" : t.brd}`,
            background: d.projects.includes(pr.id) ? t.gold+"0C" : t.inBg }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${d.projects.includes(pr.id) ? t.gold : t.txD}`,
                background: d.projects.includes(pr.id) ? t.gold : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {d.projects.includes(pr.id) && <span style={{ color:"#080b16", fontSize:12, fontWeight:800 }}>{"\u2713"}</span>}
              </div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:600, color:t.tx }}>{pr.name}</div>
                <div style={{ fontSize:10.5, color:t.txD }}>{pr.keys} keys</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ display:"flex", gap:10 }}>
      <Btn primary onClick={() => onSave(d)} style={{ flex:1 }}>Save User</Btn>
      {onDelete && <Btn danger onClick={onDelete}>Remove</Btn>}
    </div>
  </div>;
}

/* ═══ PROJECT OVERVIEW ═══ */
function POverview({ project: p, manning, expenses }) {
  const { t } = uT();
  const mx = getSalMatrix(p);
  const fx = c => c === "USD" ? p.fxUSD : c === "EUR" ? p.fxEUR : 1;
  const manT = manning.reduce((s, m) => s + cPkg(m.grade, mx) * m.hc * m.startM, 0);
  const expT = expenses.reduce((s, e) => s + e.cost * (e.units || 1) * fx(e.cur), 0);
  const recT = manning.reduce((s, m) => s + ((m.recAir||0) + (m.recAgency||0) + (m.recVisa||0)) * m.hc, 0);
  const relocT = manning.reduce((s, m) => { const mm = mx[m.grade]; return s + (mm ? (mm.reloc||0) : 0) * m.hc; }, 0);
  const total = manT + expT + recT + relocT;
  const fte = manning.reduce((s, m) => s + m.hc, 0);
  const accomCount = manning.filter(m => m.accomNeeded && m.accomNeeded !== "no").reduce((s, m) => s + m.hc, 0);
  const divMap = {};
  manning.forEach(m => { if (!divMap[m.div]) divMap[m.div] = { man:0, exp:0 }; divMap[m.div].man += cPkg(m.grade, mx) * m.hc * m.startM; });
  expenses.forEach(e => { if (!divMap[e.div]) divMap[e.div] = { man:0, exp:0 }; divMap[e.div].exp += e.cost * (e.units || 1) * fx(e.cur); });
  const divs = Object.entries(divMap).map(([id, v]) => ({ id, ...v, t: v.man + v.exp, c: DIVS.find(d => d.id === id)?.color || t.gold })).sort((a, b) => b.t - a.t);

  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:"0 0 4px", fontFamily:FN }}>Mission Control</h1>
    <p style={{ color:t.txD, fontSize:13, margin:"0 0 22px", fontFamily:FB }}>{p.name} &middot; {p.keys} Keys &middot; Opening {p.openingDate} &middot; {p.preOpenMonths || 18}mo pre-open</p>
    <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
      <StatCard label="Total Budget" value={fC(total, p.currency)} sub={fC(total/p.fxUSD, "USD")} color={t.gold} icon={"\ud83d\udc8e"} />
      <StatCard label="Total FTE" value={fmt(fte, 1)} sub={`${((fte/p.keys)*100).toFixed(1)} per 100 keys`} color={t.em} icon={"\ud83d\udc65"} />
      <StatCard label="Cost/Key" value={fC(total/p.keys, p.currency)} color={t.amb} icon={"\ud83d\udd11"} />
      <StatCard label="Labour %" value={pct(total > 0 ? manT/total : 0)} color={t.acc} icon={"\ud83d\udcca"} />
    </div>
    <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
      <StatCard label="Recruitment" value={fC(recT, p.currency)} sub="total recruitment cost" color={t.vio} icon={"\ud83d\udcce"} />
      <StatCard label="Relocation" value={fC(relocT, p.currency)} sub="total relocation cost" color={t.amb} icon={"\u2708"} />
      <StatCard label="Accommodation" value={fmt(accomCount, 0)} sub="positions needing accom." color={t.teal} icon={"\ud83c\udfe0"} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      <div style={{ background:t.bgCard, borderRadius:16, padding:"20px 22px", border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
        <div style={{ fontSize:10, fontWeight:700, color:t.txM, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14, fontFamily:FN }}>Budget by Division</div>
        <div style={{ display:"flex", borderRadius:16, overflow:"hidden", height:28, marginBottom:14, background:t.bgEl }}>
          {divs.filter(d => d.t > 0).map((d, i) => <div key={i} style={{ width:`${(d.t / total) * 100}%`, height:"100%", background:d.c, minWidth:2 }} />)}
        </div>
        {divs.slice(0, 7).map(d => <div key={d.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${t.brd}` }}>
          <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:t.tx }}><span style={{ width:8, height:8, borderRadius:2, background:d.c }} />{d.id}</span>
          <div style={{ display:"flex", gap:12 }}>
            <span style={{ fontSize:12, color:t.txM, fontWeight:600 }}>{fC(d.t, p.currency)}</span>
            <span style={{ fontSize:11, color:t.txD, width:36, textAlign:"right" }}>{pct(d.t / total)}</span>
          </div>
        </div>)}
      </div>
      <div style={{ background:t.bgCard, borderRadius:16, padding:"20px 22px", border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
        <div style={{ fontSize:10, fontWeight:700, color:t.txM, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14, fontFamily:FN }}>Manning by Grade</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {GRADES.map(g => {
            const c = manning.filter(m => m.grade === g.id).reduce((s, m) => s + m.hc, 0);
            return <div key={g.id} style={{ background: c > 0 ? t.gold+"0C" : "transparent", borderRadius:8,
              padding:"8px 12px", minWidth:60, textAlign:"center", border:`1px solid ${c > 0 ? t.gold+"20" : t.brd}` }}>
              <div style={{ fontSize:16, fontWeight:800, color: c > 0 ? t.goldL : t.txD, fontFamily:FN }}>{c || "\u2014"}</div>
              <div style={{ fontSize:8, color:t.txD, fontWeight:700 }}>G{g.id}</div>
            </div>;
          })}
        </div>
      </div>
    </div>
  </div>;
}

/* ═══ MANNING ═══ */
function PManning({ project: p, manning, setManning }) {
  const { t } = uT();
  const [drawer, setDrawer] = useState(null);
  const [filt, setFilt] = useState("all");
  const mx = getSalMatrix(p);
  const fil = filt === "all" ? manning : manning.filter(m => m.div === filt);
  const fte = fil.reduce((s, m) => s + m.hc, 0);
  const pay = fil.reduce((s, m) => s + cPkg(m.grade, mx) * m.hc * m.startM, 0);
  const recT = fil.reduce((s, m) => s + ((m.recAir||0) + (m.recAgency||0) + (m.recVisa||0)) * m.hc, 0);
  const relocT = fil.reduce((s, m) => { const mm = mx[m.grade]; return s + (mm ? (mm.reloc||0) : 0) * m.hc; }, 0);
  const accomCount = fil.filter(m => m.accomNeeded && m.accomNeeded !== "no").reduce((s, m) => s + m.hc, 0);
  const openAdd = () => setDrawer({ mode:"add", data:{ id:uid(), div:"Rooms", dept:"", pos:"", grade:"5", hc:1, startM:2,
    recAir:0, recAgency:0, recVisa:0, accomNeeded:"no", accomType:"", accomBeds:0 }});
  const save = d => {
    if (drawer.mode === "add") setManning(prev => [...prev, d]);
    else setManning(prev => prev.map(m => m.id === d.id ? d : m));
    setDrawer(null);
  };
  const del = id => { setManning(prev => prev.filter(m => m.id !== id)); setDrawer(null); };

  return <div>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>Manning</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:4, fontFamily:FB }}>Workforce planning</p>
      </div>
      <Btn primary onClick={openAdd} icon="+">Add Position</Btn>
    </div>
    <div style={{ display:"flex", gap:14, marginBottom:18, flexWrap:"wrap" }}>
      <StatCard label="FTE" value={fmt(fte, 1)} sub={`${((fte/p.keys)*100).toFixed(1)}/100 keys`} color={t.em} icon={"\ud83d\udc65"} />
      <StatCard label="Pre-Op Payroll" value={fC(pay, p.currency)} sub={fC(pay/p.fxUSD, "USD")} color={t.gold} icon={"\ud83d\udcb0"} />
      <StatCard label="Recruitment" value={fC(recT, p.currency)} color={t.acc} icon={"\ud83d\udcce"} />
      <StatCard label="Accommodation" value={fmt(accomCount,0)} sub="positions needing accom." color={t.teal} icon={"\ud83c\udfe0"} />
    </div>
    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
      {["all", ...new Set(manning.map(m => m.div))].map(d => (
        <button key={d} onClick={() => setFilt(d)} style={{
          padding:"4px 12px", borderRadius:20, border:`1px solid ${filt === d ? t.gold+"40" : t.brd}`,
          background: filt === d ? t.gold+"15" : "transparent", color: filt === d ? t.gold : t.txD,
          fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:FN
        }}>{d === "all" ? "All" : d}</button>
      ))}
    </div>
    <div style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd }}>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:FB }}>
          <thead><tr style={{ background:t.bgEl }}>
            {["Div","Dept","Position","Grade","HC","Start","Pkg/mo","Pre-Op","Recruit","Accom",""].map(h =>
              <th key={h} style={{ padding:"10px 12px", textAlign: ["Position","Div","Dept"].includes(h) ? "left" : "right",
                color:t.txM, fontWeight:700, fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.5px",
                borderBottom:`1px solid ${t.brd}`, fontFamily:FN }}>{h}</th>)}
          </tr></thead>
          <tbody>{fil.map(m => {
            const pkg = cPkg(m.grade, mx);
            const dc = DIVS.find(d => d.id === m.div);
            const mRec = ((m.recAir||0) + (m.recAgency||0) + (m.recVisa||0)) * m.hc;
            return <tr key={m.id} style={{ borderBottom:`1px solid ${t.brd}`, cursor:"pointer" }}
              onClick={() => setDrawer({ mode:"edit", data:{...m} })}>
              <td style={{ padding:"8px 12px" }}><span style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:2, background:dc?.color || t.gold }} />
                <span style={{ color:t.txM, fontSize:11 }}>{m.div}</span></span></td>
              <td style={{ padding:"8px 12px", color:t.tx, fontSize:11.5 }}>{m.dept}</td>
              <td style={{ padding:"8px 12px", color:t.tx, fontWeight:600 }}>{m.pos}</td>
              <td style={{ padding:"8px 12px", textAlign:"right" }}><Pill>{m.grade}</Pill></td>
              <td style={{ padding:"8px 12px", textAlign:"right", color:t.tx, fontWeight:700 }}>{m.hc}</td>
              <td style={{ padding:"8px 12px", textAlign:"right", color:t.txM }}>M-{m.startM}</td>
              <td style={{ padding:"8px 12px", textAlign:"right", color:t.goldL, fontWeight:600 }}>{fC(pkg, p.currency)}</td>
              <td style={{ padding:"8px 12px", textAlign:"right", color:t.tx, fontWeight:700 }}>{fC(pkg * m.hc * m.startM, p.currency)}</td>
              <td style={{ padding:"8px 12px", textAlign:"right", color: mRec > 0 ? t.acc : t.txD, fontSize:11 }}>{mRec > 0 ? fC(mRec, p.currency) : "\u2014"}</td>
              <td style={{ padding:"8px 12px", textAlign:"right" }}>{m.accomNeeded && m.accomNeeded !== "no"
                ? <Pill color={m.accomNeeded === "yes" ? t.em : t.teal}>{m.accomNeeded === "yes" ? m.accomType || "yes" : "shared"}</Pill>
                : <span style={{ color:t.txD }}>\u2014</span>}</td>
              <td style={{ padding:"8px 12px", textAlign:"center", color:t.txD }}>{"\u270e"}</td>
            </tr>;
          })}</tbody>
          <tfoot><tr style={{ background:t.gold+"0A", borderTop:`2px solid ${t.gold}30` }}>
            <td colSpan={4} style={{ padding:"10px 12px", color:t.gold, fontWeight:800, fontSize:11, fontFamily:FN }}>TOTAL</td>
            <td style={{ padding:"10px 12px", textAlign:"right", color:t.tx, fontWeight:800 }}>{fmt(fte, 1)}</td>
            <td colSpan={2} />
            <td style={{ padding:"10px 12px", textAlign:"right", color:t.tx, fontWeight:800 }}>{fC(pay, p.currency)}</td>
            <td style={{ padding:"10px 12px", textAlign:"right", color:t.acc, fontWeight:800, fontSize:11 }}>{fC(recT, p.currency)}</td>
            <td style={{ padding:"10px 12px", textAlign:"right", color:t.txM, fontSize:11 }}>{fmt(accomCount,0)}</td>
            <td />
          </tr></tfoot>
        </table>
      </div>
    </div>
    <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.mode === "add" ? "Add Position" : "Edit Position"} width={620}>
      {drawer && <MForm data={drawer.data} onSave={save} onDelete={drawer?.mode === "edit" ? () => del(drawer.data.id) : null}
        cur={p.currency} matrix={mx} preOpenMonths={p.preOpenMonths} />}
    </Drawer>
  </div>;
}

function MForm({ data: init, onSave, onDelete, cur, matrix, preOpenMonths }) {
  const { t } = uT();
  const [d, setD] = useState(init);
  const up = (k, v) => setD(p => ({...p, [k]: v}));
  const mx = matrix || SAL;
  const pkg = cPkg(d.grade, mx);
  const det = cDet(d.grade, mx);
  const poM = preOpenMonths || 18;
  const recPerEmp = (d.recAir || 0) + (d.recAgency || 0) + (d.recVisa || 0);
  const recTotal = recPerEmp * d.hc;
  const relocPerEmp = det.reloc || 0;
  const preOpPayroll = pkg * d.hc * d.startM;
  const preOpReloc = relocPerEmp * d.hc;
  const preOpTotal = preOpPayroll + preOpReloc + recTotal;

  const flow = calcManningCashflow(d, poM, mx);
  const flowMax = Math.max(...flow, 1);

  return <div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
      <Input label="Division" value={d.div} onChange={v => { up("div", v); up("dept", ""); }} options={DIVS.map(x => x.id)} />
      <Input label="Department" value={d.dept} onChange={v => up("dept", v)} options={DEPTS[d.div] || []} />
      <Input label="Position" value={d.pos} onChange={v => up("pos", v)} span={2} />
      <Input label="Grade" value={d.grade} onChange={v => up("grade", v)} options={GRADES.map(g => g.id)} />
      <Input label="Headcount" value={d.hc} onChange={v => up("hc", v)} type="number" />
      <Input label="Start (M-)" value={d.startM} onChange={v => up("startM", v)} type="number" />
    </div>

    {/* Recruitment Costs */}
    <div style={{ background:t.bgEl, borderRadius:16, padding:18, marginBottom:18, border:`1px solid ${t.brd}` }}>
      <div style={{ fontSize:11, fontWeight:700, color:t.acc, marginBottom:10, fontFamily:FN }}>Recruitment Costs</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:12 }}>
        <Input label="Airfare (Interview)" value={d.recAir} onChange={v => up("recAir", v)} type="number" />
        <Input label="Agency Cost" value={d.recAgency} onChange={v => up("recAgency", v)} type="number" />
        <Input label="Visa & Permits" value={d.recVisa} onChange={v => up("recVisa", v)} type="number" />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:t.txM }}>
        <span>Per employee: <strong style={{ color:t.tx }}>{fC(recPerEmp, cur)}</strong></span>
        <span>Total ({d.hc} HC): <strong style={{ color:t.goldL }}>{fC(recTotal, cur)}</strong></span>
      </div>
    </div>

    {/* Accommodation */}
    <div style={{ background:t.bgEl, borderRadius:16, padding:18, marginBottom:18, border:`1px solid ${t.brd}` }}>
      <div style={{ fontSize:11, fontWeight:700, color:t.em, marginBottom:10, fontFamily:FN }}>Accommodation</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <Input label="Needed" value={d.accomNeeded} onChange={v => up("accomNeeded", v)} options={["no","yes","shared"]} />
        <Input label="Type" value={d.accomType} onChange={v => up("accomType", v)} options={["","studio","1-bed","2-bed","shared"]} />
        <Input label="Beds/Room" value={d.accomBeds} onChange={v => up("accomBeds", v)} type="number" />
      </div>
    </div>

    {/* Full salary breakdown */}
    <div style={{ background:t.bgEl, borderRadius:16, padding:18, marginBottom:18, border:`1px solid ${t.brd}` }}>
      <div style={{ fontSize:11, fontWeight:700, color:t.gold, marginBottom:10, fontFamily:FN }}>Salary Breakdown &mdash; Grade {d.grade}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6 }}>
        {[{l:"Basic",v:det.basic},{l:"Housing",v:det.h},{l:"Transport",v:det.t},{l:"Utility",v:det.util},
          {l:"Schooling",v:det.sch},{l:"Meal",v:det.meal},{l:"Laundry",v:det.laun},{l:"Phone",v:det.ph},
          {l:"Medical",v:det.med},{l:"Life Ins",v:det.li},{l:"Workers Comp",v:det.wc},{l:"Pension",v:det.pen},
          {l:"Soc Ins",v:det.si},{l:"Emp Tax",v:det.etax},{l:"Emp Other",v:det.eoth},{l:"Bonus/mo",v:det.bonus},
          {l:"Oth Bonus/mo",v:det.obon},{l:"Severance",v:det.sev},{l:"Vacation",v:det.vac},{l:"Supplemental",v:det.supp},
          {l:"Air Ticket/mo",v:det.air}].map(x =>
          <div key={x.l} style={{ background:t.inBg, borderRadius:6, padding:"5px 8px", textAlign:"center" }}>
            <div style={{ fontSize:7, color:t.txD, fontWeight:700 }}>{x.l}</div>
            <div style={{ fontSize:10.5, color: x.v > 0 ? t.tx : t.txD, fontWeight:600 }}>{x.v > 0 ? fmt(x.v) : "\u2014"}</div>
          </div>)}
      </div>
      <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${t.brd}`, display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, fontWeight:700, color:t.gold, fontFamily:FN }}>Monthly Package</span>
        <span style={{ fontSize:16, fontWeight:800, color:t.goldL, fontFamily:FN }}>{fC(pkg, cur)}</span>
      </div>
      {relocPerEmp > 0 && <div style={{ marginTop:6, display:"flex", justifyContent:"space-between", fontSize:11, color:t.txM }}>
        <span>Relocation (one-time)</span>
        <span style={{ color:t.amb, fontWeight:600 }}>{fC(relocPerEmp, cur)}</span>
      </div>}
    </div>

    {/* Monthly cashflow preview */}
    <div style={{ background:t.bgEl, borderRadius:16, padding:18, marginBottom:18, border:`1px solid ${t.brd}` }}>
      <div style={{ fontSize:11, fontWeight:700, color:t.vio, marginBottom:10, fontFamily:FN }}>Monthly Cashflow</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:60 }}>
        {flow.map((v, i) => {
          const label = i < poM ? `M-${poM - i}` : i === poM ? "M0" : `M+${i - poM}`;
          const isFirst = i === (poM - d.startM);
          return <div key={i} title={`${label}: ${fC(v, cur)}`} style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ width:"100%", background: v > 0 ? (isFirst ? t.amb : t.vio+"80") : "transparent",
              borderRadius:"2px 2px 0 0", height: v > 0 ? Math.max(4, (v / flowMax) * 48) : 0 }} />
          </div>;
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:9, color:t.txD }}>
        <span>M-{poM}</span>
        <span>Opening</span>
        <span>M+4</span>
      </div>
      {d.startM > 0 && <div style={{ marginTop:8, fontSize:10, color:t.txD }}>
        Starts M-{d.startM} &middot; {d.startM} months of payroll
        {relocPerEmp > 0 && <span> &middot; <span style={{ color:t.amb }}>Relocation at M-{d.startM}</span></span>}
      </div>}
    </div>

    {/* Pre-opening total */}
    <div style={{ background:t.gold+"0A", borderRadius:16, padding:16, marginBottom:18, border:`1px solid ${t.gold}20` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <div>
          <div style={{ fontSize:9, color:t.gold, fontWeight:700, textTransform:"uppercase" }}>Pre-Opening Total</div>
          <div style={{ fontSize:10, color:t.txD, marginTop:2 }}>{d.hc} HC x {fC(pkg, cur)} x {d.startM} mo + reloc + recruitment</div>
        </div>
        <div style={{ fontSize:20, fontWeight:800, color:t.goldL, fontFamily:FN }}>{fC(preOpTotal, cur)}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, fontSize:10, color:t.txD }}>
        <div style={{ background:t.inBg, borderRadius:6, padding:"4px 8px", textAlign:"center" }}>
          <div style={{ fontSize:7.5, fontWeight:700 }}>Payroll</div>
          <div style={{ color:t.tx, fontWeight:600 }}>{fC(preOpPayroll, cur)}</div>
        </div>
        <div style={{ background:t.inBg, borderRadius:6, padding:"4px 8px", textAlign:"center" }}>
          <div style={{ fontSize:7.5, fontWeight:700 }}>Relocation</div>
          <div style={{ color:t.tx, fontWeight:600 }}>{fC(preOpReloc, cur)}</div>
        </div>
        <div style={{ background:t.inBg, borderRadius:6, padding:"4px 8px", textAlign:"center" }}>
          <div style={{ fontSize:7.5, fontWeight:700 }}>Recruitment</div>
          <div style={{ color:t.tx, fontWeight:600 }}>{fC(recTotal, cur)}</div>
        </div>
      </div>
    </div>
    <div style={{ display:"flex", gap:10 }}>
      <Btn primary onClick={() => onSave(d)} style={{ flex:1 }}>Save</Btn>
      {onDelete && <Btn danger onClick={onDelete}>Delete</Btn>}
    </div>
  </div>;
}

/* ═══ EXPENSES ═══ */
function PExpenses({ project: p, expenses, setExpenses }) {
  const { t } = uT();
  const [drawer, setDrawer] = useState(null);
  const [filt, setFilt] = useState("all");
  const fx = c => c === "USD" ? p.fxUSD : c === "EUR" ? p.fxEUR : 1;
  const fil = filt === "all" ? expenses : expenses.filter(e => e.div === filt);
  const total = fil.reduce((s, e) => s + e.cost * (e.units || 1) * fx(e.cur), 0);
  const openAdd = () => setDrawer({ mode:"add", data:{ id:uid(), div:"A&G", dept:"", usali:"", item:"",
    basis:"Per hotel", rec:"One-time M-3", units:1, cost:0, cur:"USD" }});
  const save = d => {
    if (drawer.mode === "add") setExpenses(prev => [...prev, d]);
    else setExpenses(prev => prev.map(e => e.id === d.id ? d : e));
    setDrawer(null);
  };
  const del = id => { setExpenses(prev => prev.filter(e => e.id !== id)); setDrawer(null); };

  const grouped = {};
  fil.forEach(e => { const k = e.div; if (!grouped[k]) grouped[k] = { items:[], t:0 }; grouped[k].items.push(e); grouped[k].t += e.cost * (e.units || 1) * fx(e.cur); });

  return <div>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>Expenses</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:4, fontFamily:FB }}>USALI-based expense line items</p>
      </div>
      <Btn primary onClick={openAdd} icon="+">Add Expense</Btn>
    </div>
    <div style={{ display:"flex", gap:14, marginBottom:18, flexWrap:"wrap" }}>
      <StatCard label="Total Expenses" value={fC(total, p.currency)} sub={fC(total/p.fxUSD, "USD")} color={t.amb} icon={"\ud83d\udcb0"} />
      <StatCard label="Items" value={fil.length} color={t.em} icon={"\ud83d\udccb"} />
      <StatCard label="Exp/Key" value={fC(total/p.keys, p.currency)} color={t.cor} icon={"\ud83d\udd11"} />
    </div>
    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
      {["all", ...new Set(expenses.map(e => e.div))].map(d => (
        <button key={d} onClick={() => setFilt(d)} style={{
          padding:"4px 12px", borderRadius:20, border:`1px solid ${filt === d ? t.gold+"40" : t.brd}`,
          background: filt === d ? t.gold+"15" : "transparent", color: filt === d ? t.gold : t.txD,
          fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:FN
        }}>{d === "all" ? "All" : d}</button>
      ))}
    </div>
    {Object.entries(grouped).sort((a, b) => b[1].t - a[1].t).map(([g, data]) => {
      const dc = DIVS.find(d => d.id === g);
      return <div key={g} style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, marginBottom:12, overflow:"hidden", boxShadow:t.shd }}>
        <div style={{ padding:"12px 18px", background:t.bgEl, display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${t.brd}` }}>
          <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, fontWeight:700, color:t.tx, fontFamily:FN }}>
            <span style={{ width:7, height:7, borderRadius:2, background:dc?.color || t.gold }} />{g}
            <span style={{ fontSize:11, color:t.txD, fontWeight:500 }}>({data.items.length})</span>
          </span>
          <span style={{ fontSize:13, fontWeight:700, color:t.goldL, fontFamily:FN }}>{fC(data.t, p.currency)}</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:FB }}>
          <tbody>{data.items.map(e => (
            <tr key={e.id} onClick={() => setDrawer({ mode:"edit", data:{...e} })} style={{ borderBottom:`1px solid ${t.brd}`, cursor:"pointer" }}>
              <td style={{ padding:"8px 14px", color:t.tx, fontWeight:500 }}>{e.item}</td>
              <td style={{ padding:"8px 14px", color:t.txD, fontSize:11 }}>{e.usali}</td>
              <td style={{ padding:"8px 14px" }}><Pill color={e.rec.includes("Monthly") ? t.em : t.amb}>{e.rec.replace("One-time ","")}</Pill></td>
              <td style={{ padding:"8px 14px", textAlign:"right", color:t.tx, fontWeight:600 }}>{fmt(e.cost)} {e.cur}</td>
              <td style={{ padding:"8px 14px", textAlign:"right", color:t.goldL, fontWeight:700 }}>{fC(e.cost * (e.units || 1) * fx(e.cur), p.currency)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>;
    })}
    <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.mode === "add" ? "Add Expense" : "Edit Expense"}>
      {drawer && <EForm data={drawer.data} onSave={save} onDelete={drawer?.mode === "edit" ? () => del(drawer.data.id) : null} cur={p.currency} fx={fx} />}
    </Drawer>
  </div>;
}

function EForm({ data: init, onSave, onDelete, cur, fx }) {
  const { t } = uT();
  const [d, setD] = useState(init);
  const up = (k, v) => setD(p => ({...p, [k]: v}));
  const total = d.cost * (d.units || 1) * fx(d.cur);

  return <div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
      <Input label="Division" value={d.div} onChange={v => { up("div", v); up("dept", ""); }} options={DIVS.map(x => x.id)} />
      <Input label="Department" value={d.dept} onChange={v => up("dept", v)} options={DEPTS[d.div] || []} />
      <Input label="USALI Account" value={d.usali} onChange={v => up("usali", v)} options={USALI} span={2} />
      <Input label="Item Name" value={d.item} onChange={v => up("item", v)} span={2} />
      <Input label="Basis" value={d.basis} onChange={v => up("basis", v)} options={BASES} />
      <Input label="Recurrence" value={d.rec} onChange={v => up("rec", v)} options={RECS} />
      <Input label="Units" value={d.units} onChange={v => up("units", v)} type="number" />
      <Input label="Unit Cost" value={d.cost} onChange={v => up("cost", v)} type="number" />
      <Input label="Currency" value={d.cur} onChange={v => up("cur", v)} options={["SAR","USD","EUR"]} />
    </div>
    <div style={{ background:t.gold+"0A", borderRadius:16, padding:16, marginBottom:18, border:`1px solid ${t.gold}20`,
      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ fontSize:9, color:t.gold, fontWeight:700, textTransform:"uppercase" }}>Total ({cur})</div>
      <div style={{ fontSize:20, fontWeight:800, color:t.goldL, fontFamily:FN }}>{fC(total, cur)}</div>
    </div>
    <div style={{ display:"flex", gap:10 }}>
      <Btn primary onClick={() => onSave(d)} style={{ flex:1 }}>Save</Btn>
      {onDelete && <Btn danger onClick={onDelete}>Delete</Btn>}
    </div>
  </div>;
}

/* ═══ BUDGET SUMMARY ═══ */
function PBudget({ project: p, manning, expenses }) {
  const { t } = uT();
  const mx = getSalMatrix(p);
  const fx = c => c === "USD" ? p.fxUSD : c === "EUR" ? p.fxEUR : 1;
  const divMap = {"Rooms":2,"F&B":3,"Golf":4,"Spa":5,"Parking":6,"A&G":7,"IT":8,"S&M":9,"POM":10,"Utilities":11,"Non Op.":12};
  const cats = [{id:1,n:"1 \u2013 Labour",c:t.gold},{id:2,n:"2 \u2013 Rooms",c:t.em},{id:3,n:"3 \u2013 F&B",c:t.amb},
    {id:4,n:"4 \u2013 Golf",c:"#4ADE80"},{id:5,n:"5 \u2013 Spa",c:"#38BDF8"},{id:6,n:"6 \u2013 Parking",c:"#94A3B8"},
    {id:7,n:"7 \u2013 A&G",c:t.acc},{id:8,n:"8 \u2013 IT",c:t.vio},{id:9,n:"9 \u2013 S&M",c:t.pink},
    {id:10,n:"10 \u2013 POM",c:t.teal},{id:11,n:"11 \u2013 Utilities",c:"#78716C"},
    {id:12,n:"12 \u2013 Non Op.",c:t.cor},{id:13,n:"13 \u2013 Contingency 3%",c:"#F97316"}];
  const labPayroll = manning.reduce((s, m) => s + cPkg(m.grade, mx) * m.hc * m.startM, 0);
  const labRec = manning.reduce((s, m) => s + ((m.recAir||0) + (m.recAgency||0) + (m.recVisa||0)) * m.hc, 0);
  const labReloc = manning.reduce((s, m) => { const mm = mx[m.grade]; return s + (mm ? (mm.reloc||0) : 0) * m.hc; }, 0);
  const labT = labPayroll + labRec + labReloc;
  const ed = {};
  expenses.forEach(e => { const cid = divMap[e.div] || 7; ed[cid] = (ed[cid] || 0) + e.cost * (e.units || 1) * fx(e.cur); });
  const lines = cats.map(c => {
    let v = c.id === 1 ? labT : c.id === 13 ? Object.values(ed).reduce((s, x) => s + x, 0) * .03 : (ed[c.id] || 0);
    return {...c, v};
  });
  const grand = lines.reduce((s, l) => s + l.v, 0);

  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:"0 0 4px", fontFamily:FN }}>Budget Summary</h1>
    <p style={{ color:t.txD, fontSize:13, margin:"0 0 22px", fontFamily:FB }}>{p.name}</p>
    <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
      <StatCard label={`Grand Total (${p.currency})`} value={fC(grand, p.currency)} color={t.gold} icon={"\ud83d\udc8e"} />
      <StatCard label="Total (USD)" value={fC(grand/p.fxUSD, "USD")} color={t.acc} icon={"\ud83d\udcb5"} />
      <StatCard label="Cost/Key" value={fC(grand/p.keys, p.currency)} color={t.amb} icon={"\ud83d\udd11"} />
    </div>
    <div style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:FB }}>
        <thead><tr style={{ background:t.bgEl }}>
          {["Category",`Total (${p.currency})`,"USD","Cost/Key","Share"].map(h =>
            <th key={h} style={{ padding:"12px 16px", textAlign: h === "Category" ? "left" : "right",
              color:t.txM, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px",
              borderBottom:`2px solid ${t.brd}`, fontFamily:FN }}>{h}</th>)}
        </tr></thead>
        <tbody>{lines.map(l => {
          const sh = grand > 0 ? l.v / grand : 0;
          return <tr key={l.id} style={{ borderBottom:`1px solid ${t.brd}`, opacity: l.v === 0 ? .35 : 1 }}>
            <td style={{ padding:"12px 16px" }}><span style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:9, height:9, borderRadius:3, background:l.c }} />
              <span style={{ color:t.tx, fontWeight:600, fontSize:13, fontFamily:FN }}>{l.n}</span></span></td>
            <td style={{ padding:"12px 16px", textAlign:"right", color:t.tx, fontWeight:700, fontSize:13 }}>{fC(l.v, p.currency)}</td>
            <td style={{ padding:"12px 16px", textAlign:"right", color:t.txM, fontSize:12.5 }}>{fC(l.v/p.fxUSD, "USD")}</td>
            <td style={{ padding:"12px 16px", textAlign:"right", color:t.txM, fontSize:12.5 }}>{l.v > 0 ? fC(l.v/p.keys, p.currency) : "\u2014"}</td>
            <td style={{ padding:"12px 16px", textAlign:"right" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end" }}>
                <div style={{ width:50, height:4, borderRadius:2, background:t.bgEl, overflow:"hidden" }}>
                  <div style={{ width:`${sh*100}%`, height:"100%", borderRadius:2, background:l.c }} />
                </div>
                <span style={{ fontSize:11, color:t.txD, width:36, textAlign:"right" }}>{pct(sh)}</span>
              </div>
            </td>
          </tr>;
        })}</tbody>
        <tfoot><tr style={{ background:t.gold+"0C", borderTop:`2px solid ${t.gold}30` }}>
          <td style={{ padding:"14px 16px", color:t.gold, fontWeight:800, fontSize:13, fontFamily:FN }}>GRAND TOTAL</td>
          <td style={{ padding:"14px 16px", textAlign:"right", color:t.tx, fontWeight:800, fontSize:14, fontFamily:FN }}>{fC(grand, p.currency)}</td>
          <td style={{ padding:"14px 16px", textAlign:"right", color:t.tx, fontWeight:700, fontSize:12.5 }}>{fC(grand/p.fxUSD, "USD")}</td>
          <td style={{ padding:"14px 16px", textAlign:"right", color:t.tx, fontWeight:700, fontSize:12.5 }}>{fC(grand/p.keys, p.currency)}</td>
          <td style={{ padding:"14px 16px", textAlign:"right", color:t.gold, fontWeight:800 }}>100%</td>
        </tr></tfoot>
      </table>
    </div>
  </div>;
}

/* ═══ AI WIZARD ═══ */
function AIWizard({ project: p, manning, expenses }) {
  const { t } = uT();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [history]);

  const mx = getSalMatrix(p);
  const fx = c => c === "USD" ? p.fxUSD : c === "EUR" ? p.fxEUR : 1;
  const fte = manning.reduce((s, m) => s + m.hc, 0);
  const manT = manning.reduce((s, m) => s + cPkg(m.grade, mx) * m.hc * m.startM, 0);
  const recT = manning.reduce((s, m) => s + ((m.recAir||0) + (m.recAgency||0) + (m.recVisa||0)) * m.hc, 0);
  const expT = expenses.reduce((s, e) => s + e.cost * (e.units || 1) * fx(e.cur), 0);
  const total = manT + expT + recT;

  const sysPrompt = `You are a hospitality pre-opening budget analyst for ${p.name}.
Hotel: ${p.name}, ${p.keys} keys, ${p.segment} segment, ${p.brand} brand.
Location: ${p.city}, ${p.country}. Opening: ${p.openingDate}. Currency: ${p.currency} (USD rate ${p.fxUSD}).
Current FTE: ${fte} (${((fte/p.keys)*100).toFixed(1)} per 100 keys). Budget: ${fC(total, p.currency)} (${fC(total/p.fxUSD, "USD")}).
Outlets: ${p.outlets.map(o => o.name + " (" + o.seats + " seats)").join(", ")}.
Facilities: ${p.facilities.map(f => f.name + " (" + f.sqm + " sqm)").join(", ")}.
Manning positions: ${manning.length}. Expense items: ${expenses.length}.
Provide specific, actionable advice with numbers and benchmarks.`;

  const send = async () => {
    if (!prompt.trim() || loading) return;
    const userMsg = prompt.trim();
    setPrompt("");
    setHistory(prev => [...prev, { role:"user", content:userMsg }]);
    setLoading(true);
    try {
      const msgs = [...history.map(h => ({ role:h.role, content:h.content })), { role:"user", content:userMsg }];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sysPrompt, messages:msgs })
      });
      const data = await res.json();
      const aiText = data.content?.map(c => c.text || "").join("\n") || "I couldn't generate a response.";
      setHistory(prev => [...prev, { role:"assistant", content:aiText }]);
    } catch (e) {
      setHistory(prev => [...prev, { role:"assistant", content:"Error connecting to AI. Please try again." }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    "Typical FTE per 100 keys for luxury resort in Saudi Arabia?",
    "Suggest missing departments or positions",
    "Pre-opening F&B expenses likely missing",
    "Benchmark current budget vs similar openings",
    "Recommended hiring timeline for last 6 months",
    "IT systems and costs to budget for",
    "Pre-opening marketing budget breakdown",
    "Critical path items to focus on now"
  ];

  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:"0 0 4px", fontFamily:FN }}>AI Wizard</h1>
    <p style={{ color:t.txD, fontSize:13, margin:"0 0 22px", fontFamily:FB }}>AI-powered budget analyst for {p.name}</p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
      {/* Chat */}
      <div style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd, display:"flex", flexDirection:"column", height:520 }}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${t.brd}`, background:t.bgEl }}>
          <span style={{ fontSize:12, fontWeight:700, color:t.gold, fontFamily:FN }}>{"\u2726"} AI Budget Analyst</span>
        </div>
        <div ref={chatRef} style={{ flex:1, overflow:"auto", padding:18 }}>
          {history.length === 0 && <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>{"\u2726"}</div>
            <div style={{ fontSize:14, fontWeight:700, color:t.tx, fontFamily:FN }}>Ask me anything about your budget</div>
            <div style={{ fontSize:12, color:t.txD, marginTop:6 }}>I have full context of your project data</div>
          </div>}
          {history.map((msg, i) => (
            <div key={i} style={{ display:"flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom:12 }}>
              <div style={{ maxWidth:"80%", padding:"12px 16px", borderRadius:16,
                background: msg.role === "user" ? t.gold+"18" : t.bgEl,
                border:`1px solid ${msg.role === "user" ? t.gold+"30" : t.brd}` }}>
                <div style={{ fontSize:9, color: msg.role === "user" ? t.gold : t.acc, fontWeight:700, marginBottom:4, fontFamily:FN }}>
                  {msg.role === "user" ? "You" : "AI Analyst \u2726"}
                </div>
                <div style={{ fontSize:12.5, color:t.tx, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:12 }}>
            <div style={{ padding:"12px 16px", borderRadius:16, background:t.bgEl, border:`1px solid ${t.brd}` }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:4, background:t.gold,
                  animation:`aiPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>}
        </div>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${t.brd}`, display:"flex", gap:8 }}>
          <input value={prompt} onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            placeholder="Ask about your budget..."
            style={{ flex:1, padding:"10px 14px", borderRadius:8, border:`1px solid ${t.brd}`,
              background:t.inBg, color:t.tx, fontSize:13, fontFamily:FB, outline:"none" }} />
          <Btn primary onClick={send} disabled={loading || !prompt.trim()}>Send</Btn>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ background:t.bgCard, borderRadius:16, padding:"16px 18px", border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
          <div style={{ fontSize:10, fontWeight:700, color:t.txM, textTransform:"uppercase", marginBottom:10, fontFamily:FN }}>Project Snapshot</div>
          {[{l:"Hotel",v:p.name},{l:"Keys",v:p.keys},{l:"Segment",v:p.segment},{l:"Country",v:p.country},
            {l:"FTE",v:fmt(fte,1)},{l:"FTE/100 keys",v:((fte/p.keys)*100).toFixed(1)},
            {l:"Budget",v:fC(total,p.currency)},{l:"Cost/Key",v:fC(total/p.keys,p.currency)}
          ].map(x => <div key={x.l} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${t.brd}` }}>
            <span style={{ fontSize:11, color:t.txD }}>{x.l}</span>
            <span style={{ fontSize:11, color:t.tx, fontWeight:600 }}>{x.v}</span>
          </div>)}
        </div>
        <div style={{ background:t.bgCard, borderRadius:16, padding:"16px 18px", border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
          <div style={{ fontSize:10, fontWeight:700, color:t.txM, textTransform:"uppercase", marginBottom:10, fontFamily:FN }}>Quick Prompts</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {quickPrompts.map((q, i) => (
              <button key={i} onClick={() => setPrompt(q)} style={{
                textAlign:"left", padding:"8px 10px", borderRadius:8, border:`1px solid ${t.brd}`,
                background:"transparent", color:t.txM, fontSize:11, cursor:"pointer", fontFamily:FB, lineHeight:1.4
              }}>{q}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
    <style>{`@keyframes aiPulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
  </div>;
}

/* ═══ MAIN APP ═══ */
export default function PreOpenApp() {
  const [page, setPage] = useState("sa_dash");
  const [clients, setClients] = useState(initClients);
  const [users, setUsers] = useState(initUsers);
  const [projects, setProjects] = useState(initProjects);
  const [currentUser] = useState(() => initUsers().find(u => u.role === "superadmin"));
  const [currentClient, setCurrentClient] = useState(() => initClients()[0]);
  const [currentProject, setCurrentProject] = useState(null);
  const [manningData, setManningData] = useState(MBP.p1 || []);
  const [expensesData, setExpensesData] = useState(EBP.p1 || []);
  const [mode, setMode] = useState("dark");
  const t = themes[mode];
  const toggle = () => setMode(m => m === "dark" ? "light" : "dark");

  const switchProject = p => {
    setCurrentProject(p);
    setManningData(MBP[p.id] || []);
    setExpensesData(EBP[p.id] || []);
    setPage("overview");
  };
  const switchClient = c => { setCurrentClient(c); setCurrentProject(null); setPage("home"); };

  const renderPage = () => {
    switch (page) {
      case "sa_dash": return <SADash clients={clients} users={users} projects={projects} />;
      case "sa_clients": return <SAClients clients={clients} setClients={setClients} users={users} projects={projects} setCurrentClient={switchClient} setPage={setPage} />;
      case "sa_users_global": return <SAUsers users={users} clients={clients} />;
      case "sa_analytics": return <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>Platform Analytics</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:4, marginBottom:22 }}>Cross-client metrics</p>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          <StatCard label="MRR" value="$42,500" color={t.gold} icon={"\ud83d\udcb0"} />
          <StatCard label="Projects" value={projects.length} color={t.em} icon={"\ud83c\udfe8"} />
          <StatCard label="Active Users" value={users.filter(u => u.lastActive && (Date.now() - new Date(u.lastActive).getTime()) < 7*86400000).length} color={t.acc} icon={"\ud83d\udc65"} />
          <StatCard label="Keys Managed" value={fmt(projects.reduce((s, p) => s + p.keys, 0))} color={t.amb} icon={"\ud83d\udd11"} />
        </div>
      </div>;
      case "sa_settings": return <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:0, fontFamily:FN }}>Platform Settings</h1>
        <p style={{ color:t.txD, fontSize:13, marginTop:4, marginBottom:22 }}>Global configuration</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[{t:"Salary Matrix",d:"Grade-based salary benchmarks",icon:"\ud83d\udcb0",count:`${GRADES.length} grades`},
            {t:"Expense Benchmarks",d:"USALI expense templates",icon:"\ud83d\udccb",count:`${USALI.length} accounts`},
            {t:"Divisions & Depts",d:"Organizational structure",icon:"\ud83c\udfe2",count:`${DIVS.length} divisions`},
            {t:"Currencies & FX",d:"Exchange rate defaults",icon:"\ud83d\udcb1",count:"7 currencies"}
          ].map(c => <div key={c.t} style={{ background:t.bgCard, borderRadius:16, padding:"20px 22px", border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
            <div style={{ fontSize:15, fontWeight:700, color:t.tx, fontFamily:FN }}>{c.t}</div>
            <div style={{ fontSize:12, color:t.txD, marginTop:4, lineHeight:1.5 }}>{c.d}</div>
            <div style={{ marginTop:10 }}><Pill color={t.acc}>{c.count}</Pill></div>
          </div>)}
        </div>
      </div>;
      case "home": return <ClientHome client={currentClient} projects={projects} users={users} setCurrentProject={switchProject} setPage={setPage} />;
      case "sites": return <SiteMgmt client={currentClient} projects={projects} setProjects={setProjects} setCurrentProject={switchProject} setPage={setPage} />;
      case "users": return <UserMgmt client={currentClient} users={users} setUsers={setUsers} projects={projects} />;
      case "overview": return currentProject ? <POverview project={currentProject} manning={manningData} expenses={expensesData} /> : <Empty icon={"\ud83c\udfe8"} title="No project selected" sub="Select a project from Site Management" action={<Btn primary onClick={() => setPage("sites")}>Open Sites</Btn>} />;
      case "setup": return currentProject ? <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:"0 0 4px", fontFamily:FN }}>Project Setup</h1>
        <p style={{ color:t.txD, fontSize:13, margin:"0 0 22px" }}>{currentProject.name} &middot; {currentProject.keys} keys</p>
        <div style={{ background:t.bgCard, borderRadius:16, padding:24, border:`1px solid ${t.brd}`, marginBottom:16, boxShadow:t.shd }}>
          <div style={{ fontSize:12, fontWeight:700, color:t.gold, marginBottom:14, fontFamily:FN }}>Property Info</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:14 }}>
            {[{l:"Hotel",v:currentProject.name},{l:"Brand",v:currentProject.brand},{l:"Segment",v:currentProject.segment},{l:"Keys",v:currentProject.keys},
              {l:"Opening",v:currentProject.openingDate},{l:"Country",v:currentProject.country},{l:"City",v:currentProject.city},{l:"Currency",v:currentProject.currency},
              {l:"Type",v:currentProject.type},{l:"FX USD",v:currentProject.fxUSD},{l:"FX EUR",v:currentProject.fxEUR},{l:"Status",v:currentProject.status}
            ].map(f => <div key={f.l}>
              <div style={{ fontSize:9.5, color:t.txD, fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>{f.l}</div>
              <div style={{ background:t.inBg, borderRadius:8, padding:"10px 14px", border:`1px solid ${t.brd}`, color:t.tx, fontSize:13 }}>{f.v}</div>
            </div>)}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:t.bgCard, borderRadius:16, padding:24, border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.gold, marginBottom:12, fontFamily:FN }}>Outlets ({currentProject.outlets.length})</div>
            {currentProject.outlets.map((o, i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${t.brd}` }}>
              <span style={{ fontSize:13, color:t.tx }}>{o.name}</span><span style={{ fontSize:12, color:t.txD }}>{o.seats} seats</span></div>)}
          </div>
          <div style={{ background:t.bgCard, borderRadius:16, padding:24, border:`1px solid ${t.brd}`, boxShadow:t.shd }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.gold, marginBottom:12, fontFamily:FN }}>Facilities ({currentProject.facilities.length})</div>
            {currentProject.facilities.map((f, i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${t.brd}` }}>
              <span style={{ fontSize:13, color:t.tx }}>{f.name}</span><span style={{ fontSize:12, color:t.txD }}>{f.sqm} sqm</span></div>)}
          </div>
        </div>
      </div> : null;
      case "manning": return currentProject ? <PManning project={currentProject} manning={manningData} setManning={setManningData} /> : null;
      case "expenses": return currentProject ? <PExpenses project={currentProject} expenses={expensesData} setExpenses={setExpensesData} /> : null;
      case "budget": return currentProject ? <PBudget project={currentProject} manning={manningData} expenses={expensesData} /> : null;
      case "analytics": return currentProject ? <POverview project={currentProject} manning={manningData} expenses={expensesData} /> : null;
      case "ai": return currentProject ? <AIWizard project={currentProject} manning={manningData} expenses={expensesData} /> : <Empty icon={"\u2726"} title="No project selected" sub="Select a project first" />;
      case "timeline": return currentProject ? <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:t.tx, margin:"0 0 22px", fontFamily:FN }}>Hiring Timeline</h1>
        <div style={{ background:t.bgCard, borderRadius:16, border:`1px solid ${t.brd}`, overflow:"hidden", boxShadow:t.shd }}>
          <div style={{ padding:"14px 20px", background:t.bgEl, borderBottom:`1px solid ${t.brd}` }}>
            <span style={{ fontSize:10, fontWeight:700, color:t.txM, textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:FN }}>Gantt Chart</span>
          </div>
          <div style={{ padding:"16px 20px", overflowX:"auto" }}>
            {[...manningData].sort((a, b) => b.startM - a.startM).map(m => {
              const dc = DIVS.find(d => d.id === m.div);
              const maxM = Math.max(...manningData.map(x => x.startM), 1);
              return <div key={m.id} style={{ display:"flex", alignItems:"center", marginBottom:3 }}>
                <div style={{ width:160, flexShrink:0, fontSize:11, color:t.tx, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", paddingRight:8 }}>{m.pos}</div>
                <div style={{ flex:1, height:16, background:t.bgEl, borderRadius:3, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", right:0, top:0, height:"100%", width:`${(m.startM / maxM) * 100}%`, borderRadius:3, background:(dc?.color || t.gold) + "50" }} />
                </div>
                <div style={{ width:40, textAlign:"right", fontSize:11, color:t.txD, flexShrink:0 }}>{m.hc}</div>
              </div>;
            })}
          </div>
        </div>
      </div> : null;
      default: return <Empty icon={"\ud83d\udddd"} title="Page not found" sub="Select a page from the sidebar" />;
    }
  };

  return (
    <TC.Provider value={{ t, mode, toggle }}>
      <AC.Provider value={{ currentUser, currentClient, currentProject }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ display:"flex", height:"100vh", background:t.bg, fontFamily:FB, color:t.tx, overflow:"hidden" }}>
          <Sidebar page={page} setPage={setPage} currentUser={currentUser} currentClient={currentClient} currentProject={currentProject} projects={projects} />
          <main style={{ flex:1, overflow:"auto", padding:"32px 40px", background:t.grad }}>{renderPage()}</main>
        </div>
      </AC.Provider>
    </TC.Provider>
  );
}
