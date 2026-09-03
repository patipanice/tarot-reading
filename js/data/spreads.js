const SPREADS = [
  {
    id: "single",
    nameTh: "ไพ่ใบเดียว",
    countLabel: "1 ใบ",
    descriptionTh: "ถามสั้น ตอบตรง เหมาะกับคำถามเดียวชัด ๆ หรือคำแนะนำประจำวัน",
    cardCount: 1,
    positions: [
      {
        id: "answer",
        labelTh: "คำตอบ",
        descriptionTh: "แก่นของคำตอบต่อสิ่งที่ถาม"
      }
    ]
  },
  {
    id: "three",
    nameTh: "อดีต ปัจจุบัน อนาคต",
    countLabel: "3 ใบ",
    descriptionTh: "ดูเรื่องหนึ่งผ่านสามช่วงเวลา เห็นว่าอะไรพาคุณมาถึงตรงนี้ และกำลังจะไปทางไหน",
    cardCount: 3,
    positions: [
      { id: "past", labelTh: "อดีต", descriptionTh: "สิ่งที่ผ่านมาแล้วยังส่งผลถึงตอนนี้" },
      { id: "present", labelTh: "ปัจจุบัน", descriptionTh: "จุดที่คุณยืนอยู่ในเรื่องนี้" },
      { id: "future", labelTh: "อนาคต", descriptionTh: "ทิศทางที่เรื่องกำลังเคลื่อนไป" }
    ]
  },
  {
    id: "celtic-cross",
    nameTh: "เซลติกครอส",
    countLabel: "10 ใบ",
    descriptionTh: "สเปรดคลาสสิกที่ละเอียดที่สุด เหมาะกับคำถามซับซ้อนที่อยากเห็นรอบด้าน",
    cardCount: 10,
    positions: [
      { id: "present", labelTh: "หัวใจของเรื่อง", descriptionTh: "สิ่งที่กำลังเกิดขึ้นตรงกลางของเรื่องนี้" },
      { id: "challenge", labelTh: "สิ่งที่ขวางอยู่", descriptionTh: "อุปสรรคหรือแรงต้านที่วางขวางอยู่" },
      { id: "foundation", labelTh: "รากของเรื่อง", descriptionTh: "พื้นเดิมที่เรื่องนี้งอกออกมา" },
      { id: "recent-past", labelTh: "อดีตที่เพิ่งผ่าน", descriptionTh: "สิ่งที่เพิ่งเกิดและกำลังจะพ้นไป" },
      { id: "goal", labelTh: "สิ่งที่มุ่งหวัง", descriptionTh: "เป้าหมายหรือผลที่เป็นไปได้ที่สุด" },
      { id: "near-future", labelTh: "อนาคตอันใกล้", descriptionTh: "สิ่งที่กำลังจะเข้ามาในไม่ช้า" },
      { id: "self", labelTh: "ตัวคุณเอง", descriptionTh: "ท่าทีและมุมมองที่คุณมีต่อเรื่องนี้" },
      { id: "environment", labelTh: "คนรอบตัว", descriptionTh: "อิทธิพลจากคนอื่นและสภาพแวดล้อม" },
      { id: "hopes-fears", labelTh: "หวังและกลัว", descriptionTh: "สิ่งที่คุณหวังลึก ๆ และสิ่งที่กลัวอยู่เงียบ ๆ" },
      { id: "outcome", labelTh: "ปลายทาง", descriptionTh: "ผลรวมที่เรื่องนี้มีแนวโน้มจะไปจบลง" }
    ]
  }
];

function findSpread(id) {
  return SPREADS.find((spread) => spread.id === id) || SPREADS[0];
}
