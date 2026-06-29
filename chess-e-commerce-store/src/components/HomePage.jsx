import React from "react";
import {
  Sparkles,
  Award,
  Crown,
  Clock,
  BookOpen,
  Gem,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import ProductCard from "./ProductCard";
import CustomerReviews from "./home/CustomerReviews";
import ContactSection from "./home/ContactSection";
import HomeCatalogSection from "./home/HomeCatalogSection";
import RevealOnScroll from "./home/RevealOnScroll";
import "../styles/Home.css";

export default function HomePage({
  t,
  categories,
  products,
  loadingProducts,
  featuredProduct,
  getCategoryLabel,
  handleCategorySelect,
  handleSelectProduct,
  handleAddToCart,
  handleToggleWishlist,
  isWishlisted,
}) {
  const categoryItems =
    categories.length > 0
      ? categories.slice(0, 4)
      : [
          { slug: "boards", name: t("boards"), description: t("boardsDesc") },
          { slug: "pieces", name: t("pieces"), description: t("piecesDesc") },
          { slug: "clocks", name: t("clocks"), description: t("clocksDesc") },
          { slug: "accessories", name: t("accessories"), description: t("accessoriesDesc") },
        ];

  const featuredProducts = products.filter((p) => p.isBestSeller).slice(0, 3);

  return (
    <div className="beidaq-home rtl" id="home-view-page">
      {/* 1. Hero Banner */}
      <section className="beidaq-hero hero-section overflow-hidden position-relative">
        <div className="beidaq-hero-pattern" aria-hidden="true" />
        <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6 order-lg-2 text-lg-end">
              <RevealOnScroll>
                <div className="beidaq-hero-badge d-inline-flex align-items-center gap-2 mb-4">
                  <Sparkles size={14} className="beidaq-hero-sparkle" />
                  <span>{t("choiceOfSovereigns")}</span>
                </div>
                <h1 className="beidaq-hero-title mb-4">
                  {t("tactileStrategy")}{" "}
                  <span className="beidaq-hero-accent">{t("uncompromised")}</span>
                </h1>
                <p className="beidaq-hero-desc mb-4">{t("heroDesc")}</p>
                <div className="d-flex flex-wrap gap-3 justify-content-lg-end">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("all")}
                    className="beidaq-hero-btn-primary"
                  >
                    <span>{t("browseCatalog")}</span>
                    <ArrowRight size={16} className="rotate-180" />
                  </button>
                  {categories[0] && (
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(categories[0].slug)}
                      className="beidaq-hero-btn-outline"
                    >
                      {t("explorePieces")}
                    </button>
                  )}
                </div>
              </RevealOnScroll>
            </div>

            <div className="col-lg-6 d-flex justify-content-center order-lg-1">
              <RevealOnScroll delay={120}>
                <div className="beidaq-hero-card w-100">
                  <img
                    src={
                      featuredProduct?.images?.[0] ||
                      "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="Luxury Chess Setup"
                    referrerPolicy="no-referrer"
                    className="beidaq-hero-card-img"
                  />
                  <div className="beidaq-hero-card-footer">
                    <div>
                      <span className="beidaq-hero-card-label">{t("artisanMasterpiece")}</span>
                      <span className="beidaq-hero-card-name">
                        {featuredProduct?.name || t("championshipPieces")}
                      </span>
                    </div>
                    {featuredProduct && (
                      <button
                        type="button"
                        onClick={() => handleSelectProduct(featuredProduct)}
                        className="beidaq-hero-card-btn"
                      >
                        <span>{t("inspect")}</span>
                        <ExternalLink size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories */}
      <section className="beidaq-home-section beidaq-home-categories" id="home-categories">
        <div className="beidaq-home-glow" aria-hidden="true" />
        <div className="container position-relative">
          <RevealOnScroll>
            <header className="beidaq-home-header text-center">
              <span className="beidaq-home-eyebrow">{t("featuredLayouts")}</span>
              <h2 className="beidaq-home-title">{t("curationCollections")}</h2>
              <div className="beidaq-home-divider" />
            </header>
          </RevealOnScroll>

          <div className="row g-4">
            {categoryItems.map((cat, idx) => {
              const icons = [Award, Crown, Clock, BookOpen];
              const Icon = icons[idx] || Gem;
              return (
                <div className="col-6 col-lg-3" key={cat.slug || cat.id}>
                  <RevealOnScroll delay={idx * 70}>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug)}
                      className="beidaq-category-card w-100 h-100"
                    >
                      <div className="beidaq-category-icon beidaq-float-icon">
                        <Icon size={22} />
                      </div>
                      <h3 className="beidaq-category-name">{cat.name}</h3>
                      {cat.description && (
                        <span className="beidaq-category-desc">{cat.description}</span>
                      )}
                    </button>
                  </RevealOnScroll>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="beidaq-home-section beidaq-home-featured" id="home-featured">
        <div className="container position-relative">
          <RevealOnScroll>
            <div className="beidaq-home-section-head flex-row-reverse">
              <div>
                <span className="beidaq-home-eyebrow">{t("acquisitionLeaders")}</span>
                <h2 className="beidaq-home-title mb-0">{t("bestSellers")}</h2>
              </div>
              <button
                type="button"
                onClick={() => handleCategorySelect("all")}
                className="beidaq-home-link-btn"
              >
                <span>{t("viewFullCatalog")}</span>
                <ChevronRight size={15} className="rotate-180" />
              </button>
            </div>
          </RevealOnScroll>

          <div className="row g-4 mt-2 beidaq-home-product-grid">
            {loadingProducts ? (
              <div className="col-12 beidaq-home-loading">جاري تحميل الكتالوج...</div>
            ) : (
              featuredProducts.map((product, index) => (
                <div className="col-md-6 col-lg-4" key={product.id}>
                  <RevealOnScroll delay={index * 90}>
                    <ProductCard
                      product={product}
                      onSelect={handleSelectProduct}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={isWishlisted(product.id)}
                      animationIndex={index}
                    />
                  </RevealOnScroll>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Product Catalog */}
      <HomeCatalogSection
        products={products}
        categories={categories}
        getCategoryLabel={getCategoryLabel}
        onCategorySelect={handleCategorySelect}
        onSelectProduct={handleSelectProduct}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isWishlisted}
        t={t}
      />

      {/* 5. Customer Reviews */}
      <CustomerReviews />

      {/* 6. Contact Us */}
      <ContactSection />
    </div>
  );
}
