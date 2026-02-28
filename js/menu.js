/* =========================
   コース定義（マスター）
========================= */
const courses = [
  {
    id: "patisserie",
    title: "パティシエ",
    desc: [
      "洋菓子の基礎に加え、装飾技術を学び、表現力を養います。",
      "オリジナルレシピの考案を通じて、創造力を身につけます。",
      "コンテスト出場を目指す特別ゼミも用意されています。",
      "ラッピングやフードコーディネートも学びます。"
    ]
  },
  {
    id: "bread",
    title: "ブーランジェ<br>製パン",
    desc: [
      "計量から焼成までの基本工程を学びます。",
      "トレンドパンまで幅広く習得します。",
      "粉や酵母の違いを深く学びます。",
      "店舗プロデュースも学びます。"
    ]
  },
  {
    id: "barista",
    title: "カフェ＆バリスタ",
    desc: [
      "ドリンク全般を学びます。",
      "ラテアート技術を磨きます。",
      "空間演出を学びます。",
      "接客力を身につけます。"
    ]
  },
  {
    id: "creator",
    title: "スイーツカフェ<br>クリエイター",
    desc: [
      "経営・会計の基礎を学びます。",
      "SNS発信力を高めます。",
      "インターンで実践経験を積みます。",
      "ショップづくりを学びます。"
    ]
  }
];

/* =========================
   Google Sheets 設定
========================= */
const SHEET_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFAhm6KntoMEtcZH7EiY-XwPTk3W5Cvlz-wL2hMGG9Pmb12etBAJuMTNa_jgrB7TuJ7box78Of97dT/pub";

const SHEETS = {
  patisserie: 0,
  bread: 1373192932,
  barista: 1737519002,
  creator: 277823553
};

/* =========================
   状態管理（STATE）
========================= */
const ITEMS_PER_PAGE = 6;

let currentCourseIndex = 0;
let currentMenuItems = [];
let currentMenuIndex = 0;
let currentPage = 0;

const COURSE_MAP = {
  patisserie: 0,
  bread: 1,
  barista: 2,
  creator: 3
};
/* =========================
   初期化処理
========================= */
document.addEventListener("DOMContentLoaded", () => {
  bindCourseArrows();
  bindMenuCircleArrows();
  bindHeaderCourses();
  bindGrids();
  bindCoursePanelLinks();
  renderCourse(0);
});

/* =========================
   CSV パーサー
========================= */
function parseCSV(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuote = false;

  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    const n = csv[i + 1];

    if (c === '"' && insideQuote && n === '"') {
      value += '"';
      i++;
    } else if (c === '"') {
      insideQuote = !insideQuote;
    } else if (c === "," && !insideQuote) {
      row.push(value);
      value = "";
    } else if (c === "\n" && !insideQuote) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += c;
    }
  }

  row.push(value);
  rows.push(row);
  return rows;
}

/* =========================
   コース描画
========================= */
function renderCourse(index) {
  currentCourseIndex = index;
  currentMenuIndex = 0;
  currentPage = 0;

  const course = courses[index];

  document.getElementById("courseTitle").innerHTML =
    `<span>${course.title}</span>`;

  const descWrap = document.getElementById("courseDesc");
  descWrap.innerHTML = "";

  course.desc.forEach(text => {
    const div = document.createElement("div");
    div.className = "desc-box";
    div.textContent = text;
    descWrap.appendChild(div);
  });

  loadMenuByCourse(course.id);
}

/* =========================
   メニュー読み込み（CSV）
========================= */
async function loadMenuByCourse(courseId) {
  const gid = SHEETS[courseId];
  if (gid === undefined) return;

  const url = `${SHEET_BASE}?gid=${gid}&single=true&output=csv`;
  const res = await fetch(url);
  const csv = await res.text();
  const rows = parseCSV(csv).slice(1);

  currentMenuItems = rows
    .map(cols => ({
      image: cols[1]?.trim(),
      name: cols[0]?.trim(),
      price: cols[2]?.trim(),
      tags: cols[3]?.trim()
    }))
    .filter(i => i.name && i.image);

  if (!currentMenuItems.length) return;

  renderMenuItem(currentMenuItems[0], 0);
  renderMenuList();
}

/* =========================
   メイン表示（円形メニュー）
========================= */
function renderMenuItem(item, index, scroll = false) {
  currentMenuIndex = index;

  document.getElementById("menuName").textContent = item.name;
  document.getElementById("menuImage").style.backgroundImage =
    `url('${item.image}')`;

  /* 価格画像 */
  const priceImg = document.getElementById("menuPrice");
  const price = item.price?.trim();

  if (price && /\.(png|jpg|jpeg|svg|webp)$/i.test(price)) {
    priceImg.src = price;
    priceImg.style.display = "block";
  } else {
    priceImg.removeAttribute("src");
    priceImg.style.display = "none";
  }

  /* タグ */
  const tagWrap = document.getElementById("menuTag");
  tagWrap.innerHTML = "";

  if (item.tags) {
    item.tags
      .split(/[,\n、]/)
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(tag => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        tagWrap.appendChild(span);
      });
  }

  if (scroll) {
    document
      .querySelector(".menu-visual")
      .scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* =========================
   メニュー一覧（ページング）
========================= */
function renderMenuList() {
  const list = document.getElementById("menuList");
  list.innerHTML = "";

  const start = currentPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = currentMenuItems.slice(start, end);

  pageItems.forEach(item => {
    const realIndex = currentMenuItems.indexOf(item);

    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <div class="thumb" style="background-image:url('${item.image}')"></div>
      <p>${item.name}</p>
    `;

    div.onclick = () => renderMenuItem(item, realIndex, true);
    list.appendChild(div);
  });

  renderPagination();
}

/* =========================
   ページネーション
========================= */
function renderPagination() {
  let pager = document.getElementById("menuPager");
  if (!pager) {
    pager = document.createElement("div");
    pager.id = "menuPager";
    pager.className = "menu-pager";
    document.querySelector(".menu-right").appendChild(pager);
  }

  const totalPages = Math.ceil(currentMenuItems.length / ITEMS_PER_PAGE);

  pager.innerHTML = `
    <button class="pager-btn prev" ${currentPage === 0 ? "disabled" : ""}>◀</button>
    <span class="pager-info">${currentPage + 1} / ${totalPages}</span>
    <button class="pager-btn next" ${currentPage === totalPages - 1 ? "disabled" : ""}>▶</button>
  `;

  pager.querySelector(".prev").onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      renderMenuList();
    }
  };

  pager.querySelector(".next").onclick = () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderMenuList();
    }
  };
}

/* =========================
   メニュー円ナビゲーション
========================= */
function bindMenuCircleArrows() {
  const prev = document.querySelector(".menu-nav.prev");
  const next = document.querySelector(".menu-nav.next");

  if (!prev || !next) return;

  prev.onclick = () => {
    if (!currentMenuItems.length) return;
    currentMenuIndex =
      (currentMenuIndex - 1 + currentMenuItems.length) %
      currentMenuItems.length;
    renderMenuItem(currentMenuItems[currentMenuIndex], currentMenuIndex);
  };

  next.onclick = () => {
    if (!currentMenuItems.length) return;
    currentMenuIndex =
      (currentMenuIndex + 1) % currentMenuItems.length;
    renderMenuItem(currentMenuItems[currentMenuIndex], currentMenuIndex);
  };
}

/* =========================
   コース切り替え矢印
========================= */
function bindCourseArrows() {
  document.querySelector(".course-arrow.prev").onclick = () => {
    renderCourse(
      (currentCourseIndex - 1 + courses.length) % courses.length
    );
  };

  document.querySelector(".course-arrow.next").onclick = () => {
    renderCourse(
      (currentCourseIndex + 1) % courses.length
    );
  };
}

/* =========================
   Qマーククリック
========================= */
function bindGrids() {
  const map = {
    "q-grid1": 0,
    "q-grid2": 1,
    "q-grid3": 2,
    "q-grid4": 3
  };

  Object.entries(map).forEach(([cls, idx]) => {
    const el = document.querySelector(`.${cls}`);
    if (!el) return;

    el.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      scrollToCourseSwitchOnly();

      setTimeout(() => {
        renderCourse(idx);
        const target = document.getElementById("courseSwitch");
        if (target) {
          target.classList.add("focus");
          setTimeout(() => target.classList.remove("focus"), 700);
        }
      }, 250);
    });
  });
}

/* =========================
   ヘッダーコースリンク
========================= */
function bindHeaderCourses() {
  document.querySelectorAll(".header-course").forEach(el => {
    el.onclick = () => {
      const idx = Number(el.dataset.index);
      if (!Number.isNaN(idx)) renderCourse(idx);
    };
  });
}

/* =========================
   下部コースパネル
========================= */
function bindCoursePanelLinks() {
  document.querySelectorAll(".course-card").forEach(card => {
    card.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      const idx = Number(card.dataset.index);
      if (Number.isNaN(idx)) return;

      renderCourse(idx);
      setTimeout(scrollToCourseSwitch, 60);
    });
  });
}

/* =========================
   スクロール制御
========================= */
function scrollToCourseSwitch() {
  requestAnimationFrame(() => {
    const target = document.getElementById("courseSwitch");
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    target.classList.add("focus");
    setTimeout(() => target.classList.remove("focus"), 700);
  });
}

function scrollToCourseSwitchOnly() {
  const target = document.getElementById("courseSwitch");
  if (!target) return;

  const y =
    target.getBoundingClientRect().top +
    window.pageYOffset -
    100;

  window.scrollTo({
    top: y,
    behavior: "smooth"
  });
}

/* =========================
   サイドメニュー制御
========================= */
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

/* =========================
   外部ページからの遷移（URLハッシュ対応）
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const hash = location.hash.replace("#", "");

  if (hash && COURSE_MAP[hash] !== undefined) {
    const index = COURSE_MAP[hash];
    renderCourse(index);

    // コース切り替え位置までスクロール
    setTimeout(() => {
      scrollToCourseSwitch();
    }, 100);
  } else {
    // 初期表示
    renderCourse(0);
  }
});


document.querySelectorAll(".course-title").forEach(btn => {
  btn.addEventListener("click", () => {
    const index = Number(btn.dataset.index);
    switchCourse(index);
  });
});
