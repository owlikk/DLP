const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

registerBtn.addEventListener("click", async () => {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!fullName || !email || !password) {
    message.textContent = "Заполните все поля.";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: "employee"
    });
  }

  message.textContent = "Регистрация выполнена. Теперь выполните вход.";
});

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    message.textContent = "Введите email и пароль.";
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  window.location.href = "dashboard.html";
});
