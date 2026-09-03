/* เก็บข้อมูลไว้ในเครื่องผู้ใช้เท่านั้น (localStorage) — ไม่มีการส่งออกไปที่ไหน
   localStorage อาจใช้ไม่ได้ในโหมดส่วนตัวหรือเมื่อเบราว์เซอร์ปิดการเก็บข้อมูลไว้
   ทุกฟังก์ชันจึงต้องทำงานต่อได้แม้อ่าน/เขียนไม่สำเร็จ */

const STORE_HISTORY = "tarot.history.v1";
const STORE_DAILY = "tarot.daily.v1";
const HISTORY_LIMIT = 50;

function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function storageAvailable() {
  try {
    const probe = "tarot.probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch (error) {
    return false;
  }
}

/* ---- ประวัติการดูดวง ---- */

function getHistory() {
  const list = readStore(STORE_HISTORY, []);
  return Array.isArray(list) ? list : [];
}

function saveReading(entry) {
  const list = getHistory();
  list.unshift(entry);
  return writeStore(STORE_HISTORY, list.slice(0, HISTORY_LIMIT));
}

function deleteReading(id) {
  return writeStore(
    STORE_HISTORY,
    getHistory().filter((entry) => entry.id !== id)
  );
}

function clearHistory() {
  return writeStore(STORE_HISTORY, []);
}

/* ---- ไพ่ประจำวัน ---- */

/* คีย์วันตามเวลาท้องถิ่นของผู้ใช้ ไม่ใช่ UTC เพื่อให้ "วันใหม่" ตรงกับเที่ยงคืนบ้านเขา */
function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDailyDraw() {
  const saved = readStore(STORE_DAILY, null);
  if (saved && saved.dateKey === todayKey()) return saved;
  return null;
}

function saveDailyDraw(draw) {
  return writeStore(STORE_DAILY, draw);
}
