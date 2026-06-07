document.addEventListener("DOMContentLoaded", async () => {

  /* =========================
     DOM 要素取得
  ========================= */
  const newsWrap = document.querySelector(".story-wrap");
  const track = document.querySelector(".news-thumb-track");

  if (!newsWrap || !track) {
    console.error("❌ コンテナが見つかりません");
    return;
  }

  /* =========================
     CSV 読み込み（data.js 経由）
  ========================= */
  let rows;
  try {
    rows = await Data.loadNews();
  } catch (err) {
    console.error("❌ CSV 読み込みエラー:", err);
    newsWrap.insertAdjacentHTML(
      "afterbegin",
      `<p class="news-error">ニュースを読み込めませんでした。時間をおいて再度お試しください。</p>`
    );
    return;
  }

  rows.forEach((cols, index) => {
    const [title, date, detail, image] = cols;

    /* 本文の改行整形（quote はパーサーが処理済み） */
    const formattedDetail = (detail || "").replace(/\\n/g, "<br>");

    /* NEWS 本文生成 */
    const article = document.createElement("article");
    article.className = "news-item";
    article.id = `news-${index + 1}`;
    article.innerHTML = `
      <div class="news-image-wrap">
        <img class="news-image" src="${image}" alt="${title}">
      </div>

      <div class="news-head">
        <h3 class="news-title">${title}</h3>
      </div>

      <div class="news-body">
        <p class="news-detail">${formattedDetail}</p>
      </div>

      <div class="news-meta">
        <time class="news-date">${date}</time>
      </div>
    `;

    /* コースパネルの前に挿入 */
    const coursePanel = document.querySelector(".course-panel");
    if (coursePanel) {
      newsWrap.insertBefore(article, coursePanel);
    } else {
      newsWrap.appendChild(article);
    }

    /* サムネイル生成 */
    const thumb = document.createElement("div");
    thumb.className = "news-thumb";
    thumb.dataset.target = article.id;
    thumb.innerHTML = `<img src="${image}" alt="${title}">`;
    track.appendChild(thumb);
  });

  /* =========================
     自動ループ（横スクロール）
  ========================= */
  const trackInner = document.createElement("div");
  trackInner.style.display = "flex";
  trackInner.style.gap = window.innerWidth >= 1024 ? "50px" : "24px";

  while (track.firstChild) {
    trackInner.appendChild(track.firstChild);
  }
  track.appendChild(trackInner);

  /* ループ用に複製 */
  trackInner.innerHTML += trackInner.innerHTML;

  let pos = 0;
  const speed = 0.3;

  function loop() {
    pos -= speed;
    const half = trackInner.scrollWidth / 2;
    if (Math.abs(pos) >= half) pos = 0;
    trackInner.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(loop);
  }
  loop();

  /* =========================
     サムネイルクリック処理
  ========================= */
  track.addEventListener("click", e => {
    const thumb = e.target.closest(".news-thumb");
    if (!thumb) return;
    const target = document.getElementById(thumb.dataset.target);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* =====================================================
   サイドメニュー制御
===================================================== */
Data.initSideMenu();
