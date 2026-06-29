import React, { useState } from "react";
import { CreditCard, ShieldCheck, Mail, Send, CheckCircle2, ChevronLeft, Truck, Copy, Check } from "lucide-react";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";

export default function CheckoutPage({
  cartItems,
  currentUser,
  onOrderCompleted,
  onNavigateToShop,
  onNavigateToOrders
}) {
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("visa");
  const [optInEmail, setOptInEmail] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  const { t } = useLanguage();

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 15.0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !address.trim()) {
      setErrorMessage(t("completeFieldsError"));
      return;
    }
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await api.placeOrder({
        payment_method: paymentMethod,
        shipping_address: address,
        phone
      });
      setPlacedOrder(response.order);
      onOrderCompleted();
    } catch (err) {
      setErrorMessage(err.message || ("فشل إرسال الطلب."));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (placedOrder) {
    return (
      <div className="container py-5 text-center" id="checkout-success-view" style={{ maxWidth: "700px" }}>
        <div className="d-flex align-items-center justify-content-center bg-success-subtle text-success border border-success rounded-3 mb-4 mx-auto" style={{ width: "80px", height: "80px" }}>
          <CheckCircle2 size={40} />
        </div>
        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 text-uppercase font-mono-custom fw-bold mb-3">{t("exchangeApproved")}</span>
        <h2 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-2">{t("orderDispatched")}</h2>
        <p className="text-secondary font-sans mb-4">{t("orderDispatchedSub")}</p>

        <div className="card rounded-0 p-4 border-custom bg-white mb-4 shadow-sm text-start">
          <div className={`d-flex justify-content-between align-items-center border-bottom pb-2.5 mb-2.5 ${"flex-row-reverse"}`}>
            <span className="font-mono-custom text-muted text-uppercase" style={{ fontSize: "11px" }}>{t("orderId")}</span>
            <span className="font-mono-custom fw-bold text-charcoal-custom">#{placedOrder.id}</span>
          </div>
          <div className={`d-flex justify-content-between align-items-center border-bottom pb-2.5 mb-2.5 ${"flex-row-reverse"}`}>
            <span className="font-mono-custom text-muted text-uppercase" style={{ fontSize: "11px" }}>{t("courierTrackingId")}</span>
            <div className={`d-flex align-items-center gap-2 ${"flex-row-reverse"}`}>
              <span className="font-mono-custom fw-bold text-gold-custom">{placedOrder.trackingNumber}</span>
              <button onClick={() => copyToClipboard(placedOrder.trackingNumber || "")} className="btn btn-link text-secondary p-0">
                {copiedText ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className={`d-flex justify-content-between align-items-center ${"flex-row-reverse"}`}>
            <span className="font-mono-custom text-muted text-uppercase" style={{ fontSize: "11px" }}>{t("deliveryLocation")}</span>
            <span className="text-secondary text-truncate" style={{ maxWidth: "250px", fontSize: "13px" }}>{placedOrder.address}</span>
          </div>
        </div>

        {optInEmail && currentUser?.email && (
          <div className="p-3 bg-light border border-custom mb-4 text-start d-flex gap-2.5">
            <Mail size={18} className="text-gold-custom shrink-0 mt-1" />
            <div>
              <span className="font-mono-custom fw-bold text-gold-custom text-uppercase d-block" style={{ fontSize: "10px" }}>{t("emailNotificationTitle")}</span>
              <p className="text-secondary m-0 mt-1 font-sans" style={{ fontSize: "11px" }}>{t("emailNotificationBody").replace("{email}", currentUser.email)}</p>
            </div>
          </div>
        )}

        <div className={`d-flex flex-column flex-sm-row justify-content-center gap-3 ${"flex-row-reverse"}`}>
          <button onClick={onNavigateToOrders} className="btn btn-outline-secondary text-uppercase fw-bold font-mono-custom py-3 px-4" style={{ fontSize: "11px", borderRadius: "0px" }}>{t("trackHistoryBtn")}</button>
          <button onClick={onNavigateToShop} className="btn btn-gold-custom text-uppercase fw-bold font-mono-custom py-3 px-5" style={{ fontSize: "11px" }}>{t("continueShoppingBtn")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container py-5 ${"text-end"}`} id="checkout-view-layout">
      <button onClick={onNavigateToShop} className={`btn btn-link text-muted font-mono-custom text-uppercase text-decoration-none p-0 mb-4 d-flex align-items-center gap-1 ${"flex-row-reverse"}`} style={{ fontSize: "11px" }}>
        <ChevronLeft size={16} className={"rotate-180"} />
        <span>{t("returnToCatalog")}</span>
      </button>

      <div className="border-bottom pb-4 mb-4">
        <h2 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("tacticalCheckout")}</h2>
        <p className="text-muted font-mono-custom m-0 mt-1" style={{ fontSize: "11px" }}>{t("checkoutSub")}</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="row g-4">
        <div className="col-lg-8 d-flex flex-column gap-4">
          <div className="card rounded-0 p-4 border-custom bg-white">
            <h5 className={`font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-4 d-flex align-items-center gap-2 ${"flex-row-reverse"}`}>
              <Truck size={18} className="text-gold-custom" />
              <span>{t("shippingAddressSection")}</span>
            </h5>
            {errorMessage && <div className="alert alert-danger p-2 mb-3" style={{ fontSize: "11px" }}>{errorMessage}</div>}
            <div className="row g-3 text-start">
              <div className="col-sm-6">
                <label className="form-label text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{t("recipientName")}</label>
                <input type="text" readOnly value={currentUser?.name || ""} className="form-control rounded-0 font-sans bg-light" style={{ fontSize: "12px" }} />
              </div>
              <div className="col-sm-6">
                <label className="form-label text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{t("emailAddress")}</label>
                <input type="email" readOnly value={currentUser?.email || ""} className="form-control rounded-0 font-mono-custom bg-light" style={{ fontSize: "12px" }} />
              </div>
              <div className="col-sm-6">
                <label className="form-label text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{t("phoneNumber")}</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="form-control rounded-0 font-mono-custom" style={{ fontSize: "12px" }} />
              </div>
              <div className="col-sm-6">
                <label className="form-label text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{t("courierAddress")}</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="form-control rounded-0 font-sans" style={{ fontSize: "12px" }} />
              </div>
            </div>
          </div>

          <div className="card rounded-0 p-4 border-custom bg-white">
            <h5 className={`font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-4 d-flex align-items-center gap-2 ${"flex-row-reverse"}`}>
              <CreditCard size={18} className="text-gold-custom" />
              <span>{t("secureGatewaySection")}</span>
            </h5>
            <div className="row g-2 mb-4">
              <div className="col-6">
                <button type="button" onClick={() => setPaymentMethod("visa")} className={`btn w-100 py-2.5 font-mono-custom text-uppercase fw-bold ${paymentMethod === "visa" ? "btn-dark-custom" : "btn-light border border-custom text-muted"}`} style={{ fontSize: "10px", borderRadius: "0px" }}>
                  {t("creditCard")} (Visa)
                </button>
              </div>
              <div className="col-6">
                <button type="button" onClick={() => setPaymentMethod("cash")} className={`btn w-100 py-2.5 font-mono-custom text-uppercase fw-bold ${paymentMethod === "cash" ? "btn-dark-custom" : "btn-light border border-custom text-muted"}`} style={{ fontSize: "10px", borderRadius: "0px" }}>
                  {"الدفع عند الاستلام"}
                </button>
              </div>
            </div>
            <div className={`d-flex align-items-center gap-1.5 text-muted ${"flex-row-reverse"}`}>
              <ShieldCheck size={14} className="text-success" />
              <span className="font-mono-custom" style={{ fontSize: "10px" }}>{t("aesEncryption")}</span>
            </div>
          </div>

          <div className="card rounded-0 p-4 border-custom bg-white">
            <h5 className={`font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-3 d-flex align-items-center gap-2 ${"flex-row-reverse"}`}>
              <Send size={18} className="text-gold-custom" />
              <span>{t("alertsSection")}</span>
            </h5>
            <div className="form-check d-flex align-items-start gap-2 p-0">
              <input type="checkbox" checked={optInEmail} onChange={(e) => setOptInEmail(e.target.checked)} className="form-check-input ms-0 me-2 accent-gold-custom mt-1" id="email-alerts" />
              <label className="form-check-label cursor-pointer" htmlFor="email-alerts">
                <span className="fw-bold text-charcoal-custom d-block" style={{ fontSize: "12px" }}>{t("emailAlerts")}</span>
                <span className="text-muted d-block" style={{ fontSize: "11px" }}>{t("emailAlertsDesc")}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card rounded-0 p-4 border-gold-custom bg-white shadow-sm position-relative">
            <div className="position-absolute top-0 start-0 w-100 bg-gold-custom" style={{ height: "4px" }} />
            <h6 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-4">{t("exchangeReview")}</h6>
            <div className="d-grid gap-3 mb-4 border-bottom pb-3">
              {cartItems.map(({ product, quantity }) => {
                const translatedProduct = getProductTranslation(product);
                return (
                  <div key={translatedProduct.id} className={`d-flex gap-3 align-items-center ${"flex-row-reverse text-end"}`}>
                    <img src={translatedProduct.images?.[0] || ""} alt={translatedProduct.name} referrerPolicy="no-referrer" className="object-fit-cover rounded-0 bg-white border shrink-0" style={{ width: "48px", height: "48px" }} />
                    <div className="flex-grow min-w-0">
                      <p className="font-serif-custom fw-bold text-charcoal-custom text-truncate mb-0" style={{ fontSize: "12px" }}>{translatedProduct.name}</p>
                      <p className="text-muted font-mono-custom m-0" style={{ fontSize: "10px" }}>Qty {quantity} &times; ${translatedProduct.price.toFixed(2)}</p>
                    </div>
                    <span className="fw-bold font-mono-custom text-charcoal-custom shrink-0" style={{ fontSize: "12px" }}>${(translatedProduct.price * quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-bottom pb-3 mb-4 d-grid gap-2.5 font-mono-custom text-muted" style={{ fontSize: "12px" }}>
              <div className="d-flex justify-content-between"><span>{t("totalCatalogValue")}</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="d-flex justify-content-between"><span>{t("secureShipping")}</span><span>{shipping === 0 ? t("freeCourier") : `$${shipping.toFixed(2)}`}</span></div>
            </div>
            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="font-serif-custom fw-bold text-charcoal-custom text-uppercase" style={{ fontSize: "12px" }}>{t("finalValue")}</span>
              <span className="text-gold-custom fw-bold font-sans fs-4">${total.toFixed(2)}</span>
            </div>
            <button type="submit" disabled={loading} className="btn btn-gold-custom w-100 py-3 text-uppercase fw-bold font-mono-custom" style={{ fontSize: "11px", letterSpacing: "1px" }}>
              {loading ? t("placingOrder") : t("placeOrderBtn")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
