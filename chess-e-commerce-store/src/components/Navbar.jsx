import React, { useState } from "react";
import { ShoppingCart, Heart, User as UserIcon, LogOut, ShieldCheck, Menu, X, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({
  currentUser,
  onLogout,
  cartCount,
  wishlistCount,
  activeTab,
  setActiveTab,
  onOpenAuth
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navLinkClass = (tab) =>
    `btn btn-link text-decoration-none px-3 py-2 text-uppercase fw-bold font-mono-custom nav-link-btn ${
      activeTab === tab ? "nav-link-active" : ""
    }`;

  return (
    <nav className="sticky-top shadow-sm" id="app-navbar" style={{ zIndex: 1050 }}>
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between">
          {/* Logo */}
          <div className="d-flex align-items-center cursor-pointer" onClick={() => handleNavClick("home")} id="nav-logo">
            <div className={`d-flex align-items-center justify-content-center font-serif-custom logo-mark fw-bold ${lang === "ar" ? "ms-3" : "me-3"}`} style={{ width: "40px", height: "40px", fontSize: "1.3rem" }}>
              ♔
            </div>
            <div className={lang === "ar" ? "text-end" : "text-start"}>
              <span className="font-sans text-uppercase fw-bold nav-brand-title tracking-widest d-block m-0" style={{ fontSize: "1rem" }}>
                {t("grandmaster")}
              </span>
              <span className="font-sans nav-brand-subtitle d-block">
                {t("luxuryChesscraft")}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="d-none d-md-flex align-items-center gap-1" id="nav-desktop-links">
            <button onClick={() => handleNavClick("home")} className={navLinkClass("home")} style={{ fontSize: "11px", letterSpacing: "1px" }}>
              {t("collection")}
            </button>
            <button onClick={() => handleNavClick("shop")} className={navLinkClass("shop")} style={{ fontSize: "11px", letterSpacing: "1px" }}>
              {t("catalog")}
            </button>
            <button onClick={() => handleNavClick("account")} className={navLinkClass("account")} style={{ fontSize: "11px", letterSpacing: "1px" }}>
              {t("myAccount")}
            </button>
            {currentUser?.role === "admin" && (
              <button
                onClick={() => handleNavClick("admin")}
                className={`btn btn-link text-decoration-none px-3 py-2 text-uppercase fw-bold font-mono-custom d-flex align-items-center gap-1 nav-link-btn ${
                  activeTab === "admin" ? "nav-link-active" : ""
                }`}
                style={{ fontSize: "11px", letterSpacing: "1px" }}
              >
                <ShieldCheck size={14} />
                {t("adminPanel")}
              </button>
            )}
          </div>

          {/* User Operations */}
          <div className="d-none d-md-flex align-items-center gap-3" id="nav-desktop-actions">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="btn nav-lang-btn d-flex align-items-center gap-1.5 px-3 py-1"
              title={lang === "en" ? "تغيير اللغة إلى العربية" : "Change Language to English"}
            >
              <Globe size={13} />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>

            <button
              onClick={() => handleNavClick("wishlist")}
              className="btn btn-link nav-icon-btn p-2 position-relative bg-transparent border-0"
              title={t("viewWishlist")}
            >
              <Heart size={18} className={wishlistCount > 0 ? "fill-gold text-gold-custom" : ""} />
              {wishlistCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge bg-gold-custom text-charcoal-custom rounded-circle" style={{ fontSize: "9px", padding: "3px 6px" }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick("cart")}
              className="btn btn-link nav-icon-btn p-2 position-relative bg-transparent border-0"
              title={t("viewCart")}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge bg-gold-custom text-charcoal-custom rounded-circle" style={{ fontSize: "9px", padding: "3px 6px" }}>
                  {cartCount}
                </span>
              )}
            </button>

            <div className="nav-divider" />

            {currentUser ? (
              <div className="d-flex align-items-center gap-2">
                <div
                  onClick={() => handleNavClick("account")}
                  className="d-flex align-items-center gap-2 cursor-pointer"
                >
                  <div className="d-flex align-items-center justify-content-center bg-gold-custom text-charcoal-custom fw-bold rounded-circle shadow-sm" style={{ width: "32px", height: "32px", fontSize: "13px" }}>
                    {currentUser.name[0].toUpperCase()}
                  </div>
                  <div className={lang === "ar" ? "text-end" : "text-start"}>
                    <p className="nav-member-label m-0 font-mono-custom text-uppercase">{t("member")}</p>
                    <p className="nav-member-name fw-semibold m-0">{currentUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="btn btn-logout d-flex align-items-center gap-1.5"
                  title={t("signOut")}
                >
                  <LogOut size={13} />
                  <span>{t("signOut")}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn btn-gold-custom d-flex align-items-center gap-1.5 px-4 py-1.5"
                style={{ fontSize: "11px" }}
              >
                <UserIcon size={12} />
                {t("loginJoin")}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="d-flex d-md-none align-items-center gap-2" id="nav-mobile-toggle">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="btn btn-link nav-icon-btn p-1"
              title={lang === "en" ? "العربية" : "English"}
            >
              <Globe size={18} />
            </button>

            <button
              onClick={() => handleNavClick("wishlist")}
              className="btn btn-link nav-icon-btn p-1 position-relative"
            >
              <Heart size={18} className={wishlistCount > 0 ? "fill-gold text-gold-custom" : ""} />
              {wishlistCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge bg-gold-custom text-charcoal-custom rounded-circle" style={{ fontSize: "8px", padding: "2px 5px" }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick("cart")}
              className="btn btn-link nav-icon-btn p-1 position-relative"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge bg-gold-custom text-charcoal-custom rounded-circle" style={{ fontSize: "8px", padding: "2px 5px" }}>
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline-custom nav-icon-btn p-1 ms-2"
              style={{ borderRadius: "8px" }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="d-md-none p-3" id="nav-mobile-drawer">
          <div className="d-grid gap-2">
            <button
              onClick={() => handleNavClick("home")}
              className={`btn nav-mobile-link text-uppercase fw-bold font-mono-custom p-2 ${activeTab === "home" ? "active" : ""}`}
              style={{ fontSize: "11px" }}
            >
              {t("collection")}
            </button>
            <button
              onClick={() => handleNavClick("shop")}
              className={`btn nav-mobile-link text-uppercase fw-bold font-mono-custom p-2 ${activeTab === "shop" ? "active" : ""}`}
              style={{ fontSize: "11px" }}
            >
              {t("catalog")}
            </button>
            <button
              onClick={() => handleNavClick("account")}
              className={`btn nav-mobile-link text-uppercase fw-bold font-mono-custom p-2 ${activeTab === "account" ? "active" : ""}`}
              style={{ fontSize: "11px" }}
            >
              {t("myAccount")}
            </button>
            {currentUser?.role === "admin" && (
              <button
                onClick={() => handleNavClick("admin")}
                className={`btn nav-mobile-link text-uppercase fw-bold font-mono-custom p-2 d-flex align-items-center gap-2 ${activeTab === "admin" ? "active" : ""}`}
                style={{ fontSize: "11px" }}
              >
                <ShieldCheck size={14} />
                {t("adminPanel")}
              </button>
            )}

            <div className="nav-divider my-2" style={{ width: "100%", height: "1px" }} />

            {currentUser ? (
              <div className="p-2">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="d-flex align-items-center justify-content-center bg-gold-custom text-charcoal-custom fw-bold rounded-circle shadow-sm" style={{ width: "36px", height: "36px" }}>
                    {currentUser.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="nav-member-name fw-bold m-0" style={{ fontSize: "13px" }}>{currentUser.name}</p>
                    <p className="nav-member-label m-0 font-mono-custom">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 text-uppercase fw-bold py-2"
                  style={{ fontSize: "11px", borderRadius: "8px" }}
                >
                  <LogOut size={14} />
                  {t("signOut")}
                </button>
              </div>
            ) : (
              <div className="p-1">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-gold-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: "11px" }}
                >
                  <UserIcon size={14} />
                  {t("loginJoin")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
