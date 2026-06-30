import React, { useState } from "react";
import { KeyRound, MapPin, Phone, History, Heart, Shield, Eye, CheckCircle2, Truck, RefreshCw, X, LogOut } from "lucide-react";
import { FaChessKing } from "react-icons/fa6";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { getProductTranslation } from "../utils/translations";
import "../styles/Auth.css";
import "../styles/UserPages.css";

const formatSAR = (amount) =>
  `${Number(amount).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

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
  const showAuthForms = !currentUser;
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null);

  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

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

  const getStatusBadgeClass = (order) => {
    const status = normalizeOrderStatus(order.status, order.statusRaw);
    if (status === "delivered") return "beidaq-order-status--delivered";
    if (status === "shipped") return "beidaq-order-status--shipped";
    if (status === "processing") return "beidaq-order-status--processing";
    return "beidaq-order-status--pending";
  };

  const isTrackingStepActive = (order, stepKey) => {
    const sequence = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = sequence.indexOf(normalizeOrderStatus(order.status, order.statusRaw));
    const stepIndex = sequence.indexOf(String(stepKey).toLowerCase());
    return currentIndex >= stepIndex;
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
    };
    const view = titles[authMode] || titles.login;
    const showTabs = authMode === "login" || authMode === "register";

    const authContent = (
      <div className={`beidaq-auth rtl${embedded ? " beidaq-auth--embedded" : ""}`} id="account-auth-container">
        <div className={embedded ? "" : "beidaq-auth__wrap"}>
          <div className="beidaq-auth-card">
            <header className="beidaq-auth-header">
              <div className="beidaq-auth-logo">
                <FaChessKing aria-hidden="true" />
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
                <button type="submit" disabled={loading} className="beidaq-auth-submit">
                  {loading ? t("authenticating") : authMode === "register" ? t("createCredentials") : t("enterDashboard")}
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
    <section className="beidaq-page rtl" id="account-page-layout">
      <div className="container">
        <div className="beidaq-panel mb-4">
          <div className="beidaq-account-profile">
            <div className="beidaq-account-profile__info">
              <div className="beidaq-account-avatar">{currentUser.name[0].toUpperCase()}</div>
              <div>
                <h1 className="beidaq-account-name">
                  {t("greetings").replace("{name}", currentUser.name)}
                </h1>
                <p className="beidaq-account-meta">
                  الرتبة: <strong>{currentUser.role === "admin" ? t("adminPanel") : t("member")}</strong>
                  {currentUser.joinedDate && ` · ${t("joinedOn")} ${currentUser.joinedDate}`}
                </p>
              </div>
            </div>
            {onLogout && (
              <button type="button" onClick={onLogout} className="beidaq-btn-outline">
                <LogOut size={14} />
                {t("signOut")}
              </button>
            )}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8 d-flex flex-column gap-4">
            <div className="beidaq-panel">
              <div className="beidaq-panel__head">
                <h2 className="beidaq-panel__title">
                  <History size={18} />
                  <span>{t("orderHistory").replace("{amount}", String(orders.length))}</span>
                </h2>
                <button type="button" onClick={onRefreshOrders} className="beidaq-panel__action" title="تحديث">
                  <RefreshCw size={14} />
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-center py-4 mb-0" style={{ fontFamily: "Tajawal", color: "#737373", fontSize: "0.9rem" }}>
                  لا توجد طلبات بعد.
                </p>
              ) : (
                <div className="d-grid gap-3">
                  {orders.map((o) => (
                    <article key={o.id} className="beidaq-order-card text-end">
                      <div className="row g-3 mb-3">
                        <div className="col-sm-3 col-6">
                          <span className="beidaq-order-label">{t("orderId")}</span>
                          <span className="beidaq-order-value">#{o.id}</span>
                        </div>
                        <div className="col-sm-3 col-6">
                          <span className="beidaq-order-label">التاريخ</span>
                          <span className="beidaq-order-value" style={{ fontWeight: 500, color: "#737373" }}>
                            {new Date(o.date || o.created_at).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                        <div className="col-sm-3 col-6">
                          <span className="beidaq-order-label">الحالة</span>
                          <span className={`beidaq-order-status ${getStatusBadgeClass(o)}`}>{o.status}</span>
                        </div>
                        <div className="col-sm-3 col-6">
                          <span className="beidaq-order-label">المبلغ</span>
                          <span className="beidaq-order-value beidaq-order-price">
                            {formatSAR(Number(o.total))}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mb-3 flex-row-reverse">
                        {o.items.map((item, idx) => (
                          <span key={idx} className="beidaq-order-item-chip">
                            {item.image && (
                              <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                            )}
                            <span>{item.name}</span>
                            <span>&times;{item.quantity}</span>
                          </span>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between align-items-center flex-row-reverse">
                        <span style={{ fontFamily: "Tajawal", fontSize: "0.82rem", color: "#737373" }}>
                          التتبع: <strong style={{ color: "#121212" }}>{o.trackingNumber}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setTrackingOrder(trackingOrder?.id === o.id ? null : o)}
                          className="beidaq-order-track-btn"
                        >
                          <Eye size={13} />
                          <span>{trackingOrder?.id === o.id ? t("hideDetails") : t("trackDispatch")}</span>
                        </button>
                      </div>

                      {trackingOrder?.id === o.id && (
                        <div className="beidaq-tracking-panel">
                          <h3 className="beidaq-tracking-title">{t("orderDispatchStatus")}</h3>
                          <div className="row g-2 justify-content-center flex-row-reverse">
                            {["pending", "processing", "shipped", "delivered"].map((step, i) => (
                              <div className="col-3 beidaq-tracking-step" key={step}>
                                <div
                                  className={`beidaq-tracking-dot${
                                    isTrackingStepActive(o, step) ? " beidaq-tracking-dot--active" : ""
                                  }`}
                                >
                                  {i + 1}
                                </div>
                                <span className="beidaq-tracking-label">{statusLabel(step)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 d-flex gap-2 align-items-center justify-content-center flex-row-reverse text-end" style={{ background: "#F8F7F4", borderRadius: "12px" }}>
                            {normalizeOrderStatus(o.status, o.statusRaw) === "delivered" ? (
                              <>
                                <CheckCircle2 size={16} className="text-success shrink-0" />
                                <p className="m-0" style={{ fontFamily: "Tajawal", fontSize: "0.82rem", color: "#737373" }}>
                                  {t("deliveredDesc")}
                                </p>
                              </>
                            ) : (
                              <>
                                <Truck size={16} style={{ color: "#B8962E" }} className="shrink-0" />
                                <p className="m-0" style={{ fontFamily: "Tajawal", fontSize: "0.82rem", color: "#737373" }}>
                                  {t("transitDesc")}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4 d-flex flex-column gap-4">
            <div className="beidaq-panel">
              <h2 className="beidaq-panel__title mb-3 pb-3" style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
                <MapPin size={18} />
                <span>{t("shippingCoordinates")}</span>
              </h2>
              <div className="d-grid gap-3">
                <div className="beidaq-info-row">
                  <MapPin size={15} />
                  <span className="text-truncate">{currentUser.address || t("noAddressSaved")}</span>
                </div>
                <div className="beidaq-info-row">
                  <Phone size={15} />
                  <span>{currentUser.phone || t("noPhoneSaved")}</span>
                </div>
                <div className="beidaq-info-row beidaq-info-row--success">
                  <Shield size={15} />
                  <span>{t("profileActive")}</span>
                </div>
              </div>
            </div>

            <div className="beidaq-panel">
              <div className="beidaq-panel__head" style={{ marginBottom: "1rem" }}>
                <h2 className="beidaq-panel__title">
                  <Heart size={18} />
                  <span>{t("myWishlist")}</span>
                </h2>
                <span className="beidaq-wishlist-mini-count">{wishlist.length}</span>
              </div>
              {wishlist.length === 0 ? (
                <p className="text-center py-3 m-0" style={{ fontFamily: "Tajawal", fontSize: "0.85rem", color: "#737373" }}>
                  {t("wishlistEmptyAcc")}
                </p>
              ) : (
                <div className="d-grid gap-2" style={{ maxHeight: "360px", overflowY: "auto" }}>
                  {wishlist.map((p) => {
                    const translatedP = getProductTranslation(p);
                    return (
                      <div
                        key={translatedP.id}
                        onClick={() => onSelectProduct(p)}
                        className="beidaq-wishlist-mini-item"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && onSelectProduct(p)}
                      >
                        <img
                          src={translatedP.images?.[0] || ""}
                          alt={translatedP.name}
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow-1 min-w-0">
                          <p className="beidaq-wishlist-mini-name">{translatedP.name}</p>
                          <p className="beidaq-wishlist-mini-price">{formatSAR(translatedP.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => onRemoveFromWishlist(translatedP.id, e)}
                          className="beidaq-wishlist-mini-remove"
                          title={t("removeProduct")}
                          aria-label={t("removeProduct")}
                        >
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
    </section>
  );
}
