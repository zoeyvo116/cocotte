/* =====================================================
   設定（CONFIG）
===================================================== */

// 🔧 CSVデータURL（1シートのみ）
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRb5_X0F7mLgGuVyCRd73aJ0O6dSM7uEBaIfVpf_fWkRpxauvefW2NCfoqeZ-mz3Z3oXDCFkRi-iCI_/pub?gid=364695542&single=true&output=csv";

/* =====================================================
   DOM取得
===================================================== */
const gridEl  = document.querySelector(".calendar-grid");
const monthEl = document.getElementById("current-month");
const nextBtn = document.querySelector(".calendar-arrow.next");
const prevBtn = document.querySelector(".calendar-arrow.prev");
const yearEl  = document.getElementById("current-year");

/* =====================================================
   状態管理（STATE）
===================================================== */
let currentMonth = new Date().getMonth() + 1; // 1〜12
let currentYear  = new Date().getFullYear();

let monthData = [];
let rawData   = [];

const scheduleData = {};

/* =====================================================
   CSV読み込み（初回のみ）
===================================================== */
async function loadCSV() {
  if (rawData.length) return;

  const res  = await fetch(CSV_URL);
  const text = await res.text();

  const lines = text.trim().split("\n");
  lines.shift(); // ヘッダー行を除外

  rawData = lines.map(line => {
    const cells = line.split(",");
    const day   = Number(cells[0]);

    const months = {};
    for (let m = 1; m <= 12; m++) {
      months[m] = (cells[m] || "").trim().toLowerCase();
    }

    return { day, months };
  });

  buildScheduleData();
}

/* =====================================================
   scheduleData構築（保存・再利用用）
===================================================== */
function buildScheduleData() {
  rawData.forEach(({ day, months }) => {
    Object.entries(months).forEach(([month, course]) => {
      if (!course || course === "off" || course === "skip") return;

      scheduleData[course] ??= {};
      scheduleData[course][month] ??= [];
      scheduleData[course][month].push(day);
    });
  });

  localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
}

/* =====================================================
   指定月のデータ取得
===================================================== */
function getMonthData(month) {
  return rawData.map(row => ({
    course: row.months[month] || "",
    day: row.day
  }));
}

/* =====================================================
   カレンダー描画
===================================================== */
function renderCalendar(year, month) {
  gridEl.innerHTML = "";

  if (monthEl) monthEl.textContent = month;
  if (yearEl)  yearEl.textContent  = year;

  monthData = getMonthData(month);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay    = new Date(year, month - 1, 1).getDay(); // 0〜6
  const startIndex  = (firstDay + 6) % 7; // 月曜始まり

  for (let i = 0; i < startIndex; i++) {
    gridEl.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const num = document.createElement("span");
    num.className   = "day-number";
    num.textContent = day;

    cell.appendChild(num);

    const found = monthData.find(d => d.day === day);
    if (found?.course) {
      if (found.course === "off" || found.course === "skip") {
        cell.classList.add("is-off");
      } else {
        cell.classList.add("course-" + found.course);
      }
    }

    gridEl.appendChild(cell);
  }
}

/* =====================================================
   矢印横の月表示更新（HTMLは変更しない）
===================================================== */
function updateArrowMonthLabel() {
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const prevMonth = currentMonth === 1  ? 12 : currentMonth - 1;

  nextBtn?.setAttribute("data-month", nextMonth + "月");
  prevBtn?.setAttribute("data-month", prevMonth + "月");
}

/* =====================================================
   メタ情報保存（他ページ用・任意）
===================================================== */
function saveCalendarMeta() {
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  localStorage.setItem(
    "calendarMeta",
    JSON.stringify({
      currentMonth,
      currentYear,
      nextMonth,
      updatedAt: Date.now()
    })
  );
}

/* =====================================================
   カレンダー更新（中核処理）
===================================================== */
async function updateCalendar() {
  await loadCSV();
  renderCalendar(currentYear, currentMonth);
  saveCalendarMeta();
  updateArrowMonthLabel();
}

/* =====================================================
   月移動ナビゲーション
===================================================== */
prevBtn?.addEventListener("click", async () => {
  currentMonth--;
  if (currentMonth < 1) currentMonth = 12;
  await updateCalendar();
});

nextBtn?.addEventListener("click", async () => {
  currentMonth++;
  if (currentMonth > 12) currentMonth = 1;
  await updateCalendar();
});

/* =====================================================
   初期化
===================================================== */
updateCalendar();

/* =====================================================
   サイドメニュー制御
===================================================== */
const closeMenu = document.getElementById("closeMenu");
const menuBtn   = document.querySelector(".hero-menu");
const sideMenu  = document.getElementById("sideMenu");

menuBtn?.addEventListener("click", e => {
  e.stopPropagation();
  sideMenu.classList.add("active");
});

closeMenu?.addEventListener("click", e => {
  e.stopPropagation();
  sideMenu.classList.remove("active");
});