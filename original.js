document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // LƯU CÂU TRẢ LỜI
  // ===============================
  const answers = {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null
  };

  // ===============================
  // CHỌN FOOD SET SAU Q3
  // ===============================
  function decideFoodSet(q2, q3) {
    if (q2 === "a" && q3 === "a") return "1";
    if (
      (q2 === "a" && q3 === "b") ||
      (q2 === "b" && q3 === "a")
    ) return "2";
    return "3";
  }

  // ===============================
  // HIỆN STEP
  // ===============================
  function showStep(stepName) {
    const target = document.querySelector(
      `.anketo-step[data-question="${stepName}"]`
    );

    if (!target) {
      console.error("Không tìm thấy step:", stepName);
      return;
    }

    target.classList.add("shown", "active");

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  // ===============================
  // KẾT THÚC STEP (ẨN HẲN)
  // ===============================
  function markDone(step) {
    step.classList.remove("active");
    step.classList.remove("shown");
    step.classList.add("done");

    // 🔥 ẨN HẲN KHỎI LAYOUT
    step.style.display = "none";
  }


  // ===============================
  // CLICK HANDLER
  // ===============================
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.addEventListener("click", () => {

      const step = btn.closest(".anketo-step");
      const qKey = step.dataset.question;
      const value = btn.dataset.value;
      const next = btn.dataset.next;

      // ===============================
      // LƯU ĐÁP ÁN
      // ===============================
      if (qKey === "q1") answers.q1 = value;
      if (qKey.startsWith("q2")) answers.q2 = value;
      if (qKey === "q3") answers.q3 = value;
      if (qKey.startsWith("q4")) answers.q4 = value;
      if (qKey.startsWith("q5")) answers.q5 = value;

      // ẨN STEP HIỆN TẠI
      markDone(step);

      // ===============================
      // FLOW ĐI TIẾP
      // ===============================
      if (next === "q2-a" || next === "q2-b") {
        showStep(next);
        return;
      }

      if (next === "q3") {
        showStep("q3");
        return;
      }

      if (next === "after-q3") {
        const foodSet = decideFoodSet(answers.q2, answers.q3);
        showStep(`q4-food-${foodSet}`);
        return;
      }

      if (next.startsWith("q5-")) {
        showStep(next);
        return;
      }

      if (next.startsWith("result")) {
        console.log("FINAL ANSWERS:", answers);
        // 👉 sau này gắn showResult() ở đây
        return;
      }

    });
  });

});
