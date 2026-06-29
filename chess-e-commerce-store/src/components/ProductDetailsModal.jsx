import React, { useState, useEffect } from "react";
import { X, Star, ShoppingCart, Heart, ShieldCheck } from "lucide-react";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";
import "../styles/ProductDetails.css";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80";

const formatSAR = (amount) =>
  `${Number(amount).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  const [liveProduct, setLiveProduct] = useState(product);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const { t } = useLanguage();
  const translatedProduct = getProductTranslation(liveProduct);
  const imageUrl =
    translatedProduct.images?.[0] || translatedProduct.image || PLACEHOLDER_IMAGE;

  const displayPrice =
    translatedProduct.discountPrice !== undefined
      ? translatedProduct.discountPrice
      : translatedProduct.price;
  const originalPrice =
    translatedProduct.discountPrice !== undefined ? translatedProduct.price : null;
  const discountPercent = originalPrice
    ? Math.round(((translatedProduct.price - displayPrice) / translatedProduct.price) * 100)
    : null;

  useEffect(() => {
    let active = true;
    async function fetchFreshProduct() {
      setLoadingProduct(true);
      try {
        const fresh = await api.getProduct(product.id);
        if (active) setLiveProduct(fresh);
      } catch {
        if (active) setLiveProduct(product);
      } finally {
        if (active) setLoadingProduct(false);
      }
    }
    fetchFreshProduct();
    return () => {
      active = false;
    };
  }, [product.id, product]);

  const stockClass =
    translatedProduct.stock === 0
      ? "beidaq-product-modal__stock--out"
      : translatedProduct.stock <= 5
        ? "beidaq-product-modal__stock--low"
        : "beidaq-product-modal__stock--in";

  const stockLabel =
    translatedProduct.stock === 0
      ? t("soldOut")
      : translatedProduct.stock <= 5
        ? t("onlyLeft").replace("{stock}", String(translatedProduct.stock))
        : `${t("inStock")} (${translatedProduct.stock})`;

  return (
    <div
      className="beidaq-product-overlay rtl"
      tabIndex={-1}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="beidaq-product-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="beidaq-product-modal__close"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        <div className="beidaq-product-modal__grid">
          <div className="beidaq-product-modal__media">
            <div className="beidaq-product-modal__image-wrap">
              <img
                src={imageUrl}
                alt={translatedProduct.name}
                referrerPolicy="no-referrer"
                className="beidaq-product-modal__image"
              />
            </div>
          </div>

          <div className="beidaq-product-modal__body">
            <span className="beidaq-product-modal__category">
              {translatedProduct.categoryName || translatedProduct.category}
            </span>

            <h2 className="beidaq-product-modal__title" id="product-modal-title">
              {translatedProduct.name}
            </h2>

            {loadingProduct && (
              <span className="beidaq-product-modal__loading">جاري التحديث...</span>
            )}

            <div className="beidaq-product-modal__rating">
              <div
                className="beidaq-product-modal__stars"
                aria-label={`${(translatedProduct.rating || 0).toFixed(1)} stars`}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(translatedProduct.rating || 0)
                        ? "beidaq-star--filled"
                        : "beidaq-star--empty"
                    }
                    fill={
                      i < Math.floor(translatedProduct.rating || 0) ? "currentColor" : "none"
                    }
                  />
                ))}
              </div>
              <span className="beidaq-product-modal__rating-value">
                {(translatedProduct.rating || 0).toFixed(1)}
              </span>
            </div>

            <div className="beidaq-product-modal__price-box">
              <div className="beidaq-product-modal__price-row">
                <div>
                  <span className="beidaq-product-modal__price-label">السعر</span>
                  {originalPrice && (
                    <span className="beidaq-product-modal__price-old">
                      {formatSAR(originalPrice)}
                    </span>
                  )}
                  <span className="beidaq-product-modal__price">
                    {formatSAR(displayPrice)}
                    {discountPercent && (
                      <span className="beidaq-product-modal__discount">-{discountPercent}%</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="beidaq-product-modal__stock-label">التوفر</span>
                  <span className={`beidaq-product-modal__stock ${stockClass}`}>
                    {stockLabel}
                  </span>
                </div>
              </div>
            </div>

            {translatedProduct.description && (
              <div>
                <h3 className="beidaq-product-modal__desc-title">الوصف</h3>
                <p className="beidaq-product-modal__desc">{translatedProduct.description}</p>
              </div>
            )}

            <div className="beidaq-product-modal__actions">
              <button
                type="button"
                onClick={() => {
                  if (translatedProduct.stock > 0) onAddToCart(liveProduct);
                }}
                disabled={translatedProduct.stock === 0}
                className="beidaq-product-modal__cart-btn"
              >
                <ShoppingCart size={16} />
                <span>أضف للسلة</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(liveProduct)}
                className={`beidaq-product-modal__wishlist-btn${
                  isWishlisted ? " beidaq-product-modal__wishlist-btn--active" : ""
                }`}
                aria-label={isWishlisted ? t("removeProduct") : t("viewWishlist")}
              >
                <Heart size={18} />
              </button>
            </div>

            <div className="beidaq-product-modal__trust">
              <div className="beidaq-product-modal__trust-icon">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div>
                <span className="beidaq-product-modal__trust-title">
                  {t("verifySecurityCert")}
                </span>
                <p className="beidaq-product-modal__trust-text">{t("qualityGuarantee")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
