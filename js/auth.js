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

  const { data, error } = await db.auth.signUp({
    email,
    password
  });

  if (error) {
    message.textContent = "Ошибка регистрации: " + error.message;
    return;
  }

  if (data.user) {
    await db.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      email: email,
      role: "employee"
    });

    message.textContent = "Регистрация успешна.";
  }
});

loginBtn.addEventListener("click", async () => {
  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!fullName || !email || !password) {
    message.textContent = "Заполните все поля.";
    return;
  }

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = "Ошибка входа: неверный email или пароль.";
    return;
  }

  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    await db.auth.signOut();
    message.textContent = "Профиль пользователя не найден.";
    return;
  }

  if (profile.full_name.trim().toLowerCase() !== fullName.toLowerCase()) {
    await db.auth.signOut();
    message.textContent = "Неверное ФИО.";
    return;
  }

  window.location.href = "dashboard.html";
});
