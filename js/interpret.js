// ประกอบคำแปลความหมายของไพ่ ผูกกับหมวดเรื่องที่เลือก + ตำแหน่งใน spread + หัวตั้ง/กลับหัว
function interpretCard(card, orientation, topic, position) {
  const isUpright = orientation === "upright";
  const keywords = isUpright ? card.keywordsUpright : card.keywordsReversed;
  const baseMeaning = isUpright ? card.meaningUpright : card.meaningReversed;
  const orientationLabel = isUpright ? "หัวตั้ง" : "กลับหัว";

  const positionIntro = position
    ? `ในตำแหน่ง "${position.labelTh}" (${position.descriptionTh}) — `
    : "";

  const text = `${positionIntro}${topic.introSentence}${baseMeaning.replace(/^เกี่ยวข้องกับ.+? — /, "")} (${keywords.join(", ")})`;

  return {
    orientationLabel,
    text
  };
}

function summarizeReading(question, topic, drawnCards) {
  const questionPart = question
    ? `สำหรับคำถามที่ว่า "${question}" `
    : "";
  const cardNames = drawnCards
    .map((d) => `${d.card.nameTh} (${d.orientation === "upright" ? "หัวตั้ง" : "กลับหัว"})`)
    .join(", ");

  return `${questionPart}ในหมวด${topic.labelTh} ไพ่ที่จั่วได้คือ ${cardNames} โปรดพิจารณาคำแปลของแต่ละใบร่วมกัน เพื่อมองเห็นภาพรวมของเรื่องที่ถามให้ชัดเจนยิ่งขึ้น การทำนายนี้เป็นแนวทางเพื่อการไตร่ตรอง ไม่ใช่คำชี้ขาดที่ตายตัว`;
}
