import React, { useState } from "react";
import { KeyRound, MapPin, Phone, History, Heart, Shield, Eye, CheckCircle2, Truck, RefreshCw, X, LogOut } from "lucide-react";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";

export default function AccountPage({
  currentUser,
  onLoginSuccess,
  onLogout,
  orders,
  wishlist,
  onRemoveFromWishlist,
  onSelectProduct,
  onRefreshOrders
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null);

  const { lang, t } = useLanguage();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMessage(lang === "ar" ? "الاسم مطلوب." : "Name is required.");
          setLoading(false);
          return;
        }
        if (password !== passwordConfirmation) {
          setErrorMessage(lang === "ar" ? "كلمات المرور غير متطابقة." : "Passwords do not match.");
          setLoading(false);
          return;
        }
        const response = await api.register(name, email, password, passwordConfirmation, phone, address);
        onLoginSuccess(response.user);
      } else {
        const response = await api.login(email, password);
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setErrorMessage(err.message || (lang === "ar" ? "فشل التحقق." : "Authentication failed."));
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepClass = (currentStatus, stepStatus) => {
    const sequence = ["Pending", "Processing", "Shipped", "Delivered"];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(stepStatus);
    if (currentIndex >= stepIndex) {
      return "bg-gold-custom text-charcoal-custom border-gold-custom";
    }
    return "bg-light text-muted border-secondary-subtle";
  };

  const statusLabel = (status) => {
    if (status === "Delivered") return t("deliveredStatus");
    if (status === "Shipped") return t("transitStatus");
    if (status === "Processing") return t("packingStatus");
    return t("placedStatus");
  };

  if (!currentUser) {
    return (
      <div className="container py-5" id="account-auth-container" style={{ maxWidth: "450px" }}>
        <div className={`card rounded-0 p-4 border-custom bg-white shadow-lg position-relative ${lang === "ar" ? "rtl" : "ltr"}`}>
          <div className="position-absolute top-0 start-0 w-100 bg-gold-custom" style={{ height: "4px" }} />
          <div className="text-center mb-4">
            <div className="d-flex align-items-center justify-content-center bg-light border border-custom rounded-3 mb-3 mx-auto text-gold-custom shadow-sm" style={{ width: "64px", height: "64px" }}>
              <KeyRound size={28} />
            </div>
            <h4 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">
              {isRegister ? t("createAccount") : t("accessAccount")}
            </h4>
            <p className="text-muted font-mono-custom m-0 mt-1" style={{ fontSize: "11px" }}>
              {isRegister ? t("registerSub") : t("loginSub")}
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger p-2 mb-3 text-center font-sans" style={{ fontSize: "11px" }}>{errorMessage}</div>
          )}

          <form onSubmit={handleAuthSubmit} className="d-grid gap-3">
            {isRegister && (
              <div>
                <label className="form-label text-muted font-mono-custom text-uppercase mb-1" style={{ fontSize: "9px" }}>{t("yourFullName")}</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="form-control rounded-0 font-sans" style={{ fontSize: "12px" }} />
              </div>
            )}
            <div>
              <label className="form-label text-muted font-mono-custom text-uppercase mb-1" style={{ fontSize: "9px" }}>{t("emailAddress")}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="form-control rounded-0 font-mono-custom" style={{ fontSize: "12px" }} />
            </div>
            <div>
              <label className="form-label text-muted font-mono-custom text-uppercase mb-1" style={{ fontSize: "9px" }}>{lang === "ar" ? "كلمة المرور" : "Password"}</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="form-control rounded-0 font-mono-custom" style={{ fontSize: "12px" }} />
            </div>
            {isRegister && (
              <>
                <div>
                  <label className="form-label text-muted font-mono-custom text-uppercase mb-1" style={{ fontSize: "9px" }}>{lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                  <input type="password" required minLength={8} value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="form-control rounded-0 font-mono-custom" style={{ fontSize: "12px" }} />
                </div>
                <div>
                  <label className="form-label text-muted font-mono-custom text-uppercase mb-1" style={{ fontSize: "9px" }}>{t("phoneOptional")}</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-control rounded-0 font-sans" style={{ fontSize: "12px" }} />
                </div>
                <div>
                  <label className="form-label text-muted font-mono-custom text-uppercase mb-1" style={{ fontSize: "9px" }}>{t("addressOptional")}</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="form-control rounded-0 font-sans" style={{ fontSize: "12px" }} />
                </div>
              </>
            )}
            <button type="submit" disabled={loading} className="btn btn-gold-custom w-100 py-2.5 text-uppercase fw-bold font-mono-custom" style={{ fontSize: "11px", letterSpacing: "1px" }}>
              {loading ? t("authenticating") : isRegister ? t("createCredentials") : t("enterDashboard")}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-3 p-2.5 bg-light border border-custom text-center rounded-0 font-mono-custom" style={{ fontSize: "9px" }}>
              <span className="text-gold-custom d-block fw-bold mb-1">{t("demoLogin")}</span>
              <span className="text-secondary">test@example.com / password</span>
              <br />
              <span className="text-secondary">admin@example.com / password</span>
            </div>
          )}

          <div className="mt-4 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setErrorMessage(""); }} className="btn btn-link text-decoration-none text-muted font-mono-custom p-0" style={{ fontSize: "11px" }}>
              {isRegister ? t("alreadyHaveAcc") : t("firstTimeAcc")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container py-5 ${lang === "ar" ? "text-end" : "text-start"}`} id="account-page-layout">
      <div className="card rounded-0 p-4 border-custom bg-white mb-4 shadow-sm">
        <div className={`d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
          <div className={`d-flex align-items-center gap-3 flex-column flex-sm-row text-center text-sm-start ${lang === "ar" ? "flex-row-reverse text-end" : ""}`}>
            <div className="d-flex align-items-center justify-content-center bg-gold-custom text-charcoal-custom fw-bold rounded-circle shadow-md font-serif-custom" style={{ width: "64px", height: "64px", fontSize: "1.5rem" }}>
              {currentUser.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">
                {t("greetings").replace("{name}", currentUser.name)}
              </h3>
              <p className="text-muted font-mono-custom m-0 mt-1" style={{ fontSize: "11px" }}>
                {lang === "ar" ? "الرتبة:" : "Role:"}{" "}
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
            <div className={`d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
              <h5 className={`font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0 d-flex align-items-center gap-2 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                <History size={18} className="text-gold-custom" />
                <span>{t("orderHistory").replace("{amount}", String(orders.length))}</span>
              </h5>
              <button onClick={onRefreshOrders} className="btn btn-link text-secondary p-0" title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-5 text-center text-muted italic font-sans" style={{ fontSize: "12px" }}>
                {lang === "ar" ? "لا توجد طلبات بعد." : "You have no orders yet."}
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
                        <span className="text-muted font-mono-custom text-uppercase d-block" style={{ fontSize: "9px" }}>{lang === "ar" ? "التاريخ" : "Date"}</span>
                        <span className="font-mono-custom text-secondary d-block" style={{ fontSize: "11px" }}>{new Date(o.date || o.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="col-sm-3 col-6">
                        <span className="text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{lang === "ar" ? "الحالة" : "Status"}</span>
                        <span className={`badge border px-2.5 py-1 font-mono-custom fw-bold text-uppercase ${
                          o.status === "Delivered" ? "bg-success-subtle border-success text-success" :
                          o.status === "Shipped" ? "bg-info-subtle border-info text-info" :
                          o.status === "Processing" ? "bg-warning-subtle border-warning text-warning-emphasis" :
                          "bg-danger-subtle border-danger text-danger"
                        }`} style={{ fontSize: "9px" }}>{statusLabel(o.status)}</span>
                      </div>
                      <div className="col-sm-3 col-6 text-sm-end">
                        <span className="text-muted font-mono-custom text-uppercase d-block" style={{ fontSize: "9px" }}>{lang === "ar" ? "المبلغ" : "Total"}</span>
                        <span className="font-mono-custom fw-bold text-gold-custom d-block" style={{ fontSize: "11px" }}>${Number(o.total).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className={`border-top border-bottom py-2.5 mb-3 d-flex flex-wrap gap-2 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                      {o.items.map((item, idx) => (
                        <div key={idx} className={`d-flex align-items-center gap-2 bg-white border border-custom px-2.5 py-1 rounded-0 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                          {item.image && <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="object-fit-cover rounded-0 bg-white" style={{ width: "24px", height: "24px" }} />}
                          <span className="text-secondary truncate font-serif-custom" style={{ fontSize: "10px", maxWidth: "120px" }}>{item.name}</span>
                          <span className="text-muted font-mono-custom" style={{ fontSize: "9px" }}>&times;{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`d-flex justify-content-between align-items-center ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                      <span className="font-mono-custom text-muted" style={{ fontSize: "11px" }}>
                        {lang === "ar" ? "التتبع:" : "Tracking:"} <strong className="text-charcoal-custom">{o.trackingNumber}</strong>
                      </span>
                      <button onClick={() => setTrackingOrder(trackingOrder?.id === o.id ? null : o)} className="btn btn-link text-decoration-none text-gold-custom font-mono-custom text-uppercase p-0 d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                        <Eye size={12} />
                        <span>{trackingOrder?.id === o.id ? t("hideDetails") : t("trackDispatch")}</span>
                      </button>
                    </div>

                    {trackingOrder?.id === o.id && (
                      <div className="mt-4 pt-4 border-top bg-white p-3 border border-custom text-center">
                        <h6 className="font-mono-custom fw-bold text-gold-custom text-uppercase mb-4">{t("orderDispatchStatus")}</h6>
                        <div className={`row g-2 justify-content-center ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                          {["Pending", "Processing", "Shipped", "Delivered"].map((step, i) => (
                            <div className="col-3 d-flex flex-column align-items-center" key={step}>
                              <div className={`d-flex align-items-center justify-content-center border rounded-circle fw-bold font-mono-custom ${getStatusStepClass(o.status, step)}`} style={{ width: "32px", height: "32px", fontSize: "11px" }}>{i + 1}</div>
                              <span className="fw-bold text-charcoal-custom mt-2 d-block" style={{ fontSize: "10px" }}>{statusLabel(step)}</span>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-4 p-2 bg-light border border-custom d-flex gap-2 align-items-center justify-content-center ${lang === "ar" ? "flex-row-reverse text-end" : ""}`}>
                          {o.status === "Delivered" ? (
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
              <div className={`d-flex align-items-center gap-2 text-secondary font-sans ${lang === "ar" ? "flex-row-reverse" : ""}`} style={{ fontSize: "12px" }}>
                <MapPin size={14} className="text-gold-custom shrink-0" />
                <span className="text-truncate">{currentUser.address || t("noAddressSaved")}</span>
              </div>
              <div className={`d-flex align-items-center gap-2 text-secondary font-mono-custom ${lang === "ar" ? "flex-row-reverse" : ""}`} style={{ fontSize: "12px" }}>
                <Phone size={14} className="text-gold-custom shrink-0" />
                <span>{currentUser.phone || t("noPhoneSaved")}</span>
              </div>
              <div className={`d-flex align-items-center gap-2 text-success fw-bold font-mono-custom ${lang === "ar" ? "flex-row-reverse" : ""}`} style={{ fontSize: "11px" }}>
                <Shield size={14} className="shrink-0" />
                <span>{t("profileActive")}</span>
              </div>
            </div>
          </div>

          <div className="card rounded-0 p-4 border-custom bg-white">
            <div className={`d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
              <h6 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("myWishlist")}</h6>
              <span className="badge bg-danger text-white rounded-circle font-mono-custom fw-bold" style={{ fontSize: "10px", padding: "4px 8px" }}>{wishlist.length}</span>
            </div>
            {wishlist.length === 0 ? (
              <p className="text-muted italic text-center py-3 m-0" style={{ fontSize: "11px" }}>{t("wishlistEmptyAcc")}</p>
            ) : (
              <div className="d-grid gap-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                {wishlist.map((p) => {
                  const translatedP = getProductTranslation(p, lang);
                  return (
                    <div key={translatedP.id} onClick={() => onSelectProduct(p)} className={`d-flex gap-2.5 align-items-center bg-light p-2 border border-custom cursor-pointer ${lang === "ar" ? "flex-row-reverse text-end" : "text-start"}`}>
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
