import React from "react";
import { BookOpen, Target, TrendingUp, ArrowLeft } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";

const ARTICLES = [
  {
    id: 1,
    icon: BookOpen,
    title: "مبادئ الافتتاحيات",
    description:
      "تعلم أهم الافتتاحيات التي تمنحك بداية قوية في كل مباراة وتساعدك على السيطرة على المركز.",
    image:
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=900&q=80",
    tag: "افتتاحيات",
    link: "https://covince.com/insights/CoVince/ar/Chessopeningtheoryforbeginners/e5f596ec-98b6-4bf9-b4b5-95d4ebfe7e8e",
  },
  {
    id: 2,
    icon: Target,
    title: "أنماط كش مات",
    description:
      "اكتشف أشهر طرق إنهاء المباريات بسرعة واحترافية من خلال أنماط كش مات شهيرة.",
    image:
      "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=900&q=80",
    tag: "تكتيك",
    link: "https://www.chess.com/article/view/fastest-chess-checkmates",
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "كيف تطور تصنيفك؟",
    description:
      "نصائح عملية لتحسين مستواك وزيادة تصنيفك في الشطرنج عبر التدريب الذكي والمنظم.",
    image:
      "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?auto=format&fit=crop&w=900&q=80",
    tag: "تطوير",
    link: "https://www.wikihow.com/Become-a-Better-Chess-Player",
  },
];

export default function ChessArticles() {
  return (
    <section
      className="beidaq-home-section beidaq-articles rtl"
      id="chess-articles"
    >
      <div className="beidaq-home-glow" aria-hidden="true" />
      <div className="container position-relative">
        <RevealOnScroll>
          <header className="beidaq-home-header text-center">
            <span className="beidaq-home-eyebrow">معرفة الشطرنج</span>
            <h2 className="beidaq-home-title">مقالات ونصائح الشطرنج</h2>
            <p className="beidaq-home-subtitle">
              مقالات مختارة بعناية لتساعدك على تطوير مستواك والاستمتاع بكل مباراة.
            </p>
            <div className="beidaq-home-divider" />
          </header>
        </RevealOnScroll>

        <div className="row g-4">
          {ARTICLES.map((article, index) => {
            const Icon = article.icon;
            return (
              <div className="col-md-6 col-lg-4" key={article.id}>
                <RevealOnScroll delay={index * 110}>
                  <article className="beidaq-article-card h-100">
                    <div className="beidaq-article-image-wrap">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="beidaq-article-image"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <span className="beidaq-article-tag">{article.tag}</span>
                    </div>

                    <div className="beidaq-article-body">
                      <div className="beidaq-article-icon">
                        <Icon size={20} aria-hidden="true" />
                      </div>
                      <h3 className="beidaq-article-title">{article.title}</h3>
                      <p className="beidaq-article-desc">
                        {article.description}
                      </p>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="beidaq-article-btn"
                        aria-label={`اقرأ المزيد عن ${article.title}`}
                      >
                        <span>اقرأ المزيد</span>
                        <ArrowLeft size={15} aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                </RevealOnScroll>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
