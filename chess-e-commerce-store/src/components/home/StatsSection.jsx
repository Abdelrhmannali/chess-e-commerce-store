import React, { useEffect, useRef, useState } from "react";
import { Package, Smile, Crown, Star } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";

const STATS = [
  {
    id: "orders",
    icon: Package,
    end: 5000,
    prefix: "+",
    suffix: "",
    label: "طلب مكتمل",
    decimals: 0,
  },
  {
    id: "customers",
    icon: Smile,
    end: 1200,
    prefix: "+",
    suffix: "",
    label: "عميل سعيد",
    decimals: 0,
  },
  {
    id: "products",
    icon: Crown,
    end: 350,
    prefix: "+",
    suffix: "",
    label: "منتج فاخر",
    decimals: 0,
  },
  {
    id: "rating",
    icon: Star,
    end: 4.9,
    prefix: "",
    suffix: "/5",
    label: "متوسط التقييم",
    decimals: 1,
  },
];

function AnimatedCounter({ end, decimals = 0, prefix = "", suffix = "", active }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    if (!active) return;

    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, end]);

  const formatted =
    decimals === 0
      ? Math.round(value).toLocaleString("ar-EG")
      : value.toFixed(decimals);

  return (
    <span className="beidaq-stat-number">
      <span className="beidaq-stat-prefix">{prefix}</span>
      {formatted}
      <span className="beidaq-stat-suffix">{suffix}</span>
    </span>
  );
}

export default function StatsSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="beidaq-home-section beidaq-stats rtl"
      id="stats-section"
    >
      <div className="beidaq-stats-pattern" aria-hidden="true" />
      <div className="container position-relative">
        <RevealOnScroll>
          <header className="beidaq-home-header text-center">
            <span className="beidaq-home-eyebrow beidaq-home-eyebrow--dark">
              أرقامنا تتحدث
            </span>
            <h2 className="beidaq-home-title beidaq-home-title--dark">
              نفخر بثقة عملائنا
            </h2>
            <p className="beidaq-home-subtitle beidaq-home-subtitle--dark">
              إنجازات حقيقية بصمتها ثقة عشاق الشطرنج في المملكة العربية السعودية.
            </p>
            <div className="beidaq-home-divider" />
          </header>
        </RevealOnScroll>

        <div className="row g-4">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div className="col-6 col-lg-3" key={stat.id}>
                <RevealOnScroll delay={index * 100}>
                  <div className="beidaq-stat-card">
                    <div className="beidaq-stat-icon">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <AnimatedCounter
                      end={stat.end}
                      decimals={stat.decimals}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      active={inView}
                    />
                    <span className="beidaq-stat-label">{stat.label}</span>
                  </div>
                </RevealOnScroll>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
