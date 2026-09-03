/* เราเตอร์ง่าย ๆ ด้วย hash — ทุก view ได้ container ใหม่เสมอ
   เพื่อให้ event listener ของ view เดิมตายไปพร้อมกับ DOM เดิม ไม่ทับถมกัน */

(function () {
  const ROUTES = {
    reading: ReadingView,
    daily: DailyView,
    library: LibraryView,
    history: HistoryView
  };

  const app = document.getElementById("app");
  const sheet = document.getElementById("card-sheet");

  function routeName() {
    const raw = window.location.hash.replace(/^#\/?/, "").split("/")[0];
    return ROUTES[raw] ? raw : "reading";
  }

  function syncNav(name) {
    document.querySelectorAll("#nav .nav__link").forEach((link) => {
      const target = link.getAttribute("href").replace(/^#\/?/, "");
      if (target === name) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function render() {
    const name = routeName();
    const container = document.createElement("div");
    app.replaceChildren(container);
    ROUTES[name].render(container);
    syncNav(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* กล่องรายละเอียดไพ่: ปิดด้วยปุ่ม หรือคลิกพื้นหลังนอกกล่อง */
  sheet.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-sheet]") || event.target === sheet) {
      sheet.close();
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
