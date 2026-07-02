import React from "react";
import { FaStar, FaCircleCheck } from "react-icons/fa6";
import RevealOnScroll from "./RevealOnScroll";

const TESTIMONIALS = [
  {
    id: 1,
    name: "محمد حمدان",
    city: "الرياض",
    date: "12 مارس 2026",
    initial: "خ",
    text: "بصراحة الجودة فاقت توقعي، التغليف مرتب جدًا ووصل الطلب بسرعة. أكيد مو آخر مرة أطلب من بيدق.",
  },
  {
    id: 2,
    name: "مريم حسن",
    city: "جدة",
    date: "28 فبراير 2026",
    initial: "ن",
    text: "أفضل متجر شطرنج تعاملت معه، خدمة راقية وسرعة بالشحن. القطع ثقيلة وممتازة للعب اليومي.",
  },
  {
    id: 3,
    name: "محمد محمود",
    city: "الدمام",
    date: "5 مارس 2026",
    initial: "م",
    text: "المنتجات نفس الصور بالضبط، والرقعة جت بحالة ممتازة. أنصح فيه بكل أمانة لكل اللي يحبون الشطرنج.",
  },
  {
    id: 4,
    name: "ريم الشمري",
    city: "الخبر",
    date: "18 فبراير 2026",
    initial: "ر",
    text: "طلبت ساعة شطرنج هدية لأخوي وطلعت فخمة مرّة. التغليف يصلح للإهداء بدون أي تعديل.",
  },
  {
    id: 5,
    name: "عبدالله المطيري",
    city: "مكة",
    date: "2 مارس 2026",
    initial: "ع",
    text: "تعامل راقي من أول رسالة لين وصول الطلب. الدعم ردّوا علي بسرعة ووضّحوا كل التفاصيل.",
  },
  {
    id: 6,
    name: "سارة عبدالله",
    city: "المدينة",
    date: "20 فبراير 2026",
    initial: "س",
    text: "اشتريت طقم قطع للنادي وكل اللاعبين عجبهم. الجودة تستاهل السعر وما حسيت بأي نقص بالتجهيز.",
  },
];

export default function CustomerReviews() {
  return (
    <section className="beidaq-home-section beidaq-reviews rtl" id="customer-reviews">
      <div className="beidaq-home-glow" aria-hidden="true" />
      <div className="container position-relative">
        <RevealOnScroll>
          <header className="beidaq-home-header text-center">
            <span className="beidaq-home-eyebrow">آراء حقيقية من عملائنا</span>
            <h2 className="beidaq-home-title">⭐ آراء عملائنا</h2>
            <p className="beidaq-home-subtitle">
              نفخر بثقة عملائنا ونسعد دائمًا بتقديم أفضل تجربة تسوق لعشاق الشطرنج.
            </p>
            <div className="beidaq-home-divider" />
          </header>
        </RevealOnScroll>

        <div className="row g-4 beidaq-reviews-grid">
          {TESTIMONIALS.map((review, index) => (
            <div className="col-md-6 col-lg-4" key={review.id}>
              <RevealOnScroll delay={index * 80}>
                <article className="beidaq-review-card h-100">
                  <div className="beidaq-review-top">
                    <div className="beidaq-review-avatar" aria-hidden="true">
                      {review.initial}
                    </div>
                    <div className="beidaq-review-meta">
                      <h3 className="beidaq-review-name">{review.name}</h3>
                      <span className="beidaq-review-city">{review.city}</span>
                    </div>
                  </div>

                  <div className="beidaq-review-badges">
                    <span className="beidaq-review-verified">
                      <FaCircleCheck aria-hidden="true" />
                      عملية شراء موثّقة
                    </span>
                    <span className="beidaq-review-date">{review.date}</span>
                  </div>

                  <div className="beidaq-review-stars" aria-label="5 من 5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} aria-hidden="true" />
                    ))}
                  </div>

                  <blockquote className="beidaq-review-text">
                    &ldquo;{review.text}&rdquo;
                  </blockquote>
                </article>
              </RevealOnScroll>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
