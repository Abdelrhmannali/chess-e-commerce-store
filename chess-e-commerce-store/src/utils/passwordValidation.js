const RULES = {
  minLength: (p) => p.length >= 8,
  uppercase: (p) => /[A-Z]/.test(p),
  lowercase: (p) => /[a-z]/.test(p),
  number: (p) => /[0-9]/.test(p),
  special: (p) => /[^A-Za-z0-9]/.test(p),
};

export const PASSWORD_RULES = [
  { id: "minLength", label: "8 أحرف على الأقل", test: RULES.minLength },
  { id: "uppercase", label: "حرف كبير (A-Z)", test: RULES.uppercase },
  { id: "lowercase", label: "حرف صغير (a-z)", test: RULES.lowercase },
  { id: "number", label: "رقم واحد على الأقل", test: RULES.number },
  { id: "special", label: "رمز خاص (!@#$...)", test: RULES.special },
];

export function validatePassword(password) {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
}

export function isPasswordStrong(password) {
  return validatePassword(password).every((r) => r.passed);
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  const passed = validatePassword(password).filter((r) => r.passed).length;
  if (passed <= 2) return { score: 25, label: "ضعيفة", color: "#E11D48" };
  if (passed === 3) return { score: 50, label: "متوسطة", color: "#F59E0B" };
  if (passed === 4) return { score: 75, label: "جيدة", color: "#059669" };
  return { score: 100, label: "قوية", color: "#D4AF37" };
}

export function validateEmail(email) {
  if (!email.trim()) return "البريد الإلكتروني مطلوب.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "يرجى إدخال بريد إلكتروني صالح.";
  return null;
}
