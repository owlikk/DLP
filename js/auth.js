const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

registerBtn.addEventListener("click", async () => {
  message.textContent = "Регистрация...";

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!fullName || !email || !password) {
    message.textContent = "Заполните все поля.";
    return;
  }

  try {
    const { data, error } = await db.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      message.textContent = "Ошибка регистрации: " + error.message;
      return;
    }

    if (data.user) {
      const { error: profileError } = await db
        .from("profiles")
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: "employee"
        });

      if (profileError) {
        message.textContent = "Пользователь создан, но профиль не сохранён.";
        return;
      }
    }

    message.textContent = "Регистрация успешна. Теперь нажмите «Войти».";

  } catch (e) {
    message.textContent = "Ошибка: " + e.message;
  }
});

loginBtn.addEventListener("click", async () => {
  message.textContent = "Вход...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    message.textContent = "Введите email и пароль.";
    return;
  }

  try {
    const { error } = await db.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      message.textContent = "Ошибка входа: " + error.message;
      return;
    }

    window.location.href = "dashboard.html";

  } catch (e) {
    message.textContent = "Ошибка: " + e.message;
  }
});
