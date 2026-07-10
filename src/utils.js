export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function won(value) {
  if (!Number.isFinite(value)) return "0원";
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function eok(value) {
  const amount = Math.max(0, Math.round(value / 10000000) / 10);
  return `${amount.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억`;
}

export function shortKoreanDate(date) {
  if (!date) return "";
  const year = String(date.getFullYear()).slice(-2);
  return `${year}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

export function readableMoney(value) {
  const amount = Math.max(0, Math.round(Number(value) || 0));
  if (amount === 0) return "0원";

  const eokUnit = Math.floor(amount / 100000000);
  const manUnit = Math.floor((amount % 100000000) / 10000);

  if (eokUnit > 0 && manUnit > 0) {
    return `${eokUnit.toLocaleString("ko-KR")}억 ${manUnit.toLocaleString("ko-KR")}만원`;
  }

  if (eokUnit > 0) {
    return `${eokUnit.toLocaleString("ko-KR")}억원`;
  }

  if (manUnit > 0) {
    return `${manUnit.toLocaleString("ko-KR")}만원`;
  }

  return `${amount.toLocaleString("ko-KR")}원`;
}

export function clamp(num, min, max) {
  return Math.min(max, Math.max(min, Number(num) || 0));
}

export function monthlyPayment(principal, annualRate, years) {
  const months = years * 12;
  return monthlyPaymentByMonths(principal, annualRate, months);
}

export function monthlyPaymentByMonths(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * (r * (1 + r) ** months)) / ((1 + r) ** months - 1);
}

export function monthsBetween(start, end) {
  return Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 +
      end.getMonth() -
      start.getMonth(),
  );
}
