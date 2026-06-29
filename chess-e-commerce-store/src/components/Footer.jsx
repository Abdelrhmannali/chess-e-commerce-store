import React from "react";
import {
  FaChessKing,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaTiktok,
  FaSnapchat,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcApplePay,
  FaCreditCard,
  FaMobileScreenButton,
} from "react-icons/fa6";
import "../styles/Footer.css";

const CATEGORIES = [
  { slug: "boards", label: "رقع الشطرنج" },
  { slug: "pieces", label: "قطع الشطرنج" },
  { slug: "clocks", label: "ساعات الشطرنج" },
  { slug: "accessories", label: "إكسسوارات الشطرنج" },
  { slug: "all", label: "جميع المنتجات" },
];

const CUSTOMER_LINKS = [
  { type: "tab", value: "account", label: "حسابي" },
  { type: "tab", value: "wishlist", label: "المفضلة" },
  { type: "tab", value: "cart", label: "سلة التسوق" },
  { type: "tab", value: "account", label: "طلباتي" },
  { type: "contact", label: "تواصل معنا" },
];

const SOCIAL_LINKS = [
  { href: "https://instagram.com/beidaq", label: "Instagram", icon: FaInstagram },
  { href: "https://facebook.com/beidaq", label: "Facebook", icon: FaFacebookF },
  { href: "https://x.com/beidaq", label: "X", icon: FaXTwitter },
  { href: "https://tiktok.com/@beidaq", label: "TikTok", icon: FaTiktok },
  { href: "https://snapchat.com/add/beidaq", label: "Snapchat", icon: FaSnapchat },
  { href: "https://youtube.com/@beidaq", label: "YouTube", icon: FaYoutube },
];

const PAYMENT_METHODS = [
  { id: "visa", label: "Visa", icon: FaCcVisa, type: "icon" },
  { id: "mastercard", label: "Mastercard", icon: FaCcMastercard, type: "icon" },
  { id: "applepay", label: "Apple Pay", icon: FaCcApplePay, type: "icon" },
  { id: "stcpay", label: "STC Pay", icon: FaMobileScreenButton, type: "badge", text: "STC Pay" },
  { id: "mada", label: "Mada", icon: FaCreditCard, type: "badge", text: "مدى" },
];

const LEGAL_LINKS = [
  "سياسة الخصوصية",
  "الشروط والأحكام",
  "سياسة الاسترجاع",
  "سياسة الشحن",
];

export default function Footer({ onCategorySelect, onNavigate }) {
  const handleCustomerLink = (link) => {
    if (link.type === "contact") {
      window.location.href = "mailto:support@beidaq.sa";
      return;
    }
    onNavigate(link.value);
  };

  return (
    <footer className="beidaq-footer mt-auto rtl" id="app-footer">
      <div className="beidaq-footer-glow" aria-hidden="true" />
      <div className="beidaq-footer-pattern" aria-hidden="true" />

      <div className="container position-relative">
        <div className="beidaq-footer-main">
          <div className="row g-4 g-xl-5">
            {/* Brand */}
            <div className="col-lg-4 col-md-6">
              <div className="beidaq-footer-glass beidaq-footer-brand-card h-100">
                <div className="beidaq-footer-brand">
                  <div className="beidaq-footer-logo">
                    <FaChessKing aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="beidaq-footer-name">بــيــدق</h2>
                    <p className="beidaq-footer-slogan">لأن كل بطل بدأ ببــيــدق.</p>
                  </div>
                </div>
                <p className="beidaq-footer-desc">
                  متجر بــيــدق هو وجهتك الأولى لعشاق الشطرنج في المملكة العربية السعودية، حيث نوفر رقع
                  الشطرنج، القطع، الساعات، والإكسسوارات بأعلى جودة.
                </p>
                <div className="beidaq-footer-social">
                  {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      className="beidaq-social-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      <Icon aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="col-6 col-md-3 col-lg-2">
              <div className="beidaq-footer-glass beidaq-footer-section-card h-100">
                <h3 className="beidaq-footer-heading">الفئات</h3>
                <ul className="beidaq-footer-links list-unstyled mb-0">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.slug}>
                      <button
                        type="button"
                        className="beidaq-footer-link"
                        onClick={() => onCategorySelect(cat.slug)}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Customer Links */}
            <div className="col-6 col-md-3 col-lg-2">
              <div className="beidaq-footer-glass beidaq-footer-section-card h-100">
                <h3 className="beidaq-footer-heading">خدمة العملاء</h3>
                <ul className="beidaq-footer-links list-unstyled mb-0">
                  {CUSTOMER_LINKS.map((link, idx) => (
                    <li key={`${link.label}-${idx}`}>
                      <button
                        type="button"
                        className="beidaq-footer-link"
                        onClick={() => handleCustomerLink(link)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="col-md-6 col-lg-4">
              <div className="beidaq-footer-glass beidaq-footer-section-card h-100" id="contact">
                <h3 className="beidaq-footer-heading">تواصل معنا</h3>
                <ul className="beidaq-footer-contact list-unstyled mb-0">
                  <li>
                    <span className="beidaq-footer-contact-icon">
                      <FaLocationDot aria-hidden="true" />
                    </span>
                    <span>Sakaka, Saudi Arabia</span>
                  </li>
                  <li>
                    <span className="beidaq-footer-contact-icon">
                      <FaPhone aria-hidden="true" />
                    </span>
                    <a href="tel:+966556354954" className="beidaq-footer-contact-link">
                      +966 55 635 4954
                    </a>
                  </li>
                  <li>
                    <span className="beidaq-footer-contact-icon">
                      <FaEnvelope aria-hidden="true" />
                    </span>
                    <a href="mailto:support@beidaq.sa" className="beidaq-footer-contact-link">
                      support@beidaq.sa
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="beidaq-footer-payments">
          <div className="beidaq-footer-glass beidaq-footer-payments-card">
            <h3 className="beidaq-footer-payments-title">طرق الدفع المتاحة</h3>
            <div className="beidaq-footer-payments-grid">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, type, text }) => (
                <div key={id} className="beidaq-payment-item" title={label}>
                  {type === "icon" ? (
                    <Icon className="beidaq-payment-icon" aria-label={label} />
                  ) : (
                    <div className={`beidaq-payment-badge beidaq-payment-badge--${id}`}>
                      <Icon className="beidaq-payment-badge-icon" aria-hidden="true" />
                      <span>{text}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="beidaq-footer-bottom">
          <p className="beidaq-footer-copy mb-0">
            &copy; 2026 بــيــدق - جميع الحقوق محفوظة.
          </p>
          <nav className="beidaq-footer-legal" aria-label="روابط قانونية">
            {LEGAL_LINKS.map((label) => (
              <button key={label} type="button" className="beidaq-footer-legal-link">
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
