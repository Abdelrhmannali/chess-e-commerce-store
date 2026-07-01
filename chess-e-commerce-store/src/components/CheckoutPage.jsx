import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  Smartphone,
  Copy,
  Check,
  Package,
  Send,
  Wallet,
} from "lucide-react";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";
import { PAYMENT_ICONS } from "./checkout/PaymentIcons";
import "../styles/Checkout.css";

const formatSAR = (amount) =>
  `${Number(amount).toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;

const PAYMENT_METHODS = [
  { id: "cash", name: "الدفع عند الاستلام", form: "cash" },
  { id: "visa", name: "Visa", form: "card" },
  { id: "mastercard", name: "Mastercard", form: "card" },
  { id: "mada", name: "مدى (Mada)", form: "card_mada" },
  { id: "apple_pay", name: "Apple Pay", form: "wallet" },
  { id: "stc_pay", name: "STC Pay", form: "stc_pay" },
  { id: "google_pay", name: "Google Pay", form: "wallet" },
  { id: "samsung_pay", name: "Samsung Pay", form: "wallet" },
  { id: "tamara", name: "تمارا (Tamara)", form: "bnpl" },
  { id: "tabby", name: "تابي (Tabby)", form: "bnpl" },
];

// ── Validation helpers ────────────────────────────────────────
const digitsOnly = (v) => (v || "").replace(/\D/g, "");

const luhnCheck = (num) => {
  const s = digitsOnly(num);
  if (s.length < 13 || s.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const validateExpiry = (v) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v || "");
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  return exp >= now;
};

const validateSaudiPhone = (v) => {
  const d = digitsOnly(v);
  // 05XXXXXXXX (10 digits) or 9665XXXXXXXX (12) or +9665XXXXXXXX (13 with +)
  return /^(05\d{8}|9665\d{8})$/.test(d);
};

const formatCardNumber = (v) =>
  digitsOnly(v).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v) => {
  const d = digitsOnly(v).slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

// ── Card form (Visa / Mastercard / Mada) ──────────────────────
function CardForm({ methodId, card, setCard, errors, setErrors }) {
  const brandIconMap = { visa: "visa", mastercard: "mastercard", mada: "mada" };
  const BrandIcon = PAYMENT_ICONS[brandIconMap[methodId] || "visa"];

  const validateField = (field, value) => {
    const next = { ...errors };
    if (field === "number") {
      if (!value) next.number = "رقم البطاقة مطلوب";
      else if (!luhnCheck(value)) next.number = "رقم البطاقة غير صحيح";
      else delete next.number;
    }
    if (field === "name") {
      if (!value || value.trim().length < 3) next.name = "اسم حامل البطاقة قصير جداً";
      else delete next.name;
    }
    if (field === "expiry") {
      if (!validateExpiry(value)) next.expiry = "تاريخ الانتهاء غير صالح (MM/YY)";
      else delete next.expiry;
    }
    if (field === "cvv") {
      if (!/^\d{3,4}$/.test(digitsOnly(value))) next.cvv = "CVV يجب أن يكون 3 أو 4 أرقام";
      else delete next.cvv;
    }
    setErrors(next);
  };

  const setField = (field, formatter) => (e) => {
    const raw = e.target.value;
    const value = formatter ? formatter(raw) : raw;
    setCard({ ...card, [field]: value });
    if (errors[field]) validateField(field, value);
  };

  return (
    <>
      {methodId === "mada" && (
        <div className="beidaq-info-banner">
          <Info size={18} className="beidaq-info-banner__icon" />
          <div>
            <span className="beidaq-info-banner__title">بطاقة مدى</span>
            يجب أن تكون البطاقة صادرة من بنك سعودي وتحمل شعار مدى.
          </div>
        </div>
      )}

      <div className="beidaq-card-visual">
        <div className="beidaq-card-visual__brand">
          <BrandIcon size={44} />
        </div>
        <div className="beidaq-card-visual__chip" />
        <div className="beidaq-card-visual__number">
          {card.number || "•••• •••• •••• ••••"}
        </div>
        <div className="beidaq-card-visual__row">
          <div>
            <span className="beidaq-card-visual__label">CARD HOLDER</span>
            <span className="beidaq-card-visual__value">
              {card.name.toUpperCase() || "YOUR NAME"}
            </span>
          </div>
          <div>
            <span className="beidaq-card-visual__label">EXPIRES</span>
            <span className="beidaq-card-visual__value">{card.expiry || "MM/YY"}</span>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <div className="beidaq-co-field">
            <label className="beidaq-co-label" htmlFor="card-name">
              اسم حامل البطاقة <span className="beidaq-co-label__required">*</span>
            </label>
            <input
              id="card-name"
              type="text"
              className={`beidaq-co-input ${errors.name ? "is-invalid" : ""}`}
              placeholder="AHMAD AL-SAUD"
              value={card.name}
              onChange={setField("name")}
              onBlur={(e) => validateField("name", e.target.value)}
              autoComplete="cc-name"
              dir="ltr"
            />
            {errors.name && <span className="beidaq-co-error">{errors.name}</span>}
          </div>
        </div>

        <div className="col-12">
          <div className="beidaq-co-field">
            <label className="beidaq-co-label" htmlFor="card-number">
              رقم البطاقة <span className="beidaq-co-label__required">*</span>
            </label>
            <input
              id="card-number"
              type="text"
              className={`beidaq-co-input beidaq-co-input--ltr ${errors.number ? "is-invalid" : ""}`}
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={setField("number", formatCardNumber)}
              onBlur={(e) => validateField("number", e.target.value)}
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={23}
            />
            {errors.number && <span className="beidaq-co-error">{errors.number}</span>}
          </div>
        </div>

        <div className="col-sm-6">
          <div className="beidaq-co-field">
            <label className="beidaq-co-label" htmlFor="card-expiry">
              تاريخ الانتهاء <span className="beidaq-co-label__required">*</span>
            </label>
            <input
              id="card-expiry"
              type="text"
              className={`beidaq-co-input beidaq-co-input--ltr ${errors.expiry ? "is-invalid" : ""}`}
              placeholder="MM/YY"
              value={card.expiry}
              onChange={setField("expiry", formatExpiry)}
              onBlur={(e) => validateField("expiry", e.target.value)}
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
            />
            {errors.expiry && <span className="beidaq-co-error">{errors.expiry}</span>}
          </div>
        </div>

        <div className="col-sm-6">
          <div className="beidaq-co-field">
            <label className="beidaq-co-label" htmlFor="card-cvv">
              CVV <span className="beidaq-co-label__required">*</span>
            </label>
            <input
              id="card-cvv"
              type="password"
              className={`beidaq-co-input beidaq-co-input--ltr ${errors.cvv ? "is-invalid" : ""}`}
              placeholder="•••"
              value={card.cvv}
              onChange={setField("cvv", (v) => digitsOnly(v).slice(0, 4))}
              onBlur={(e) => validateField("cvv", e.target.value)}
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
            />
            {errors.cvv && <span className="beidaq-co-error">{errors.cvv}</span>}
          </div>
        </div>
      </div>
    </>
  );
}

// ── STC Pay form ──────────────────────────────────────────────
function StcPayForm({ phone, setPhone, error, setError }) {
  const validate = (v) => {
    if (!v) setError("رقم الجوال مطلوب");
    else if (!validateSaudiPhone(v)) setError("أدخل رقم جوال سعودي صحيح (05XXXXXXXX)");
    else setError("");
  };

  return (
    <>
      <div className="beidaq-info-banner">
        <Smartphone size={18} className="beidaq-info-banner__icon" />
        <div>
          <span className="beidaq-info-banner__title">الدفع عبر STC Pay</span>
          سيتم إرسال طلب الدفع إلى تطبيق STC Pay، افتح التطبيق لتأكيد العملية.
        </div>
      </div>

      <div className="beidaq-co-field">
        <label className="beidaq-co-label" htmlFor="stc-phone">
          رقم الجوال المرتبط بـ STC Pay
          <span className="beidaq-co-label__required">*</span>
        </label>
        <input
          id="stc-phone"
          type="tel"
          className={`beidaq-co-input beidaq-co-input--ltr ${error ? "is-invalid" : ""}`}
          placeholder="05XXXXXXXX"
          value={phone}
          onChange={(e) => {
            const v = digitsOnly(e.target.value).slice(0, 12);
            setPhone(v);
            if (error) validate(v);
          }}
          onBlur={(e) => validate(e.target.value)}
          inputMode="tel"
          maxLength={12}
        />
        {error && <span className="beidaq-co-error">{error}</span>}
      </div>
    </>
  );
}

// ── Wallet block (Apple/Google/Samsung) ───────────────────────
function WalletBlock({ methodId, loading, onSubmit, disabled }) {
  const config = {
    apple_pay: {
      label: "Pay with Apple Pay",
      className: "beidaq-wallet-btn--apple",
      note: "سيتم فتح نافذة Apple Pay لإتمام عملية الدفع بشكل آمن.",
    },
    google_pay: {
      label: "Pay with Google Pay",
      className: "beidaq-wallet-btn--google",
      note: "سيتم فتح نافذة Google Pay لإكمال الدفع.",
    },
    samsung_pay: {
      label: "Pay with Samsung Pay",
      className: "beidaq-wallet-btn--samsung",
      note: "سيتم فتح نافذة Samsung Pay لإكمال الدفع.",
    },
  }[methodId];

  return (
    <>
      <div className="beidaq-info-banner beidaq-info-banner--soft">
        <ShieldCheck size={18} className="beidaq-info-banner__icon" />
        <div>{config.note}</div>
      </div>
      <button
        type="button"
        className={`beidaq-wallet-btn ${config.className}`}
        onClick={onSubmit}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <span className="beidaq-spinner" />
            <span>جارٍ التحويل...</span>
          </>
        ) : (
          <>
            <Wallet size={18} />
            <span>{config.label}</span>
          </>
        )}
      </button>
    </>
  );
}

// ── BNPL block (Tamara / Tabby) ───────────────────────────────
function BnplBlock({ methodId, total, loading, onSubmit, disabled }) {
  const installments = useMemo(() => {
    const n = 4;
    const per = total / n;
    return Array.from({ length: n }, (_, i) => ({
      idx: i + 1,
      amount: per,
    }));
  }, [total]);

  const config = {
    tamara: {
      title: "الدفع مع تمارا",
      subtitle: "الدفع بالتقسيط بدون فوائد (حسب الأهلية).",
      btn: "Continue with Tamara",
      className: "beidaq-wallet-btn--tamara",
    },
    tabby: {
      title: "الدفع مع تابي",
      subtitle: "قسّم مشترياتك على 4 دفعات بدون فوائد ولا رسوم إضافية.",
      btn: "Continue with Tabby",
      className: "beidaq-wallet-btn--tabby",
    },
  }[methodId];

  return (
    <>
      <div className="beidaq-info-banner">
        <Info size={18} className="beidaq-info-banner__icon" />
        <div>
          <span className="beidaq-info-banner__title">{config.title}</span>
          {config.subtitle}
        </div>
      </div>

      <div className="beidaq-bnpl-plan">
        {installments.map((inst) => (
          <div className="beidaq-bnpl-installment" key={inst.idx}>
            <span className="beidaq-bnpl-installment__label">
              {inst.idx === 1 ? "اليوم" : `الدفعة ${inst.idx}`}
            </span>
            <span className="beidaq-bnpl-installment__amount">
              {formatSAR(inst.amount)}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`beidaq-wallet-btn ${config.className}`}
        onClick={onSubmit}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <span className="beidaq-spinner" />
            <span>جارٍ التحويل...</span>
          </>
        ) : (
          <>
            <Wallet size={18} />
            <span>{config.btn}</span>
          </>
        )}
      </button>
    </>
  );
}

// ── Cash on delivery block ────────────────────────────────────
function CashBlock() {
  return (
    <div className="beidaq-info-banner beidaq-info-banner--soft">
      <Package size={18} className="beidaq-info-banner__icon" />
      <div>
        <span className="beidaq-info-banner__title">الدفع عند الاستلام</span>
        سيتم تحصيل قيمة الطلب نقداً أو بالبطاقة عند وصول الشحنة إلى عنوانك.
        الرجاء تجهيز المبلغ بالضبط.
      </div>
    </div>
  );
}

// ── Main Checkout Page ────────────────────────────────────────
export default function CheckoutPage({
  cartItems,
  currentUser,
  onOrderCompleted,
  onNavigateToShop,
  onNavigateToOrders,
}) {
  const { t } = useLanguage();

  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [shippingErrors, setShippingErrors] = useState({});

  const [selectedMethod, setSelectedMethod] = useState("cash");

  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState({});

  const [stcPhone, setStcPhone] = useState("");
  const [stcError, setStcError] = useState("");

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  const effectivePriceOf = (p) => (p.discountPrice ?? p.effectivePrice ?? p.price);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + effectivePriceOf(item.product) * item.quantity,
    0
  );
  const shipping = subtotal > 150 ? 0 : 15.0;
  const total = subtotal + shipping;

  // ── Validation for pay-button enablement ───────────────────
  const shippingValid = Boolean(phone.trim() && address.trim());

  const paymentValid = useMemo(() => {
    if (!method) return false;
    switch (method.form) {
      case "cash":
      case "wallet":
      case "bnpl":
        return true;
      case "card":
      case "card_mada":
        return (
          card.name.trim().length >= 3 &&
          luhnCheck(card.number) &&
          validateExpiry(card.expiry) &&
          /^\d{3,4}$/.test(digitsOnly(card.cvv))
        );
      case "stc_pay":
        return validateSaudiPhone(stcPhone);
      default:
        return false;
    }
  }, [method, card, stcPhone]);

  const canPay = shippingValid && paymentValid && !loading;

  // ── Handlers ───────────────────────────────────────────────
  const validateShipping = () => {
    const errs = {};
    if (!phone.trim()) errs.phone = "رقم الجوال مطلوب";
    else if (!validateSaudiPhone(phone)) errs.phone = "رقم جوال سعودي غير صالح";
    if (!address.trim()) errs.address = "عنوان الشحن مطلوب";
    else if (address.trim().length < 10) errs.address = "الرجاء إدخال عنوان تفصيلي";
    setShippingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitOrder = async () => {
    setAlert("");

    if (!validateShipping()) {
      setAlert("الرجاء التأكد من صحة بيانات الشحن.");
      return;
    }

    if (!paymentValid) {
      setAlert("الرجاء إكمال بيانات الدفع بشكل صحيح.");
      return;
    }

    setLoading(true);
    try {
      // Simulate payment gateway roundtrip for card/wallet/BNPL/STC
      // (no real gateway; UI-only demo).
      if (method.form !== "cash") {
        await new Promise((r) => setTimeout(r, 900));
      }

      const response = await api.placeOrder({
        payment_method: selectedMethod,
        shipping_address: address,
        phone,
      });
      setPlacedOrder(response.order);
      onOrderCompleted && onOrderCompleted();
    } catch (err) {
      setAlert(err.message || "فشل إرسال الطلب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitOrder();
  };

  const copyTracking = () => {
    if (!placedOrder?.trackingNumber) return;
    navigator.clipboard.writeText(placedOrder.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success screen ─────────────────────────────────────────
  if (placedOrder) {
    return (
      <section className="beidaq-checkout rtl">
        <div className="container">
          <div className="beidaq-co-success">
            <div className="beidaq-co-success__badge">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="beidaq-co-success__title">تم استلام طلبك بنجاح!</h2>
            <p className="beidaq-co-success__subtitle">
              شكراً لثقتك في بيدق. سيتم شحن طلبك خلال 24 ساعة عمل.
            </p>

            <div className="beidaq-co-success__details">
              <div className="beidaq-co-success__row">
                <span className="beidaq-co-success__row-label">رقم الطلب</span>
                <span className="beidaq-co-success__row-value">#{placedOrder.id}</span>
              </div>
              <div className="beidaq-co-success__row">
                <span className="beidaq-co-success__row-label">رقم التتبع</span>
                <span
                  className="beidaq-co-success__row-value"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", direction: "ltr" }}
                >
                  {placedOrder.trackingNumber}
                  <button
                    type="button"
                    onClick={copyTracking}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: copied ? "#2F855A" : "#B8962E",
                      padding: 0,
                    }}
                    aria-label="نسخ رقم التتبع"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </span>
              </div>
              <div className="beidaq-co-success__row">
                <span className="beidaq-co-success__row-label">وسيلة الدفع</span>
                <span className="beidaq-co-success__row-value">{method.name}</span>
              </div>
              <div className="beidaq-co-success__row">
                <span className="beidaq-co-success__row-label">الإجمالي</span>
                <span className="beidaq-co-success__row-value" style={{ color: "#B8962E" }}>
                  {formatSAR(total)}
                </span>
              </div>
            </div>

            <div className="beidaq-co-success__actions">
              <button
                type="button"
                className="beidaq-co-btn-outline"
                onClick={onNavigateToOrders}
              >
                عرض طلباتي
              </button>
              <button
                type="button"
                className="beidaq-pay-btn"
                style={{ marginTop: 0, width: "auto" }}
                onClick={onNavigateToShop}
              >
                <span>متابعة التسوق</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Main form ──────────────────────────────────────────────
  return (
    <section className="beidaq-checkout rtl">
      <div className="container">
        <button
          type="button"
          className="beidaq-checkout__back"
          onClick={onNavigateToShop}
        >
          <ChevronRight size={16} />
          <span>العودة إلى المتجر</span>
        </button>

        <header className="beidaq-checkout__header">
          <span className="beidaq-checkout__eyebrow">إتمام الطلب</span>
          <h1 className="beidaq-checkout__title">تأكيد الطلب والدفع الآمن</h1>
          <p className="beidaq-checkout__subtitle">
            راجع بياناتك واختر وسيلة الدفع المناسبة لإتمام عملية الشراء.
          </p>
        </header>

        {alert && (
          <div className="beidaq-alert">
            <Info size={16} />
            <span>{alert}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="row g-4" noValidate>
          <div className="col-lg-8">
            {/* Shipping panel */}
            <div className="beidaq-co-panel">
              <div className="beidaq-co-panel__head">
                <span className="beidaq-co-panel__num">1</span>
                <h3 className="beidaq-co-panel__title">
                  عنوان الشحن
                  <span className="beidaq-co-panel__hint">
                    البيانات المطلوبة لتوصيل الشحنة إلى موقعك
                  </span>
                </h3>
                <Truck size={22} style={{ color: "#B8962E" }} />
              </div>

              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="beidaq-co-field">
                    <label className="beidaq-co-label">اسم المستلم</label>
                    <input
                      type="text"
                      className="beidaq-co-input beidaq-co-input--readonly"
                      value={currentUser?.name || ""}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="beidaq-co-field">
                    <label className="beidaq-co-label">البريد الإلكتروني</label>
                    <input
                      type="email"
                      className="beidaq-co-input beidaq-co-input--readonly beidaq-co-input--ltr"
                      value={currentUser?.email || ""}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="beidaq-co-field">
                    <label className="beidaq-co-label" htmlFor="ship-phone">
                      رقم الجوال <span className="beidaq-co-label__required">*</span>
                    </label>
                    <input
                      id="ship-phone"
                      type="tel"
                      className={`beidaq-co-input beidaq-co-input--ltr ${shippingErrors.phone ? "is-invalid" : ""}`}
                      placeholder="05XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={validateShipping}
                      required
                    />
                    {shippingErrors.phone && (
                      <span className="beidaq-co-error">{shippingErrors.phone}</span>
                    )}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="beidaq-co-field">
                    <label className="beidaq-co-label" htmlFor="ship-address">
                      عنوان الشحن <span className="beidaq-co-label__required">*</span>
                    </label>
                    <input
                      id="ship-address"
                      type="text"
                      className={`beidaq-co-input ${shippingErrors.address ? "is-invalid" : ""}`}
                      placeholder="الحي، الشارع، رقم المبنى، المدينة"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={validateShipping}
                      required
                    />
                    {shippingErrors.address && (
                      <span className="beidaq-co-error">{shippingErrors.address}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment panel */}
            <div className="beidaq-co-panel">
              <div className="beidaq-co-panel__head">
                <span className="beidaq-co-panel__num">2</span>
                <h3 className="beidaq-co-panel__title">
                  وسيلة الدفع
                  <span className="beidaq-co-panel__hint">
                    اختر الوسيلة المفضلة لديك للدفع الآمن
                  </span>
                </h3>
                <CreditCard size={22} style={{ color: "#B8962E" }} />
              </div>

              <div className="beidaq-pm-grid">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = PAYMENT_ICONS[m.id];
                  const active = selectedMethod === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      className={`beidaq-pm-card ${active ? "beidaq-pm-card--active" : ""}`}
                      onClick={() => setSelectedMethod(m.id)}
                      aria-pressed={active}
                    >
                      <span className="beidaq-pm-card__icon">
                        {Icon ? <Icon size={44} /> : null}
                      </span>
                      <span className="beidaq-pm-card__name">{m.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="beidaq-pm-form" key={selectedMethod}>
                {method.form === "cash" && <CashBlock />}

                {(method.form === "card" || method.form === "card_mada") && (
                  <>
                    <div className="beidaq-brand-row">
                      <span className="beidaq-brand-row__label">
                        نقبل جميع البطاقات:
                      </span>
                      <span className="beidaq-brand-chip">
                        <PAYMENT_ICONS.visa size={28} />
                      </span>
                      <span className="beidaq-brand-chip">
                        <PAYMENT_ICONS.mastercard size={28} />
                      </span>
                      <span className="beidaq-brand-chip">
                        <PAYMENT_ICONS.mada size={28} />
                      </span>
                    </div>
                    <CardForm
                      methodId={selectedMethod}
                      card={card}
                      setCard={setCard}
                      errors={cardErrors}
                      setErrors={setCardErrors}
                    />
                  </>
                )}

                {method.form === "stc_pay" && (
                  <StcPayForm
                    phone={stcPhone}
                    setPhone={setStcPhone}
                    error={stcError}
                    setError={setStcError}
                  />
                )}

                {method.form === "wallet" && (
                  <WalletBlock
                    methodId={selectedMethod}
                    loading={loading}
                    disabled={!shippingValid}
                    onSubmit={submitOrder}
                  />
                )}

                {method.form === "bnpl" && (
                  <BnplBlock
                    methodId={selectedMethod}
                    total={total}
                    loading={loading}
                    disabled={!shippingValid}
                    onSubmit={submitOrder}
                  />
                )}
              </div>

              <div className="beidaq-secure-note">
                <ShieldCheck size={14} />
                <span>معاملاتك محمية بتشفير AES-256 ومعيار PCI-DSS</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="beidaq-summary">
              <div className="beidaq-summary__bar" />
              <div className="beidaq-summary__body">
                <h3 className="beidaq-summary__title">
                  ملخص الطلب
                  <span className="beidaq-summary__title-badge">
                    {cartItems.length} منتج
                  </span>
                </h3>

                <div className="beidaq-summary__items">
                  {cartItems.map(({ product, quantity }) => {
                    const p = getProductTranslation(product);
                    return (
                      <div className="beidaq-summary__item" key={p.id}>
                        <img
                          src={p.images?.[0] || ""}
                          alt={p.name}
                          className="beidaq-summary__thumb"
                          referrerPolicy="no-referrer"
                        />
                        <div className="beidaq-summary__item-body">
                          <span className="beidaq-summary__item-name">{p.name}</span>
                          <span className="beidaq-summary__item-qty">
                            × {quantity}
                          </span>
                        </div>
                        <span className="beidaq-summary__item-price">
                          {formatSAR(effectivePriceOf(p) * quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="beidaq-summary__row">
                  <span>المجموع الفرعي</span>
                  <span>{formatSAR(subtotal)}</span>
                </div>
                <div className="beidaq-summary__row">
                  <span>الشحن</span>
                  {shipping === 0 ? (
                    <span className="beidaq-summary__free">شحن مجاني</span>
                  ) : (
                    <span>{formatSAR(shipping)}</span>
                  )}
                </div>

                <div className="beidaq-summary__row beidaq-summary__row--total">
                  <span>الإجمالي</span>
                  <span className="beidaq-summary__total-value">
                    {formatSAR(total)}
                  </span>
                </div>

                {/* Show pay button only for non-wallet/BNPL flows (those have their own buttons) */}
                {method.form !== "wallet" && method.form !== "bnpl" && (
                  <button
                    type="submit"
                    className="beidaq-pay-btn"
                    disabled={!canPay}
                  >
                    {loading ? (
                      <>
                        <span className="beidaq-spinner" />
                        <span>جارٍ المعالجة...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>
                          {method.form === "cash"
                            ? "تأكيد الطلب"
                            : `ادفع ${formatSAR(total)}`}
                        </span>
                      </>
                    )}
                  </button>
                )}

                <div className="beidaq-secure-note">
                  <ShieldCheck size={14} />
                  <span>دفع آمن 100%</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
