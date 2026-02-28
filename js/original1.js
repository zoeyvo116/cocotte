document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // KHÓA SCROLL BAN ĐẦU
  // ===============================
  document.body.classList.add("no-scroll");

  // ===============================
  // LƯU CÂU TRẢ LỜI
  // ===============================
  const answers = {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    foodSet: null
  };

  // ===============================
  // Q2 → FOOD SET
  // ===============================
  function decideFoodSetFromQ2(value) {
    return { a: 1, b: 2, c: 3, d: 4, e: 5 }[value];
  }

  // ===============================
  // HIỆN STEP
  // ===============================
  function showStep(stepName) {
    const step = document.querySelector(
      `.anketo-step[data-question="${stepName}"]`
    );
    if (!step) return;

    step.classList.add("shown", "active");

    step.scrollIntoView({
      behavior: "smooth",
      block: "end"   // 👈 luôn sát mép dưới
    });
  }




  // ===============================
  // STEP STATE
  // ===============================
  function disableStep(step) {
    step.classList.remove("active");
    step.classList.add("disabled");
  }

  function hideStep(step) {
    step.classList.remove("active", "shown");
    step.classList.add("done"); // display:none → anketo co lại
  }


  // ===============================
  // CLICK ANSWER
  // ===============================
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.addEventListener("click", () => {

      const step  = btn.closest(".anketo-step");
      const qKey  = step.dataset.question;
      const value = btn.dataset.value;

      // ===============================
      // LƯU ĐÁP ÁN
      // ===============================
      if (qKey === "q1") answers.q1 = value;

      if (qKey === "q2-a") {
        answers.q2 = value;
        answers.foodSet = decideFoodSetFromQ2(value);
      }

      if (qKey.startsWith("q3")) answers.q3 = value;
      if (qKey.startsWith("q4")) answers.q4 = value;

      // ===============================
      // FLOW
      // ===============================

      // Q1 → Q2
      if (qKey === "q1") {
        disableStep(step);
        showStep("q2-a");
        return;
      }

      // Q2 → Q3
      if (qKey === "q2-a") {
        disableStep(step);
        showStep(`q3-food-${answers.foodSet}`);
        return;
      }

      // FOOD SET 1,2: Q3 → Q4
      if (
        (answers.foodSet === 1 || answers.foodSet === 2) &&
        qKey.startsWith("q3")
      ) {
        hideStep(step); // ✅ Q3 BIẾN MẤT
        showStep(`q4-food-${answers.foodSet}`);
        return;
      }

      // FOOD SET 1,2: Q4 → RESULT
      if (
        (answers.foodSet === 1 || answers.foodSet === 2) &&
        qKey.startsWith("q4")
      ) {
        // ❗ KHÔNG BIẾN MẤT – CHỈ XÁM
        disableStep(step);

        document.body.classList.remove("no-scroll");
        showResultFoodSet1(answers.q1, answers.q2);
        return;
      }

      // FOOD SET 3,4,5: Q3 → RESULT
      if (
        answers.foodSet >= 3 &&
        qKey.startsWith("q3")
      ) {
        disableStep(step);

        document.body.classList.remove("no-scroll");
        // sau này gắn result set 3/4/5 ở đây
        return;
      }
    });
  });

  // ===============================
  // START BUTTON
  // ===============================
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      showStep("q1");
      startBtn.style.display = "none";
    });
  }
});


/* =================================================
   FOOD SET 1 – DATA
================================================= */
const FOOD_SET_1 = {
  "a-a": [{ name: "チョコクッキーシュー", img: "img/menu/choco_cookie_shu.png" }],
  "a-b": [{ name: "クッキーシュー", img: "img/menu/cookie_shu.png" }],
  "a-c": [{ name: "ガトーショコラ", img: "img/menu/gateau_choco.png" }],

  "b-a": [
    { name: "カッサータ", img: "img/menu/cassata.png" },
    { name: "カヌレ", img: "img/menu/canele.png" }
  ],

  "b-b": [
    { name: "紅茶レモンのシフォンケーキ", img: "img/menu/tea_lemon_chiffon.png" },
    { name: "レモンクリームと紅茶のシフォンケーキ", img: "img/menu/lemon_tea_chiffon.png" }
  ],

  "b-c": [{ name: "紅茶レモンのシフォンケーキ", img: "img/menu/tea_lemon_chiffon.png" }],

  "c-a": [
    { name: "クッキーシュー", img: "img/menu/cookie_shu.png" },
    { name: "シュークリーム", img: "img/menu/cream_puff.png" },
    { name: "チーズケーキ", img: "img/menu/cheese_cake.png" }
  ],

  "c-b": [{ name: "ピスタチオフィナンシェ", img: "img/menu/pistachio_financier.png" }],
  "c-c": [{ name: "チーズケーキ", img: "img/menu/cheese_cake.png" }],

  "d-a": [{ name: "クッキーシュー", img: "img/menu/cookie_shu.png" }],

  "d-b": [
    { name: "塩キャラメルパウンドケーキ", img: "img/menu/salt_caramel_pound.png" },
    { name: "バナナキャラメルパウンドケーキ", img: "img/menu/banana_caramel_pound.png" },
    { name: "キャラメルバナナパウンドケーキ", img: "img/menu/caramel_banana_pound.png" }
  ],

  "d-c": [{ name: "キャラメルバナナパウンドケーキ", img: "img/menu/caramel_banana_pound.png" }]
};


/* =================================================
   RESULT LOGIC
================================================= */
let susumeList = [];
let susumeIndex = 0;



function showResultFoodSet1(q1, q2) {
  const key = `${q1}-${q2}`;
  susumeList = FOOD_SET_1[key] || [];
  susumeIndex = 0;

  if (!susumeList.length) return;

  renderSusume();

  const result = document.querySelector(".result");

  // 🔥 LẤY STEP CUỐI CÙNG ĐƯỢC ACTIVE / DISABLED
  const lastStep =
    document.querySelector(".anketo-step.active") ||
    document.querySelector(".anketo-step.disabled");

  result.classList.add("show");

  requestAnimationFrame(() => {
    if (!lastStep) return;

    const rect = lastStep.getBoundingClientRect();

    const scrollTarget =
      window.scrollY + rect.bottom + 8; // dính sát, không hở

    window.scrollTo({
      top: scrollTarget,
      behavior: "smooth"
    });
  });
}

function renderSusume() {
  const item = susumeList[susumeIndex];
  if (!item) return;

  document.getElementById("susumeImg").src = item.img;
  document.querySelector(".result-name").textContent = item.name;

  const showArrow = susumeList.length > 1;
  document.querySelector(".susume-arrow.prev").style.display = showArrow ? "block" : "none";
  document.querySelector(".susume-arrow.next").style.display = showArrow ? "block" : "none";
}

/* arrows */
document.querySelector(".susume-arrow.prev").onclick = () => {
  susumeIndex = (susumeIndex - 1 + susumeList.length) % susumeList.length;
  renderSusume();
};

document.querySelector(".susume-arrow.next").onclick = () => {
  susumeIndex = (susumeIndex + 1) % susumeList.length;
  renderSusume();
};

/* retry */
document.querySelector(".result-btn.retry").onclick = () => {
  location.reload();
};
document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // KHÓA SCROLL BAN ĐẦU
  // ===============================
  document.body.classList.add("no-scroll");

  // ===============================
  // LƯU CÂU TRẢ LỜI
  // ===============================
  const answers = {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    foodSet: null
  };

  // ===============================
  // Q2 → FOOD SET
  // ===============================
  function decideFoodSetFromQ2(value) {
    return { a: 1, b: 2, c: 3, d: 4, e: 5 }[value];
  }

  // ===============================
  // HIỆN STEP
  // ===============================
  function showStep(stepName) {
    const step = document.querySelector(
      `.anketo-step[data-question="${stepName}"]`
    );
    if (!step) return;

    step.classList.add("shown", "active");

    step.scrollIntoView({
      behavior: "smooth",
      block: "end"   // 👈 luôn sát mép dưới
    });
  }




  // ===============================
  // STEP STATE
  // ===============================
  function disableStep(step) {
    step.classList.remove("active");
    step.classList.add("disabled");
  }

  function hideStep(step) {
    step.classList.remove("active", "shown");
    step.classList.add("done"); // display:none → anketo co lại
  }


  // ===============================
  // CLICK ANSWER
  // ===============================
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.addEventListener("click", () => {

      const step  = btn.closest(".anketo-step");
      const qKey  = step.dataset.question;
      const value = btn.dataset.value;

      // ===============================
      // LƯU ĐÁP ÁN
      // ===============================
      if (qKey === "q1") answers.q1 = value;

      if (qKey === "q2-a") {
        answers.q2 = value;
        answers.foodSet = decideFoodSetFromQ2(value);
      }

      if (qKey.startsWith("q3")) answers.q3 = value;
      if (qKey.startsWith("q4")) answers.q4 = value;

      // ===============================
      // FLOW
      // ===============================

      // Q1 → Q2
      if (qKey === "q1") {
        disableStep(step);
        showStep("q2-a");
        return;
      }

      // Q2 → Q3
      if (qKey === "q2-a") {
        disableStep(step);
        showStep(`q3-food-${answers.foodSet}`);
        return;
      }

      // FOOD SET 1,2: Q3 → Q4
      if (
        (answers.foodSet === 1 || answers.foodSet === 2) &&
        qKey.startsWith("q3")
      ) {
        hideStep(step); // ✅ Q3 BIẾN MẤT
        showStep(`q4-food-${answers.foodSet}`);
        return;
      }

      // FOOD SET 1,2: Q4 → RESULT
      if (
        (answers.foodSet === 1 || answers.foodSet === 2) &&
        qKey.startsWith("q4")
      ) {
        // ❗ KHÔNG BIẾN MẤT – CHỈ XÁM
        disableStep(step);

        document.body.classList.remove("no-scroll");
        showResultFoodSet1(answers.q1, answers.q2);
        return;
      }

      // FOOD SET 3,4,5: Q3 → RESULT
      if (
        answers.foodSet >= 3 &&
        qKey.startsWith("q3")
      ) {
        disableStep(step);

        document.body.classList.remove("no-scroll");
        // sau này gắn result set 3/4/5 ở đây
        return;
      }
    });
  });

  // ===============================
  // START BUTTON
  // ===============================
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      showStep("q1");
      startBtn.style.display = "none";
    });
  }
});


/* =================================================
   FOOD SET 1 – DATA
================================================= */
const FOOD_SET_1 = {
  "a-a": [{ name: "チョコクッキーシュー", img: "img/menu/choco_cookie_shu.png" }],
  "a-b": [{ name: "クッキーシュー", img: "img/menu/cookie_shu.png" }],
  "a-c": [{ name: "ガトーショコラ", img: "img/menu/gateau_choco.png" }],

  "b-a": [
    { name: "カッサータ", img: "img/menu/cassata.png" },
    { name: "カヌレ", img: "img/menu/canele.png" }
  ],

  "b-b": [
    { name: "紅茶レモンのシフォンケーキ", img: "img/menu/tea_lemon_chiffon.png" },
    { name: "レモンクリームと紅茶のシフォンケーキ", img: "img/menu/lemon_tea_chiffon.png" }
  ],

  "b-c": [{ name: "紅茶レモンのシフォンケーキ", img: "img/menu/tea_lemon_chiffon.png" }],

  "c-a": [
    { name: "クッキーシュー", img: "img/menu/cookie_shu.png" },
    { name: "シュークリーム", img: "img/menu/cream_puff.png" },
    { name: "チーズケーキ", img: "img/menu/cheese_cake.png" }
  ],

  "c-b": [{ name: "ピスタチオフィナンシェ", img: "img/menu/pistachio_financier.png" }],
  "c-c": [{ name: "チーズケーキ", img: "img/menu/cheese_cake.png" }],

  "d-a": [{ name: "クッキーシュー", img: "img/menu/cookie_shu.png" }],

  "d-b": [
    { name: "塩キャラメルパウンドケーキ", img: "img/menu/salt_caramel_pound.png" },
    { name: "バナナキャラメルパウンドケーキ", img: "img/menu/banana_caramel_pound.png" },
    { name: "キャラメルバナナパウンドケーキ", img: "img/menu/caramel_banana_pound.png" }
  ],

  "d-c": [{ name: "キャラメルバナナパウンドケーキ", img: "img/menu/caramel_banana_pound.png" }]
};


/* =================================================
   RESULT LOGIC
================================================= */
let susumeList = [];
let susumeIndex = 0;



function showResultFoodSet1(q1, q2) {
  const key = `${q1}-${q2}`;
  susumeList = FOOD_SET_1[key] || [];
  susumeIndex = 0;

  if (!susumeList.length) return;

  renderSusume();

  const result = document.querySelector(".result");

  // 🔥 LẤY STEP CUỐI CÙNG ĐƯỢC ACTIVE / DISABLED
  const lastStep =
    document.querySelector(".anketo-step.active") ||
    document.querySelector(".anketo-step.disabled");

  result.classList.add("show");

  requestAnimationFrame(() => {
    if (!lastStep) return;

    const rect = lastStep.getBoundingClientRect();

    const scrollTarget =
      window.scrollY + rect.bottom + 8; // dính sát, không hở

    window.scrollTo({
      top: scrollTarget,
      behavior: "smooth"
    });
  });
}

function renderSusume() {
  const item = susumeList[susumeIndex];
  if (!item) return;

  document.getElementById("susumeImg").src = item.img;
  document.querySelector(".result-name").textContent = item.name;

  const showArrow = susumeList.length > 1;
  document.querySelector(".susume-arrow.prev").style.display = showArrow ? "block" : "none";
  document.querySelector(".susume-arrow.next").style.display = showArrow ? "block" : "none";
}

/* arrows */
document.querySelector(".susume-arrow.prev").onclick = () => {
  susumeIndex = (susumeIndex - 1 + susumeList.length) % susumeList.length;
  renderSusume();
};

document.querySelector(".susume-arrow.next").onclick = () => {
  susumeIndex = (susumeIndex + 1) % susumeList.length;
  renderSusume();
};

/* retry */
document.querySelector(".result-btn.retry").onclick = () => {
  location.reload();
};
