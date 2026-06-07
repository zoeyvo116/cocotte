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

/* =====================================================
   CSV読み込み（初回のみ・data.js 経由）
===================================================== */
async function loadCSV() {
  if (rawData.length) return;
  try {
    rawData = await Data.loadSchedule();
  } catch (err) {
    console.error("[schedule] CSV読み込みエラー:", err);
    rawData = [];
  }
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
Data.initSideMenu();