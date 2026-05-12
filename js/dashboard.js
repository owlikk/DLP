const analyzeBtn = document.getElementById("analyzeBtn");
const clipboardBtn = document.getElementById("clipboardBtn");
const logoutBtn = document.getElementById("logoutBtn");

const messageInput = document.getElementById("messageInput");
const riskLevel = document.getElementById("riskLevel");
const riskScore = document.getElementById("riskScore");
const foundItems = document.getElementById("foundItems");

analyzeBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();

  if (!text) {
    alert("Введите текст для анализа.");
    return;
  }

  const result = analyzeText(text);

  riskLevel.textContent = "Риск: " + result.risk;
  riskScore.textContent = "Оценка: " + result.score;

  foundItems.innerHTML = result.findings
    .map(item => `<p>• ${item}</p>`)
    .join("");
});

clipboardBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    messageInput.value = text;

    const result = analyzeText(text);

    riskLevel.textContent = "Риск: " + result.risk;
    riskScore.textContent = "Оценка: " + result.score;

    foundItems.innerHTML = result.findings
      .map(item => `<p>• ${item}</p>`)
      .join("");
  } catch {
    alert("Нет доступа к буферу обмена.");
  }
});

logoutBtn.addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.href = "index.html";
});
