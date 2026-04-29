const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

registerBtn.addEventListener("click", async () => {
  message.textContent = "Выполняется регистрация...";

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!fullName || !email || !password) {
    message.textContent = "Заполните все поля.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    message.textContent = "Ошибка регистрации: " + error.message;
    return;
  }

  if (data.user) {
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: "employee"
      });

    if (profileError) {
      message.textContent = "Пользователь создан, но профиль не сохранён: " + profileError.message;
      return;
    }
  }

  message.textContent = "Регистрация выполнена. Теперь нажмите «Войти».";
});

loginBtn.addEventListener("click", async () => {
  message.textContent = "Выполняется вход...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    message.textContent = "Введите email и пароль.";
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    message.textContent = "Ошибка входа: " + error.message;
    return;
  }

  window.location.href = "dashboard.html";
});
