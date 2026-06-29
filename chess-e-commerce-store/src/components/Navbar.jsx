import React, { useState } from "react";
import { ShoppingCart, Heart, User as UserIcon, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { FaChessKing } from "react-icons/fa6";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Navbar.css";

export default function Navbar({
  currentUser,
  onLogout,
  cartCount,
  wishlistCount,
  activeTab,
  setActiveTab,
  onOpenAuth,
  isAdminMode = false
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navLinkClass = (tab) =>
    `beidaq-navbar__link${activeTab === tab ? " beidaq-navbar__link--active" : ""}`;

  if (isAdminMode) {
    return (
      <nav className="beidaq-navbar beidaq-navbar--admin sticky-top" id="app-navbar">
        <div className="container beidaq-navbar__inner">
          <div className="d-flex align-items-center justify-content-between">
            <div className="beidaq-navbar__brand">
              <div className="beidaq-navbar__logo">
                <FaChessKing aria-hidden="true" />
              </div>
              <div className="beidaq-navbar__brand-text">
                <span className="beidaq-navbar__brand-name">{t("adminPanel")}</span>
                <span className="beidaq-navbar__admin-badge">لوحة الإدارة فقط</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              {currentUser && (
                <>
                  <div className="d-none d-sm-flex align-items-center gap-2 flex-row-reverse">
                    <div className="beidaq-navbar__avatar">{currentUser.name[0].toUpperCase()}</div>
                    <span className="beidaq-navbar__user-name">{currentUser.name}</span>
                  </div>
                  <button type="button" onClick={onLogout} className="beidaq-navbar__logout">
                    <LogOut size={13} />
                    <span>{t("signOut")}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="beidaq-navbar sticky-top" id="app-navbar">
      <div className="container beidaq-navbar__inner">
        <div className="d-flex align-items-center justify-content-between">
          <div
            className="beidaq-navbar__brand"
            onClick={() => handleNavClick("home")}
            id="nav-logo"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleNavClick("home")}
          >
            <div className="beidaq-navbar__logo">
              <FaChessKing aria-hidden="true" />
            </div>
            <div className="beidaq-navbar__brand-text">
              <span className="beidaq-navbar__brand-name">{t("grandmaster")}</span>
              <span className="beidaq-navbar__brand-tagline">{t("luxuryChesscraft")}</span>
            </div>
          </div>

          <div className="d-none d-md-flex beidaq-navbar__links" id="nav-desktop-links">
            <button type="button" onClick={() => handleNavClick("home")} className={navLinkClass("home")}>
              {t("collection")}
            </button>
            <button type="button" onClick={() => handleNavClick("shop")} className={navLinkClass("shop")}>
              {t("catalog")}
            </button>
            <button type="button" onClick={() => handleNavClick("account")} className={navLinkClass("account")}>
              {t("myAccount")}
            </button>
            {currentUser?.role === "admin" && (
              <button
                type="button"
                onClick={() => handleNavClick("admin")}
                className={`beidaq-navbar__link beidaq-navbar__link--admin${
                  activeTab === "admin" ? " beidaq-navbar__link--active" : ""
                }`}
              >
                <ShieldCheck size={14} />
                {t("adminPanel")}
              </button>
            )}
          </div>

          <div className="d-none d-md-flex beidaq-navbar__actions" id="nav-desktop-actions">
            {currentUser && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick("wishlist")}
                  className="beidaq-navbar__icon-btn"
                  title={t("viewWishlist")}
                  aria-label={t("viewWishlist")}
                >
                  <Heart size={17} className={wishlistCount > 0 ? "fill-gold text-gold-custom" : ""} />
                  {wishlistCount > 0 && <span className="beidaq-navbar__badge">{wishlistCount}</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("cart")}
                  className="beidaq-navbar__icon-btn"
                  title={t("viewCart")}
                  aria-label={t("viewCart")}
                >
                  <ShoppingCart size={17} />
                  {cartCount > 0 && <span className="beidaq-navbar__badge">{cartCount}</span>}
                </button>

                <div className="beidaq-navbar__divider" aria-hidden="true" />
              </>
            )}

            {currentUser ? (
              <div className="d-flex align-items-center gap-2 flex-row-reverse">
                <div className="beidaq-navbar__user" onClick={() => handleNavClick("account")}>
                  <div className="beidaq-navbar__avatar">{currentUser.name[0].toUpperCase()}</div>
                  <div className="beidaq-navbar__user-info">
                    <p className="beidaq-navbar__user-label">{t("member")}</p>
                    <p className="beidaq-navbar__user-name">{currentUser.name}</p>
                  </div>
                </div>
                <button type="button" onClick={onLogout} className="beidaq-navbar__logout" title={t("signOut")}>
                  <LogOut size={13} />
                  <span>{t("signOut")}</span>
                </button>
              </div>
            ) : (
              <button type="button" onClick={onOpenAuth} className="beidaq-navbar__login-btn">
                <UserIcon size={14} />
                {t("loginJoin")}
              </button>
            )}
          </div>

          <div className="d-flex d-md-none align-items-center gap-2" id="nav-mobile-toggle">
            {currentUser && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick("wishlist")}
                  className="beidaq-navbar__icon-btn"
                  aria-label={t("viewWishlist")}
                >
                  <Heart size={17} className={wishlistCount > 0 ? "fill-gold text-gold-custom" : ""} />
                  {wishlistCount > 0 && <span className="beidaq-navbar__badge">{wishlistCount}</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("cart")}
                  className="beidaq-navbar__icon-btn"
                  aria-label={t("viewCart")}
                >
                  <ShoppingCart size={17} />
                  {cartCount > 0 && <span className="beidaq-navbar__badge">{cartCount}</span>}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="beidaq-navbar__menu-toggle"
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="beidaq-navbar__drawer d-md-none" id="nav-mobile-drawer">
          <div className="container d-grid gap-2">
            <button
              type="button"
              onClick={() => handleNavClick("home")}
              className={`beidaq-navbar__mobile-link${activeTab === "home" ? " beidaq-navbar__mobile-link--active" : ""}`}
            >
              {t("collection")}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("shop")}
              className={`beidaq-navbar__mobile-link${activeTab === "shop" ? " beidaq-navbar__mobile-link--active" : ""}`}
            >
              {t("catalog")}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("account")}
              className={`beidaq-navbar__mobile-link${activeTab === "account" ? " beidaq-navbar__mobile-link--active" : ""}`}
            >
              {t("myAccount")}
            </button>
            {currentUser?.role === "admin" && (
              <button
                type="button"
                onClick={() => handleNavClick("admin")}
                className={`beidaq-navbar__mobile-link d-flex align-items-center gap-2 flex-row-reverse${
                  activeTab === "admin" ? " beidaq-navbar__mobile-link--active" : ""
                }`}
              >
                <ShieldCheck size={14} />
                {t("adminPanel")}
              </button>
            )}

            <div className="beidaq-navbar__divider my-1" style={{ width: "100%", height: "1px" }} aria-hidden="true" />

            {currentUser ? (
              <div className="beidaq-navbar__mobile-user">
                <div className="d-flex align-items-center gap-3 mb-3 flex-row-reverse">
                  <div className="beidaq-navbar__avatar">{currentUser.name[0].toUpperCase()}</div>
                  <div className="text-end">
                    <p className="beidaq-navbar__user-name mb-1">{currentUser.name}</p>
                    <p className="beidaq-navbar__user-label mb-0">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="beidaq-navbar__mobile-logout"
                >
                  <LogOut size={14} />
                  {t("signOut")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="beidaq-navbar__login-btn w-100 justify-content-center"
              >
                <UserIcon size={14} />
                {t("loginJoin")}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
