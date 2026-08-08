(function () {
  const state = {
    topic: null,
    spread: null,
    question: "",
    deck: [],
    drawn: [] // { card, orientation, position }
  };

  const steps = {
    topic: document.getElementById("step-topic"),
    spread: document.getElementById("step-spread"),
    question: document.getElementById("step-question"),
    draw: document.getElementById("step-draw"),
    result: document.getElementById("step-result")
  };

  function showStep(name) {
    Object.entries(steps).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderTopicOptions() {
    const container = document.getElementById("topic-options");
    container.innerHTML = "";
    TOPICS.forEach((topic) => {
      const card = document.createElement("button");
      card.className = "option-card";
      card.type = "button";
      card.innerHTML = `<span class="option-icon">${topic.icon}</span><span>${topic.labelTh}</span>`;
      card.addEventListener("click", () => {
        state.topic = topic;
        renderSpreadOptions();
        showStep("spread");
      });
      container.appendChild(card);
    });
  }

  function renderSpreadOptions() {
    const container = document.getElementById("spread-options");
    container.innerHTML = "";
    SPREADS.forEach((spread) => {
      const card = document.createElement("button");
      card.className = "option-card option-card-wide";
      card.type = "button";
      card.innerHTML = `<strong>${spread.nameTh}</strong><span class="option-desc">${spread.descriptionTh}</span>`;
      card.addEventListener("click", () => {
        state.spread = spread;
        showStep("question");
      });
      container.appendChild(card);
    });
  }

  function startDrawStep() {
    state.deck = shuffle(TAROT_CARDS);
    state.drawn = [];
    document.getElementById("deck-grid").innerHTML = "";
    renderDeck();
    updateDrawProgress();
    showStep("draw");
  }

  function updateDrawProgress() {
    const needed = state.spread.cardCount;
    document.getElementById("draw-progress").textContent = `(${state.drawn.length}/${needed})`;
  }

  function renderDeck() {
    const container = document.getElementById("deck-grid");
    container.innerHTML = "";
    state.deck.forEach((card, index) => {
      const slot = document.createElement("button");
      slot.className = "deck-card";
      slot.type = "button";
      slot.setAttribute("aria-label", "จั่วไพ่");
      slot.innerHTML = `<span class="deck-card-back">✦</span>`;
      slot.addEventListener("click", () => onDrawCard(index));
      container.appendChild(slot);
    });
  }

  function onDrawCard(deckIndex) {
    const needed = state.spread.cardCount;
    if (state.drawn.length >= needed) return;

    const card = state.deck[deckIndex];
    if (!card) return;

    const orientation = randomOrientation();
    const position = state.spread.positions[state.drawn.length];
    state.drawn.push({ card, orientation, position });

    // เอาไพ่ใบที่จั่วออกจากกอง ป้องกันการจั่วซ้ำ
    state.deck.splice(deckIndex, 1);
    renderDeck();
    updateDrawProgress();

    if (state.drawn.length >= needed) {
      setTimeout(showResult, 300);
    }
  }

  function showResult() {
    const summaryEl = document.getElementById("reading-summary");
    summaryEl.textContent = summarizeReading(state.question, state.topic, state.drawn);

    const grid = document.getElementById("result-grid");
    grid.innerHTML = "";

    state.drawn.forEach(({ card, orientation, position }) => {
      const interpretation = interpretCard(card, orientation, state.topic, position);
      const item = document.createElement("article");
      item.className = "result-card";
      item.innerHTML = `
        <div class="result-card-image ${orientation === "reversed" ? "is-reversed" : ""}">
          <img src="assets/cards/${card.image}" alt="${card.nameTh}" onerror="this.style.display='none'">
        </div>
        <div class="result-card-body">
          <h3>${position ? position.labelTh + " — " : ""}${card.nameTh}</h3>
          <p class="orientation-tag">${interpretation.orientationLabel}</p>
          <p>${interpretation.text}</p>
        </div>
      `;
      grid.appendChild(item);
    });

    showStep("result");
  }

  function restart() {
    state.topic = null;
    state.spread = null;
    state.question = "";
    state.deck = [];
    state.drawn = [];
    document.getElementById("question-input").value = "";
    renderTopicOptions();
    showStep("topic");
  }

  document.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    switch (action) {
      case "back-to-topic":
        showStep("topic");
        break;
      case "back-to-spread":
        showStep("spread");
        break;
      case "skip-question":
        state.question = "";
        startDrawStep();
        break;
      case "confirm-question":
        state.question = document.getElementById("question-input").value.trim();
        startDrawStep();
        break;
      case "restart":
        restart();
        break;
    }
  });

  renderTopicOptions();
  showStep("topic");
})();
