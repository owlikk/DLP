function analyzeText(text) {
  const findings = [];
  let score = 0;

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\+?\d{10,15}/g;
  const passwordRegex = /(password|пароль|login|логин)/gi;
  const linkRegex = /(https?:\/\/[^\s]+)/g;

  if (text.match(emailRegex)) {
    findings.push("Обнаружен email");
    score += 20;
  }

  if (text.match(phoneRegex)) {
    findings.push("Обнаружен номер телефона");
    score += 20;
  }

  if (text.match(passwordRegex)) {
    findings.push("Обнаружены слова, связанные с паролями");
    score += 35;
  }

  if (text.match(linkRegex)) {
    findings.push("Обнаружена ссылка");
    score += 15;
  }

  let risk = "Низкий";

  if (score >= 30) risk = "Средний";
  if (score >= 60) risk = "Высокий";

  return {
    score,
    risk,
    findings
  };
}
