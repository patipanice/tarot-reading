/* คลังไพ่: ค้นหาและกรองไพ่ทั้ง 78 ใบ */

const LibraryView = (function () {
  const GROUPS = [
    { id: "all", labelTh: "ทั้งหมด", color: "var(--gilt)" },
    { id: "major", labelTh: "ชุดใหญ่", color: "var(--ink-major)" },
    { id: "cups", labelTh: "ถ้วย", color: "var(--ink-cups)" },
    { id: "pentacles", labelTh: "เหรียญ", color: "var(--ink-pentacles)" },
    { id: "swords", labelTh: "ดาบ", color: "var(--ink-swords)" },
    { id: "wands", labelTh: "ไม้เท้า", color: "var(--ink-wands)" }
  ];

  let root;
  let filter = "all";
  let query = "";

  function matches(card) {
    const inGroup =
      filter === "all" ||
      (filter === "major" ? card.arcana === "major" : card.suit === filter);
    if (!inGroup) return false;
    if (!query) return true;

    const haystack = [
      card.nameTh,
      card.nameEn,
      card.meaningUpright,
      card.meaningReversed,
      ...card.keywordsUpright,
      ...card.keywordsReversed
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.toLowerCase());
  }

  function gridMarkup() {
    const results = TAROT_CARDS.filter(matches);

    if (results.length === 0) {
      return `
        <div class="empty">
          ${glyph("gl-book", 48, "empty__glyph")}
          <p>ไม่พบไพ่ที่ตรงกับ “${escapeHtml(query)}”</p>
          <p>ลองค้นด้วยชื่อไพ่ ชื่อภาษาอังกฤษ หรือคำอย่าง “เริ่มต้นใหม่”</p>
        </div>`;
    }

    return `
      <div class="library">
        ${results
          .map((card) => {
            const meta = suitMeta(card);
            return `
            <button class="lib-card" type="button" data-open-card="${card.id}">
              <span class="lib-card__art">
                <img src="assets/cards/${card.image}" alt="${escapeHtml(card.nameTh)}" loading="lazy">
              </span>
              <span class="lib-card__suit" style="color:${meta.color}">
                ${escapeHtml(card.numeral || "")}
              </span>
              <span class="lib-card__name">${escapeHtml(card.nameTh)}</span>
            </button>`;
          })
          .join("")}
      </div>`;
  }

  function paint() {
    root.innerHTML = `
      <section class="cloth">
        <div class="view-head">
          <p class="eyebrow">78 ใบ</p>
          <h2>คลังความหมายไพ่</h2>
          <p class="lede">
            สำรับ Rider–Waite–Smith เต็มสำรับ กดที่ไพ่เพื่ออ่านความหมายทั้งหัวตั้งและกลับหัว
            พร้อมมุมมองแยกตามเรื่องที่ถาม
          </p>
        </div>

        <div class="filters">
          <input class="search" id="library-search" type="search"
                 placeholder="ค้นหาชื่อไพ่ หรือคำสำคัญ" value="${escapeHtml(query)}"
                 aria-label="ค้นหาไพ่">
          <div class="chips">
            ${GROUPS.map(
              (group) => `
              <button class="chip" type="button" data-filter="${group.id}"
                      aria-pressed="${filter === group.id}">
                <span class="chip__dot" style="background:${group.color}"></span>
                ${escapeHtml(group.labelTh)}
              </button>`
            ).join("")}
          </div>
        </div>

        <div id="library-grid">${gridMarkup()}</div>
      </section>`;
  }

  function repaintGrid() {
    const grid = root.querySelector("#library-grid");
    if (grid) grid.innerHTML = gridMarkup();
  }

  function render(container) {
    root = container;
    filter = "all";
    query = "";
    paint();

    root.addEventListener("input", (event) => {
      if (event.target.id !== "library-search") return;
      query = event.target.value.trim();
      repaintGrid();
    });

    root.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-filter]");
      if (chip && root.contains(chip)) {
        filter = chip.dataset.filter;
        root.querySelectorAll("[data-filter]").forEach((button) => {
          button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
        });
        repaintGrid();
        return;
      }

      const open = event.target.closest("[data-open-card]");
      if (open && root.contains(open)) {
        const card = findCard(open.dataset.openCard);
        if (card) openCardSheet(card);
      }
    });
  }

  return { render };
})();
