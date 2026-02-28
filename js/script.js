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

/* =====================================================
   クエスチョンマーククリック処理
===================================================== */
document.querySelectorAll(".qmark").forEach(qmark => {
  qmark.addEventListener("click", e => {
    e.stopPropagation();
    const key = qmark.dataset.info;
    if (!key) return;

    if (window.innerWidth >= 1024) {
      openPCPopup(qmark, key);
    } else {
      openMobileInfo(key);
    }
  });
});

/* ===================== PC表示 ===================== */
function openPCPopup(qmark, key) {
  // 既存ポップアップがあれば閉じる
  if (activePopup) {
    closePopup();
    return;
  }

  qmark.style.opacity = "0";

  const popup = document.createElement("img");
  popup.src = infoPC[key];
  popup.className = "pc-info-img show";

  // ⚠️ 画面ズレ防止のため fixed を使用
  popup.style.position = "fixed";
  popup.style.width = "220px";
  popup.style.height = "220px";

  document.body.appendChild(popup);

  positionPopupCenter(qmark, popup, 220, 220);

  popup.addEventListener("click", e => {
    e.stopPropagation();
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

/* ===================== ポップアップ位置計算 ===================== */
function positionPopupCenter(target, popup, width, height) {
  const rect = target.getBoundingClientRect();

  popup.style.left =
    rect.left + rect.width / 2 - width / 2 + "px";
  popup.style.top =
    rect.top + rect.height / 2 - height / 2 + "px";
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

/* =====================================================
   ローディング＋スケジュール処理
===================================================== */
const loading = document.getElementById("loadingScreen");
const counter = document.getElementById("loadingCounter");
const enterBtn = document.getElementById("enterSite");
const goToMenuBtn = document.getElementById("goToMenuBtn");
const todayText = document.getElementById("todayCourseText");

const SCHEDULE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRb5_X0F7mLgGuVyCRd73aJ0O6dSM7uEBaIfVpf_fWkRpxauvefW2NCfoqeZ-mz3Z3oXDCFkRi-iCI_/pub?gid=364695542&single=true&output=csv";

const COURSE_LABEL = {
  patisserie: "パティシエコース",
  barista: "カフェ＆バリスタコース",
  bread: "ブーランジェコース",
  creator: "スイーツカフェクリエイターコース"
};

let scheduleCache = [];

/* ===================== CSV読み込み ===================== */
async function loadScheduleCSV() {
  if (scheduleCache.length) return scheduleCache;

  const res = await fetch(SCHEDULE_CSV_URL);
  const text = await res.text();
  const lines = text.trim().split("\n");
  lines.shift();

  scheduleCache = lines.map(line => {
    const cells = line.split(",");
    const day = Number(cells[0]);
    const months = {};

    for (let m = 1; m <= 12; m++) {
      months[m] = (cells[m] || "").trim().toLowerCase();
    }
    return { day, months };
  });

  return scheduleCache;
}

/* ===================== 本日のコース取得 ===================== */
async function getTodayCourse() {
  const data = await loadScheduleCSV();
  const now = new Date();
  const row = data.find(r => r.day === now.getDate());
  if (!row) return null;

  const course = row.months[now.getMonth() + 1];
  if (!course || course === "off" || course === "skip") return null;
  return course;
}

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
    loading.style.display = "none";
    document.body.classList.add("loaded");
  }

  const courseKey = await getTodayCourse();

  if (courseKey) {
    todayText.innerHTML =
      `本日は<br><strong>${COURSE_LABEL[courseKey]}</strong>を提供しています ☕🍰`;
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
  }, 400);
});
