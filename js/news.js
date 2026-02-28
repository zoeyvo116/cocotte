document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CSV ファイルの URL
  ========================= */
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOiSsXspBCXRD7N0v1ZMirkdvIxonYW8pJL93do78x41V0Z2ru1jJY1-_0t_HTXFErWZzOlQSqk_BQ/pub?output=csv";

  /* =========================
     DOM 要素取得
  ========================= */
  const newsWrap = document.querySelector(".story-wrap");
  const track = document.querySelector(".news-thumb-track");

  /* =========================
     要素チェック
  ========================= */
  if (!newsWrap || !track) {
    console.error("❌ コンテナが見つかりません");
    return;
  }

  /* =========================
     CSV 読み込み
  ========================= */
  fetch(CSV_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split("\n").slice(1); // ヘッダー除外

      rows.forEach((row, index) => {
        const [title, date, detail, image] = row.split(",");

        /* =========================
           本文の改行・記号整形
        ========================= */
        const formattedDetail = detail
          .replace(/\\n/g, "<br>")
          .replace(/""/g, '"')
          .replace(/^"+|"+$/g, "");

        /* =========================
           NEWS 本文生成
        ========================= */
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

        /* =========================
           コースパネルの前に挿入
        ========================= */
        const coursePanel = document.querySelector(".course-panel");

        if (coursePanel) {
          newsWrap.insertBefore(article, coursePanel);
        } else {
          newsWrap.appendChild(article);
        }

        /* =========================
           サムネイル生成
        ========================= */
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

      /* デバイス別ギャップ調整 */
      if (window.innerWidth >= 1024) {
        trackInner.style.gap = "50px"; // PC
      } else {
        trackInner.style.gap = "24px"; // モバイル
      }

      /* 中身を移動 */
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
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    })
    .catch(err => {
      console.error("❌ CSV 読み込みエラー:", err);
    });
});

/* =====================================================
   サイドメニュー制御
===================================================== */
const menuBtn = document.querySelector(".hero-menu");
const sideMenu = document.getElementById("sideMenu");
const closeMenu = document.getElementById("closeMenu");

menuBtn?.addEventListener("click", e => {
  e.stopPropagation();
  sideMenu.classList.add("active");
});

closeMenu?.addEventListener("click", e => {
  e.stopPropagation();
  sideMenu.classList.remove("active");
});
