document.addEventListener("DOMContentLoaded", function () {
  loadCSV();

  const resultText = document.getElementById("result-text");
  const resultArticle = document.getElementById("result-article");
  const resultAnswer = document.getElementById("result-text-plus");

  if (resultText && resultArticle) {
    const isCorrect = localStorage.getItem("isCorrect") === "true";
    resultText.innerText = isCorrect
      ? "정답···엄청난 성과 이뤄"
      : "오답···발전 가능성 높아";
    resultArticle.innerHTML = highlightQuotedText(
      (localStorage.getItem("resultArticle") || "").replace(/\n/g, "<br>")
    );
  }

  if (resultAnswer) {
    resultAnswer.innerHTML = highlightQuotedText(
      localStorage.getItem("resultAnswer") || ""
    );
  }
});

async function loadCSV() {
  try {
    const response = await fetch("weeklyUpdates/articles.csv");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    let csvText = await response.text();
    csvText = csvText.replace(/^\uFEFF/, "");
    const parsedData = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: "greedy", // 완전 빈 줄 + 공백줄 무시
      transform: (v) => (typeof v === "string" ? v.trim() : v), // 양끝 공백 제거
    }).data;
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const todayArticle = parsedData.find((article) => article.date === today);
    if (todayArticle) updateArticle(todayArticle);
    else console.warn("오늘 날짜에 해당하는 기사가 없습니다.");
  } catch (error) {
    console.error("CSV 파일 로딩 오류:", error);
  }
}

function getKSTTimestamp() {
  const date = new Date(Date.now() + 9 * 60 * 60 * 1000); // UTC + 9시간
  return date.toISOString().replace("T", " ").split(".")[0];
}

document.addEventListener("DOMContentLoaded", function () {
  //shared.html 진입 이벤트
  if (location.pathname.includes("shared.html")) {
    gtag("event", "quiz_shared_page", {});
  }

  //index.html 진입 이벤트
  if (location.pathname.includes("index.html")) {
    gtag("event", "quiz_index_page", {});
  }

  // main.html 진입 이벤트
  if (location.pathname.includes("main.html")) {
    gtag("event", "quiz_main_page", {});
  }

  // result.html 진입 이벤트
  if (location.pathname.includes("result.html")) {
    gtag("event", "quiz_result_page", {});

    const r1 = localStorage.getItem("resultImage1") || "";
    const r2 = localStorage.getItem("resultImage2") || "";
    const r3 = localStorage.getItem("resultImage3") || "";

    const img1 = document.querySelector("#result-img1 img");
    const img2 = document.querySelector("#result-img2 img");
    const img3 = document.querySelector("#result-img3 img");

    if (img1 && r1) img1.src = r1;
    if (img2 && r2) img2.src = r2;
    if (img3 && r3) img3.src = r3;
  }

  // 메인 결과 이미지
  const mainImg = document.querySelector(".result-img img");
  if (mainImg && r1) mainImg.src = r1;

  // 이스터에그 2장
  const easters = document.querySelectorAll("#third .easter img");
  if (easters[0] && r2) easters[0].src = r2;
  if (easters[1] && r3) easters[1].src = r3;
});

function highlightQuotedText(text) {
  return (
    text
      ?.replace(/<([^>]+)>/g, '<span class="highlight">&lt;$1&gt;</span>')
      .replace(/\n/g, "<br>") || ""
  );
}

function extractKeyword(text) {
  const match = text.match(/<([^>]+)>/);
  return match ? match[1].trim() : text.trim();
}

function updateArticle(article) {
  document.getElementById("weather").innerText = article.weather;
  document.getElementById("article-title").innerHTML = highlightQuotedText(
    article.title
  );
  document.getElementById("article-img").src = article.image;
  document.getElementById("article-content").innerHTML = highlightQuotedText(
    article.content
  );
  document.getElementById("article-author").innerText = article.author;
  document.getElementById("ad-img").src = article.adImage;

  localStorage.setItem("resultArticle", article.resultArticle);
  localStorage.setItem("resultAnswer", article.resultAnswer);

  localStorage.setItem("correctKeyword", extractKeyword(article.correctChoice));

  localStorage.setItem("resultImage1", article.resultImage1 || "");
  localStorage.setItem("resultImage2", article.resultImage2 || "");
  localStorage.setItem("resultImage3", article.resultImage3 || "");

  localStorage.setItem("readArticle", article.readArticle);

  // 표시용 HTML 저장
  localStorage.setItem(
    "correctChoice",
    highlightQuotedText(article.correctChoice.trim())
  );
  localStorage.setItem(
    "wrongChoice",
    highlightQuotedText(article.wrongChoice.trim())
  );

  randomizeChoices();
}

// index.html 퀴즈 풀러 가기 누르기
function goSolveQuiz() {
  gtag("event", "quiz_go_solve", {});
  window.location.href = "main.html";
}

function randomizeChoices() {
  const correctContainer = document.getElementById("correct-choice");
  const wrongContainer = document.getElementById("wrong-choice");
  const correctHTML = localStorage.getItem("correctChoice") || "";
  const wrongHTML = localStorage.getItem("wrongChoice") || "";

  if (Math.random() < 0.5) {
    correctContainer.querySelector("div").innerHTML = correctHTML;
    wrongContainer.querySelector("div").innerHTML = wrongHTML;
  } else {
    correctContainer.querySelector("div").innerHTML = wrongHTML;
    wrongContainer.querySelector("div").innerHTML = correctHTML;
  }
}

function checkAnswer(event) {
  const correctKeyword = localStorage.getItem("correctKeyword") || "";

  const selectedRaw = event.currentTarget.textContent || "";
  const selectedKeyword = extractKeyword(selectedRaw);

  alert(`정답 키워드: [${correctKeyword}]\n선택 키워드: [${selectedKeyword}]`);

  const isCorrect = selectedKeyword === correctKeyword;
  localStorage.setItem("isCorrect", isCorrect.toString());
  localStorage.setItem("correctAnswer", correctKeyword);
  localStorage.setItem("selectedChoice", selectedKeyword);

  gtag("event", "quiz_answer_selected", {
    value: isCorrect ? 1 : 0,
    event_callback: () => {
      window.location.href = "result.html";
    },
    event_timeout: 500, // 전송 실패해도 0.5초 후엔 이동
  });
}

function readArticle() {
  gtag("event", "quiz_read_article", {});

  //임시로 새탭에 구글이 열림
  window.open(`${localStorage.getItem("readArticle")}`);
}

function share() {
  gtag("event", "quiz_share", {});

  const mainUrl = `${window.location.origin}/shared.html`;
  // const mainUrl = "https://dwiroilbo.github.io"

  navigator.clipboard
    .writeText(mainUrl)
    .then(() => {
      alert("링크가 복사되었습니다!\n" + mainUrl);
    })
    .catch((err) => {
      console.error("클립보드 복사 실패:", err);
      alert("링크 복사에 실패했습니다. 수동으로 복사해주세요!");
    });
}

function easter() {
  alert("준비중입니다!");
}
