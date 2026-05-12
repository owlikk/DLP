function analyzeText(text, customRules = []) {
  const findings = [];
  let score = 0;

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const phoneRegex = /\+?\d{10,15}/g;
  const passwordRegex = /(password|пароль|login|логин|token|api key|ключ доступа)/gi;
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const cardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  const iinRegex = /\b\d{12}\b/g;

  if (text.match(emailRegex)) {
    findings.push("Обнаружен email");
    score += 20;
  }

  if (text.match(phoneRegex)) {
    findings.push("Обнаружен номер телефона");
    score += 20;
  }

  if (text.match(passwordRegex)) {
    findings.push("Обнаружены данные, связанные с паролями");
    score += 35;
  }

  if (text.match(linkRegex)) {
    findings.push("Обнаружена ссылка");
    score += 15;
  }

  if (text.match(cardRegex)) {
    findings.push("Обнаружен номер банковской карты");
    score += 40;
  }

  if (text.match(iinRegex)) {
    findings.push("Обнаружен ИИН");
    score += 35;
  }

  customRules.forEach(rule => {
    if (text.toLowerCase().includes(rule.value.toLowerCase())) {
      findings.push(`Найдено запрещённое слово: ${rule.value}`);
      score += rule.risk_weight || 20;
    }
  });

  let risk = "Низкий";

  if (score >= 30) risk = "Средний";
  if (score >= 60) risk = "Высокий";

  return {
    score,
    risk,
    findings
  };
}
