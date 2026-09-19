/* หน้าดูดวง: เลือกเรื่อง → เลือกสเปรด → ตั้งคำถาม → จั่วไพ่ → อ่านผล */

const ReadingView = (function () {
  /* ต้องตรงกับ DAILY_LIMIT_PER_DEVICE ใน worker/src/index.js — แก้ที่เดียวไม่ sync กันอัตโนมัติ */
  const AI_DAILY_LIMIT = 5;

  const STEPS = [
    { numeral: "I", labelTh: "เรื่องที่ถาม" },
    { numeral: "II", labelTh: "รูปแบบ" },
    { numeral: "III", labelTh: "คำถาม" },
    { numeral: "IV", labelTh: "จั่วไพ่" }
  ];

  let state;
  let root;

  function reset() {
    state = {
      step: 1,
      topic: null,
      spread: null,
      question: "",
      deck: [],
      drawn: [],
      saved: false,
      readingId: null
    };
  }

  /* ---------- ส่วนประกอบย่อย ---------- */

  function rail() {
    if (state.step > STEPS.length) return "";
    return `
      <nav class="rail" aria-label="ขั้นตอนการดูดวง">
        ${STEPS.map((step, index) => {
          const number = index + 1;
          const status =
            number === state.step ? "current" : number < state.step ? "done" : "todo";
          const canReturn = number < state.step;
          return `
            ${index > 0 ? '<span class="rail__sep"></span>' : ""}
            <button class="rail__step" type="button" data-state="${status}"
                    data-goto="${number}" ${canReturn ? "" : "disabled"}>
              <span class="rail__num numeral">${step.numeral}</span>
              <span>${step.labelTh}</span>
            </button>`;
        }).join("")}
      </nav>`;
  }

  function stepTopic() {
    return `
      ${rail()}
      <div class="view-head">
        <p class="eyebrow">ขั้นที่ ๑</p>
        <h2>อยากถามเรื่องอะไร</h2>
        <p class="lede">เลือกเรื่องที่ใจอยู่กับมันมากที่สุดตอนนี้ คำแปลไพ่จะปรับให้ตรงกับเรื่องที่เลือก</p>
      </div>
      <div class="choices">
        ${TOPICS.map(
          (topic) => `
          <button class="choice" type="button" data-topic="${topic.id}">
            ${glyph(topic.glyph, 28, "choice__glyph")}
            <span class="choice__title">${escapeHtml(topic.labelTh)}</span>
            <span class="choice__desc">${escapeHtml(topic.descriptionTh)}</span>
          </button>`
        ).join("")}
      </div>`;
  }

  function stepSpread() {
    return `
      ${rail()}
      <div class="view-head">
        <p class="eyebrow">ขั้นที่ ๒</p>
        <h2>จะเปิดไพ่กี่ใบ</h2>
        <p class="lede">ยิ่งหลายใบยิ่งเห็นรายละเอียด แต่ก็ต้องใช้เวลาอ่านมากขึ้นเช่นกัน</p>
      </div>
      <div class="choices">
        ${SPREADS.map(
          (spread) => `
          <button class="choice" type="button" data-spread="${spread.id}">
            <span class="choice__count">${escapeHtml(spread.countLabel)}</span>
            <span class="choice__title">${escapeHtml(spread.nameTh)}</span>
            <span class="choice__desc">${escapeHtml(spread.descriptionTh)}</span>
          </button>`
        ).join("")}
      </div>`;
  }

  function stepQuestion() {
    return `
      ${rail()}
      <div class="view-head">
        <p class="eyebrow">ขั้นที่ ๓</p>
        <h2>อยากถามไพ่ว่าอะไร</h2>
        <p class="lede">
          พิมพ์คำถามในใจไว้ก็ได้ ข้ามไปเลยก็ได้ — คำถามจะไม่เปลี่ยนผลไพ่
          แต่ช่วยให้คุณอ่านคำตอบได้ตรงกับสิ่งที่อยากรู้มากขึ้น
        </p>
      </div>
      <div class="ask">
        <textarea class="ask__field" id="question-input"
                  placeholder="เช่น ถ้าฉันย้ายงานตอนนี้ จะเจอกับอะไร"
                  maxlength="300">${escapeHtml(state.question)}</textarea>
        <p class="ask__hint">คำถามเก็บไว้ในเครื่องคุณเท่านั้น ไม่ถูกส่งออกไปที่ไหน</p>
        <div class="btn-row">
          <button class="btn btn--quiet" type="button" data-skip>ข้ามไปจั่วไพ่</button>
          <button class="btn btn--gold" type="button" data-confirm>สับไพ่แล้วเริ่ม</button>
        </div>
      </div>`;
  }

  function stepDraw() {
    const total = state.deck.length + state.drawn.length;
    const mid = (total - 1) / 2;

    return `
      ${rail()}
      <div class="view-head">
        <p class="eyebrow">ขั้นที่ ๔</p>
        <h2>เลือกไพ่ของคุณ</h2>
        <p class="lede">สำรับสับใหม่แล้วด้วยการสุ่มจริง ไม่มีใครรู้ว่าใบไหนอยู่ตรงไหน รวมถึงตัวเว็บเอง</p>
      </div>

      <div class="fan-panel">
        <p class="fan-status" id="fan-status">${drawStatusText()}</p>
        <div class="fan" id="fan" style="--mid:${mid}">
          ${state.deck
            .map(
              (card, index) => `
            <button class="fan__card" type="button" style="--i:${index}"
                    data-draw="${index}" aria-label="จั่วไพ่ใบที่ ${index + 1}">
              <div class="card">
                <div class="card__inner">
                  <div class="card__face card__face--back"></div>
                </div>
              </div>
            </button>`
            )
            .join("")}
        </div>

        <div class="slots" id="slots">
          ${state.spread.positions
            .map(
              (position, index) => `
            <div class="slot ${index < state.drawn.length ? "is-filled" : ""}"
                 title="${escapeHtml(position.labelTh)}">${index + 1}</div>`
            )
            .join("")}
        </div>

        <div class="btn-row">
          <button class="btn" type="button" data-shuffle>สับไพ่ใหม่</button>
        </div>
      </div>`;
  }

  function drawStatusText() {
    const need = state.spread.cardCount;
    const got = state.drawn.length;
    if (got >= need) return "ครบแล้ว กำลังเปิดไพ่ให้…";
    const next = state.spread.positions[got];
    return need === 1
      ? "แตะไพ่หนึ่งใบจากสำรับ"
      : `ใบที่ ${got + 1} จาก ${need} — ตำแหน่ง “${next.labelTh}”`;
  }

  function stepResult() {
    const topic = state.topic;

    return `
      <div class="view-head">
        <p class="eyebrow">${escapeHtml(topic.labelTh)} · ${escapeHtml(state.spread.nameTh)}</p>
        <h2>ไพ่ตอบไว้แบบนี้</h2>
      </div>

      <div class="spread spread--${state.spread.id}">
        ${state.drawn
          .map(
            (draw, index) => `
          <div class="laid pos-${index + 1}" style="--i:${index}">
            <button class="card-btn" type="button" data-open-card="${draw.card.id}"
                   >
              ${cardMarkup(draw.card, {
                reversed: draw.orientation === "reversed",
                index,
                lazy: false
              })}
            </button>
            <span class="laid__label">${escapeHtml(draw.position.labelTh)}</span>
          </div>`
          )
          .join("")}
      </div>

      <div class="summary">
        ${
          state.question
            ? `<p class="summary__q">“${escapeHtml(state.question)}”</p>`
            : `<p class="summary__q">อ่านภาพรวมเรื่อง${escapeHtml(topic.labelTh)}</p>`
        }
        <p>${escapeHtml(summarizeReading(state.drawn, topic))}</p>
      </div>

      ${aiPanel()}

      <div class="readings">
        ${state.drawn.map((draw) => readingBlock(draw)).join("")}
      </div>

      <div class="btn-row">
        <button class="btn btn--gold" type="button" data-restart>ดูดวงใหม่อีกครั้ง</button>
        <a class="btn" href="#/history">ดูประวัติที่บันทึกไว้</a>
      </div>`;
  }

  function aiPanel() {
    return `
      <div class="ai-panel" id="ai-panel">
        <div class="ai-panel__body" id="ai-panel-body">
          <button class="btn btn--gold" type="button" data-ask-ai>ให้ AI ช่วยเรียบเรียงคำทำนาย</button>
          <p class="ask__hint">
            ส่งเฉพาะไพ่ที่จั่วได้กับคำถามของคุณไปให้ช่วยร้อยเรียงเป็นความเดียว
            ไม่เกิน ${AI_DAILY_LIMIT} ครั้งต่อวันต่อเครื่อง
          </p>
        </div>
      </div>`;
  }

  function readingBlock(draw) {
    const reading = interpretCard(draw.card, draw.orientation, state.topic, draw.position);
    const meta = suitMeta(draw.card);

    return `
      <article class="reading">
        <button class="card-btn" type="button" data-open-card="${draw.card.id}">
          ${cardMarkup(draw.card, {
            revealed: true,
            reversed: draw.orientation === "reversed",
            lazy: false
          })}
        </button>
        <div>
          <div class="reading__head">
            <span class="reading__position">${escapeHtml(reading.positionLabel)}</span>
            ${orientationTag(draw.orientation)}
          </div>
          <h3 class="reading__name">${escapeHtml(draw.card.nameTh)}</h3>
          <p class="eyebrow" style="color:${meta.color};margin-top:.35rem">
            ${escapeHtml(draw.card.nameEn)} · ${escapeHtml(meta.label)}
          </p>
          <p class="reading__topic">${escapeHtml(reading.topicLine)}</p>
          <p class="reading__meaning">${escapeHtml(reading.meaning)}</p>
          <ul class="keywords">
            ${reading.keywords.map((word) => `<li>${escapeHtml(word)}</li>`).join("")}
          </ul>
        </div>
      </article>`;
  }

  /* ---------- การทำงาน ---------- */

  function paint() {
    const body =
      state.step === 1
        ? stepTopic()
        : state.step === 2
        ? stepSpread()
        : state.step === 3
        ? stepQuestion()
        : state.step === 4
        ? stepDraw()
        : stepResult();

    root.innerHTML = `<section class="cloth">${body}</section>`;

    if (state.step === 5) revealSequence();
  }

  function revealSequence() {
    const cards = root.querySelectorAll(".spread .card");
    cards.forEach((card, index) => {
      window.setTimeout(() => card.classList.add("is-revealed"), 260 + index * 200);
    });
  }

  function beginDraw() {
    state.deck = shuffle(TAROT_CARDS);
    state.drawn = [];
    state.saved = false;
    state.step = 4;
    paint();
  }

  function drawCard(deckIndex) {
    if (state.drawn.length >= state.spread.cardCount) return;

    const card = state.deck[deckIndex];
    if (!card) return;

    const button = root.querySelector(`[data-draw="${deckIndex}"]`);
    if (!button || button.classList.contains("is-taken")) return;
    button.classList.add("is-taken");
    button.disabled = true;

    state.drawn.push({
      card,
      orientation: randomOrientation(),
      position: state.spread.positions[state.drawn.length]
    });

    const slot = root.querySelectorAll("#slots .slot")[state.drawn.length - 1];
    if (slot) slot.classList.add("is-filled");

    const status = root.querySelector("#fan-status");
    if (status) status.textContent = drawStatusText();

    if (state.drawn.length >= state.spread.cardCount) {
      persist();
      window.setTimeout(() => {
        state.step = 5;
        paint();
      }, 620);
    }
  }

  function persist() {
    if (state.saved) return;
    state.readingId = `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    state.saved = saveReading({
      id: state.readingId,
      at: Date.now(),
      topicId: state.topic.id,
      spreadId: state.spread.id,
      question: state.question,
      cards: state.drawn.map((draw) => ({
        cardId: draw.card.id,
        orientation: draw.orientation,
        positionId: draw.position.id
      }))
    });
  }

  function askAi() {
    const body = root.querySelector("#ai-panel-body");
    if (!body) return;

    body.innerHTML = `<p class="ai-panel__loading">กำลังให้ AI อ่านไพ่ของคุณ…</p>`;

    requestAiInterpretation({
      question: state.question,
      topic: state.topic,
      spread: state.spread,
      drawn: state.drawn
    })
      .then((narrative) => {
        if (state.readingId) saveAiNarrative(state.readingId, narrative);
        body.innerHTML = `
          <p class="eyebrow" style="color:var(--gilt)">AI ช่วยเรียบเรียง</p>
          <p class="ai-panel__text">${escapeHtml(narrative)}</p>`;
      })
      .catch((error) => {
        body.innerHTML = `
          <p class="ai-panel__error">${escapeHtml(error.message)}</p>
          <button class="btn" type="button" data-ask-ai>ลองอีกครั้ง</button>`;
      });
  }

  function shuffleAgain() {
    const fan = root.querySelector("#fan");
    if (!fan) return;
    state.deck = shuffle(state.deck);
    fan.classList.add("is-shuffling");
    window.setTimeout(() => fan.classList.remove("is-shuffling"), 540);
  }

  function bind() {
    root.addEventListener("click", (event) => {
      const target = event.target.closest("[data-topic],[data-spread],[data-goto],[data-skip],[data-confirm],[data-draw],[data-shuffle],[data-restart],[data-open-card],[data-ask-ai]");
      if (!target || !root.contains(target)) return;

      if (target.dataset.topic) {
        state.topic = findTopic(target.dataset.topic);
        state.step = 2;
        paint();
      } else if (target.dataset.spread) {
        state.spread = findSpread(target.dataset.spread);
        state.step = 3;
        paint();
      } else if (target.dataset.goto) {
        state.step = Number(target.dataset.goto);
        paint();
      } else if (target.hasAttribute("data-skip")) {
        state.question = "";
        beginDraw();
      } else if (target.hasAttribute("data-confirm")) {
        const field = root.querySelector("#question-input");
        state.question = field ? field.value.trim() : "";
        beginDraw();
      } else if (target.dataset.draw) {
        drawCard(Number(target.dataset.draw));
      } else if (target.hasAttribute("data-shuffle")) {
        shuffleAgain();
      } else if (target.hasAttribute("data-restart")) {
        reset();
        paint();
      } else if (target.dataset.openCard) {
        const card = findCard(target.dataset.openCard);
        if (card) openCardSheet(card);
      } else if (target.hasAttribute("data-ask-ai")) {
        askAi();
      }
    });
  }

  function render(container) {
    root = container;
    reset();
    paint();
    bind();
  }

  return { render };
})();
