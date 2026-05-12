const logsContainer = document.getElementById("logsContainer");
const addRuleBtn = document.getElementById("addRuleBtn");

async function loadLogs() {
  const { data, error } = await db
    .from("check_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logsContainer.textContent = "Ошибка загрузки.";
    return;
  }

  if (!data.length) {
    logsContainer.textContent = "Журнал пуст.";
    return;
  }

  logsContainer.innerHTML = data.map(log => `
    <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.15);">
      <p><strong>Риск:</strong> ${log.risk_level}</p>
      <p><strong>Оценка:</strong> ${log.risk_score}</p>
      <p><strong>Дата:</strong> ${new Date(log.created_at).toLocaleString()}</p>
    </div>
  `).join("");
}

addRuleBtn.addEventListener("click", async () => {
  const value = document.getElementById("ruleInput").value.trim();

  if (!value) return;

  await db.from("rules").insert({
    rule_name: value,
    rule_type: "keyword",
    value: value,
    risk_weight: 20
  });

  alert("Правило добавлено.");
});

loadLogs();
