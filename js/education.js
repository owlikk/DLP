async function submitTest(correct) {
  const testResult = document.getElementById("testResult");

  if (correct) {
    testResult.textContent = "Верно. Пароли нельзя передавать через незащищённые каналы.";
  } else {
    testResult.textContent = "Неверно. Передача паролей через мессенджеры небезопасна.";
  }

  const {
    data: { user }
  } = await db.auth.getUser();

  if (user) {
    await db.from("test_results").insert({
      user_id: user.id,
      score: correct ? 1 : 0,
      total: 1
    });
  }
}
