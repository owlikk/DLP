const analyzeBtn = document.getElementById("analyzeBtn");
const maskBtn = document.getElementById("maskBtn");
const clipboardBtn = document.getElementById("clipboardBtn");
const logoutBtn = document.getElementById("logoutBtn");

const messageInput = document.getElementById("messageInput");
const maskedOutput = document.getElementById("maskedOutput");

const riskLevel = document.getElementById("riskLevel");
const riskScore = document.getElementById("riskScore");
const foundItems = document.getElementById("foundItems");

async function checkAuth() {
  const {
    data: { user }
  } = await db.auth.getUser();

  if (!user) {
    window.location.href = "index.html";
  }
}

async function getRules() {
  const { data } = await db
    .from("rules")
    .select("*")
    .eq("is_active", true);

  return data || [];
}

async function saveLog(text, result, type) {
  const {
    data: { user }
  } = await db.auth.getUser();

  if (!user) return;

  await db.from("check_logs").insert({
    user_id: user.id,
    check_type: type,
    input_text: text,
    masked_text: result.maskedText,
    risk_level: result.risk,
    risk_score: result.score,
    found_items: result.findings
  });
}

function renderResult(result) {
  riskLevel.textContent = "Риск: " + result.risk;
  riskScore.textContent = "Оценка: " + result.score;
  maskedOutput.value = result.maskedText;

  if (!result.findings.length) {
    foundItems.innerHTML = "<p>Угроз не обнаружено.</p>";
    return;
  }

  foundItems.innerHTML = result.findings.map(item => `<p>• ${item}</p>`).join("");
}

analyzeBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return alert("Введите текст.");

  const rules = await getRules();
  const result = analyzeText(text, rules);

  renderResult(result);
  await saveLog(text, result, "text");
});

maskBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  maskedOutput.value = maskSensitiveData(text);
});

clipboardBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    messageInput.value = text;

    const rules = await getRules();
    const result = analyzeText(text, rules);

    renderResult(result);
    await saveLog(text, result, "clipboard");
  } catch {
    alert("Нет доступа к буферу обмена.");
  }
});

logoutBtn.addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.href = "index.html";
});

checkAuth();
