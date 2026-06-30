import React from "react";
import RevealOnScroll from "./RevealOnScroll";

const BRANDS = [
  { id: "staunton", name: "Staunton", tagline: "EST. 1849" },
  { id: "dgt", name: "DGT", tagline: "DIGITAL CHESS" },
  { id: "hos", name: "House of Staunton", tagline: "PREMIUM SETS" },
  { id: "chessbase", name: "ChessBase", tagline: "SOFTWARE" },
  { id: "millennium", name: "Millennium", tagline: "SMART BOARDS" },
];

export default function BrandsSection() {
  return (
    <section
      className="beidaq-home-section beidaq-brands rtl"
      id="brands-section"
    >
      <div className="beidaq-home-glow" aria-hidden="true" />
      <div className="container position-relative">
        <RevealOnScroll>
          <header className="beidaq-home-header text-center">
            <span className="beidaq-home-eyebrow">شركاء التميّز</span>
            <h2 className="beidaq-home-title">العلامات التجارية</h2>
            <p className="beidaq-home-subtitle">
              نقدم لك مجموعة من أرقى العلامات التجارية العالمية المتخصصة في صناعة
              الشطرنج الفاخر.
            </p>
            <div className="beidaq-home-divider" />
          </header>
        </RevealOnScroll>

        <div className="row g-4 justify-content-center">
          {BRANDS.map((brand, index) => (
            <div
              className="col-6 col-sm-4 col-md-4 col-lg-2"
              key={brand.id}
            >
              <RevealOnScroll delay={index * 80}>
                <div className="beidaq-brand-card" title={brand.name}>
                  <span className="beidaq-brand-name">{brand.name}</span>
                  <span className="beidaq-brand-tag">{brand.tagline}</span>
                </div>
              </RevealOnScroll>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
