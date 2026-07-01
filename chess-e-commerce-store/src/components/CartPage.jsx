import React from "react";
import { ShoppingCart, Trash2, Plus, Minus, ChevronRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";
import "../styles/UserPages.css";

const formatSAR = (amount) =>
  `${Number(amount).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

export default function CartPage({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onNavigateToShop,
}) {
  const { t } = useLanguage();

  const effectivePriceOf = (p) => (p.discountPrice ?? p.effectivePrice ?? p.price);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + effectivePriceOf(item.product) * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? (subtotal > 150 ? 0 : 15.0) : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <section className="beidaq-page rtl" id="empty-cart-state">
        <div className="container">
          <div className="beidaq-empty">
            <div className="beidaq-empty__icon">
              <ShoppingCart size={32} />
            </div>
            <h2 className="beidaq-empty__title">{t("emptyCartTitle")}</h2>
            <p className="beidaq-empty__text">{t("emptyCartDesc")}</p>
            <button type="button" onClick={onNavigateToShop} className="beidaq-btn-gold">
              {t("exploreElite")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="beidaq-page rtl" id="cart-page-layout">
      <div className="container">
        <header className="beidaq-page__header">
          <span className="beidaq-page__eyebrow">
            <ShoppingCart size={14} />
            {t("yourChessCart")}
          </span>
          <h1 className="beidaq-page__title">{t("yourChessCart")}</h1>
          <p className="beidaq-page__subtitle">{t("cartSub")}</p>
          <div className="beidaq-page__divider" />
        </header>

        <div className="row g-4">
          <div className="col-lg-8 d-flex flex-column gap-3">
            {cartItems.map(({ id: cartItemId, product, quantity }) => {
              const translatedProduct = getProductTranslation(product);
              return (
                <article key={cartItemId || product.id} className="beidaq-cart-item">
                  <div className="row g-3 align-items-center flex-row-reverse text-end">
                    <div className="col-4 col-sm-2 d-flex justify-content-center">
                      <img
                        src={translatedProduct.images?.[0] || ""}
                        alt={translatedProduct.name}
                        referrerPolicy="no-referrer"
                        className="beidaq-cart-item__image"
                      />
                    </div>
                    <div className="col-8 col-sm-4">
                      <span className="beidaq-cart-item__category">
                        {translatedProduct.categoryName || translatedProduct.category}
                      </span>
                      <h3 className="beidaq-cart-item__name">{translatedProduct.name}</h3>
                      {translatedProduct.discountPrice !== undefined ? (
                        <div className="d-flex align-items-baseline gap-2 flex-row-reverse">
                          <span className="beidaq-cart-item__price" style={{ color: "#B8962E" }}>
                            {formatSAR(translatedProduct.discountPrice)}
                          </span>
                          <span
                            style={{
                              textDecoration: "line-through",
                              textDecorationColor: "#DC2626",
                              textDecorationThickness: "2px",
                              color: "#6B6B6B",
                              fontSize: "0.95rem",
                              fontWeight: 600,
                            }}
                          >
                            {formatSAR(translatedProduct.price)}
                          </span>
                          <span style={{ background: "#DC2626", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "8px", fontWeight: 700 }}>
                            -{translatedProduct.discountPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="beidaq-cart-item__price">
                          {formatSAR(translatedProduct.price)}
                        </span>
                      )}
                    </div>
                    <div className="col-6 col-sm-3 d-flex justify-content-center justify-content-sm-start">
                      <div className="beidaq-qty-control">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(cartItemId, product.id, quantity - 1)}
                          className="beidaq-qty-btn"
                          aria-label="تقليل الكمية"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="beidaq-qty-value">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(cartItemId, product.id, quantity + 1)}
                          disabled={quantity >= translatedProduct.stock}
                          className="beidaq-qty-btn"
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3 d-flex align-items-center justify-content-end gap-3 flex-row-reverse">
                      <span className="beidaq-cart-item__total">
                        {formatSAR(effectivePriceOf(translatedProduct) * quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(cartItemId, product.id)}
                        className="beidaq-cart-remove"
                        title={t("removeProduct")}
                        aria-label={t("removeProduct")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="col-lg-4">
            <aside className="beidaq-cart-summary">
              <h2 className="beidaq-cart-summary__title">{t("orderInvoice")}</h2>
              <div className="beidaq-cart-summary__row">
                <span>{t("vesselSubtotal")}</span>
                <span>{formatSAR(subtotal)}</span>
              </div>
              <div className="beidaq-cart-summary__row">
                <span>{t("shippingDispatch")}</span>
                <span>
                  {shipping === 0 ? (
                    <span className="beidaq-cart-summary__free">{t("freeCourier")}</span>
                  ) : (
                    formatSAR(shipping)
                  )}
                </span>
              </div>
              <div className="beidaq-cart-summary__total-row">
                <span className="beidaq-cart-summary__total-label">{t("finalSum")}</span>
                <span className="beidaq-cart-summary__total-value">{formatSAR(total)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="beidaq-btn-gold beidaq-btn-gold--full"
              >
                <span>{t("secureCheckoutBtn")}</span>
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <div className="beidaq-cart-summary__secure">
                <ShieldCheck size={15} />
                <span>{t("sslGuarantee")}</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
