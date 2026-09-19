/* เรียก Worker กลางเพื่อขอให้ AI ช่วยแปลผลไพ่เป็นคำทำนายเดียวที่ลื่นไหล
   Worker ถือ API key ไว้ฝั่งเซิร์ฟเวอร์เอง — หน้าเว็บนี้ไม่รู้จักคีย์ใด ๆ ทั้งสิ้น */

const AI_WORKER_URL = "https://tarot-interpret.patipan-r.workers.dev/interpret";
const DEVICE_ID_KEY = "tarot.deviceId.v1";
const AI_REQUEST_TIMEOUT_MS = 20000;

/* รหัสเครื่องแบบสุ่ม ไม่ใช่ข้อมูลระบุตัวตน ใช้แค่เป็นกุญแจนับโควตาต่อวันฝั่ง Worker */
function getDeviceId() {
  let id = readStore(DEVICE_ID_KEY, null);
  if (typeof id === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(id)) return id;

  id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : `dev-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  writeStore(DEVICE_ID_KEY, id);
  return id;
}

/* drawn: [{ card, orientation, position }], topic/spread: จาก data/topics.js, data/spreads.js */
async function requestAiInterpretation({ question, topic, spread, drawn }) {
  const cards = drawn.map(({ card, orientation, position }) => {
    const reading = interpretCard(card, orientation, topic, position);
    return {
      positionLabel: reading.positionLabel,
      nameTh: card.nameTh,
      nameEn: card.nameEn,
      orientationLabel: reading.orientationLabel,
      meaning: reading.meaning,
      topicLine: reading.topicLine
    };
  });

  // ตั้ง timeout เอง เผื่อ Worker หรือ Anthropic แขวนไม่ตอบ ไม่ให้ผู้ใช้รอค้างไม่มีที่สิ้นสุด
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(AI_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        question,
        topicLabel: topic.labelTh,
        spreadLabel: spread.nameTh,
        cards
      }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("รอนานเกินไป ลองใหม่อีกครั้งนะ");
    }
    throw new Error("เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่นะ");
  } finally {
    clearTimeout(timeout);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // ปล่อยให้ data เป็น null แล้วตกไปที่ error ทั่วไปด้านล่าง
  }

  if (!response.ok) {
    const message = (data && data.message) || "ขอ AI ช่วยแปลไม่สำเร็จตอนนี้ ลองใหม่อีกครั้งนะ";
    throw new Error(message);
  }

  if (!data || !data.narrative) {
    throw new Error("ไม่ได้รับคำทำนายกลับมา ลองใหม่อีกครั้งนะ");
  }

  return data.narrative;
}
