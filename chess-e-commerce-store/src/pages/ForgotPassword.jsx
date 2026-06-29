import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import { FaChessKing } from "react-icons/fa6";
import { requestPasswordReset } from "../utils/authApi";
import { validateEmail } from "../utils/passwordValidation";
import "../styles/PasswordReset.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }
    setFieldError("");

    setLoading(true);
    try {
      const result = await requestPasswordReset(email.trim());
      setSuccess(result.message || "إذا كان البريد مسجلاً لدينا، فقد أُرسل رابط إعادة تعيين كلمة المرور.");
      setEmail("");
    } catch (err) {
      setError(err.message || "تعذر إرسال الرابط. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="beidaq-reset-page rtl" dir="rtl">
      <div className="beidaq-reset-card">
        <div className="beidaq-reset-icon-wrap">
          <KeyRound size={32} strokeWidth={1.5} />
        </div>

        <div className="beidaq-reset-logo">
          <FaChessKing />
        </div>

        <h1 className="beidaq-reset-title">نسيت كلمة المرور؟</h1>
        <p className="beidaq-reset-subtitle">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.
        </p>

        {success && (
          <div className="beidaq-reset-alert beidaq-reset-alert--success mb-3" role="status">
            {success}
          </div>
        )}

        {error && (
          <div className="beidaq-reset-alert beidaq-reset-alert--error mb-3" role="alert">
            {error}
          </div>
        )}

        <form className="beidaq-reset-form" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="beidaq-reset-label" htmlFor="forgot-email">
              البريد الإلكتروني
            </label>
            <div className="beidaq-reset-input-wrap">
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                dir="ltr"
                className={`beidaq-reset-input${fieldError ? " beidaq-reset-input--error" : ""}`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError("");
                }}
                disabled={loading}
              />
              <Mail size={16} className="beidaq-reset-input-icon" />
            </div>
            {fieldError && (
              <p className="beidaq-reset-alert beidaq-reset-alert--error beidaq-reset-alert--error-sm">
                {fieldError}
              </p>
            )}
          </div>

          <button type="submit" className="beidaq-reset-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="beidaq-reset-spinner" />
                جاري الإرسال…
              </>
            ) : (
              <>
                إرسال الرابط
                <ArrowRight size={16} className="rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <Link to="/" className="beidaq-reset-back">
            <ArrowRight size={14} />
            العودة لتسجيل الدخول
          </Link>
        </div>

        <p className="beidaq-reset-footer">© بيدق — Beidaq Chess Store</p>
      </div>
    </div>
  );
}
