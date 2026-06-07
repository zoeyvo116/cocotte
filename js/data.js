/* =====================================================
   data.js — centralized data layer for all pages
   Exposes a single global: window.Data
   - sessionStorage cache (one network fetch per tab per sheet)
   - Robust CSV parsing (handles commas AND newlines inside quotes)
   - Error handling with graceful fallback
   - Shared side-menu controller
===================================================== */
(function (global) {
  "use strict";

  const SHEETS = {
    schedule: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRb5_X0F7mLgGuVyCRd73aJ0O6dSM7uEBaIfVpf_fWkRpxauvefW2NCfoqeZ-mz3Z3oXDCFkRi-iCI_/pub?gid=364695542&single=true&output=csv",
    menuBase: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFAhm6KntoMEtcZH7EiY-XwPTk3W5Cvlz-wL2hMGG9Pmb12etBAJuMTNa_jgrB7TuJ7box78Of97dT/pub",
    news:     "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOiSsXspBCXRD7N0v1ZMirkdvIxonYW8pJL93do78x41V0Z2ru1jJY1-_0t_HTXFErWZzOlQSqk_BQ/pub?output=csv",
    story:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFAhm6KntoMEtcZH7EiY-XwPTk3W5Cvlz-wL2hMGG9Pmb12etBAJuMTNa_jgrB7TuJ7box78Of97dT/pub?output=csv",
  };

  const COURSE_LABEL = {
    patisserie: "パティシエコース",
    barista: "カフェ＆バリスタコース",
    bread: "ブーランジェコース",
    creator: "スイーツカフェクリエイターコース",
  };

  /* ---------------------------------------------------
     CSV parser — full state machine.
     Handles quoted fields containing commas and newlines.
     Returns: array of rows, each row an array of cells.
  --------------------------------------------------- */
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const n = text[i + 1];

      if (c === '"' && inQuotes && n === '"') {
        value += '"';
        i++;
      } else if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        row.push(value.trim());
        value = "";
      } else if ((c === "\n" || c === "\r") && !inQuotes) {
        // Handle CRLF: skip the \n after \r
        if (c === "\r" && n === "\n") i++;
        row.push(value.trim());
        rows.push(row);
        row = [];
        value = "";
      } else {
        value += c;
      }
    }

    // Flush last value/row if any content remains
    if (value.length || row.length) {
      row.push(value.trim());
      rows.push(row);
    }

    return rows;
  }

  /* ---------------------------------------------------
     Fetch CSV text with sessionStorage cache.
     Throws on network/parse error.
  --------------------------------------------------- */
  async function fetchCSV(key, url) {
    const cacheKey = "csv_" + key;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${key}`);
    const text = await res.text();
    if (text.trim().startsWith("<!")) {
      throw new Error(`Received HTML instead of CSV for ${key}`);
    }
    try {
      sessionStorage.setItem(cacheKey, text);
    } catch (_) {
      /* quota exceeded — ignore, just skip caching */
    }
    return text;
  }

  /* ---------------------------------------------------
     Schedule: returns [{ day:number, months:{1..12:string} }]
  --------------------------------------------------- */
  async function loadSchedule() {
    const text = await fetchCSV("schedule", SHEETS.schedule);
    const rows = parseCSV(text);
    rows.shift(); // header

    return rows
      .filter(cells => cells[0] !== "")
      .map(cells => {
        const day = Number(cells[0]);
        const months = {};
        for (let m = 1; m <= 12; m++) {
          months[m] = (cells[m] || "").toLowerCase();
        }
        return { day, months };
      });
  }

  /* ---------------------------------------------------
     Schedule indexed by course:
     { courseKey: { month: [day, day, ...] } }
  --------------------------------------------------- */
  async function loadScheduleByCourse() {
    const data = await loadSchedule();
    const byCourse = {};
    data.forEach(({ day, months }) => {
      for (let m = 1; m <= 12; m++) {
        const course = months[m];
        if (!course || course === "off" || course === "skip") continue;
        (byCourse[course] ??= {});
        (byCourse[course][m] ??= []);
        byCourse[course][m].push(day);
      }
    });
    return byCourse;
  }

  /* ---------------------------------------------------
     Today's course key, or null if off / not a business day.
  --------------------------------------------------- */
  async function getTodayCourse() {
    try {
      const data = await loadSchedule();
      const now = new Date();
      const row = data.find(r => r.day === now.getDate());
      if (!row) return null;
      const course = row.months[now.getMonth() + 1];
      if (!course || course === "off" || course === "skip") return null;
      return course;
    } catch (err) {
      console.error("[Data] getTodayCourse failed:", err);
      return null;
    }
  }

  /* ---------------------------------------------------
     Menu sheet (multi-tab). gid = Google sheet tab id.
     Returns rows (header removed).
  --------------------------------------------------- */
  async function loadMenuSheet(gid) {
    const url = `${SHEETS.menuBase}?gid=${gid}&single=true&output=csv`;
    const text = await fetchCSV("menu_" + gid, url);
    const rows = parseCSV(text);
    rows.shift();
    return rows;
  }

  /* ---------------------------------------------------
     News rows (header removed).
  --------------------------------------------------- */
  async function loadNews() {
    const text = await fetchCSV("news", SHEETS.news);
    const rows = parseCSV(text);
    rows.shift();
    return rows.filter(r => r.length > 1 && r[0] !== "");
  }

  /* ---------------------------------------------------
     Story sheet — returns the image column (B) as array.
  --------------------------------------------------- */
  async function loadStoryImages() {
    const text = await fetchCSV("story", SHEETS.story);
    const rows = parseCSV(text);
    rows.shift();
    return rows.map(cells => cells[1]).filter(Boolean);
  }

  /* ---------------------------------------------------
     Shared side-menu open/close controller.
     Wires .hero-menu (open), #closeMenu (close),
     and outside-click (close). Safe to call once per page.
  --------------------------------------------------- */
  function initSideMenu() {
    const menuBtn = document.querySelector(".hero-menu");
    const sideMenu = document.getElementById("sideMenu");
    const closeBtn = document.getElementById("closeMenu");
    if (!sideMenu) return;

    menuBtn?.addEventListener("click", e => {
      e.stopPropagation();
      sideMenu.classList.add("active");
    });

    closeBtn?.addEventListener("click", e => {
      e.stopPropagation();
      sideMenu.classList.remove("active");
    });
  }

  /* ---------------------------------------------------
     Public API
  --------------------------------------------------- */
  global.Data = {
    SHEETS,
    COURSE_LABEL,
    parseCSV,
    fetchCSV,
    loadSchedule,
    loadScheduleByCourse,
    getTodayCourse,
    loadMenuSheet,
    loadNews,
    loadStoryImages,
    initSideMenu,
  };
})(window);
