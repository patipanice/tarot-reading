// สับไพ่แบบ Fisher–Yates โดยใช้ Math.random() เพื่อให้ได้ลำดับที่สุ่มจริงทุกครั้ง ไม่มีการ seed หรือจดจำผลเดิม
function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// สุ่มหัวตั้ง/กลับหัวอิสระ 50/50 ต่อใบ
function randomOrientation() {
  return Math.random() < 0.5 ? "upright" : "reversed";
}
