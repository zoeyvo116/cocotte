/* =====================================================
   INFOボックス設定
===================================================== */
const infoImage = document.getElementById("infoImage");

const images = {
  info1: "img/phone/a-menu.svg",
  info2: "img/phone/a-calendar.svg",
  info3: "img/phone/a-original.svg",
  info4: "img/phone/a-story.svg",
  info5: "img/phone/a-news.svg",
  info6: "img/phone/a-info.svg"
};

const infoPC = {
  info1: "img/pc/a-menu.svg",
  info2: "img/pc/a-calendar.svg",
  info3: "img/pc/a-original.svg",
  info4: "img/pc/a-story.svg",
  info5: "img/pc/a-news.svg",
  info6: "img/pc/a-info.svg"
};

const infoLinks = {
  info1: "menu.html",
  info2: "calendar.html",
  info3: "original.html",
  info4: "story.html",
  info5: "news.html",
  info6: "info.html"
};

let activePopup = null;
let activeQmark = null;

/* ？ごとのラベル（PCホバー時に表示） */
const qmarkLabels = {
  info1: "メニュー",
  info2: "カレンダー",
  info3: "なにたべる？",
  info4: "ストーリー",
  info5: "ニュース",
  info6: "インフォメーション"
};

let hoverLabel = null;

/* =====================================================
   クエスチョンマーククリック処理
===================================================== */
document.querySelectorAll(".qmark").forEach(qmark => {
  qmark.addEventListener("click", e => {
    e.stopPropagation();
    const key = qmark.dataset.info;
    if (!key) return;

    hidePcHint();   // 初めてクリックしたらヒントを消す

    if (window.innerWidth >= 1024) {
      openPCPopup(qmark, key);
    } else {
      openMobileInfo(key);
    }
  });

  /* PC：？にホバーでラベル表示 */
  qmark.addEventListener("mouseenter", () => {
    if (window.innerWidth < 1024) return;
    const key = qmark.dataset.info;
    const text = qmarkLabels[key];
    if (!text) return;

    hoverLabel = document.createElement("div");
    hoverLabel.className = "qmark-label";
    hoverLabel.textContent = text;
    document.body.appendChild(hoverLabel);

    const r = qmark.getBoundingClientRect();
    hoverLabel.style.left = (r.left + r.width / 2) + "px";
    hoverLabel.style.top = (r.top - 10) + "px";

    requestAnimationFrame(() => hoverLabel?.classList.add("show"));
  });

  qmark.addEventListener("mouseleave", () => {
    hoverLabel?.remove();
    hoverLabel = null;
  });
});

/* =====================================================
   PC用：操作ガイド（中央モーダル）
===================================================== */
const pcHint = document.getElementById("pcHint");
const pcHintClose = document.getElementById("pcHintClose");
const pcHintOk = document.getElementById("pcHintOk");
let pcHintShown = false;

function showPcHint() {
  if (window.innerWidth < 1024 || !pcHint || pcHintShown) return;
  pcHintShown = true;
  pcHint.classList.add("show");
}

function hidePcHint() {
  pcHint?.classList.remove("show");
}

/* 閉じる：ボタン・×・背景クリック */
pcHintClose?.addEventListener("click", hidePcHint);
pcHintOk?.addEventListener("click", hidePcHint);
pcHint?.addEventListener("click", e => {
  if (e.target === pcHint) hidePcHint();   // 背景（オーバーレイ）クリックで閉じる
});

/* ===================== PC表示 ===================== */
function openPCPopup(qmark, key) {
  // 同じ「？」をもう一度クリック → 閉じる（トグル）
  if (activePopup && activeQmark === qmark) {
    closePopup();
    return;
  }
  // 別の「？」をクリック → 今のを閉じてすぐ新しいのを開く（1クリック）
  if (activePopup) closePopup();

  qmark.style.opacity = "0";

  const popup = document.createElement("img");
  popup.src = infoPC[key];
  popup.className = "pc-info-img";   // .show は次フレームで付与
  document.body.appendChild(popup);

  // 「？」の上に表示（実寸で計算：透明クリック誤爆を防ぐ）
  const pw = popup.offsetWidth || 220;
  const ph = popup.offsetHeight || 75;
  positionPopupAbove(qmark, popup, pw, ph);

  // 次フレームで .show → transition がなめらかに発火
  requestAnimationFrame(() => popup.classList.add("show"));

  // 誤クリック防止：出現直後はリンクを無効化（400ms後に有効）
  let clickable = false;
  setTimeout(() => { clickable = true; }, 400);

  popup.addEventListener("click", e => {
    e.stopPropagation();
    if (!clickable) return;   // まだ出現中 → 遷移しない
    location.href = infoLinks[key];
  });

  activePopup = popup;
  activeQmark = qmark;
}

/* ===================== モバイル表示 ===================== */
function openMobileInfo(key) {
  if (!infoImage) return;

  infoImage.src = images[key];
  infoImage.style.transform = "scale(1.03)";

  setTimeout(() => {
    infoImage.style.transform = "scale(1)";
  }, 200);

  infoImage.onclick = () => {
    location.href = infoLinks[key];
  };
}

/* ===================== ポップアップ位置計算 =====================
   「？」の中心に合わせ、ほんの少し（30px）だけ上げる。
================================================================ */
function positionPopupAbove(target, popup, width, height) {
  const rect = target.getBoundingClientRect();
  const margin = 8;
  const RAISE = 15;   // 元の中央位置から少しだけ上へ

  let left = rect.left + rect.width / 2 - width / 2;
  let top = rect.top + rect.height / 2 - height / 2 - RAISE;

  // 左右クランプ（画面外防止）
  if (left < margin) left = margin;
  if (left + width > window.innerWidth - margin) {
    left = window.innerWidth - width - margin;
  }
  if (top < margin) top = margin;

  popup.style.left = left + "px";
  popup.style.top = top + "px";
}

/* ===================== ポップアップを閉じる ===================== */
function closePopup() {
  if (!activePopup) return;

  activePopup.remove();
  activeQmark.style.opacity = "1";

  activePopup = null;
  activeQmark = null;
}

/* ===================== 画面外クリック処理 ===================== */
document.addEventListener("click", e => {
  if (e.target.closest(".pc-info-img")) return;
  if (e.target.closest(".qmark")) return;

  closePopup();
});

/* =====================================================
   モバイル初期INFOボックス強制表示
===================================================== */
function forceMobileInfoBoxDefault() {
  if (window.innerWidth >= 1024 || !infoImage) return;

  infoImage.src = images.info1;
  infoImage.onclick = () => {
    location.href = infoLinks.info1;
  };
}

forceMobileInfoBoxDefault();
window.addEventListener("resize", forceMobileInfoBoxDefault);

/* =====================================================
   サイドメニュー制御
===================================================== */
Data.initSideMenu();

/* =====================================================
   ローディング＋スケジュール処理
===================================================== */
const loading = document.getElementById("loadingScreen");
const counter = document.getElementById("loadingCounter");
const enterBtn = document.getElementById("enterSite");
const goToMenuBtn = document.getElementById("goToMenuBtn");
const todayText = document.getElementById("todayCourseText");

/* =====================================================
   初期処理
===================================================== */
window.addEventListener("load", async () => {
  if (!sessionStorage.getItem("cocotteLoaded")) {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      counter.textContent = count;

      if (count >= 100) {
        clearInterval(interval);
        document.body.classList.add("hide-counter");
        setTimeout(() => document.body.classList.add("show-logo"), 300);
        setTimeout(() => document.body.classList.add("show-banner"), 1400);
        setTimeout(() => document.body.classList.add("hide-logo"), 1900);
        setTimeout(() => document.body.classList.add("show-box"), 2300);
      }
    }, 18);
  } else {
    // すでに訪問済み：ローディングをスムーズにフェードアウト
    loading.style.transition = "opacity 0.4s ease";
    loading.style.opacity = "0";
    setTimeout(() => {
      loading.style.display = "none";
      document.body.classList.add("loaded");
      setTimeout(showPcHint, 600);   // サイトに入ったらヒント表示
    }, 400);
  }

  /* 本日のコース取得（data.js 経由・エラー時は null） */
  const courseKey = await Data.getTodayCourse();

  if (courseKey) {
    todayText.innerHTML =
      `本日は<br><strong>${Data.COURSE_LABEL[courseKey]}</strong>を提供しています ☕🍰`;
    goToMenuBtn.classList.remove("disabled");
    goToMenuBtn.href = "menu.html";
  } else {
    todayText.innerHTML =
      `本日は営業日ではありません。<br>Cocotteの世界をぜひのぞいてみてください ✨`;
    goToMenuBtn.classList.add("disabled");
    goToMenuBtn.removeAttribute("href");
  }

  goToMenuBtn.addEventListener("click", e => {
    if (goToMenuBtn.classList.contains("disabled")) {
      e.preventDefault();
      alert("本日はメニューの販売はありません 🍃");
    }
  });
});

/* =====================================================
   ENTER SITE ボタン
===================================================== */
enterBtn?.addEventListener("click", e => {
  e.preventDefault();

  loading.style.opacity = "0";
  setTimeout(() => {
    loading.style.display = "none";
    document.body.classList.add("loaded");
    sessionStorage.setItem("cocotteLoaded", "true");
    setTimeout(showPcHint, 600);   // サイトに入ったらヒント表示
  }, 400);
});
