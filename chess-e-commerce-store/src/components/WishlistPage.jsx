import React from "react";
import { Heart } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import ProductCard from "./ProductCard";
import "../styles/UserPages.css";

export default function WishlistPage({
  wishlist,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  onNavigateToShop,
}) {
  const { t } = useLanguage();

  return (
    <section className="beidaq-page rtl" id="wishlist-view-page">
      <div className="container">
        <header className="beidaq-page__header">
          <span className="beidaq-page__eyebrow">
            <Heart size={14} />
            {t("myStrategyWishlist")}
          </span>
          <h1 className="beidaq-page__title">{t("myStrategyWishlist")}</h1>
          <p className="beidaq-page__subtitle">{t("wishlistSub")}</p>
          <div className="beidaq-page__divider" />
        </header>

        {wishlist.length === 0 ? (
          <div className="beidaq-empty">
            <div className="beidaq-empty__icon">
              <Heart size={28} />
            </div>
            <h2 className="beidaq-empty__title">{t("noWishlistTitle")}</h2>
            <p className="beidaq-empty__text">{t("noWishlistDesc")}</p>
            <button type="button" onClick={onNavigateToShop} className="beidaq-btn-gold">
              {t("exploreElite")}
            </button>
          </div>
        ) : (
          <div className="row beidaq-catalog-grid g-4">
            {wishlist.map((product, index) => (
              <div className="col-12 col-md-6 col-lg-3" key={product.id}>
                <ProductCard
                  product={product}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={true}
                  animationIndex={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
