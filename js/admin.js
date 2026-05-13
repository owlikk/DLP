async function checkAdminAccess() {
  const {
    data: { user }
  } = await db.auth.getUser();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    alert("Доступ запрещён.");
    window.location.href = "dashboard.html";
    return;
  }

  if (sessionStorage.getItem("admin_pin_verified") !== "true") {
    alert("Требуется подтверждение PIN.");
    window.location.href = "dashboard.html";
    return;
  }
}

const logsContainer = document.getElementById("logsContainer");
const testsContainer = document.getElementById("testsContainer");
const addRuleBtn = document.getElementById("addRuleBtn");
const ruleMessage = document.getElementById("ruleMessage");

async function loadLogs() {
  const { data } = await db
    .from("check_logs")
    .select("*")
    .order("created_at", { ascending: false });

  logsContainer.innerHTML = data?.length
    ? data.map(log => `
      <div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.18);">
        <p><strong>Сотрудник:</strong> ${log.full_name}</p>
        <p><strong>Email:</strong> ${log.email}</p>
        <p><strong>Тип:</strong> ${log.check_type}</p>
        <p><strong>Риск:</strong> ${log.risk_level}</p>
        <p><strong>Оценка:</strong> ${log.risk_score}</p>
        <p><strong>Дата:</strong> ${new Date(log.created_at).toLocaleString()}</p>
      </div>
    `).join("")
    : "Журнал пуст.";
}

async function loadTests() {
  const { data } = await db
    .from("test_results")
    .select("*")
    .order("created_at", { ascending: false });

  testsContainer.innerHTML = data?.length
    ? data.map(test => `
      <div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.18);">
        <p><strong>Сотрудник:</strong> ${test.full_name}</p>
        <p><strong>Email:</strong> ${test.email}</p>
        <p><strong>Результат:</strong> ${test.score}/${test.total}</p>
        <p><strong>Дата:</strong> ${new Date(test.created_at).toLocaleString()}</p>
      </div>
    `).join("")
    : "Журнал пуст.";
}

addRuleBtn.addEventListener("click", async () => {
  const value = document.getElementById("ruleInput").value.trim();
  if (!value) return;

  await db.from("rules").insert({
    rule_name: value,
    rule_type: "keyword",
    value: value,
    risk_weight: 20,
    is_active: true
  });

  ruleMessage.textContent = "Правило добавлено.";
});

(async () => {
  await checkAdminAccess();
  await loadLogs();
  await loadTests();
})();
