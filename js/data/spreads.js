const SPREADS = [
  {
    id: "single",
    nameTh: "ไพ่ใบเดียว",
    descriptionTh: "เหมาะกับคำถามตรงไปตรงมา หรือต้องการคำแนะนำสั้นๆ ในแต่ละวัน",
    cardCount: 1,
    positions: [
      { id: "answer", labelTh: "คำตอบ/คำแนะนำ", descriptionTh: "ภาพรวมของคำตอบต่อคำถามที่ถาม" }
    ]
  },
  {
    id: "three",
    nameTh: "3 ใบ: อดีต-ปัจจุบัน-อนาคต",
    descriptionTh: "ดูภาพรวมของเรื่องที่ถามผ่านสามช่วงเวลา",
    cardCount: 3,
    positions: [
      { id: "past", labelTh: "อดีต", descriptionTh: "สิ่งที่ผ่านมาซึ่งส่งผลถึงตอนนี้" },
      { id: "present", labelTh: "ปัจจุบัน", descriptionTh: "สถานการณ์ที่กำลังเผชิญอยู่ตอนนี้" },
      { id: "future", labelTh: "อนาคต", descriptionTh: "แนวโน้มที่กำลังจะเกิดขึ้น" }
    ]
  },
  {
    id: "celtic-cross",
    nameTh: "Celtic Cross (10 ใบ)",
    descriptionTh: "ไพ่แบบละเอียดที่นิยมที่สุด เหมาะกับคำถามที่ซับซ้อนหรือต้องการมุมมองรอบด้าน",
    cardCount: 10,
    positions: [
      { id: "present", labelTh: "1. สถานการณ์ปัจจุบัน", descriptionTh: "หัวใจของเรื่องที่กำลังเกิดขึ้น" },
      { id: "challenge", labelTh: "2. อุปสรรค/ความท้าทาย", descriptionTh: "สิ่งที่ขวางหรือท้าทายอยู่ตรงหน้า" },
      { id: "foundation", labelTh: "3. รากฐาน/อดีตที่ผ่านมา", descriptionTh: "พื้นฐานหรือเหตุการณ์ในอดีตที่ส่งผล" },
      { id: "recent-past", labelTh: "4. อดีตอันใกล้", descriptionTh: "เหตุการณ์ที่เพิ่งผ่านมาไม่นาน" },
      { id: "goal", labelTh: "5. เป้าหมาย/สิ่งที่หวังไว้", descriptionTh: "สิ่งที่มุ่งหวังหรือเป็นไปได้ในเรื่องนี้" },
      { id: "near-future", labelTh: "6. อนาคตอันใกล้", descriptionTh: "สิ่งที่กำลังจะเกิดขึ้นในไม่ช้า" },
      { id: "self", labelTh: "7. ตัวคุณเอง", descriptionTh: "มุมมองหรือท่าทีของคุณต่อเรื่องนี้" },
      { id: "environment", labelTh: "8. สิ่งแวดล้อมรอบตัว", descriptionTh: "อิทธิพลจากคนรอบข้างหรือสถานการณ์แวดล้อม" },
      { id: "hopes-fears", labelTh: "9. ความหวังและความกลัว", descriptionTh: "ความรู้สึกลึกๆ ที่มีต่อผลลัพธ์ของเรื่องนี้" },
      { id: "outcome", labelTh: "10. ผลลัพธ์สุดท้าย", descriptionTh: "แนวโน้มผลลัพธ์โดยรวมของเรื่องที่ถาม" }
    ]
  }
];
