
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_before_deploy";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000,*";
const DATA_FILE = path.join(__dirname, "..", "data", "db.json");

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    const allowed = CORS_ORIGIN.split(",").map(x => x.trim());
    if (allowed.includes("*") || allowed.includes(origin)) return cb(null, true);
    return cb(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const makeId = (p) => `${p}_${Date.now()}_${Math.floor(Math.random()*1000000)}`;

function defaultDb() {
  const hash = bcrypt.hashSync("1234", 10);
  return {
    users: [{ id:"user_1", businessName:"Skyline Lounge", ownerName:"Aarav Mehta", username:"skyline", passwordHash:hash, type:"main_user", status:"active", expiryDate:"2026-12-31T00:00:00.000Z", createdAt:now() }],
    subUsers: [{ id:"sub_1", userId:"user_1", name:"Rahul", username:"rahul_bar", passwordHash:hash, type:"sub_user", role:"Bar Counter", status:"active", allowedBarIds:["bar_1"], createdAt:now() }],
    outlets: [
      { id:"outlet_1", userId:"user_1", name:"Pune Central", address:"Pune", status:"active", createdAt:now() },
      { id:"outlet_2", userId:"user_1", name:"Pune Airport", address:"Pune Airport", status:"active", createdAt:now() },
      { id:"outlet_3", userId:"user_1", name:"Pune NDA", address:"Pune NDA", status:"active", createdAt:now() }
    ],
    bars: [
      { id:"stock_1", outletId:"outlet_1", name:"Stock Room", type:"stock_room", location:"Back Office", status:"active", createdAt:now() },
      { id:"bar_1", outletId:"outlet_1", name:"Sky Bar", type:"bar", location:"Rooftop", status:"active", createdAt:now() },
      { id:"bar_2", outletId:"outlet_1", name:"Low Bar", type:"bar", location:"Ground Floor", status:"active", createdAt:now() },
      { id:"stock_2", outletId:"outlet_2", name:"Stock Room", type:"stock_room", location:"Service Area", status:"active", createdAt:now() },
      { id:"bar_3", outletId:"outlet_2", name:"Sky Bar", type:"bar", location:"Level 2", status:"active", createdAt:now() },
      { id:"bar_4", outletId:"outlet_2", name:"Low Bar", type:"bar", location:"Ground Floor", status:"active", createdAt:now() },
      { id:"stock_3", outletId:"outlet_3", name:"Stock Room", type:"stock_room", location:"Service Area", status:"active", createdAt:now() },
      { id:"bar_5", outletId:"outlet_3", name:"Sky Bar", type:"bar", location:"Level 2", status:"active", createdAt:now() },
      { id:"bar_6", outletId:"outlet_3", name:"Low Bar", type:"bar", location:"Ground Floor", status:"active", createdAt:now() }
    ],
    products: [
      { id:"product_1", productCode:"P-1001", barcode:"890100000001", name:"Magic Moments Green Apple Vodka", category:"Vodka", bottleSizeMl:750, costOfBottle:850, sellingPricePerBottle:1800, status:"active", createdAt:now() },
      { id:"product_2", productCode:"P-1002", barcode:"890100000002", name:"Jameson Irish Whiskey", category:"Whiskey", bottleSizeMl:750, costOfBottle:2100, sellingPricePerBottle:4200, status:"active", createdAt:now() },
      { id:"product_3", productCode:"P-1003", barcode:"890100000003", name:"Bacardi White Rum", category:"Rum", bottleSizeMl:1000, costOfBottle:1800, sellingPricePerBottle:3600, status:"active", createdAt:now() }
    ],
    stockRoomInventory: [
      { id:"sri_1", outletId:"outlet_1", barId:"stock_1", productId:"product_1", totalFullBottle:10, totalOpenBottleMl:0, stockValue:8500, updatedAt:now() },
      { id:"sri_2", outletId:"outlet_1", barId:"stock_1", productId:"product_2", totalFullBottle:6, totalOpenBottleMl:0, stockValue:12600, updatedAt:now() },
      { id:"sri_3", outletId:"outlet_2", barId:"stock_2", productId:"product_3", totalFullBottle:12, totalOpenBottleMl:0, stockValue:21600, updatedAt:now() }
    ],
    barInventory: [
      { id:"bi_1", outletId:"outlet_1", barId:"bar_1", productId:"product_1", businessDate:today(), openingFullBottle:2, openingOpenBottleMl:300, indentFullBottle:0, indentOpenBottleMl:0, transferInFullBottle:0, transferInOpenBottleMl:0, transferOutFullBottle:0, transferOutOpenBottleMl:0, closingFullBottle:0, closingOpenBottleMl:0, emptyBottleCount:0, availableMl:1800, consumptionMl:0, varianceMl:0, totalSell:0, updatedAt:now() }
    ],
    stockAssignments: [], transfers: [], indents: [], closingSessions: [], closingItems: [], activityLogs: [],
    deviceStatus: { deviceConnected:false, scannerConnected:false, scaleConnected:false, lastBarcode:null, lastWeight:null, lastRemainingMl:null, updatedAt:now() }
  };
}
function migrateDb(d){
  let changed=false;
  const add=(arr,obj)=>{ if(!arr.some(x=>x.id===obj.id)){ arr.push(obj); changed=true; } };
  add(d.outlets,{ id:"outlet_3", userId:"user_1", name:"Pune NDA", address:"Pune NDA", status:"active", createdAt:now() });
  const requiredBars=[
    { id:"stock_1", outletId:"outlet_1", name:"Stock Room", type:"stock_room", location:"Back Office", status:"active", createdAt:now() },
    { id:"bar_1", outletId:"outlet_1", name:"Sky Bar", type:"bar", location:"Rooftop", status:"active", createdAt:now() },
    { id:"bar_2", outletId:"outlet_1", name:"Low Bar", type:"bar", location:"Ground Floor", status:"active", createdAt:now() },
    { id:"stock_2", outletId:"outlet_2", name:"Stock Room", type:"stock_room", location:"Service Area", status:"active", createdAt:now() },
    { id:"bar_3", outletId:"outlet_2", name:"Sky Bar", type:"bar", location:"Level 2", status:"active", createdAt:now() },
    { id:"bar_4", outletId:"outlet_2", name:"Low Bar", type:"bar", location:"Ground Floor", status:"active", createdAt:now() },
    { id:"stock_3", outletId:"outlet_3", name:"Stock Room", type:"stock_room", location:"Service Area", status:"active", createdAt:now() },
    { id:"bar_5", outletId:"outlet_3", name:"Sky Bar", type:"bar", location:"Level 2", status:"active", createdAt:now() },
    { id:"bar_6", outletId:"outlet_3", name:"Low Bar", type:"bar", location:"Ground Floor", status:"active", createdAt:now() }
  ];
  requiredBars.forEach(b=>add(d.bars,b));
  const renames={bar_1:"Sky Bar",bar_2:"Low Bar"};
  d.bars.forEach(b=>{ if(renames[b.id]&&b.name!==renames[b.id]){ b.name=renames[b.id]; changed=true; } });
  return changed;
}
function ensureDb(){
  if(!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE),{recursive:true});
  if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDb(), null, 2));
  const d=JSON.parse(fs.readFileSync(DATA_FILE,"utf8"));
  if(migrateDb(d)) fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2));
}
function db(){ ensureDb(); return JSON.parse(fs.readFileSync(DATA_FILE,"utf8")); }
function save(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2)); }
function log(d, x){ d.activityLogs.push({ id:makeId("log"), createdAt:now(), ...x }); }
function sign(u){ return jwt.sign({ id:u.id, type:u.type, userId:u.type==="main_user"?u.id:u.userId }, JWT_SECRET, {expiresIn:"7d"}); }
function auth(req,res,next){ const h=req.headers.authorization||""; if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Unauthorized"}); try{ req.auth=jwt.verify(h.replace("Bearer ",""),JWT_SECRET); next(); }catch{ return res.status(401).json({message:"Invalid token"}); } }
function product(d,id){ return d.products.find(x=>x.id===id); }
function bar(d,id){ return d.bars.find(x=>x.id===id); }
function assertBars(d,outletId,ids){ ids.forEach(bid=>{ const b=bar(d,bid); if(!b) throw new Error("Bar not found"); if(b.outletId!==outletId) throw new Error("Bars do not belong to selected outlet"); }); }
function getStock(d,outletId,barId,productId){ let r=d.stockRoomInventory.find(x=>x.barId===barId&&x.productId===productId); if(!r){ r={id:makeId("sri"), outletId, barId, productId, totalFullBottle:0,totalOpenBottleMl:0,stockValue:0,updatedAt:now()}; d.stockRoomInventory.push(r); } return r; }
function getInv(d,outletId,barId,productId,date=today()){ let r=d.barInventory.find(x=>x.barId===barId&&x.productId===productId&&x.businessDate===date); if(!r){ r={id:makeId("bi"), outletId, barId, productId, businessDate:date, openingFullBottle:0, openingOpenBottleMl:0, indentFullBottle:0, indentOpenBottleMl:0, transferInFullBottle:0, transferInOpenBottleMl:0, transferOutFullBottle:0, transferOutOpenBottleMl:0, closingFullBottle:0, closingOpenBottleMl:0, emptyBottleCount:0, availableMl:0, consumptionMl:0, varianceMl:0, totalSell:0, updatedAt:now()}; d.barInventory.push(r);} return r; }
function recalc(r,p){ const opening=r.openingFullBottle*p.bottleSizeMl+r.openingOpenBottleMl; const indent=r.indentFullBottle*p.bottleSizeMl+r.indentOpenBottleMl; const tin=r.transferInFullBottle*p.bottleSizeMl+r.transferInOpenBottleMl; const tout=r.transferOutFullBottle*p.bottleSizeMl+r.transferOutOpenBottleMl; const close=r.closingFullBottle*p.bottleSizeMl+r.closingOpenBottleMl; r.availableMl=opening+indent+tin-tout; if(close>r.availableMl) throw new Error("Closing stock cannot exceed available stock"); r.consumptionMl=Math.max(0,r.availableMl-close); r.totalSell=Number(((r.consumptionMl/p.bottleSizeMl)*(p.sellingPricePerBottle||0)).toFixed(2)); r.updatedAt=now(); return r; }
function productView(p){ return { id:p.id, productCode:p.productCode, barcode:p.barcode, name:p.name, category:p.category, bottleSizeMl:p.bottleSizeMl, costOfBottle:p.costOfBottle, sellingPricePerBottle:p.sellingPricePerBottle, status:p.status}; }
function reportRow(d,r){ const p=product(d,r.productId); if(!p) return null; return { id:r.id,outletId:r.outletId,barId:r.barId,businessDate:r.businessDate,productId:p.id,productCode:p.productCode,name:p.name,category:p.category,bottleSize:p.bottleSizeMl,costOfBottle:p.costOfBottle,openingFullBottle:r.openingFullBottle,openingOpenBottle:r.openingOpenBottleMl,indent:r.indentFullBottle,transfer:r.transferInFullBottle-r.transferOutFullBottle,closingFullBottle:r.closingFullBottle,closingOpenBottle:r.closingOpenBottleMl,totalConsumption:r.consumptionMl,totalSell:r.totalSell,availableMl:r.availableMl}; }

app.get("/", (_,res)=>res.json({ok:true, app:"Inventory Backend"}));
app.get("/health", (_,res)=>res.json({ok:true,message:"Inventory backend is running",time:now()}));

app.post("/api/auth/login",(req,res)=>{ const d=db(); const {username,password}=req.body||{}; let u=d.users.find(x=>x.username===username); if(u&&bcrypt.compareSync(String(password||""),u.passwordHash)){ if(u.status!=="active") return res.status(403).json({message:"Account inactive"}); return res.json({token:sign(u), user:{id:u.id,type:"main_user",businessName:u.businessName,ownerName:u.ownerName,username:u.username}}); } u=d.subUsers.find(x=>x.username===username); if(u&&bcrypt.compareSync(String(password||""),u.passwordHash)){ if(u.status!=="active") return res.status(403).json({message:"Account inactive"}); return res.json({token:sign(u), user:{id:u.id,type:"sub_user",parentUserId:u.userId,name:u.name,username:u.username,role:u.role,allowedBarIds:u.allowedBarIds||[]}}); } res.status(401).json({message:"Invalid credentials"}); });
app.get("/api/auth/me",auth,(req,res)=>{ const d=db(); const u=req.auth.type==="main_user"?d.users.find(x=>x.id===req.auth.id):d.subUsers.find(x=>x.id===req.auth.id); if(!u)return res.status(404).json({message:"Account not found"}); res.json({auth:req.auth,user:u}); });

app.get("/api/outlets",auth,(req,res)=>{ const d=db(); if(req.auth.type==="main_user") return res.json(d.outlets.filter(x=>x.userId===req.auth.id)); const su=d.subUsers.find(x=>x.id===req.auth.id); const allowed=new Set(su?.allowedBarIds||[]); const outletIds=new Set(d.bars.filter(b=>allowed.has(b.id)).map(b=>b.outletId)); res.json(d.outlets.filter(o=>outletIds.has(o.id))); });
app.get("/api/bars/outlet/:outletId",auth,(req,res)=>{ const d=db(); let rows=d.bars.filter(x=>x.outletId===req.params.outletId); if(req.auth.type==="sub_user"){ const su=d.subUsers.find(x=>x.id===req.auth.id); const allowed=new Set(su?.allowedBarIds||[]); rows=rows.filter(b=>allowed.has(b.id)); } res.json(rows); });
app.get("/api/products",auth,(req,res)=>{ const d=db(); const q=String(req.query.q||"").toLowerCase(); let rows=d.products.filter(x=>x.status!=="inactive"); if(q) rows=rows.filter(p=>p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)||p.productCode.toLowerCase().includes(q)||String(p.barcode||"").includes(q)); res.json(rows.map(productView)); });
app.get("/api/products/barcode/:barcode",auth,(req,res)=>{ const d=db(); const p=d.products.find(x=>String(x.barcode)===String(req.params.barcode)); if(!p)return res.status(404).json({message:"Product not found"}); res.json(productView(p)); });

app.get("/api/stock-room/:barId",auth,(req,res)=>{ const d=db(); res.json(d.stockRoomInventory.filter(x=>x.barId===req.params.barId).map(x=>({...x, product:productView(product(d,x.productId))}))); });
app.post("/api/stock-room/add",auth,(req,res)=>{ const d=db(); try{ const {outletId,stockRoomBarId,productId}=req.body; const full=Number(req.body.fullBottleCount||0), open=Number(req.body.openBottleMl||0); assertBars(d,outletId,[stockRoomBarId]); const p=product(d,productId); if(!p)throw new Error("Product not found"); const s=getStock(d,outletId,stockRoomBarId,productId); s.totalFullBottle+=full; s.totalOpenBottleMl+=open; s.stockValue=Number((s.totalFullBottle*p.costOfBottle).toFixed(2)); s.updatedAt=now(); log(d,{action:"STOCK_ROOM_ADD",outletId,barId:stockRoomBarId,productId,actorId:req.auth.id,message:"Stock added"}); save(d); res.status(201).json({...s, product:productView(p)});}catch(e){res.status(400).json({message:e.message});} });
app.post("/api/stock-room/assign",auth,(req,res)=>{ const d=db(); try{ const {outletId,stockRoomBarId,destinationBarId,productId}=req.body; const full=Number(req.body.fullBottleCount||0), open=Number(req.body.openBottleMl||0); assertBars(d,outletId,[stockRoomBarId,destinationBarId]); const source=bar(d,stockRoomBarId); if(!String(source.type).includes("stock")) throw new Error("Selected source is not stock room"); const p=product(d,productId); if(!p)throw new Error("Product not found"); const s=getStock(d,outletId,stockRoomBarId,productId); if(s.totalFullBottle<full) throw new Error("Not enough full bottles in stock room"); if(s.totalOpenBottleMl<open) throw new Error("Not enough open bottle ML in stock room"); s.totalFullBottle-=full; s.totalOpenBottleMl-=open; s.stockValue=Number((s.totalFullBottle*p.costOfBottle).toFixed(2)); const inv=getInv(d,outletId,destinationBarId,productId); inv.openingFullBottle+=full; inv.openingOpenBottleMl+=open; recalc(inv,p); const a={id:makeId("assign"),outletId,stockRoomBarId,destinationBarId,productId,fullBottleCount:full,openBottleMl:open,createdAt:now()}; d.stockAssignments.push(a); log(d,{action:"STOCK_ASSIGNED",outletId,barId:destinationBarId,productId,actorId:req.auth.id,message:"Stock assigned",data:a}); save(d); res.status(201).json(a);}catch(e){res.status(400).json({message:e.message});} });

app.post("/api/transfers",auth,(req,res)=>{ const d=db(); try{ const {outletId,fromBarId,toBarId,productId}=req.body; const full=Number(req.body.fullBottleCount||0), open=Number(req.body.openBottleMl||0); if(fromBarId===toBarId) throw new Error("Source and destination cannot be same"); assertBars(d,outletId,[fromBarId,toBarId]); const p=product(d,productId); if(!p)throw new Error("Product not found"); const reqMl=full*p.bottleSizeMl+open; const from=getInv(d,outletId,fromBarId,productId); recalc(from,p); if(reqMl>from.availableMl) throw new Error("Transfer quantity exceeds available source stock"); from.transferOutFullBottle+=full; from.transferOutOpenBottleMl+=open; recalc(from,p); const to=getInv(d,outletId,toBarId,productId); to.transferInFullBottle+=full; to.transferInOpenBottleMl+=open; recalc(to,p); const t={id:makeId("transfer"),outletId,fromBarId,toBarId,productId,fullBottleCount:full,openBottleMl:open,createdAt:now()}; d.transfers.push(t); log(d,{action:"STOCK_TRANSFERRED",outletId,barId:toBarId,productId,actorId:req.auth.id,message:"Stock transferred",data:t}); save(d); res.status(201).json(t);}catch(e){res.status(400).json({message:e.message});} });

app.post("/api/indents",auth,(req,res)=>{ const d=db(); try{ const {outletId,barId,sourceBarId,productId}=req.body; const full=Number(req.body.fullBottleCount||0), open=Number(req.body.openBottleMl||0); assertBars(d,outletId,sourceBarId?[barId,sourceBarId]:[barId]); const p=product(d,productId); if(!p)throw new Error("Product not found"); if(sourceBarId){ const src=getInv(d,outletId,sourceBarId,productId); recalc(src,p); const ml=full*p.bottleSizeMl+open; if(ml>src.availableMl) throw new Error("Indent quantity exceeds source stock"); src.transferOutFullBottle+=full; src.transferOutOpenBottleMl+=open; recalc(src,p); } const inv=getInv(d,outletId,barId,productId); inv.indentFullBottle+=full; inv.indentOpenBottleMl+=open; recalc(inv,p); const ind={id:makeId("indent"),outletId,barId,sourceBarId:sourceBarId||null,productId,fullBottleCount:full,openBottleMl:open,createdAt:now()}; d.indents.push(ind); log(d,{action:"INDENT_CREATED",outletId,barId,productId,actorId:req.auth.id,message:"Indent added",data:ind}); save(d); res.status(201).json(ind);}catch(e){res.status(400).json({message:e.message});} });

app.post("/api/inventory/manual-entry",auth,(req,res)=>{ const d=db(); try{ const {barId,productId}=req.body; const remaining=Number(req.body.remainingMl||0), closingFull=Number(req.body.closingFullBottle||0), empty=Number(req.body.emptyBottleCount||0); const b=bar(d,barId); if(!b)throw new Error("Bar not found"); const p=product(d,productId); if(!p)throw new Error("Product not found"); const inv=getInv(d,b.outletId,barId,productId, req.body.businessDate ? new Date(req.body.businessDate).toISOString().slice(0,10):today()); inv.closingFullBottle=closingFull; inv.closingOpenBottleMl=remaining; inv.emptyBottleCount=empty; recalc(inv,p); log(d,{action:"MANUAL_INVENTORY",outletId:b.outletId,barId,productId,actorId:req.auth.id,message:"Manual inventory updated"}); save(d); res.status(201).json({ ...inv, openingOpenBottle: inv.openingOpenBottleMl, closingOpenBottle: inv.closingOpenBottleMl, totalConsumption: inv.consumptionMl });}catch(e){res.status(400).json({message:e.message});} });

app.post("/api/closing/session",auth,(req,res)=>{ const d=db(); try{ const {outletId,barId}=req.body; assertBars(d,outletId,[barId]); let s=d.closingSessions.find(x=>x.outletId===outletId&&x.barId===barId&&x.status==="draft"); if(s)return res.json(s); s={id:makeId("closing"),outletId,barId,userId:req.auth.userId,subUserId:req.auth.type==="sub_user"?req.auth.id:null,status:"draft",businessDate:today(),createdAt:now(),completedAt:null}; d.closingSessions.push(s); log(d,{action:"CLOSING_STARTED",outletId,barId,actorId:req.auth.id,message:"Closing session started"}); save(d); res.status(201).json(s);}catch(e){res.status(400).json({message:e.message});} });
app.post("/api/closing/item",auth,(req,res)=>{ const d=db(); try{ const {sessionId,barId,productId}=req.body; const closingFull=Number(req.body.closingFullBottle||0), closingOpen=Number(req.body.closingOpenBottleMl||0), empty=Number(req.body.emptyBottleCount||0); const s=d.closingSessions.find(x=>x.id===sessionId); if(!s)throw new Error("Closing session not found"); if(s.status==="completed")throw new Error("Closing session already completed"); const p=product(d,productId); if(!p)throw new Error("Product not found"); const inv=getInv(d,s.outletId,barId,productId,s.businessDate); inv.closingFullBottle=closingFull; inv.closingOpenBottleMl=closingOpen; inv.emptyBottleCount=empty; recalc(inv,p); let item=d.closingItems.find(x=>x.sessionId===sessionId&&x.productId===productId); if(!item){ item={id:makeId("closing_item"),sessionId,productId,createdAt:now()}; d.closingItems.push(item); } Object.assign(item,{barId,productId,openingFullBottle:inv.openingFullBottle,openingOpenBottleMl:inv.openingOpenBottleMl,indentFullBottle:inv.indentFullBottle,indentOpenBottleMl:inv.indentOpenBottleMl,transferFullBottle:inv.transferInFullBottle-inv.transferOutFullBottle,transferOpenBottleMl:inv.transferInOpenBottleMl-inv.transferOutOpenBottleMl,closingFullBottle:closingFull,closingOpenBottleMl:closingOpen,emptyBottleCount:empty,availableMl:inv.availableMl,consumptionMl:inv.consumptionMl,totalSell:inv.totalSell,updatedAt:now()}); log(d,{action:"CLOSING_ITEM_SAVED",outletId:s.outletId,barId,productId,actorId:req.auth.id,message:"Closing item saved"}); save(d); res.status(201).json(item);}catch(e){res.status(400).json({message:e.message});} });
app.post("/api/closing/session/:sessionId/complete",auth,(req,res)=>{ const d=db(); try{ const s=d.closingSessions.find(x=>x.id===req.params.sessionId); if(!s)throw new Error("Closing session not found"); const items=d.closingItems.filter(x=>x.sessionId===s.id); if(!items.length)throw new Error("No closing items found"); s.status="completed"; s.completedAt=now(); log(d,{action:"CLOSING_COMPLETED",outletId:s.outletId,barId:s.barId,actorId:req.auth.id,message:"Closing session completed"}); save(d); res.json(s);}catch(e){res.status(400).json({message:e.message});} });
app.get("/api/closing/session/:sessionId/items",auth,(req,res)=>{ const d=db(); res.json(d.closingItems.filter(x=>x.sessionId===req.params.sessionId)); });

app.get("/api/reports/bar",auth,(req,res)=>{ const d=db(); const {outletId,barId,from,to}=req.query; let rows=d.barInventory; if(outletId)rows=rows.filter(x=>x.outletId===outletId); if(barId)rows=rows.filter(x=>x.barId===barId); if(from)rows=rows.filter(x=>x.businessDate>=String(from)); if(to)rows=rows.filter(x=>x.businessDate<=String(to)); res.json(rows.map(x=>reportRow(d,x)).filter(Boolean)); });
app.get("/api/reports/stock-room",auth,(req,res)=>{ const d=db(); const {outletId,barId}=req.query; let rows=d.stockRoomInventory; if(outletId)rows=rows.filter(x=>x.outletId===outletId); if(barId)rows=rows.filter(x=>x.barId===barId); res.json(rows.map(r=>{const p=product(d,r.productId); return {id:r.id,outletId:r.outletId,barId:r.barId,productId:p?.id||r.productId,productCode:p?.productCode||"",name:p?.name||"",category:p?.category||"",bottleSize:p?.bottleSizeMl||0,costOfBottle:p?.costOfBottle||0,totalFullBottle:r.totalFullBottle,totalOpenBottle:r.totalOpenBottleMl,stockValue:r.stockValue};})); });
app.get("/api/history",auth,(req,res)=>{ const d=db(); const {outletId,barId,action}=req.query; let rows=[...d.activityLogs].reverse(); if(outletId)rows=rows.filter(x=>x.outletId===outletId); if(barId)rows=rows.filter(x=>x.barId===barId); if(action)rows=rows.filter(x=>x.action===action); res.json(rows); });
app.get("/api/device/status",auth,(req,res)=>res.json(db().deviceStatus));
app.post("/api/device/status",auth,(req,res)=>{ const d=db(); d.deviceStatus={...d.deviceStatus,...req.body,updatedAt:now()}; save(d); res.json(d.deviceStatus); });
app.post("/api/device/reading",auth,(req,res)=>{ const d=db(); const {barcode,weight,remainingMl}=req.body; d.deviceStatus={...d.deviceStatus,lastBarcode:barcode||d.deviceStatus.lastBarcode,lastWeight:typeof weight==="number"?weight:d.deviceStatus.lastWeight,lastRemainingMl:typeof remainingMl==="number"?remainingMl:d.deviceStatus.lastRemainingMl,updatedAt:now()}; save(d); const p=barcode?d.products.find(x=>String(x.barcode)===String(barcode)):null; res.json({product:p?productView(p):null,reading:d.deviceStatus}); });
app.get("/api/sub-users",auth,(req,res)=>{ const d=db(); if(req.auth.type!=="main_user")return res.status(403).json({message:"Only main user allowed"}); res.json(d.subUsers.filter(x=>x.userId===req.auth.id).map(x=>({...x,passwordHash:undefined}))); });
app.post("/api/sub-users",auth,(req,res)=>{ const d=db(); try{ if(req.auth.type!=="main_user")throw new Error("Only main user can create sub-users"); const {name,username,password,role,allowedBarIds}=req.body; if(!name||!username||!password)throw new Error("name, username and password are required"); if(d.users.some(x=>x.username===username)||d.subUsers.some(x=>x.username===username))throw new Error("Username already exists"); const su={id:makeId("sub"),userId:req.auth.id,name,username,passwordHash:bcrypt.hashSync(String(password),10),type:"sub_user",role:role||"Bar Counter",status:"active",allowedBarIds:Array.isArray(allowedBarIds)?allowedBarIds:[],createdAt:now()}; d.subUsers.push(su); save(d); res.status(201).json({...su,passwordHash:undefined});}catch(e){res.status(400).json({message:e.message});} });

app.use((req,res)=>res.status(404).json({message:`Route not found: ${req.method} ${req.originalUrl}`}));
ensureDb();
app.listen(PORT,()=>{ console.log(`Inventory backend running on port ${PORT}`); console.log(`Health: http://localhost:${PORT}/health`); console.log("Login: skyline / 1234"); });
