const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

registerBtn.addEventListener("click", async () => {
  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!fullName || !email || !password) {
    message.textContent = "Заполните все поля.";
    return;
  }

  message.textContent = "Регистрация...";

  const { data, error } = await db.auth.signUp({
    email,
    password
  });

  if (error) {
    message.textContent = "Ошибка регистрации: " + error.message;
    return;
  }

  if (!data.user) {
    message.textContent = "Ошибка создания пользователя.";
    return;
  }

  const { error: profileError } = await db
    .from("profiles")
    .upsert({
      id: data.user.id,
      full_name: fullName,
      email: email,
      role: "employee"
    });

  if (profileError) {
    message.textContent = "Ошибка создания профиля.";
    return;
  }

  alert(
    "Регистрация выполнена.\n\n" +
    "Для завершения регистрации необходимо подтвердить адрес электронной почты.\n" +
    "Письмо с подтверждением отправлено на вашу почту.\n\n" +
    "После подтверждения email вы сможете войти в систему."
  );

  fullNameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
  message.textContent = "";
});

loginBtn.addEventListener("click", async () => {
  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!fullName || !email || !password) {
    message.textContent = "Заполните все поля.";
    return;
  }

  message.textContent = "Проверка данных...";

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (profileError || !profile) {
    message.textContent = "Пользователь не найден.";
    return;
  }

  if (profile.full_name.trim().toLowerCase() !== fullName.toLowerCase()) {
    message.textContent = "Неверное ФИО.";
    return;
  }

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      message.textContent = "Подтвердите email перед входом.";
      return;
    }

    message.textContent = "Неверный email или пароль.";
    return;
  }

  window.location.href = "dashboard.html";
});
