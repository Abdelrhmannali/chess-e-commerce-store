import React from "react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";

export default function ProductCard({
  product,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}) {
  const { t } = useLanguage();
  const translatedProduct = getProductTranslation(product);

  const displayPrice = translatedProduct.discountPrice !== undefined ? translatedProduct.discountPrice : translatedProduct.price;
  const originalPrice = translatedProduct.discountPrice !== undefined ? translatedProduct.price : null;

  return (
    <div
      onClick={() => onSelect(product)}
      className="card h-100 product-card-custom position-relative cursor-pointer"
      id={`product-card-${translatedProduct.id}`}
    >
      {/* Badges container */}
      <div 
        className="position-absolute z-3 d-flex flex-column gap-1" 
        style={{ 
          top: "14px", 
          right: "auto", 
          left: "14px" 
        }}
      >
        {translatedProduct.isBestSeller && (
          <span className="badge bg-black-custom text-white fw-bold text-uppercase px-2.5 py-1 text-xs" style={{ borderRadius: "0px", letterSpacing: "1px" }}>
            {t("bestsellerBadge")}
          </span>
        )}
        {translatedProduct.isNewArrival && (
          <span className="badge bg-dark text-white border border-secondary fw-bold text-uppercase px-2.5 py-1 text-xs" style={{ borderRadius: "0px", letterSpacing: "1px" }}>
            {t("newArrivalBadge")}
          </span>
        )}
        {originalPrice && (
          <span className="badge bg-danger text-white fw-bold text-uppercase px-2.5 py-1 text-xs" style={{ borderRadius: "0px", letterSpacing: "1px" }}>
            {t("promoBadge")}
          </span>
        )}
      </div>

      {/* Wishlist Heart */}
      <button
        onClick={(e) => onToggleWishlist(product, e)}
        className="btn bg-white border border-light position-absolute z-3 p-2 rounded-circle shadow-sm"
        style={{ 
          top: "14px", 
          left: "auto", 
          right: "14px",
          width: "38px",
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title={isWishlisted ? t("removeProduct") : t("viewWishlist")}
      >
        <Heart size={16} className={isWishlisted ? "text-danger fill-danger" : "text-secondary"} />
      </button>

      {/* Image container */}
      <div className="position-relative overflow-hidden bg-light border-bottom" style={{ aspectRatio: "1" }}>
        <img
          src={translatedProduct.images?.[0] || translatedProduct.image || "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80"}
          alt={translatedProduct.name}
          referrerPolicy="no-referrer"
          className="w-100 h-100 object-fit-cover transition"
          style={{ transition: "all 0.5s ease" }}
        />
        {/* Action Overlay */}
        <div 
          className="position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 opacity-0 text-white transition-opacity"
          style={{ transition: "opacity 0.3s ease" }}
        >
          <div className="p-3 bg-gold-custom text-charcoal-custom rounded-circle shadow-lg">
            <Eye size={18} />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="card-body d-flex flex-column p-4 text-start">
        {/* Category */}
        <span className={`font-mono-custom fw-bold text-gold-custom text-uppercase d-block mb-1`} style={{ fontSize: "10px", letterSpacing: "1.5px" }}>
          {translatedProduct.categoryName || translatedProduct.category}
        </span>

        {/* Title */}
        <h5 className="card-title font-serif-custom fw-bold text-charcoal-custom mb-2 text-truncate-2" style={{ fontSize: "1rem", lineHeight: "1.4" }}>
          {translatedProduct.name}
        </h5>

        {/* Rating */}
        <div className="d-flex align-items-center gap-2 mb-3 mt-auto flex-row-reverse">
          <div className="d-flex text-warning">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(translatedProduct.rating) ? "text-gold-custom fill-gold" : "text-muted opacity-25"}
              />
            ))}
          </div>
          <span className="text-muted font-mono-custom" style={{ fontSize: "11px" }}>
            {(translatedProduct.rating || 0).toFixed(1)}
          </span>
        </div>

        {/* Pricing & Cart Action */}
        <div className="d-flex align-items-center justify-content-between pt-3 border-top flex-row-reverse">
          <div className="d-flex flex-column">
            {originalPrice && (
              <span className="text-muted text-decoration-line-through font-mono-custom" style={{ fontSize: "11px" }}>
                ${translatedProduct.price.toFixed(2)}
              </span>
            )}
            <span className="fs-5 fw-bold text-charcoal-custom font-serif-custom">
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={translatedProduct.stock === 0}
            className={`btn d-flex align-items-center justify-content-center ${
              translatedProduct.stock === 0
                ? "btn-light text-muted border-0 cursor-not-allowed"
                : "btn-dark-custom"
            }`}
            style={{ width: "40px", height: "40px", borderRadius: "0px" }}
            title={translatedProduct.stock === 0 ? t("outOfStock") : t("viewCart")}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Inventory Stock Status */}
        <div className="mt-2 text-start">
          {translatedProduct.stock === 0 ? (
            <span className="text-danger font-mono-custom fw-bold text-uppercase" style={{ fontSize: "10px", letterSpacing: "1px" }}>{t("soldOut")}</span>
          ) : translatedProduct.stock <= 5 ? (
            <span className="text-gold-custom font-mono-custom fw-bold text-uppercase" style={{ fontSize: "10px", letterSpacing: "1px" }}>
              {t("onlyLeft").replace("{stock}", String(translatedProduct.stock))}
            </span>
          ) : (
            <span className="text-muted font-mono-custom text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>{t("inStock")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
