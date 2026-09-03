/* ไพ่ประจำวัน: สุ่มจริงตอนเปิดครั้งแรกของวัน แล้วคงใบเดิมไว้จนหมดวัน */

const DailyView = (function () {
  let root;

  function paint() {
    const saved = getDailyDraw();
    root.innerHTML = `<section class="cloth">${saved ? drawn(saved) : invite()}</section>`;
  }

  function invite() {
    return `
      <div class="view-head">
        <p class="eyebrow">${escapeHtml(formatThaiDate(Date.now()))}</p>
        <h2>ไพ่ประจำวันนี้</h2>
        <p class="lede">
          เปิดได้วันละใบ ใบที่เปิดแล้วจะอยู่กับคุณทั้งวัน แล้วเริ่มใหม่พรุ่งนี้
          ลองถือคำใบ้ของมันไว้ดูว่าวันนี้จะเจออะไร
        </p>
      </div>
      <div class="daily daily--empty">
        <div style="width:min(14rem,60vw)">
          ${cardMarkup(TAROT_CARDS[0], { lazy: false })}
        </div>
        <button class="btn btn--gold" type="button" data-draw-daily>เปิดไพ่ของวันนี้</button>
      </div>`;
  }

  function drawn(saved) {
    const card = findCard(saved.cardId);
    if (!card) return invite();

    const upright = saved.orientation === "upright";
    const meta = suitMeta(card);

    return `
      <div class="view-head">
        <p class="eyebrow">${escapeHtml(formatThaiDate(saved.at))}</p>
        <h2>ไพ่ประจำวันนี้</h2>
      </div>
      <div class="daily">
        <div class="daily__art">
          <button class="card-btn" type="button" data-open-card="${card.id}">
            ${cardMarkup(card, {
              revealed: true,
              reversed: !upright,
              lazy: false
            })}
          </button>
        </div>
        <div>
          <p class="eyebrow" style="color:${meta.color}">
            ${escapeHtml(card.nameEn)} · ${escapeHtml(meta.label)}
          </p>
          <h3 class="daily__name">${escapeHtml(card.nameTh)}</h3>
          ${orientationTag(saved.orientation)}
          <p class="reading__topic">${escapeHtml((card.topics && card.topics.general) || "")}</p>
          <p class="reading__meaning">
            ${escapeHtml(upright ? card.meaningUpright : card.meaningReversed)}
          </p>
          <ul class="keywords">
            ${(upright ? card.keywordsUpright : card.keywordsReversed)
              .map((word) => `<li>${escapeHtml(word)}</li>`)
              .join("")}
          </ul>
          <div class="btn-row" style="justify-content:flex-start">
            <a class="btn" href="#/reading">ถามให้ลึกกว่านี้</a>
          </div>
        </div>
      </div>`;
  }

  function drawToday() {
    const card = shuffle(TAROT_CARDS)[0];
    const draw = {
      dateKey: todayKey(),
      at: Date.now(),
      cardId: card.id,
      orientation: randomOrientation()
    };
    saveDailyDraw(draw);
    paint();

    const cardEl = root.querySelector(".card");
    if (cardEl) {
      cardEl.classList.remove("is-revealed");
      window.setTimeout(() => cardEl.classList.add("is-revealed"), 60);
    }
  }

  function render(container) {
    root = container;
    paint();

    root.addEventListener("click", (event) => {
      const target = event.target.closest("[data-draw-daily],[data-open-card]");
      if (!target || !root.contains(target)) return;

      if (target.hasAttribute("data-draw-daily")) {
        drawToday();
      } else if (target.dataset.openCard) {
        const card = findCard(target.dataset.openCard);
        if (card) openCardSheet(card);
      }
    });
  }

  return { render };
})();
