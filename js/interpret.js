/* ประกอบคำแปล: มุมมองเฉพาะเรื่อง (topics) + ความหมายตามทิศทางไพ่ + ตำแหน่งในสเปรด */

function interpretCard(card, orientation, topic, position) {
  const upright = orientation === "upright";
  const topics = card.topics || {};

  return {
    orientation,
    orientationLabel: upright ? "หัวตั้ง" : "กลับหัว",
    positionLabel: position ? position.labelTh : "",
    positionDesc: position ? position.descriptionTh : "",
    topicLine: topics[topic.id] || topics.general || "",
    meaning: upright ? card.meaningUpright : card.meaningReversed,
    keywords: upright ? card.keywordsUpright : card.keywordsReversed
  };
}

/* อ่านภาพรวมของสเปรดทั้งชุด — สังเกตจากสัดส่วนไพ่ชุดใหญ่ ไพ่กลับหัว และดอกที่ออกบ่อย
   เพื่อให้บทสรุปพูดถึงการเปิดไพ่ครั้งนี้จริง ๆ ไม่ใช่ประโยคสำเร็จรูป */
function readSpreadShape(drawn) {
  const total = drawn.length;
  const majors = drawn.filter((d) => d.card.arcana === "major").length;
  const reversed = drawn.filter((d) => d.orientation === "reversed").length;

  const suitCounts = {};
  drawn.forEach((d) => {
    if (d.card.arcana !== "minor") return;
    suitCounts[d.card.suit] = (suitCounts[d.card.suit] || 0) + 1;
  });

  const [topSuit, topSuitCount] = Object.entries(suitCounts).sort(
    (a, b) => b[1] - a[1]
  )[0] || [null, 0];

  return { total, majors, reversed, topSuit, topSuitCount };
}

const SUIT_DOMAIN = {
  cups: "เรื่องของใจและความสัมพันธ์",
  pentacles: "เรื่องของเงินทองและสิ่งที่จับต้องได้",
  swords: "เรื่องของความคิดและการตัดสินใจ",
  wands: "เรื่องของแรงผลักและการลงมือทำ"
};

function summarizeReading(drawn, topic) {
  const shape = readSpreadShape(drawn);
  const notes = [];

  if (shape.total > 1 && shape.majors >= Math.ceil(shape.total / 2)) {
    notes.push(
      `ไพ่ชุดใหญ่ออกมาถึง ${shape.majors} ใบ เรื่องนี้จึงมีน้ำหนักมากกว่าเหตุการณ์ประจำวันทั่วไป และน่าจะเป็นจังหวะเปลี่ยนผ่านบางอย่างของคุณ`
    );
  } else if (shape.total > 1 && shape.majors === 0) {
    notes.push(
      "ไพ่ที่ออกเป็นไพ่ชุดเล็กทั้งหมด แปลว่าเรื่องนี้ยังอยู่ในมือคุณ ปรับที่การกระทำประจำวันได้เลย"
    );
  }

  if (shape.total > 1 && shape.reversed >= Math.ceil(shape.total / 2)) {
    notes.push(
      "ไพ่กลับหัวออกมาค่อนข้างมาก มักบอกว่าพลังของเรื่องนี้ยังติดขัดอยู่ข้างใน มากกว่าจะมาจากคนอื่นหรือสถานการณ์ภายนอก"
    );
  }

  if (shape.topSuitCount >= 2 && SUIT_DOMAIN[shape.topSuit]) {
    notes.push(
      `ไพ่ดอกเดียวกันออกซ้ำ ${shape.topSuitCount} ใบ คำตอบจึงวนอยู่ที่${SUIT_DOMAIN[shape.topSuit]}เป็นหลัก`
    );
  }

  if (notes.length === 0) {
    notes.push(
      `ลองอ่านไพ่แต่ละใบต่อกันเป็นเรื่องเดียว แล้วดูว่ามันตอบคำถามเรื่อง${topic.labelTh}ของคุณอย่างไร`
    );
  }

  return notes.join(" ");
}
