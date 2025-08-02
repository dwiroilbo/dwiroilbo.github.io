// // GA 설정
// window.dataLayer = window.dataLayer || [];
// function gtag() {
//   dataLayer.push(arguments);
// }

// gtag("js", new Date());
// gtag("config", "G-75M5ZCMR2J", { debug_mode: true });

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
    const parsedData = Papa.parse(csvText, { header: true }).data;
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
  //start.html 진입 이벤트
  if (location.pathname.includes("start.html")) {
    gtag("event", "quiz_start_page", {});
  }

  // index.html 진입 이벤트
  if (location.pathname.includes("index.html")) {
    gtag("event", "quiz_main_page", {});
  }

  // result.html 진입 이벤트
  if (location.pathname.includes("result.html")) {
    gtag("event", "quiz_result_page", {});
  }
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

// start.html 퀴즈 풀러 가기 누르기
function goSolveQuiz() {
  gtag("event", "quiz_go_solve", {});
  window.location.href = "index.html?from=start";
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

  const selectedRaw =
    event.currentTarget.querySelector("div").textContent || "";
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
  alert("관련기사 준비중...");
}

function share() {
  gtag("event", "quiz_share", {});
  alert("공유 준비중...");
}

function easter() {
  alert("준비중입니다!");
}
