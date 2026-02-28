let popupPosition = null;

/* =====================================================
   設定（CONFIG）
===================================================== */
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRb5_X0F7mLgGuVyCRd73aJ0O6dSM7uEBaIfVpf_fWkRpxauvefW2NCfoqeZ-mz3Z3oXDCFkRi-iCI_/pub?output=csv";

const COURSE_INFO = {
  patisserie: {
    title: "パティシエコース",
    box1: "様々なスイーツの作製により基礎技術を徹底的に",
    box2: "楽しみ、クオリティの高い製品を作る力を身につけます"
  },
  barista: {
    title: "カフェ＆バリスタコース",
    box1: "コーヒーとドリンクの知識・技術を基礎から学び",
    box2: "接客力と実践力を身につけます"
  },
  bread: {
    title: "ブーランジェ パンコース",
    box1: "パン作りの基礎から応用までを学び",
    box2: "製造技術と商品理解を深めます"
  },
  creator: {
    title: "スイーツカフェ\nクリエイターコース",
    box1: "企画・発信・表現を通して",
    box2: "スイーツの魅力を伝える力を育てます"
  }
};

let currentCourse = "patisserie";

/* =====================================================
   DOM取得
===================================================== */
const titleEl = document.querySelector(".top-title");
const box1El = document.querySelector(".top-box1");
const box2El = document.querySelector(".top-box2");
const rows = document.querySelectorAll(".hanbai-row");
const courseBtns = document.querySelectorAll(".course-item");

const infoImage = document.getElementById("infoImage");
const menuBtn = document.querySelector(".hero-menu");
const sideMenu = document.getElementById("sideMenu");
const closeMenu = document.getElementById("closeMenu");

/* =====================================================
   状態管理（STATE）
===================================================== */
let scheduleData = {};

/* =====================================================
   CSVデータ読み込み
===================================================== */
async function loadSchedule() {
  const cached = localStorage.getItem("scheduleData");
  if (cached) {
    scheduleData = JSON.parse(cached);
    return;
  }

  const res = await fetch(CSV_URL);
  const text = await res.text();
  const lines = text.trim().split("\n");
  lines.shift(); // ヘッダー行を除外

  scheduleData = {};

  lines.forEach(line => {
    const cells = line.split(",");
    const day = Number(cells[0]);

    for (let m = 1; m <= 12; m++) {
      const course = (cells[m] || "").trim().toLowerCase();
      if (!course || course === "off" || course === "skip") continue;

      if (!scheduleData[course]) scheduleData[course] = {};
      if (!scheduleData[course][m]) scheduleData[course][m] = [];
      scheduleData[course][m].push(day);
    }
  });

  localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
}

/* =====================================================
   コース情報表示
===================================================== */
function renderCourseInfo(course) {
  const info = COURSE_INFO[course];
  if (!info) return;

  titleEl.textContent = info.title;
  box1El.textContent = info.box1;
  box2El.textContent = info.box2;
}

/* =====================================================
   販売日表示
===================================================== */
function renderHanbai(course) {
  const today = new Date();
  const m1 = today.getMonth() + 1;
  const m2 = m1 === 12 ? 1 : m1 + 1;

  renderRow(rows[0], course, m1);
  renderRow(rows[1], course, m2);
}

function renderRow(rowEl, course, month) {
  const left = rowEl.querySelector(".month-label.left");
  const right = rowEl.querySelector(".month-label.right");
  const daysBox = rowEl.querySelector(".days");

  const days = scheduleData?.[course]?.[month] || [];
  if (!days.length) {
    rowEl.style.display = "none";
    return;
  }

  rowEl.style.display = "";
  left.textContent = `${month}月`;
  right.textContent = `${month}月`;
  daysBox.innerHTML = "";

  days.forEach(day => {
    const span = document.createElement("span");
    span.className = "day";
    span.textContent = day;
    span.onclick = () => {
      location.href = `schedule.html?course=${course}&month=${month}`;
    };
    daysBox.appendChild(span);
  });
}

/* =====================================================
   コース切り替え（PC・モバイル共通）
===================================================== */
function switchCourse(course) {
  currentCourse = course;
  renderCourseInfo(course);
  renderHanbai(course);

  window.scrollTo({ top: 0, behavior: "smooth" });

  infoImage.src = "img/phone/calendar-box.svg";
  infoImage.onclick = () => {
    location.href = "schedule.html";
  };
}

/* =====================================================
   モバイル用コースボタン初期化
===================================================== */
function initCourseButtons() {
  courseBtns.forEach(btn => {
    btn.onclick = () => {
      switchCourse(btn.dataset.course);
    };
  });
}

/* =====================================================
   PC用カーブメニュー制御
===================================================== */
function initPcCurveMenu() {
  const pcMenus = document.querySelectorAll(".curve-menu a[data-course]");
  pcMenus.forEach(item => {
    item.onclick = e => {
      e.preventDefault();
      switchCourse(item.dataset.course);
    };
  });
}

/* =====================================================
   ハンバーガーメニュー制御
===================================================== */
menuBtn.onclick = e => {
  e.stopPropagation();
  sideMenu.classList.add("active");
};

closeMenu.onclick = e => {
  e.stopPropagation();
  sideMenu.classList.remove("active");
};

document.addEventListener("click", () => {
  if (sideMenu.classList.contains("active")) {
    sideMenu.classList.remove("active");
  }
});

/* =====================================================
   初期化
===================================================== */
async function init() {
  await loadSchedule();
  initCourseButtons();   // モバイル
  initPcCurveMenu();     // PC
  switchCourse(currentCourse);
}

init();

/* =====================================================
   Qマーク（？）クリック時：メニューページへ遷移
===================================================== */
const qmarkGreen = document.querySelector(".qmark.q-green");

qmarkGreen?.addEventListener("click", () => {
  window.location.href = "menu.html";
});