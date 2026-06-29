import React, { useState, useEffect } from "react";
import { KeyRound, MapPin, Phone, History, Heart, Shield, Eye, CheckCircle2, Truck, RefreshCw, X, LogOut, ArrowLeft, Mail } from "lucide-react";
import { FaChessKing } from "react-icons/fa6";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { getPasswordResetParams, hasPasswordResetLink } from "../utils/authParams";
import { getProductTranslation } from "../utils/translations";
import "../styles/Auth.css";

export default function AccountPage({
  currentUser,
  onLoginSuccess,
  onLogout,
  orders,
  wishlist,
  onRemoveFromWishlist,
  onSelectProduct,
  onRefreshOrders,
  embedded = false,
}) {
  const resetParams = getPasswordResetParams();
  const showAuthForms = !currentUser || hasPasswordResetLink();
  const initialMode = resetParams.token && resetParams.email ? "reset" : "login";

  const [authMode, setAuthMode] = useState(initialMode);
  const [email, setEmail] = useState(resetParams.email || "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [resetToken, setResetToken] = useState(resetParams.token || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null);

  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (resetParams.token && resetParams.email) {
      setAuthMode("reset");
      setResetToken(resetParams.token);
      setEmail(resetParams.email);
    }
  }, []);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    clearMessages();

    try {
      if (authMode === "register") {
        if (!name.trim()) {
          setErrorMessage("الاسم مطلوب.");
          setLoading(false);
          return;
        }
        if (password !== passwordConfirmation) {
          setErrorMessage("كلمات المرور غير متطابقة.");
          setLoading(false);
          return;
        }
        const response = await api.register(name, email, password, passwordConfirmation, phone, address);
        showSuccess("تم إنشاء الحساب بنجاح.");
        onLoginSuccess(response.user);
      } else {
        const response = await api.login(email, password);
        onLoginSuccess(response.user);
      }
    } catch (err) {
      const msg = err.message || ("فشل التحقق.");
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    clearMessages();

    try {
      const result = await api.forgotPassword(email.trim());
      const msg = result.message || ("تحقق من بريدك الإلكتروني.");
      setSuccessMessage(msg);
      showSuccess(msg);
    } catch (err) {
      const msg = err.message || ("تعذر إرسال رابط إعادة التعيين.");
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !resetToken.trim() || !password.trim()) return;

    if (password !== passwordConfirmation) {
      setErrorMessage("كلمات المرور غير متطابقة.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const result = await api.resetPassword(email.trim(), resetToken.trim(), password, passwordConfirmation);
      const msg = result.message || ("تم إعادة تعيين كلمة المرور.");
      setSuccessMessage(msg);
      showSuccess(msg);
      setAuthMode("login");
      setPassword("");
      setPasswordConfirmation("");
      setResetToken("");
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err) {
      const msg = err.message || ("تعذر إعادة تعيين كلمة المرور.");
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const normalizeOrderStatus = (status, statusRaw) => {
    if (statusRaw) return String(statusRaw).toLowerCase();
    const map = {
      "قيد الانتظار": "pending",
      "قيد المعالجة": "processing",
      "تم الشحن": "shipped",
      "تم التوصيل": "delivered",
      "ملغى": "cancelled",
      Pending: "pending",
      Processing: "processing",
      Shipped: "shipped",
      Delivered: "delivered",
      Cancelled: "cancelled"
    };
    return map[status] || String(status || "pending").toLowerCase();
  };

  const getStatusStepClass = (order, stepKey) => {
    const sequence = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = sequence.indexOf(normalizeOrderStatus(order.status, order.statusRaw));
    const stepIndex = sequence.indexOf(String(stepKey).toLowerCase());
    if (currentIndex >= stepIndex) {
      return "bg-gold-custom text-charcoal-custom border-gold-custom";
    }
    return "bg-light text-muted border-secondary-subtle";
  };

  const statusLabel = (stepKey) => {
    const key = String(stepKey).toLowerCase();
    if (key === "delivered") return t("deliveredStatus");
    if (key === "shipped") return t("transitStatus");
    if (key === "processing") return t("packingStatus");
    return t("placedStatus");
  };

  if (showAuthForms) {
    const titles = {
      login: { title: t("accessAccount"), sub: t("loginSub"), icon: KeyRound },
      register: { title: t("createAccount"), sub: t("registerSub"), icon: KeyRound },
      forgot: { title: "نسيت كلمة المرور", sub: "أدخل بريدك لاستلام رابط إعادة التعيين", icon: Mail },
      reset: { title: "إعادة تعيين كلمة المرور", sub: "أدخل كلمة المرور الجديدة", icon: KeyRound },
    };
    const view = titles[authMode] || titles.login;
    const Icon = view.icon;
    const showTabs = authMode === "login" || authMode === "register";

    const authContent = (
      <div className={`beidaq-auth rtl${embedded ? " beidaq-auth--embedded" : ""}`} id="account-auth-container">
        <div className={embedded ? "" : "beidaq-auth__wrap"}>
          <div className="beidaq-auth-card">
            <header className="beidaq-auth-header">
              <div className="beidaq-auth-logo">
                {authMode === "forgot" || authMode === "reset" ? (
                  <Icon size={24} aria-hidden="true" />
                ) : (
                  <FaChessKing aria-hidden="true" />
                )}
              </div>
              <h2 className="beidaq-auth-title">{view.title}</h2>
              <p className="beidaq-auth-subtitle">{view.sub}</p>
            </header>

            {showTabs && (
              <div className="beidaq-auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "login"}
                  className={`beidaq-auth-tab${authMode === "login" ? " beidaq-auth-tab--active" : ""}`}
                  onClick={() => {
                    setAuthMode("login");
                    clearMessages();
                  }}
                >
                  {t("accessAccount")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "register"}
                  className={`beidaq-auth-tab${authMode === "register" ? " beidaq-auth-tab--active" : ""}`}
                  onClick={() => {
                    setAuthMode("register");
                    clearMessages();
                  }}
                >
                  {t("createAccount")}
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="beidaq-auth-alert beidaq-auth-alert--error">
                <X size={15} aria-hidden="true" />
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="beidaq-auth-alert beidaq-auth-alert--success">
                <CheckCircle2 size={15} aria-hidden="true" />
                {successMessage}
              </div>
            )}

            {(authMode === "login" || authMode === "register") && (
              <form onSubmit={handleAuthSubmit} className="beidaq-auth-form">
                {authMode === "register" && (
                  <div className="beidaq-auth-field">
                    <label className="beidaq-auth-label" htmlFor="auth-name">{t("yourFullName")}</label>
                    <input
                      id="auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="beidaq-auth-input"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                )}
                <div className="beidaq-auth-field">
                  <label className="beidaq-auth-label" htmlFor="auth-email">{t("emailAddress")}</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="beidaq-auth-input"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                <div className="beidaq-auth-field">
                  <label className="beidaq-auth-label" htmlFor="auth-password">كلمة المرور</label>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="beidaq-auth-input"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
                {authMode === "register" && (
                  <>
                    <div className="beidaq-auth-field">
                      <label className="beidaq-auth-label" htmlFor="auth-password-confirm">تأكيد كلمة المرور</label>
                      <input
                        id="auth-password-confirm"
                        type="password"
                        required
                        minLength={8}
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="beidaq-auth-input"
                        placeholder="••••••••"
                        dir="ltr"
                      />
                    </div>
                    <div className="beidaq-auth-field">
                      <label className="beidaq-auth-label" htmlFor="auth-phone">{t("phoneOptional")}</label>
                      <input
                        id="auth-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="beidaq-auth-input"
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                      />
                    </div>
                    <div className="beidaq-auth-field">
                      <label className="beidaq-auth-label" htmlFor="auth-address">{t("addressOptional")}</label>
                      <input
                        id="auth-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="beidaq-auth-input"
                        placeholder="الرياض، المملكة العربية السعودية"
                      />
                    </div>
                  </>
                )}
                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("forgot");
                      clearMessages();
                    }}
                    className="beidaq-auth-forgot"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
                <button type="submit" disabled={loading} className="beidaq-auth-submit">
                  {loading ? t("authenticating") : authMode === "register" ? t("createCredentials") : t("enterDashboard")}
                </button>
              </form>
            )}

            {authMode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="beidaq-auth-form">
                <div className="beidaq-auth-field">
                  <label className="beidaq-auth-label" htmlFor="forgot-email">{t("emailAddress")}</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="beidaq-auth-input"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                <button type="submit" disabled={loading} className="beidaq-auth-submit">
                  {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    clearMessages();
                  }}
                  className="beidaq-auth-back"
                >
                  <ArrowLeft size={14} className="rotate-180" />
                  العودة لتسجيل الدخول
                </button>
              </form>
            )}

            {authMode === "reset" && (
              <form onSubmit={handleResetSubmit} className="beidaq-auth-form">
                <div className="beidaq-auth-field">
                  <label className="beidaq-auth-label" htmlFor="reset-email">{t("emailAddress")}</label>
                  <input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="beidaq-auth-input" dir="ltr" />
                </div>
                <div className="beidaq-auth-field">
                  <label className="beidaq-auth-label" htmlFor="reset-token">رمز إعادة التعيين</label>
                  <input id="reset-token" type="text" required value={resetToken} onChange={(e) => setResetToken(e.target.value)} className="beidaq-auth-input" dir="ltr" />
                </div>
                <div className="beidaq-auth-field">
                  <label className="beidaq-auth-label" htmlFor="reset-password">كلمة المرور الجديدة</label>
                  <input id="reset-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="beidaq-auth-input" dir="ltr" />
                </div>
                <div className="beidaq-auth-field">
                  <label className="beidaq-auth-label" htmlFor="reset-password-confirm">تأكيد كلمة المرور</label>
                  <input id="reset-password-confirm" type="password" required minLength={8} value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="beidaq-auth-input" dir="ltr" />
                </div>
                <button type="submit" disabled={loading} className="beidaq-auth-submit">
                  {loading ? "جاري الحفظ..." : "إعادة تعيين كلمة المرور"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    clearMessages();
                  }}
                  className="beidaq-auth-back"
                >
                  <ArrowLeft size={14} className="rotate-180" />
                  العودة لتسجيل الدخول
                </button>
              </form>
            )}

            {authMode === "login" && (
              <div className="beidaq-auth-demo">
                <span className="beidaq-auth-demo-title">{t("demoLogin")}</span>
                <span className="beidaq-auth-demo-text">test@example.com / password</span>
              </div>
            )}

            {showTabs && (
              <div className="beidaq-auth-switch">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "register" ? "login" : "register");
                    clearMessages();
                  }}
                  className="beidaq-auth-switch-btn"
                >
                  {authMode === "register" ? t("alreadyHaveAcc") : t("firstTimeAcc")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (embedded) return authContent;

    return <div className="beidaq-auth-page">{authContent}</div>;
  }

  return (
    <div className={`container py-5 ${"text-end"}`} id="account-page-layout">
      <div className="card rounded-0 p-4 border-custom bg-white mb-4 shadow-sm">
        <div className={`d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 ${"flex-row-reverse"}`}>
          <div className={`d-flex align-items-center gap-3 flex-column flex-sm-row text-center text-sm-start ${"flex-row-reverse text-end"}`}>
            <div className="d-flex align-items-center justify-content-center bg-gold-custom text-charcoal-custom fw-bold rounded-circle shadow-md font-serif-custom" style={{ width: "64px", height: "64px", fontSize: "1.5rem" }}>
              {currentUser.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">
                {t("greetings").replace("{name}", currentUser.name)}
              </h3>
              <p className="text-muted font-mono-custom m-0 mt-1" style={{ fontSize: "11px" }}>
                {"الرتبة:"}{" "}
                <span className="text-gold-custom fw-bold text-uppercase">{currentUser.role === "admin" ? t("adminPanel") : t("member")}</span>
                {currentUser.joinedDate && ` | ${t("joinedOn")} ${currentUser.joinedDate}`}
              </p>
            </div>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="btn btn-logout d-flex align-items-center gap-2">
              <LogOut size={14} />
              {t("signOut")}
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8 d-flex flex-column gap-3">
          <div className="card rounded-0 p-4 border-custom bg-white">
            <div className={`d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 ${"flex-row-reverse"}`}>
              <h5 className={`font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0 d-flex align-items-center gap-2 ${"flex-row-reverse"}`}>
                <History size={18} className="text-gold-custom" />
                <span>{t("orderHistory").replace("{amount}", String(orders.length))}</span>
              </h5>
              <button onClick={onRefreshOrders} className="btn btn-link text-secondary p-0" title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-5 text-center text-muted italic font-sans" style={{ fontSize: "12px" }}>
                {"لا توجد طلبات بعد."}
              </div>
            ) : (
              <div className="d-grid gap-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-3 bg-light border border-custom text-start rounded-0">
                    <div className="row g-2 mb-3">
                      <div className="col-sm-3 col-6">
                        <span className="text-muted font-mono-custom text-uppercase d-block" style={{ fontSize: "9px" }}>{t("orderId")}</span>
                        <span className="font-mono-custom fw-bold text-charcoal-custom d-block" style={{ fontSize: "11px" }}>#{o.id}</span>
                      </div>
                      <div className="col-sm-3 col-6">
                        <span className="text-muted font-mono-custom text-uppercase d-block" style={{ fontSize: "9px" }}>{"التاريخ"}</span>
                        <span className="font-mono-custom text-secondary d-block" style={{ fontSize: "11px" }}>{new Date(o.date || o.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="col-sm-3 col-6">
                        <span className="text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{"الحالة"}</span>
                        <span className={`badge border px-2.5 py-1 font-mono-custom fw-bold text-uppercase ${
                          normalizeOrderStatus(o.status, o.statusRaw) === "delivered" ? "bg-success-subtle border-success text-success" :
                          normalizeOrderStatus(o.status, o.statusRaw) === "shipped" ? "bg-info-subtle border-info text-info" :
                          normalizeOrderStatus(o.status, o.statusRaw) === "processing" ? "bg-warning-subtle border-warning text-warning-emphasis" :
                          "bg-danger-subtle border-danger text-danger"
                        }`} style={{ fontSize: "9px" }}>{o.status}</span>
                      </div>
                      <div className="col-sm-3 col-6 text-sm-end">
                        <span className="text-muted font-mono-custom text-uppercase d-block" style={{ fontSize: "9px" }}>{"المبلغ"}</span>
                        <span className="font-mono-custom fw-bold text-gold-custom d-block" style={{ fontSize: "11px" }}>${Number(o.total).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className={`border-top border-bottom py-2.5 mb-3 d-flex flex-wrap gap-2 ${"flex-row-reverse"}`}>
                      {o.items.map((item, idx) => (
                        <div key={idx} className={`d-flex align-items-center gap-2 bg-white border border-custom px-2.5 py-1 rounded-0 ${"flex-row-reverse"}`}>
                          {item.image && <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="object-fit-cover rounded-0 bg-white" style={{ width: "24px", height: "24px" }} />}
                          <span className="text-secondary truncate font-serif-custom" style={{ fontSize: "10px", maxWidth: "120px" }}>{item.name}</span>
                          <span className="text-muted font-mono-custom" style={{ fontSize: "9px" }}>&times;{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`d-flex justify-content-between align-items-center ${"flex-row-reverse"}`}>
                      <span className="font-mono-custom text-muted" style={{ fontSize: "11px" }}>
                        {"التتبع:"} <strong className="text-charcoal-custom">{o.trackingNumber}</strong>
                      </span>
                      <button onClick={() => setTrackingOrder(trackingOrder?.id === o.id ? null : o)} className="btn btn-link text-decoration-none text-gold-custom font-mono-custom text-uppercase p-0 d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                        <Eye size={12} />
                        <span>{trackingOrder?.id === o.id ? t("hideDetails") : t("trackDispatch")}</span>
                      </button>
                    </div>

                    {trackingOrder?.id === o.id && (
                      <div className="mt-4 pt-4 border-top bg-white p-3 border border-custom text-center">
                        <h6 className="font-mono-custom fw-bold text-gold-custom text-uppercase mb-4">{t("orderDispatchStatus")}</h6>
                        <div className={`row g-2 justify-content-center ${"flex-row-reverse"}`}>
                          {["pending", "processing", "shipped", "delivered"].map((step, i) => (
                            <div className="col-3 d-flex flex-column align-items-center" key={step}>
                              <div className={`d-flex align-items-center justify-content-center border rounded-circle fw-bold font-mono-custom ${getStatusStepClass(o, step)}`} style={{ width: "32px", height: "32px", fontSize: "11px" }}>{i + 1}</div>
                              <span className="fw-bold text-charcoal-custom mt-2 d-block" style={{ fontSize: "10px" }}>{statusLabel(step)}</span>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-4 p-2 bg-light border border-custom d-flex gap-2 align-items-center justify-content-center flex-row-reverse text-end`}>
                          {normalizeOrderStatus(o.status, o.statusRaw) === "delivered" ? (
                            <><CheckCircle2 size={16} className="text-success shrink-0" /><p className="text-secondary m-0" style={{ fontSize: "11px" }}>{t("deliveredDesc")}</p></>
                          ) : (
                            <><Truck size={16} className="text-gold-custom shrink-0" /><p className="text-secondary m-0" style={{ fontSize: "11px" }}>{t("transitDesc")}</p></>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column gap-3">
          <div className="card rounded-0 p-4 border-custom bg-white">
            <h6 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase border-bottom pb-2 mb-3">{t("shippingCoordinates")}</h6>
            <div className="d-grid gap-2.5 text-start">
              <div className={`d-flex align-items-center gap-2 text-secondary font-sans ${"flex-row-reverse"}`} style={{ fontSize: "12px" }}>
                <MapPin size={14} className="text-gold-custom shrink-0" />
                <span className="text-truncate">{currentUser.address || t("noAddressSaved")}</span>
              </div>
              <div className={`d-flex align-items-center gap-2 text-secondary font-mono-custom ${"flex-row-reverse"}`} style={{ fontSize: "12px" }}>
                <Phone size={14} className="text-gold-custom shrink-0" />
                <span>{currentUser.phone || t("noPhoneSaved")}</span>
              </div>
              <div className={`d-flex align-items-center gap-2 text-success fw-bold font-mono-custom ${"flex-row-reverse"}`} style={{ fontSize: "11px" }}>
                <Shield size={14} className="shrink-0" />
                <span>{t("profileActive")}</span>
              </div>
            </div>
          </div>

          <div className="card rounded-0 p-4 border-custom bg-white">
            <div className={`d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 ${"flex-row-reverse"}`}>
              <h6 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("myWishlist")}</h6>
              <span className="badge bg-danger text-white rounded-circle font-mono-custom fw-bold" style={{ fontSize: "10px", padding: "4px 8px" }}>{wishlist.length}</span>
            </div>
            {wishlist.length === 0 ? (
              <p className="text-muted italic text-center py-3 m-0" style={{ fontSize: "11px" }}>{t("wishlistEmptyAcc")}</p>
            ) : (
              <div className="d-grid gap-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                {wishlist.map((p) => {
                  const translatedP = getProductTranslation(p);
                  return (
                    <div key={translatedP.id} onClick={() => onSelectProduct(p)} className={`d-flex gap-2.5 align-items-center bg-light p-2 border border-custom cursor-pointer ${"flex-row-reverse text-end"}`}>
                      <img src={translatedP.images?.[0] || ""} alt={translatedP.name} referrerPolicy="no-referrer" className="object-fit-cover bg-white" style={{ width: "36px", height: "36px" }} />
                      <div className="flex-grow-1 min-w-0">
                        <p className="font-serif-custom fw-bold text-charcoal-custom text-truncate m-0 text-uppercase" style={{ fontSize: "11px" }}>{translatedP.name}</p>
                        <p className="text-gold-custom font-mono-custom m-0" style={{ fontSize: "10px" }}>${translatedP.price.toFixed(2)}</p>
                      </div>
                      <button onClick={(e) => onRemoveFromWishlist(translatedP.id, e)} className="btn btn-outline-danger border-0 p-1" title={t("removeProduct")}>
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
