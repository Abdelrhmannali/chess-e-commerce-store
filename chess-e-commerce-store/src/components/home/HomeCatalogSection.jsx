import React, { useMemo, useState } from "react";
import { FaChessBoard } from "react-icons/fa6";
import { ChevronRight } from "lucide-react";
import ProductCard from "../ProductCard";
import RevealOnScroll from "./RevealOnScroll";

const HOME_CATALOG_LIMIT = 8;

export default function HomeCatalogSection({
  products,
  categories,
  getCategoryLabel,
  onCategorySelect,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  t,
}) {
  const [homeCategory, setHomeCategory] = useState("all");

  const categoryFilters = useMemo(
    () => [{ slug: "all", name: "الكل" }, ...categories],
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const list =
      homeCategory === "all"
        ? products
        : products.filter((p) => p.category === homeCategory);
    return list.slice(0, HOME_CATALOG_LIMIT);
  }, [products, homeCategory]);

  return (
    <section className="beidaq-home-section beidaq-home-catalog rtl" id="home-catalog">
      <div className="container position-relative">
        <RevealOnScroll>
          <header className="beidaq-home-header text-center">
            <div className="beidaq-home-header-icon">
              <FaChessBoard aria-hidden="true" />
            </div>
            <span className="beidaq-home-eyebrow">{t("sovereignCatalog")}</span>
            <h2 className="beidaq-home-title">كتالوج المنتجات</h2>
            <p className="beidaq-home-subtitle">{t("catalogSub")}</p>
            <div className="beidaq-home-divider" />
          </header>
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <div className="beidaq-home-catalog-filters">
            {categoryFilters.map((cat) => (
              <button
                key={cat.slug || cat.id}
                type="button"
                className={`beidaq-home-filter-pill${
                  homeCategory === cat.slug ? " beidaq-home-filter-pill--active" : ""
                }`}
                onClick={() => setHomeCategory(cat.slug)}
              >
                {cat.slug === "all" ? getCategoryLabel("all") : cat.name}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        {filteredProducts.length === 0 ? (
          <div className="beidaq-home-empty">{t("noProducts")}</div>
        ) : (
          <div className="row g-4 beidaq-home-product-grid">
            {filteredProducts.map((product, index) => (
              <div className="col-12 col-md-6 col-lg-3" key={product.id}>
                <ProductCard
                  product={product}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={isWishlisted(product.id)}
                  animationIndex={index}
                />
              </div>
            ))}
          </div>
        )}

        <RevealOnScroll delay={120}>
          <div className="beidaq-home-catalog-cta text-center">
            <button
              type="button"
              className="beidaq-home-btn-outline"
              onClick={() => onCategorySelect("all")}
            >
              <span>{t("viewFullCatalog")}</span>
              <ChevronRight size={16} className="rotate-180" />
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
