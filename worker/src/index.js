/*
 * tarot-interpret — Cloudflare Worker
 *
 * ใช้ Cloudflare Workers AI (binding "AI") เรียบเรียงคำทำนาย — อยู่ในโควตาฟรีของบัญชี Cloudflare
 * เอง ไม่ต้องมี API key หรือผูกบัตรเครดิตกับผู้ให้บริการภายนอกเพิ่ม
 * รับผลไพ่ที่จั่วแล้ว (ตีความไว้แล้วในเว็บ ไม่ใช่ข้อมูลไพ่ดิบ) มาประกอบเป็นพร้อมต์
 * แล้วขอให้โมเดลเรียบเรียงเป็นคำทำนายภาษาไทยความยาวเดียว
 *
 * มี rate limit สองชั้นกันใช้เกินโควตาฟรีรายวัน:
 *  - ต่อเครื่อง (deviceId ที่ฝั่งเว็บสุ่มเก็บใน localStorage) 5 ครั้ง/วัน — กันคนทั่วไปกดรัว
 *  - ต่อ IP (CF-Connecting-IP) 30 ครั้ง/วัน — กันคนล้าง localStorage แล้วยิงซ้ำ
 */

const DAILY_LIMIT_PER_DEVICE = 5;
const DAILY_LIMIT_PER_IP = 30;
const MAX_CARDS = 10;
const MAX_FIELD_LEN = 400;
const MAX_QUESTION_LEN = 300;
// หมายเหตุ: เลี่ยงโมเดล "reasoning" (qwen3.8, glm-4.7-flash, deepseek-r1 ฯลฯ) เพราะมันเผา
// max_tokens ไปกับ chain-of-thought ก่อนเขียนคำตอบจริง ทำให้ content ว่างถ้า token ไม่พอ
// llama-3.3-70b-instruct เป็น instruct ตรง ๆ ไม่มีขั้น reasoning แยก และคืนค่าแบบ { response }
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const DEV_ORIGINS = ["http://localhost:8934", "http://127.0.0.1:8934"];

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = origin === env.ALLOWED_ORIGIN || DEV_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clampText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

/* จำกัดจำนวนครั้งด้วย Cloudflare KV — แยกเป็นสองขั้นตอนโดยตั้งใจ:
   peekLimit ดูโควตาก่อนเรียกโมเดลโดยไม่หักออก แล้ว bumpLimit หักออกจริง
   เฉพาะตอนเรียกโมเดลสำเร็จแล้วเท่านั้น ป้องกันไม่ให้คำขอที่ล้มเหลว (เช่น upstream error)
   ไปกินโควตาผู้ใช้แบบไม่ได้อะไรกลับมา
   ไม่ใช้ atomic increment เพราะ KV ไม่รองรับ — ความคลาดเคลื่อนเล็กน้อยจากการแข่งกันเขียนยอมรับได้
   สำหรับงานกันสแปมระดับนี้ (ไม่ใช่ระบบจ่ายเงินที่ต้องแม่นยำเป๊ะ) */
async function peekLimit(kv, key, limit) {
  const current = Number((await kv.get(key)) || "0");
  return current < limit;
}

async function bumpLimit(kv, key) {
  const current = Number((await kv.get(key)) || "0");
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 26 });
}

function buildPrompt({ question, topicLabel, spreadLabel, cards }) {
  const cardLines = cards
    .map(
      (c, i) =>
        `${i + 1}. ตำแหน่ง "${c.positionLabel}" — ${c.nameTh} (${c.nameEn}) ${c.orientationLabel}\n` +
        `   ความหมาย: ${c.meaning}\n` +
        `   มุมมองเรื่อง${topicLabel}: ${c.topicLine}`
    )
    .join("\n");

  const questionLine = question
    ? `คำถามของผู้ถาม: "${question}"`
    : `ผู้ถามไม่ได้ระบุคำถาม ต้องการอ่านภาพรวมเรื่อง${topicLabel}`;

  return (
    `หมวดที่ถาม: ${topicLabel}\nรูปแบบไพ่: ${spreadLabel}\n${questionLine}\n\nไพ่ที่จั่วได้:\n${cardLines}`
  );
}

const SYSTEM_PROMPT = `คุณคือนักอ่านไพ่ทาโรต์ที่เขียนภาษาไทยได้อบอุ่น ตรงไปตรงมา และให้เกียรติผู้ถาม
งานของคุณคือนำความหมายไพ่แต่ละใบที่ให้มา (ซึ่งตีความไว้แล้วตามหลักไพ่ทาโรต์ Rider-Waite-Smith) มาร้อยเรียง
เป็นคำทำนายเดียวที่ลื่นไหล เชื่อมโยงไพ่แต่ละใบเข้าด้วยกันเป็นเรื่องราว ไม่ใช่พูดถึงไพ่ทีละใบแยกกัน

กติกาสำคัญ:
- ห้ามสร้างความหมายไพ่ใหม่ที่ไม่ได้อยู่ในข้อมูลที่ให้มา ใช้สิ่งที่ให้มาเป็นวัตถุดิบเท่านั้น
- ห้ามพูดแบบชี้ชะตาตายตัว ("จะเกิดขึ้นแน่นอน", "จะล้มเหลว") ให้พูดเป็นแนวโน้มและมุมมองให้คิดต่อ
- ถ้าผู้ถามระบุคำถามมา ให้ตอบโดยตรงกับคำถามนั้น
- ความยาว 150-220 คำ เป็นภาษาไทยล้วน ไม่ขึ้นหัวข้อ ไม่ใส่ bullet ไม่ทักทายเกริ่นนำ เขียนเป็นเนื้อความต่อเนื่อง
- ปิดท้ายด้วยประโยคที่ให้กำลังใจหรือชวนคิดต่อ ไม่ใช่คำเตือนน่ากลัว`;

async function callWorkersAi(env, promptBody) {
  const result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: promptBody }
    ],
    max_tokens: 700
  });

  // โมเดลรุ่นเก่าใน Workers AI คืนค่าเป็น { response: "..." }
  // ส่วนโมเดลรุ่นใหม่ (เช่น qwen3.8, glm) คืนแบบ OpenAI-compatible { choices: [{ message: { content } }] }
  const text =
    typeof result === "string"
      ? result
      : result?.response ?? result?.choices?.[0]?.message?.content;

  if (!text || !text.trim()) throw new Error("Workers AI returned no text content");
  return text.trim();
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/interpret" || request.method !== "POST") {
      return json({ error: "not found" }, 404, headers);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400, headers);
    }

    const deviceId = clampText(payload.deviceId, 64);
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(deviceId)) {
      return json({ error: "invalid device id" }, 400, headers);
    }

    const cardsRaw = Array.isArray(payload.cards) ? payload.cards : [];
    if (cardsRaw.length === 0 || cardsRaw.length > MAX_CARDS) {
      return json({ error: "invalid cards" }, 400, headers);
    }

    const cards = cardsRaw.map((c) => ({
      positionLabel: clampText(c.positionLabel, 60),
      nameTh: clampText(c.nameTh, 60),
      nameEn: clampText(c.nameEn, 60),
      orientationLabel: clampText(c.orientationLabel, 20),
      meaning: clampText(c.meaning, MAX_FIELD_LEN),
      topicLine: clampText(c.topicLine, MAX_FIELD_LEN)
    }));

    const question = clampText(payload.question, MAX_QUESTION_LEN);
    const topicLabel = clampText(payload.topicLabel, 40) || "ภาพรวมชีวิต";
    const spreadLabel = clampText(payload.spreadLabel, 60) || "ไพ่ยิบซี";

    const day = todayKey();
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const deviceKey = `d:${deviceId}:${day}`;
    const ipKey = `ip:${ip}:${day}`;

    // แค่ "ดู" โควตาก่อน ยังไม่หัก — หักจริงเฉพาะตอนเรียกโมเดลสำเร็จแล้วเท่านั้น
    // (ด้านล่าง) ป้องกันคำขอที่ล้มเหลวไปกินโควตาผู้ใช้แบบไม่ได้อะไรกลับมา
    const deviceOk = await peekLimit(env.RATE_LIMIT, deviceKey, DAILY_LIMIT_PER_DEVICE);
    if (!deviceOk) {
      return json(
        { error: "device_limit", message: `วันนี้ขอให้ AI ช่วยแปลไปครบ ${DAILY_LIMIT_PER_DEVICE} ครั้งแล้ว พรุ่งนี้มาลองใหม่นะ` },
        429,
        headers
      );
    }

    const ipOk = await peekLimit(env.RATE_LIMIT, ipKey, DAILY_LIMIT_PER_IP);
    if (!ipOk) {
      return json(
        { error: "ip_limit", message: "ตอนนี้มีคนขอให้ AI ช่วยแปลจากเครือข่ายนี้เยอะ ลองใหม่พรุ่งนี้นะ" },
        429,
        headers
      );
    }

    try {
      const prompt = buildPrompt({ question, topicLabel, spreadLabel, cards });
      const narrative = await callWorkersAi(env, prompt);
      await Promise.all([bumpLimit(env.RATE_LIMIT, deviceKey), bumpLimit(env.RATE_LIMIT, ipKey)]);
      return json({ narrative }, 200, headers);
    } catch (error) {
      console.error("interpret failed:", error.message);
      return json(
        { error: "upstream_error", message: "ขอ AI ช่วยแปลไม่สำเร็จตอนนี้ ลองใหม่อีกครั้งนะ" },
        502,
        headers
      );
    }
  }
};
