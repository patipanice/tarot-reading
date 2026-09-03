/* รวมสำรับทั้งใบ: ชุดใหญ่ 22 + ชุดเล็ก 56 = 78 ใบ */

const TAROT_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA];

function findCard(id) {
  return TAROT_CARDS.find((card) => card.id === id) || null;
}
