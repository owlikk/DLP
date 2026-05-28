const phishingMessage = document.getElementById("phishingMessage");

async function registerPhishingClick() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    phishingMessage.textContent = "Ошибка: контрольный токен не найден.";
    return;
  }

  const { data, error } = await db
    .from("phishing_tests")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    phishingMessage.textContent = "Контрольная ссылка недействительна.";
    return;
  }

  if (!data.clicked) {
    await db
      .from("phishing_tests")
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      })
      .eq("token", token);
  }

  phishingMessage.innerHTML = `
    Вы перешли по учебной фишинговой ссылке.<br><br>
    В реальной ситуации такой переход мог привести к утечке данных,
    компрометации учётной записи или заражению устройства.<br><br>
    Проверяйте отправителя письма, домен ссылки и не переходите
    по подозрительным адресам.
  `;
}

registerPhishingClick();
