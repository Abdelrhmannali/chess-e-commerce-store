import React from "react";
import { ShoppingCart, Trash2, Plus, Minus, ChevronRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";

export default function CartPage({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onNavigateToShop
}) {
  const { lang, t } = useLanguage();

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal > 150 ? 0 : 15.0) : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center" id="empty-cart-state" style={{ maxWidth: "600px" }}>
        <div className="d-flex align-items-center justify-content-center rounded-3 border border-custom mb-4 mx-auto" style={{ width: "80px", height: "80px", backgroundColor: "var(--color-offwhite-deep)" }}>
          <ShoppingCart size={40} style={{ color: "var(--color-charcoal)" }} />
        </div>
        <h3 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-2">{t("emptyCartTitle")}</h3>
        <p className="text-secondary font-sans mb-4" style={{ fontSize: "14px" }}>{t("emptyCartDesc")}</p>
        <button onClick={onNavigateToShop} className="btn btn-primary-custom px-5 py-3 text-uppercase fw-bold font-mono-custom" style={{ fontSize: "11px" }}>{t("exploreElite")}</button>
      </div>
    );
  }

  return (
    <div className="container py-5" id="cart-page-layout">
      <div className={`border-bottom pb-4 mb-4 ${lang === "ar" ? "text-end" : "text-start"}`} style={{ borderColor: "var(--color-beige)" }}>
        <h2 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("yourChessCart")}</h2>
        <p className="text-muted font-mono-custom m-0 mt-1" style={{ fontSize: "11px" }}>{t("cartSub")}</p>
      </div>

      <div className={`row g-4 ${lang === "ar" ? "text-end" : "text-start"}`}>
        <div className="col-lg-8 d-flex flex-column gap-3">
          {cartItems.map(({ id: cartItemId, product, quantity }) => {
            const translatedProduct = getProductTranslation(product, lang);
            return (
              <div key={cartItemId || product.id} className={`card rounded-0 p-3 shadow-sm border-custom ${lang === "ar" ? "rtl" : "ltr"}`} style={{ backgroundColor: "var(--color-white)", borderColor: "var(--color-border)" }}>
                <div className="row g-3 align-items-center">
                  <div className="col-4 col-sm-2 text-center">
                    <div className="border p-1" style={{ width: "80px", height: "80px", borderColor: "var(--color-beige)", backgroundColor: "var(--color-offwhite)" }}>
                      <img src={translatedProduct.images?.[0] || ""} alt={translatedProduct.name} referrerPolicy="no-referrer" className="w-100 h-100 object-fit-cover" />
                    </div>
                  </div>
                  <div className="col-8 col-sm-4 text-start">
                    <span className="font-mono-custom fw-bold text-uppercase d-block" style={{ fontSize: "9px", color: "var(--color-accent)" }}>
                      {translatedProduct.categoryName || translatedProduct.category}
                    </span>
                    <h6 className="font-serif-custom fw-bold text-charcoal-custom m-0 text-truncate text-uppercase" style={{ fontSize: "13px" }}>{translatedProduct.name}</h6>
                    <span className="fw-bold font-mono-custom" style={{ fontSize: "13px", color: "var(--color-charcoal)" }}>${translatedProduct.price.toFixed(2)}</span>
                  </div>
                  <div className="col-6 col-sm-3 d-flex justify-content-center justify-content-sm-start">
                    <div className="d-flex align-items-center border p-1" style={{ height: "38px", backgroundColor: "var(--color-offwhite)", borderColor: "var(--color-beige)" }}>
                      <button onClick={() => onUpdateQuantity(cartItemId, product.id, quantity - 1)} className="btn btn-link p-1 border-0" style={{ color: "var(--color-gray-mid)" }}>
                        <Minus size={14} />
                      </button>
                      <span className="px-3 fw-bold font-mono-custom text-charcoal-custom" style={{ fontSize: "12px" }}>{quantity}</span>
                      <button onClick={() => onUpdateQuantity(cartItemId, product.id, quantity + 1)} disabled={quantity >= translatedProduct.stock} className="btn btn-link p-1 border-0" style={{ color: "var(--color-gray-mid)" }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3 d-flex align-items-center justify-content-end gap-3">
                    <span className="fw-bold font-mono-custom text-charcoal-custom" style={{ fontSize: "14px" }}>${(translatedProduct.price * quantity).toFixed(2)}</span>
                    <button onClick={() => onRemoveItem(cartItemId, product.id)} className="btn btn-outline-danger border-0 p-2" style={{ borderRadius: "0px" }} title={t("removeProduct")}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-lg-4">
          <div className="card rounded-0 p-4 shadow-sm position-relative" style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-charcoal)" }}>
            <div className="position-absolute top-0 start-0 w-100" style={{ height: "4px", backgroundColor: "var(--color-charcoal)" }} />
            <h6 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-4">{t("orderInvoice")}</h6>
            <div className="border-bottom pb-3 mb-3 d-grid gap-2 font-mono-custom" style={{ fontSize: "12px", borderColor: "var(--color-beige)" }}>
              <div className="d-flex justify-content-between text-muted">
                <span>{t("vesselSubtotal")}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>{t("shippingDispatch")}</span>
                <span>{shipping === 0 ? <span className="fw-bold text-uppercase" style={{ fontSize: "10px" }}>{t("freeCourier")}</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="font-serif-custom fw-bold text-charcoal-custom text-uppercase" style={{ fontSize: "12px" }}>{t("finalSum")}</span>
              <span className="fw-bold font-sans fs-3" style={{ color: "var(--color-charcoal)" }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} className="btn btn-primary-custom w-100 py-3 text-uppercase fw-bold font-mono-custom d-flex align-items-center justify-content-center gap-2" style={{ fontSize: "11px", letterSpacing: "1px" }}>
              <span>{t("secureCheckoutBtn")}</span>
              <ChevronRight size={14} className={lang === "ar" ? "rotate-180" : ""} />
            </button>
            <div className="mt-4 pt-3 d-flex align-items-center justify-content-center gap-2 font-mono-custom text-muted" style={{ fontSize: "10px", borderTop: "0.5px solid var(--color-beige)" }}>
              <ShieldCheck size={14} className="text-success" />
              <span>{t("sslGuarantee")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
