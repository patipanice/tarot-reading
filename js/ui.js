/* ตัวช่วยที่ทุก view ใช้ร่วมกัน */

const SUIT_META = {
  major: { label: "ชุดใหญ่", glyph: "gl-star", color: "var(--ink-major)" },
  cups: { label: "ถ้วย", glyph: "gl-cups", color: "var(--ink-cups)" },
  pentacles: { label: "เหรียญ", glyph: "gl-pentacles", color: "var(--ink-pentacles)" },
  swords: { label: "ดาบ", glyph: "gl-swords", color: "var(--ink-swords)" },
  wands: { label: "ไม้เท้า", glyph: "gl-wands", color: "var(--ink-wands)" }
};

function suitMeta(card) {
  return SUIT_META[card.arcana === "major" ? "major" : card.suit] || SUIT_META.major;
}

/* ข้อความจากผู้ใช้และจาก localStorage ต้อง escape ก่อนใส่ innerHTML เสมอ */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function glyph(id, size = 20, className = "") {
  return `<svg class="${className}" width="${size}" height="${size}" aria-hidden="true"><use href="#${id}"/></svg>`;
}

function cardMarkup(card, options = {}) {
  const { revealed = false, reversed = false, index = 0, lazy = true } = options;
  const classes = ["card"];
  if (revealed) classes.push("is-revealed");
  if (reversed) classes.push("is-reversed");
  return `
    <div class="${classes.join(" ")}" style="--i:${index}">
      <div class="card__inner">
        <div class="card__face card__face--back"></div>
        <div class="card__face card__face--front">
          <img src="assets/cards/${card.image}" alt="${escapeHtml(card.nameTh)}"${lazy ? ' loading="lazy"' : ""}>
        </div>
      </div>
    </div>`;
}

function orientationTag(orientation) {
  return orientation === "upright"
    ? '<span class="tag tag--upright">หัวตั้ง</span>'
    : '<span class="tag tag--reversed">กลับหัว</span>';
}

function formatThaiDate(timestamp) {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(timestamp));
  } catch (error) {
    return new Date(timestamp).toLocaleDateString();
  }
}

function formatThaiDateTime(timestamp) {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(timestamp));
  } catch (error) {
    return new Date(timestamp).toLocaleString();
  }
}

/* เปิดกล่องรายละเอียดไพ่ ใช้ร่วมกันระหว่างคลังไพ่ ไพ่ประจำวัน และหน้าผล */
function openCardSheet(card) {
  const sheet = document.getElementById("card-sheet");
  const body = document.getElementById("card-sheet-body");
  const meta = suitMeta(card);

  body.innerHTML = `
    <div>${cardMarkup(card, { revealed: true, lazy: false })}</div>
    <div>
      <p class="eyebrow" style="color:${meta.color}">
        ${escapeHtml(card.nameEn)} · ${escapeHtml(meta.label)}
      </p>
      <h3 class="reading__name" style="margin:.25rem 0 1rem">${escapeHtml(card.nameTh)}</h3>

      <div class="meaning-block">
        <h4 class="tag--upright" style="color:var(--gilt)">หัวตั้ง</h4>
        <p>${escapeHtml(card.meaningUpright)}</p>
        <ul class="keywords">${card.keywordsUpright.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}</ul>
      </div>

      <div class="meaning-block">
        <h4 style="color:var(--ink-wands)">กลับหัว</h4>
        <p>${escapeHtml(card.meaningReversed)}</p>
        <ul class="keywords">${card.keywordsReversed.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}</ul>
      </div>

      <div class="meaning-block">
        <h4>ไพ่ใบนี้พูดถึงอะไรในแต่ละเรื่อง</h4>
        <ul class="topic-list">
          ${TOPICS.map(
            (topic) => `<li><strong>${escapeHtml(topic.labelTh)}</strong> — ${escapeHtml(
              (card.topics && card.topics[topic.id]) || ""
            )}</li>`
          ).join("")}
        </ul>
      </div>
    </div>`;

  if (typeof sheet.showModal === "function") {
    sheet.showModal();
  } else {
    sheet.setAttribute("open", "");
  }
}
