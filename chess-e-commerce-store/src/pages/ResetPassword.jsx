import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { FaChessKing } from "react-icons/fa6";
import { resetPassword } from "../utils/authApi";
import {
  validatePassword,
  isPasswordStrong,
  getPasswordStrength,
} from "../utils/passwordValidation";
import "../styles/PasswordReset.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenFromUrl = searchParams.get("token") || searchParams.get("reset_token") || "";
  const emailFromUrl = searchParams.get("email") || "";

  const [email] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const passwordRules = useMemo(() => validatePassword(password), [password]);
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password && password === passwordConfirmation;
  const canSubmit = tokenFromUrl && email && isPasswordStrong(password) && passwordsMatch && !loading;

  useEffect(() => {
    if (!tokenFromUrl || !emailFromUrl) {
      setError("رابط إعادة التعيين غير صالح. يرجى طلب رابط جديد.");
    }
  }, [tokenFromUrl, emailFromUrl]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => navigate("/", { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!tokenFromUrl || !email) {
      setError("رابط إعادة التعيين غير صالح.");
      return;
    }
    if (!isPasswordStrong(password)) {
      setError("يرجى استيفاء جميع متطلبات كلمة المرور.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("كلمات المرور غير متطابقة.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        email: email.trim(),
        token: tokenFromUrl,
        password,
        passwordConfirmation,
      });
      setSuccess(result.message || "تم إعادة تعيين كلمة المرور بنجاح.");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      setError(err.message || "تعذر إعادة تعيين كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="beidaq-reset-page rtl" dir="rtl">
      <div className="beidaq-reset-card">
        <div className="beidaq-reset-logo">
          <FaChessKing />
        </div>

        <h1 className="beidaq-reset-title">إنشاء كلمة مرور جديدة</h1>
        <p className="beidaq-reset-subtitle">
          {email ? (
            <>لحساب: <strong dir="ltr">{email}</strong></>
          ) : (
            "أدخل كلمة المرور الجديدة لحسابك"
          )}
        </p>

        {success && (
          <div className="beidaq-reset-alert beidaq-reset-alert--success mb-3" role="status">
            <div className="d-flex align-items-center gap-2 flex-row-reverse justify-content-end">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
            <p className="mb-0 mt-2" style={{ fontSize: "0.78rem", opacity: 0.85 }}>
              سيتم تحويلك لتسجيل الدخول خلال ثوانٍ…
            </p>
          </div>
        )}

        {error && !success && (
          <div className="beidaq-reset-alert beidaq-reset-alert--error mb-3" role="alert">
            {error}
          </div>
        )}

        {!success && (
          <form className="beidaq-reset-form" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="beidaq-reset-label" htmlFor="reset-password">
                كلمة المرور الجديدة
              </label>
              <div className="beidaq-reset-input-wrap">
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  dir="ltr"
                  className="beidaq-reset-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !tokenFromUrl}
                />
                <button
                  type="button"
                  className="beidaq-reset-toggle-pw"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <div className="beidaq-reset-strength">
                  <div className="beidaq-reset-strength-bar">
                    <div
                      className="beidaq-reset-strength-fill"
                      style={{ width: `${strength.score}%`, background: strength.color }}
                    />
                  </div>
                  <div className="beidaq-reset-strength-label" style={{ color: strength.color }}>
                    قوة كلمة المرور: {strength.label}
                  </div>
                  <div className="beidaq-reset-rules">
                    {passwordRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`beidaq-reset-rule${rule.passed ? " beidaq-reset-rule--passed" : ""}`}
                      >
                        <span className="beidaq-reset-rule-dot" />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="beidaq-reset-label" htmlFor="reset-password-confirm">
                تأكيد كلمة المرور
              </label>
              <div className="beidaq-reset-input-wrap">
                <input
                  id="reset-password-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  dir="ltr"
                  className={`beidaq-reset-input${
                    passwordConfirmation && !passwordsMatch ? " beidaq-reset-input--error" : ""
                  }`}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  disabled={loading || !tokenFromUrl}
                />
                <button
                  type="button"
                  className="beidaq-reset-toggle-pw"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "إخفاء التأكيد" : "إظهار التأكيد"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordConfirmation && !passwordsMatch && (
                <p className="beidaq-reset-match-error">
                  كلمات المرور غير متطابقة
                </p>
              )}
            </div>

            <button type="submit" className="beidaq-reset-submit" disabled={!canSubmit}>
              {loading ? (
                <>
                  <span className="beidaq-reset-spinner" />
                  جاري الحفظ…
                </>
              ) : (
                "حفظ كلمة المرور الجديدة"
              )}
            </button>
          </form>
        )}

        <div className="text-center">
          {success ? (
            <Link to="/" className="beidaq-reset-back">
              <ArrowRight size={14} />
              الذهاب لتسجيل الدخول
            </Link>
          ) : (
            <Link to="/forgot-password" className="beidaq-reset-back">
              <ArrowRight size={14} />
              طلب رابط جديد
            </Link>
          )}
        </div>

        <p className="beidaq-reset-footer">© بيدق — Beidaq Chess Store</p>
      </div>
    </div>
  );
}
