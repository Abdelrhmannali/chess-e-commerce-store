import React, { useState, useEffect } from "react";
import { X, Star, ShoppingCart, Heart, ShieldAlert } from "lucide-react";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { getProductTranslation } from "../utils/translations";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80";

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}) {
  const [liveProduct, setLiveProduct] = useState(product);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const { lang, t } = useLanguage();
  const translatedProduct = getProductTranslation(liveProduct, lang);
  const imageUrl = translatedProduct.images?.[0] || translatedProduct.image || PLACEHOLDER_IMAGE;

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
    return () => { active = false; };
  }, [product.id, product]);

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(17, 17, 17, 0.85)", backdropFilter: "blur(5px)", zIndex: 1060, overflowY: "auto" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered my-5">
        <div className="modal-content bg-white border-gold-custom rounded-0 shadow-lg position-relative overflow-hidden">
          <button onClick={onClose} className="btn btn-dark-custom position-absolute border-0 rounded-circle" style={{ top: "16px", right: lang === "ar" ? "auto" : "16px", left: lang === "ar" ? "16px" : "auto", zIndex: 10, width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>

          <div className="row g-0">
            <div className="col-md-6 p-4 bg-light d-flex flex-column justify-content-center border-end">
              <div className="bg-white border border-custom p-2 mb-3" style={{ aspectRatio: "1" }}>
                <img src={imageUrl} alt={translatedProduct.name} referrerPolicy="no-referrer" className="w-100 h-100 object-fit-cover" />
              </div>
            </div>

            <div className={`col-md-6 p-4 d-flex flex-column ${lang === "ar" ? "text-end" : "text-start"}`} style={{ maxHeight: "85vh", overflowY: "auto" }}>
              <span className="font-mono-custom fw-bold text-gold-custom text-uppercase d-block mb-1" style={{ fontSize: "11px", letterSpacing: "1.5px" }}>
                {translatedProduct.categoryName || translatedProduct.category}
              </span>
              <h3 className="font-serif-custom fw-bold text-charcoal-custom mb-2">{translatedProduct.name}</h3>
              {loadingProduct && <span className="badge badge-custom mb-2">{lang === "ar" ? "جاري التحديث..." : "Syncing..."}</span>}

              <div className={`d-flex align-items-center gap-2 mb-4 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                <div className="d-flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(translatedProduct.rating || 0) ? "text-gold-custom fill-gold" : "text-muted opacity-25"} />
                  ))}
                </div>
                <span className="text-muted font-mono-custom" style={{ fontSize: "11px" }}>{(translatedProduct.rating || 0).toFixed(1)}</span>
              </div>

              <div className="p-3 bg-light border border-custom mb-4">
                <div className={`d-flex align-items-center justify-content-between ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                  <div>
                    <span className="text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{lang === "ar" ? "السعر" : "Price"}</span>
                    <span className="fs-3 fw-bold text-charcoal-custom font-serif-custom">${translatedProduct.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted font-mono-custom text-uppercase d-block mb-1" style={{ fontSize: "9px" }}>{t("statusLabel")}</span>
                    {translatedProduct.stock === 0 ? (
                      <span className="badge bg-danger-subtle text-danger border border-danger rounded-0 px-2.5 py-1 text-uppercase font-mono-custom" style={{ fontSize: "10px" }}>{t("soldOut")}</span>
                    ) : translatedProduct.stock <= 5 ? (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning rounded-0 px-2.5 py-1 text-uppercase font-mono-custom" style={{ fontSize: "10px" }}>{t("onlyLeft").replace("{stock}", String(translatedProduct.stock))}</span>
                    ) : (
                      <span className="badge bg-success-subtle text-success border border-success rounded-0 px-2.5 py-1 text-uppercase font-mono-custom" style={{ fontSize: "10px" }}>{t("inStock")} ({translatedProduct.stock})</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-muted font-mono-custom text-uppercase fw-bold mb-2" style={{ fontSize: "10px" }}>{lang === "ar" ? "الوصف" : "Description"}</h6>
                <p className="text-secondary font-sans mb-0" style={{ fontSize: "13px", lineHeight: "1.6" }}>{translatedProduct.description}</p>
              </div>

              <div className={`d-flex gap-2 mb-4 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                <button onClick={() => { if (translatedProduct.stock > 0) onAddToCart(liveProduct); }} disabled={translatedProduct.stock === 0} className={`btn flex-grow-1 py-3 text-uppercase fw-bold font-mono-custom d-flex align-items-center justify-content-center gap-2 ${translatedProduct.stock === 0 ? "btn-light text-muted border border-custom" : "btn-gold-custom"}`} style={{ fontSize: "11px" }}>
                  <ShoppingCart size={14} />
                  {lang === "ar" ? "إضافة إلى السلة" : "Add to Cart"}
                </button>
                <button onClick={() => onToggleWishlist(liveProduct)} className={`btn p-3 border rounded-0 d-flex align-items-center justify-content-center ${isWishlisted ? "btn-light border-danger text-danger bg-danger-subtle" : "btn-light border-secondary text-secondary"}`} style={{ width: "48px" }}>
                  <Heart size={16} className={isWishlisted ? "fill-danger" : ""} />
                </button>
              </div>

              <div className={`p-3 bg-light border border-custom d-flex gap-3 ${lang === "ar" ? "flex-row-reverse text-end" : ""}`}>
                <ShieldAlert size={18} className="text-gold-custom shrink-0 mt-1" />
                <div>
                  <span className="font-mono-custom fw-bold text-gold-custom text-uppercase d-block mb-1" style={{ fontSize: "10px" }}>{t("verifySecurityCert")}</span>
                  <p className="text-secondary m-0" style={{ fontSize: "11px", lineHeight: "1.4" }}>{t("qualityGuarantee")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
