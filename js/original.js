document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     初期スクロールロック
  =============================== */
  document.body.classList.add("no-scroll");

  /* ===============================
     状態管理（回答保存）
  =============================== */
  const answers = {
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  foodSet: null,

  drinkQ2: null,
  drinkQ3: null
};


  /* ===============================
     Q2 → フードセット判定
  =============================== */
  function decideFoodSetFromQ2(value) {
    return { a: 1, b: 2, c: 3, d: 4, e: 5 }[value];
  }

  /* ===============================
     ステップ制御
  =============================== */
  function showStep(stepName) {
    const step = document.querySelector(
      `.anketo-step[data-question="${stepName}"]`
    );
    if (!step) return;

    step.classList.add("active");

    step.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }

  function disableStep(step) {
    step.classList.remove("active");
    step.classList.add("disabled");
  }

  function hideStep(step) {
    step.classList.remove("active");
    step.style.display = "none";
  }

  /* ===============================
     結果エリアへスクロール
  =============================== */
  function scrollToResult() {
    const result = document.querySelector(".result");
    if (!result) return;

    setTimeout(() => {
      result.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 200);
  }

  /* ===============================
     回答クリック処理
  =============================== */
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.addEventListener("click", () => {

      const step = btn.closest(".anketo-step");
      if (!step) return;

      const qKey = step.dataset.question;
      const value = btn.dataset.value || null;

      /* ===== LƯU ĐÁP ÁN ===== */
      if (qKey === "q1") answers.q1 = value;

      if (qKey === "q2-a") {
        answers.q2 = value;
        answers.foodSet = decideFoodSetFromQ2(value);
      }

      if (qKey.startsWith("q3-food")) answers.q3 = value;
      if (qKey.startsWith("q4")) answers.q4 = value;

      /* ===== フロー制御 ===== */

      /* Q1 → Q2（フード／ドリンク分岐） */
      if (qKey === "q1") {
        disableStep(step);

        if (value === "a") {
          showStep("q2-a");        // フード
        }

        if (value === "b") {
          showStep("q2-drink");   // ドリンク
        }
        return;
      }


      /* フード Q2 → Q3 */
      if (qKey === "q2-a") {
        disableStep(step);
        showStep(`q3-food-${answers.foodSet}`);
        return;
      }

      /* ドリンク Q2 → Q3 */
      if (qKey === "q2-drink") {
        answers.drinkQ2 = value;
        disableStep(step);
        showStep("q3-drink");
        return;
      }

      /* ドリンク Q3 → 結果 */
      if (qKey === "q3-drink") {
        answers.drinkQ3 = value;
        disableStep(step);
        document.body.classList.remove("no-scroll");

        showResultDrink(
          answers.drinkQ2,
          answers.drinkQ3
        );

        scrollToResult();
        return;
      }

      

      /* フードセット1：Q4 → 結果 */
      if (
        answers.foodSet === 1 &&
        qKey.startsWith("q4")
      ) {
        disableStep(step);
        document.body.classList.remove("no-scroll");

        showResultByFoodSet(
          1,
          `${answers.q3}-${answers.q4}`
        );

        scrollToResult();
        return;
      }


      /* フードセット1：Q3 → Q4 */
      if (
        answers.foodSet === 1 &&
        qKey.startsWith("q3")
      ) {
        hideStep(step);
        showStep("q4-food-1");
        return;
      }

       /* フードセット2：Q4 → 結果 */
      if (
        answers.foodSet === 2 &&
        qKey.startsWith("q4")
      ) {
        disableStep(step);
        document.body.classList.remove("no-scroll");

        showResultByFoodSet(
          2,
          `${answers.q3}-${answers.q4}`
        );
        scrollToResult();
        return;
      }

      /* フードセット2：Q3 → Q4 */
      if (
        answers.foodSet === 2 &&
        qKey.startsWith("q3")
      ) {
        hideStep(step);
        showStep("q4-food-2");
        return;
      }

      

      /* フードセット3・4・5：Q3 → 結果 */
      if (
        answers.foodSet >= 3 &&
        qKey.startsWith("q3-food")
      ) {
        disableStep(step);
        document.body.classList.remove("no-scroll");

        showResultByFoodSet(answers.foodSet, answers.q3);
        scrollToResult();
        return;
      }
    });
  });

  /* ===============================
     スタートボタン
  =============================== */
  const startBtn = document.getElementById("startBtn");
  startBtn?.addEventListener("click", () => {
    showStep("q1");
    startBtn.classList.add("disabled");
  });

  /* ===============================
     リトライ処理
  =============================== */
  document.querySelector(".result-btn.retry")?.addEventListener("click", () => {
    document.body.classList.add("no-scroll");

    Object.keys(answers).forEach(k => answers[k] = null);

    document.querySelectorAll(".anketo-step").forEach(step => {
      step.classList.remove("active", "disabled");
      step.style.display = "";
    });

    startBtn?.classList.remove("disabled");

    setTimeout(() => showStep("q1"), 150);
  });

});

/* =================================================
   フードセット1：データ定義
================================================= */
const FOOD_SET_1 = {
  "a-a": [{ name: "チョコクッキーシュー", img: "img/menu/patisserie/patisserie-chococookieshu.jpeg" }],
  "a-b": [{ name: "クッキーシュー", img: "img/menu/patisserie/patisserie-cookieshu.jpeg" }],
  "a-c": [{ name: "ガトーショコラ", img: "img/menu/patisserie/patisserie-gateauchocolate.png" }],

  "b-a": [
    { name: "カッサータ", img: "img/menu/patisserie/patisserie-cassatal.png" },
    { name: "カシスムース", img: "img/menu/patisserie/patisserie-kashisumuzu.jpeg" }
  ],

  "b-b": [
    { name: "紅茶レモンのシフォンケーキ", img: "img/menu/patisserie/patisserie-gateau.png" },
  ],

  "b-c": [
    { name: "紅茶レモンのシフォンケーキ", img: "img/menu/patisserie/patisserie-ealtealemon.png" },
  ],

  "c-a": [
    { name: "クッキーシュー", img: "img/menu/patisserie/patisserie-cookieshu.jpeg" },
    { name: "チーズケーキ", img: "img/menu/patisserie/patisserie-cheecake.png" }
  ],

  "c-b": [{ name: "ピスタチオフィナンシェ", img: "img/menu/patisserie/patisserie-pistachio.png" }],
  "c-c": [{ name: "チーズケーキ", img: "img/menu/patisserie/patisserie-cheecake.png" }],

  "d-a": [{ name: "クッキーシュー", img: "img/menu/patisserie/patisserie-cookieshu.jpeg" }],
  
  "d-b": [
    { name: "ピスタチオフィナンシェ", img: "img/menu/patisserie/patisserie-pistachio.png" },
    { name: " 塩キャラメルパウンドケーキ", img: "img/menu/patisserie/patisserie-saltedcaramelpoundcake.png" },
    { name: "バナナキャラメルパウンドケーキ", img: "img/menu/patisserie/patisserie-bananacaramelcake.png" },
    { name: "キャラメルバナナパウンドケーキ", img: "img/menu/patisserie/patisserie-caramelbananacrepe.png" }
  ],

  "d-c": [
    { name: "塩キャラメルパウンドケーキ", img: "img/menu/patisserie/patisserie-saltedcaramelpoundcake.png" },
    { name: "バナナキャラメルパウンドケーキ", img: "img/menu/patisserie/patisserie-bananacaramelcake.png" },
    { name: "キャラメルバナナパウンドケーキ", img: "img/menu/patisserie/patisserie-caramelbananacrepe.png" }
  ]
};

/* =================================================
   フードセット2：データ定義
================================================= */
const FOOD_SET_2 = {
  "a-a": [
    { name: "アサイーボウル", img: "img/menu/patisserie/patisserie-asaibowl.png" }
  ],

  "a-b": [
    { name: "マンゴーショート", img: "img/menu/patisserie/patisserie-mangoshot.png" },
    { name: "キウイのショートケーキ", img: "img/menu/patisserie/patisserie-kiwi.png" },
    { name: "オレンジのショートケーキ", img: "img/menu/patisserie/patisserie-orangecake.png" }
  ],

  "a-c": [
    { name: "バナナクレープ", img: "img/menu/barista/barista-bananacrepe.png" }
  ],

  "b-a": [
    { name: "アサイーボウル", img: "img/menu/patisserie/patisserie-asaibowl.png" }
  ],

  "b-b": [
    { name: "オレンジのショートケーキ", img: "img/menu/patisserie/patisserie-orangecake.png" },
    { name: "キウイのショートケーキ", img: "img/menu/patisserie/patisserie-kiwi.png" }
  ],

  "b-c": [
    { name: "バナナクレープ", img: "img/menu/barista/barista-bananacrepe.png" }
  ],

  "c-a": [
    { name: "パッションオレンジムース", img: "img/menu/patisserie/patisserie-passion.png" },
  ],

  "c-b": [
    { name: "ガトーカシス", img: "img/menu/patisserie/patisserie-gateau.png" }
  ],

  "c-c": [
    { name: "チョコミントクレープ", img: "img/menu/barista/barista-chocomint.png" }
  ],

  "d-a": [
    { name: "桃のレアチーズ", img: "img/menu/patisserie/patisserie-peachcheese.jpeg" }
  ],

  "d-b": [
    { name: "桃のレアチーズ", img: "img/menu/patisserie/patisserie-peachcheese.jpeg" }
  ],

  "d-c": [
    { name: "チョコミントクレープ", img: "img/menu/barista/barista-chocomint.png" }
  ]
};

/* =================================================
   フードセット3：データ定義
================================================= */
const FOOD_SET_3 = {
  "a": [
    {
      name: "抹茶のディアマンクッキー",
      img: "img/menu/bread/bread-matchadiamondcookie.jpeg"
    }
  ],

  "b": [
    {
      name: "抹茶スコーン",
      img: "img/menu/bread/bread-matchascone.png"
    }
  ],

  "c": [
    {
      name: "いちごのSCメロンパン",
      img: "img/menu/bread/bread-strawberryscmelonpan.png"
    }
  ]
};

/* =================================================
   フードセット4：データ定義
================================================= */
const FOOD_SET_4 = {
  "a": [
    { name: "栗ときび糖のパウンドケーキ", img: "img/menu/bread/bread-poundcake.png" },
    { name: "マドレーヌ", img: "img/menu/bread/bread-lemonmadeleine.png" },
    { name: "レモンマドレーヌ", img: "img/menu/bread/bread-lemonmadeleine.png" },
    { name: "レモンマフィン", img: "img/menu/bread/bread-lemonmuffin.png" }
  ],

  "b": [
    { name: "", img: "img/menu/bread/plain_bagel.png" },
    { name: "", img: "img/menu/bread/blueberry_bagel.png" }
  ],

  "c": [
    { name: "プレーンベーグル", img: "img/menu/bread/bread-plainbagel.png" },
    { name: "ブルーベリーベーグル", img: "img/menu/bread/bread-blueberrybagel.png" },
    { name: "オレンジあんぱん", img: "img/menu/bread/bread-orangeanpan.png" },
    { name: "マンゴークリームパン", img: "img/menu/bread/bread-mangocream.png" }
  ],

  "d": [
    { name: "ブリオッシュ・ポワール", img: "img/menu/bread/bread-pear.png" },
    { name: "白桃ブリオッシュ", img: "img/menu/bread/bread-whitepeach.png" },
    { name: "紅茶のスイートブール", img: "img/menu/bread/bread-earltea.png" },
    { name: "スイートブール", img: "img/menu/bread/bread-earltea.png" },
    { name: "シュガーバターロール", img: "img/menu/bread/bread-sugarbutter.png" }
  ],

  "e": [
    { name: "バトン", img: "img/menu/bread/bread-baton.png" },
    { name: "キャトルスティック", img: "img/menu/bread/bread-stick.png" }
  ]
};

/* =================================================
   フードセット5：データ定義
================================================= */
const FOOD_SET_5 = {
  "a": [
    { name: "真夏のHOTドッグ", img: "img/menu/meal/summer_hot_dog.png" },
    { name: "フォカッチャサンド", img: "img/menu/creator/creator-focacciasandwich.png" },
    { name: "パニーニサンド", img: "img/menu/creator/creator-paninisandwich.png" }
  ],
  "b": [
    { name: "冷製パスタ", img: "img/menu/creator/creator-coldpasta.png" }
  ],
  "c": [
    { name: "リゾットレモーネ", img: "img/menu/creator/creator-risottolimone.jpeg" },
    { name: "リゾットロッソ", img: "img/menu/creator/creator-risottonesso.png" },
    { name: "リゾットマーレ", img: "img/menu/creator/creator-risottomare.png" },
    { name: "リゾットネロ", img: "img/menu/creator/creator-risottonegro.png" }
  ],
  "d": [
    { name: "ラザニア", img: "img/menu/creator/creator-lasagna.png" },
    { name: "バターチキンカレー", img: "img/menu/creator/creator-butterchickencurry.jpeg" },
    { name: "レトルトカレー", img: "img/menu/creator/creator-torutoru.jpeg" }
  ],
  "e": [
    { name: "鶏もものソテー", img: "img/menu/creator/creator-chickenlegsaute.png" }
  ]
};

/* =================================================
   ドリンクセット：データ定義
================================================= */
const DRINK_SET = {
  "a-a": [
    { name: "レモネード", img: "img/menu/barista/barista-pinksaltlemonade.jpeg" },
    { name: "ピンクソルトレモネード", img: "img/menu/barista/barista-pinksaltlemonade.jpeg" },
    { name: "レモンスカッシュ", img: "img/menu/barista/barista-lemonsquash.jpeg" }
  ],

  "a-b": [
    { name: "レモネード", img: "img/menu/barista/barista-pinksaltlemonade.jpeg" },
    { name: "ピンクソルトレモネード", img: "img/menu/barista/barista-pinksaltlemonade.jpeg" },
    { name: "レモンスカッシュ", img: "img/menu/barista/barista-lemonsquash.jpeg" }
  ],

  "b-a": [
    { name: "コールドブリューコーヒー", img: "img/menu/barista/barista-coldbrew.jpeg" },
    { name: "アイスコーヒー", img: "img/menu/barista/barista-coffee.png" }
  ],

  "b-b": [
    { name: "アイスラテ", img: "img/menu/barista/barista-icelatte.jpeg" }
  ],

  "c-a": [
    { name: "アイスティー", img: "img/menu/barista/barista-icetea.jpeg" }
  ],

  "c-b": [
    { name: "アイスラテ", img: "img/menu/barista/barista-icelatte.jpeg" }
  ],

  "d-a": [
    { name: "グラニータ", img: "img/menu/barista/barista-granitta.png" }
  ],

  "d-b": [
    { name: "グラニータ", img: "img/menu/barista/barista-granitta.png" }
  ]
};



/* =================================================
   結果表示ロジック
================================================= */
let susumeList = [];
let susumeIndex = 0;

function showResultFoodSet1(q1, q2) {
  const key = `${q1}-${q2}`;
  susumeList = FOOD_SET_1[key] || [];
  susumeIndex = 0;
  renderSusume();
}

function showResultByFoodSet(foodSet, key) {
  const map = {
    1: FOOD_SET_1,  
    2: FOOD_SET_2,
    3: FOOD_SET_3,
    4: FOOD_SET_4,
    5: FOOD_SET_5
  };

  susumeList = map[foodSet]?.[key] || [];
  susumeIndex = 0;
  renderSusume();
}

function showResultDrink(q2, q3) {
  const key = `${q2}-${q3}`;
  susumeList = DRINK_SET[key] || [];
  susumeIndex = 0;
  renderSusume();
}



function renderSusume() {
  if (!susumeList.length) return;

  const item = susumeList[susumeIndex];
  const circle = document.getElementById("menuImage");

  circle.style.backgroundImage = `url(${item.img})`;
  document.querySelector(".result-name").textContent = item.name;

  const show = susumeList.length > 1;
  document.querySelector(".result-nav.prev").style.display = show ? "block" : "none";
  document.querySelector(".result-nav.next").style.display = show ? "block" : "none";
}

/* arrows */
document.querySelector(".result-nav.prev").onclick = () => {
  susumeIndex = (susumeIndex - 1 + susumeList.length) % susumeList.length;
  renderSusume();
};

document.querySelector(".result-nav.next").onclick = () => {
  susumeIndex = (susumeIndex + 1) % susumeList.length;
  renderSusume();
};

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
