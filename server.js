const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;

const FACTS = [
  "웜뱃은 지구상에서 유일하게 정육면체 똥을 누는 동물입니다.",
  "웜뱃은 하루 밤 사이에 똥을 80~100개나 눕니다.",
  "웜뱃의 육아낭은 뒤쪽을 향해 열려서, 굴을 팔 때 흙이 새끼에게 들어가지 않습니다.",
  "웜뱃이 먹이를 완전히 소화하는 데는 8~14일이 걸립니다.",
  "웜뱃의 엉덩이는 대부분 두꺼운 연골로 되어 있어 천적의 이빨을 막아냅니다.",
  "숏다리처럼 보이지만, 웜뱃은 짧은 거리에서 시속 40km까지 달릴 수 있습니다.",
  "웜뱃의 이빨에는 뿌리가 없어서 평생 자랍니다.",
  "웜뱃과 가장 가까운 친척은 코알라입니다.",
  "웜뱃 똥의 수분은 약 65%로, 인간(75%)이나 소(85~90%)보다 훨씬 건조합니다.",
  "웜뱃 큐브 똥의 비밀을 밝힌 연구는 2019년 이그노벨 물리학상을 받았습니다.",
  "매년 10월 22일은 '웜뱃의 날'입니다.",
  "웜뱃의 소장은 약 10m나 됩니다.",
  "웜뱃은 야생에서 약 15년, 사육 환경에서는 30년 이상 삽니다.",
  "웜뱃은 하루에 약 16시간을 잡니다.",
  "웜뱃 똥에는 44종의 화학 물질이 들어 있어, 냄새로 서로 소통합니다.",
  "2020년 발견된 사실: 웜뱃의 털은 자외선 아래에서 청록색 형광을 냅니다.",
  "북방털코웜뱃은 지구에서 멸종 위기가 가장 심각한 포유류 중 하나로, 딱 두 곳에만 남아 있습니다.",
  "웜뱃은 2000년 시드니 올림픽의 비공식 마스코트 '팻소'로 활약했습니다.",
  "웜뱃 새끼는 육아낭 속에서 6~7개월을 보냅니다.",
  "2009년 태즈메이니아 버니의 한 공장은 웜뱃 똥으로 종이를 만들었습니다."
];

app.use(express.json());
app.use(express.static(__dirname));

app.use("/api", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const sb = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

app.get("/api/health", function (req, res) {
  res.json({ status: "ok", supabase: sb ? "connected" : "not-configured" });
});

app.get("/api/fact", function (req, res) {
  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
  res.json({ fact: fact, total: FACTS.length });
});

app.get("/api/facts", function (req, res) {
  res.json(FACTS);
});

app.get("/api/comments", async function (req, res) {
  if (!sb) {
    return res.status(503).json({ error: "Supabase가 설정되지 않았습니다" });
  }
  const { data, error } = await sb
    .from("comments")
    .select("name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    return res.status(500).json({ error: "댓글을 불러오지 못했습니다" });
  }
  res.json(data);
});

app.post("/api/comments", async function (req, res) {
  if (!sb) {
    return res.status(503).json({ error: "Supabase가 설정되지 않았습니다" });
  }
  const body = req.body || {};
  let name = typeof body.name === "string" ? body.name.trim() : "";
  let message = typeof body.message === "string" ? body.message.trim() : "";
  if (!name) {
    name = "익명의 웜뱃";
  }
  if (name.length > 30) {
    name = name.slice(0, 30);
  }
  if (!message || message.length > 500) {
    return res.status(400).json({ error: "메시지는 1~500자여야 합니다" });
  }
  const { data, error } = await sb
    .from("comments")
    .insert({ name: name, message: message })
    .select("name, message, created_at")
    .single();
  if (error) {
    return res.status(500).json({ error: "댓글 저장에 실패했습니다" });
  }
  res.status(201).json(data);
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, function () {
  console.log("Wombat server listening on port " + port);
});
