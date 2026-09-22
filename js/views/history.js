/* ประวัติการดูดวง — อ่านจาก localStorage ของเครื่องผู้ใช้เท่านั้น */

const HistoryView = (function () {
  let root;

  function entryMarkup(entry) {
    const topic = findTopic(entry.topicId);
    const spread = findSpread(entry.spreadId);

    const cardNames = (entry.cards || [])
      .map((item) => {
        const card = findCard(item.cardId);
        if (!card) return null;
        return `${card.nameTh}${item.orientation === "reversed" ? " (กลับหัว)" : ""}`;
      })
      .filter(Boolean)
      .join(", ");

    return `
      <article class="entry">
        <div>
          <p class="entry__meta">${escapeHtml(formatThaiDateTime(entry.at))}</p>
          ${
            entry.question
              ? `<p class="entry__q">“${escapeHtml(entry.question)}”</p>`
              : `<p class="entry__q">อ่านภาพรวมเรื่อง${escapeHtml(topic.labelTh)}</p>`
          }
          <p class="entry__cards">
            ${escapeHtml(spread.nameTh)} — ${escapeHtml(cardNames)}
          </p>
          ${
            entry.aiNarrative
              ? `<p class="entry__ai">${escapeHtml(entry.aiNarrative)}</p>`
              : ""
          }
        </div>
        <div class="entry__actions">
          <button class="btn btn--quiet btn--danger" type="button"
                  data-delete="${escapeHtml(entry.id)}">ลบ</button>
        </div>
      </article>`;
  }

  function paint() {
    const entries = getHistory();

    const body = !storageAvailable()
      ? `<div class="empty">
           ${glyph("gl-scroll", 48, "empty__glyph")}
           <p>เบราว์เซอร์นี้ปิดการเก็บข้อมูลในเครื่องไว้ จึงบันทึกประวัติให้ไม่ได้</p>
           <p>ลองเปิดนอกโหมดส่วนตัว แล้วดูดวงอีกครั้ง</p>
         </div>`
      : entries.length === 0
      ? `<div class="empty">
           ${glyph("gl-scroll", 48, "empty__glyph")}
           <p>ยังไม่มีประวัติที่บันทึกไว้</p>
           <p>ทุกครั้งที่เปิดไพ่จนครบ ระบบจะเก็บผลไว้ให้ที่นี่โดยอัตโนมัติ</p>
           <div class="btn-row"><a class="btn btn--gold" href="#/reading">เริ่มดูดวง</a></div>
         </div>`
      : `<div class="history">${entries.map(entryMarkup).join("")}</div>
         <div class="btn-row">
           <button class="btn btn--quiet btn--danger" type="button" data-clear>ลบประวัติทั้งหมด</button>
         </div>`;

    root.innerHTML = `
      <section class="cloth">
        <div class="view-head">
          <p class="eyebrow">${entries.length ? `${entries.length} ครั้งล่าสุด` : "ยังว่างอยู่"}</p>
          <h2>ประวัติการดูดวง</h2>
          <p class="lede">
            เก็บไว้ในเครื่องคุณเท่านั้น เก็บได้สูงสุด 50 ครั้ง เกินจากนั้นรายการเก่าสุดจะหลุดออกไปเอง
          </p>
        </div>
        ${body}
      </section>`;
  }

  function render(container) {
    root = container;
    paint();

    root.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-delete]");
      if (remove && root.contains(remove)) {
        deleteReading(remove.dataset.delete);
        paint();
        return;
      }

      const clear = event.target.closest("[data-clear]");
      if (clear && root.contains(clear)) {
        if (window.confirm("ลบประวัติการดูดวงทั้งหมดในเครื่องนี้ ใช่ไหม")) {
          clearHistory();
          paint();
        }
      }
    });
  }

  return { render };
})();
