emailjs.init("oEcdaRQJYMDUDQaUM");

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
    alert("Требуется подтверждение PIN-кода.");
    window.location.href = "dashboard.html";
    return;
  }
}

const logsContainer = document.getElementById("logsContainer");
const testsContainer = document.getElementById("testsContainer");
const addRuleBtn = document.getElementById("addRuleBtn");
const ruleMessage = document.getElementById("ruleMessage");
const ruleInput = document.getElementById("ruleInput");
const riskWeightInput = document.getElementById("riskWeightInput");

async function loadLogs() {
  const { data } = await db
    .from("check_logs")
    .select("*")
    .order("created_at", { ascending: false });

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
  const { data } = await db
    .from("test_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data || !data.length) {
    testsContainer.textContent = "Журнал обучения пуст.";
    return;
  }

  testsContainer.innerHTML = data.map(test => `
    <div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.18);">
      <p><strong>Сотрудник:</strong> ${test.full_name || "Не указано"}</p>
      <p><strong>Email:</strong> ${test.email || "Не указано"}</p>
      <p><strong>Результат тестирования:</strong> ${test.score}/${test.total}</p>
      <p><strong>Дата:</strong> ${new Date(test.created_at).toLocaleString()}</p>
    </div>
  `).join("");
}

addRuleBtn.addEventListener("click", async () => {
  const value = ruleInput.value.trim();
  const riskWeight = parseInt(riskWeightInput.value);

  if (!value) {
    ruleMessage.textContent = "Введите ключевое слово или фразу.";
    return;
  }

  if (!riskWeight || riskWeight < 1 || riskWeight > 100) {
    ruleMessage.textContent = "Введите корректный вес риска (1–100).";
    return;
  }

  const { error } = await db.from("rules").insert({
    rule_name: value,
    rule_type: "keyword",
    value: value,
    risk_weight: riskWeight,
    is_active: true
  });

  if (error) {
    ruleMessage.textContent = "Ошибка добавления правила.";
    return;
  }

  ruleMessage.textContent = `Правило "${value}" добавлено. Вес риска: ${riskWeight}`;

  ruleInput.value = "";
  riskWeightInput.value = "";
});

const employeesContainer = document.getElementById("employeesContainer");
const phishingTitleInput = document.getElementById("phishingTitleInput");
const sendPhishingBtn = document.getElementById("sendPhishingBtn");
const phishingMessage = document.getElementById("phishingMessage");
const phishingLogsContainer = document.getElementById("phishingLogsContainer");

const phishingTemplates = [
  {
    subject: "Срочное подтверждение аккаунта",
    text: "Ваш корпоративный аккаунт требует срочного подтверждения."
  },
  {
    subject: "Подтверждение VPN-доступа",
    text: "Для продолжения работы подтвердите VPN-доступ."
  },
  {
    subject: "Подозрительная активность",
    text: "Обнаружена подозрительная активность в вашей учётной записи."
  },
  {
    subject: "Новый документ HR",
    text: "Ознакомьтесь с новым внутренним документом компании."
  },
  {
    subject: "Обновление пароля",
    text: "Требуется обновить пароль корпоративного аккаунта."
  },
  {
    subject: "Проверка службы безопасности",
    text: "Служба безопасности требует подтверждения данных."
  },
  {
    subject: "Защищённый файл",
    text: "Вам отправлен защищённый корпоративный файл."
  },
  {
    subject: "Системное уведомление",
    text: "Для продолжения работы подтвердите учётную запись."
  },
  {
    subject: "Обновление доступа",
    text: "Подтвердите доступ к внутренним ресурсам компании."
  },
  {
    subject: "Проверка Microsoft Account",
    text: "Требуется повторная авторизация Microsoft аккаунта."
  }
];

async function loadEmployees() {
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("role", "employee");

  if (error) {
    employeesContainer.innerHTML = "Ошибка загрузки сотрудников.";
    return;
  }

  if (!data.length) {
    employeesContainer.innerHTML = "Сотрудники не найдены.";
    return;
  }

  employeesContainer.innerHTML = "";

  data.forEach(user => {
employeesContainer.innerHTML += `
  <label style="
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:10px;
    cursor:pointer;
  ">
    <input
      type="checkbox"
      class="employeeCheckbox"
      value="${user.id}"
      data-name="${user.full_name}"
      data-email="${user.email}"
      style="
        width:18px;
        height:18px;
        margin:0;
      "
    >

    <span>
      ${user.full_name} — ${user.email}
    </span>
  </label>
`;
  });
}

async function loadPhishingLogs() {
  const { data, error } = await db
    .from("phishing_tests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    phishingLogsContainer.innerHTML = "Ошибка загрузки журнала.";
    return;
  }

  if (!data.length) {
    phishingLogsContainer.innerHTML = "Журнал пуст.";
    return;
  }

  phishingLogsContainer.innerHTML = "";

  data.forEach(log => {
    phishingLogsContainer.innerHTML += `
      <div style="
        margin-bottom:12px;
        padding:10px;
        border-radius:10px;
        background: rgba(255,255,255,0.07);
      ">
        <strong>${log.employee_name}</strong><br>
        ${log.employee_email}<br>
        Проверка: ${log.test_title}<br>
        Переход: ${log.clicked ? "Да" : "Нет"}<br>
      </div>
    `;
  });
}

sendPhishingBtn.addEventListener("click", async () => {

  const selected = document.querySelectorAll(".employeeCheckbox:checked");

  if (!selected.length) {
    phishingMessage.textContent = "Выберите сотрудников.";
    return;
  }

  const title = phishingTitleInput.value.trim();

  if (!title) {
    phishingMessage.textContent = "Введите название проверки.";
    return;
  }

  sendPhishingBtn.disabled = true;

  phishingMessage.textContent = "Отправка писем...";

  for (const employee of selected) {

    const employeeId = employee.value;
    const employeeName = employee.dataset.name;
    const employeeEmail = employee.dataset.email;

    const template =
      phishingTemplates[
        Math.floor(Math.random() * phishingTemplates.length)
      ];

    const token = crypto.randomUUID();

    const phishingLink =
      `${window.location.origin}${window.location.pathname.replace("admin.html", "phishing.html")}?token=${token}`;

    await db.from("phishing_tests").insert({
      employee_id: employeeId,
      employee_name: employeeName,
      employee_email: employeeEmail,
      test_title: title,
      email_subject: template.subject,
      message_text: template.text,
      token,
      phishing_link: phishingLink,
      template_name: template.subject
    });

    await emailjs.send(
      "service_yq7nqjn",
      "template_szbbyyq",
      {
        to_email: employeeEmail,
        employee_name: employeeName,
        subject: template.subject,
        message_text: template.text,
        phishing_link: phishingLink
      }
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  phishingMessage.textContent =
    "Фишинговое тестирование успешно отправлено.";

  setTimeout(() => {
    sendPhishingBtn.disabled = false;
  }, 5000);

  loadPhishingLogs();
});

(async () => {
  await checkAdminAccess();
  await loadLogs();
  await loadTests();
  await loadEmployees();
  await loadPhishingLogs();
})();

