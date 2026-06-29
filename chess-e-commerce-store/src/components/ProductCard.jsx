import React from "react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";
import "../styles/Catalog.css";

const formatSAR = (amount) =>
  `${Number(amount).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

export default function ProductCard({
  product,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  animationIndex = 0,
}) {
  const { t } = useLanguage();
  const translatedProduct = getProductTranslation(product);

  const displayPrice =
    translatedProduct.discountPrice !== undefined
      ? translatedProduct.discountPrice
      : translatedProduct.price;
  const originalPrice =
    translatedProduct.discountPrice !== undefined ? translatedProduct.price : null;
  const discountPercent = originalPrice
    ? Math.round(((translatedProduct.price - displayPrice) / translatedProduct.price) * 100)
    : null;

  const imageSrc =
    translatedProduct.images?.[0] ||
    translatedProduct.image ||
    "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80";

  return (
    <article
      className="beidaq-product-card"
      id={`product-card-${translatedProduct.id}`}
      style={{ "--card-index": animationIndex }}
      onClick={() => onSelect(product)}
    >
      {/* Image */}
      <div className="beidaq-product-image-wrap">
        <img
          src={imageSrc}
          alt={translatedProduct.name}
          referrerPolicy="no-referrer"
          className="beidaq-product-image"
          loading="lazy"
        />
        <div className="beidaq-product-image-overlay" aria-hidden="true" />

        {/* Badges */}
        <div className="beidaq-product-badges">
          {translatedProduct.isBestSeller && (
            <span className="beidaq-product-badge beidaq-product-badge--bestseller">
              {t("bestsellerBadge")}
            </span>
          )}
          {translatedProduct.isNewArrival && (
            <span className="beidaq-product-badge beidaq-product-badge--new">
              {t("newArrivalBadge")}
            </span>
          )}
          {discountPercent && (
            <span className="beidaq-product-badge beidaq-product-badge--discount">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => onToggleWishlist(product, e)}
          className={`beidaq-product-wishlist${isWishlisted ? " beidaq-product-wishlist--active" : ""}`}
          title={isWishlisted ? t("removeProduct") : t("viewWishlist")}
          aria-label={isWishlisted ? t("removeProduct") : t("viewWishlist")}
        >
          <Heart size={17} />
        </button>

        {/* Hover Actions */}
        <div className="beidaq-product-actions">
          <button
            type="button"
            className="beidaq-product-action-btn beidaq-product-action-btn--outline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
          >
            <Eye size={15} />
            <span>معاينة سريعة</span>
          </button>
          <button
            type="button"
            className="beidaq-product-action-btn beidaq-product-action-btn--primary"
            disabled={translatedProduct.stock === 0}
            onClick={(e) => onAddToCart(product, e)}
          >
            <ShoppingCart size={15} />
            <span>أضف للسلة</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="beidaq-product-body">
        <span className="beidaq-product-category">
          {translatedProduct.categoryName || translatedProduct.category}
        </span>

        <h3 className="beidaq-product-title">{translatedProduct.name}</h3>

        {translatedProduct.description && (
          <p className="beidaq-product-desc">{translatedProduct.description}</p>
        )}

        <div className="beidaq-product-rating">
          <div className="beidaq-product-stars" aria-label={`${(translatedProduct.rating || 0).toFixed(1)} stars`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={
                  i < Math.floor(translatedProduct.rating || 0)
                    ? "beidaq-star--filled"
                    : "beidaq-star--empty"
                }
                fill={i < Math.floor(translatedProduct.rating || 0) ? "currentColor" : "none"}
              />
            ))}
          </div>
          <span className="beidaq-product-rating-value">
            {(translatedProduct.rating || 0).toFixed(1)}
          </span>
        </div>

        <div className="beidaq-product-pricing">
          <div className="beidaq-product-price-group">
            {originalPrice && (
              <span className="beidaq-product-price-old">{formatSAR(originalPrice)}</span>
            )}
            <span className="beidaq-product-price">{formatSAR(displayPrice)}</span>
          </div>

          <button
            type="button"
            onClick={(e) => onAddToCart(product, e)}
            disabled={translatedProduct.stock === 0}
            className="beidaq-product-cart-btn"
            title={translatedProduct.stock === 0 ? t("outOfStock") : t("viewCart")}
            aria-label={translatedProduct.stock === 0 ? t("outOfStock") : t("viewCart")}
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        <div
          className={`beidaq-product-stock ${
            translatedProduct.stock === 0
              ? "beidaq-product-stock--out"
              : translatedProduct.stock <= 5
                ? "beidaq-product-stock--low"
                : "beidaq-product-stock--available"
          }`}
        >
          {translatedProduct.stock === 0
            ? t("soldOut")
            : translatedProduct.stock <= 5
              ? t("onlyLeft").replace("{stock}", String(translatedProduct.stock))
              : t("inStock")}
        </div>
      </div>
    </article>
  );
}
