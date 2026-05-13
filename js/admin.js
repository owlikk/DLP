const logsContainer = document.getElementById("logsContainer");
const testsContainer = document.getElementById("testsContainer");
const addRuleBtn = document.getElementById("addRuleBtn");
const ruleMessage = document.getElementById("ruleMessage");

async function checkAuth() {
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    window.location.href = "index.html";
  }
}

async function loadLogs() {
  const { data, error } = await db
    .from("check_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logsContainer.textContent = "Ошибка загрузки журнала проверок.";
    return;
  }

  if (!data || !data.length) {
    logsContainer.textContent = "Журнал проверок пуст.";
    return;
  }

  logsContainer.innerHTML = data.map(log => `
    <div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.18);">
      <p><strong>Сотрудник:</strong> ${log.full_name || "Не указано"}</p>
      <p><strong>Email:</strong> ${log.email || "Не указано"}</p>
      <p><strong>Тип проверки:</strong> ${log.check_type}</p>
      <p><strong>Риск:</strong> ${log.risk_level}</p>
      <p><strong>Оценка:</strong> ${log.risk_score}</p>
      <p><strong>Найдено:</strong> ${(log.found_items || []).join(", ") || "Угроз не обнаружено"}</p>
      <p><strong>Дата:</strong> ${new Date(log.created_at).toLocaleString()}</p>
      <details>
        <summary>Показать замаскированный текст</summary>
        <p>${log.masked_text || "Нет данных"}</p>
      </details>
    </div>
  `).join("");
}

async function loadTests() {
  const { data, error } = await db
    .from("test_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    testsContainer.textContent = "Ошибка загрузки журнала обучения.";
    return;
  }

  if (!data || !data.length) {
    testsContainer.textContent = "Журнал обучения пуст.";
    return;
  }

  testsContainer.innerHTML = data.map(test => `
    <div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.18);">
      <p><strong>Сотрудник:</strong> ${test.full_name || "Не указано"}</p>
      <p><strong>Email:</strong> ${test.email || "Не указано"}</p>
      <p><strong>Результат:</strong> ${test.score}/${test.total}</p>
      <p><strong>Дата:</strong> ${new Date(test.created_at).toLocaleString()}</p>
    </div>
  `).join("");
}

addRuleBtn.addEventListener("click", async () => {
  const value = document.getElementById("ruleInput").value.trim();

  if (!value) {
    ruleMessage.textContent = "Введите слово или фразу.";
    return;
  }

  const { error } = await db.from("rules").insert({
    rule_name: value,
    rule_type: "keyword",
    value: value,
    risk_weight: 20,
    is_active: true
  });

  if (error) {
    ruleMessage.textContent = "Ошибка добавления правила.";
    return;
  }

  ruleMessage.textContent = "Правило добавлено.";
  document.getElementById("ruleInput").value = "";
});

checkAuth();
loadLogs();
loadTests();
