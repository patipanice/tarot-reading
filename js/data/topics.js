/* หมวดเรื่องที่ถามได้ — ผูกกับดอกไพ่ที่ตรงกับเรื่องนั้นในสำรับ
   ความรัก=ถ้วย การงาน=ไม้เท้า การเงิน=เหรียญ ภาพรวม=ดาว */

const TOPICS = [
  {
    id: "love",
    labelTh: "ความรัก",
    glyph: "gl-cups",
    descriptionTh: "คนที่คบอยู่ คนที่แอบชอบ หรือความสัมพันธ์ที่ยังไม่ลงตัว"
  },
  {
    id: "career",
    labelTh: "การงาน",
    glyph: "gl-wands",
    descriptionTh: "งานที่ทำอยู่ การเปลี่ยนงาน เรียนต่อ หรือเส้นทางที่ยังลังเล"
  },
  {
    id: "money",
    labelTh: "การเงิน",
    glyph: "gl-pentacles",
    descriptionTh: "รายรับรายจ่าย หนี้สิน การลงทุน และความมั่นคงระยะยาว"
  },
  {
    id: "general",
    labelTh: "ภาพรวมชีวิต",
    glyph: "gl-star",
    descriptionTh: "คำถามกว้าง ๆ หรือเรื่องที่ยังไม่รู้จะจัดไว้หมวดไหน"
  }
];

function findTopic(id) {
  return TOPICS.find((topic) => topic.id === id) || TOPICS[3];
}
