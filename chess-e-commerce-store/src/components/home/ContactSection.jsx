import React, { useState } from "react";
import {
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa6";
import { useToast } from "../../context/ToastContext";
import RevealOnScroll from "./RevealOnScroll";

const CONTACT_ITEMS = [
  {
    icon: FaLocationDot,
    label: "الموقع",
    value: "سكاكا، المملكة العربية السعودية",
    href: null,
  },
  {
    icon: FaPhone,
    label: "الهاتف",
    value: "+966 556354954",
    href: "tel:+966501234567",
  },
  {
    icon: FaEnvelope,
    label: "البريد الإلكتروني",
    value: "support@beidaq.sa",
    href: "mailto:support@beidaq.sa",
  },
  {
    icon: FaClock,
    label: "ساعات العمل",
    value: "السبت - الخميس · 9:00 صباحًا - 10:00 مساءً",
    href: null,
  },
];

export default function ContactSection() {
  const { showSuccess } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showSuccess("تم إرسال رسالتك بنجاح! سيتواصل معك فريق بيدق قريبًا.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <section className="beidaq-home-section beidaq-contact rtl" id="contact">
      <div className="beidaq-home-glow beidaq-home-glow--bottom" aria-hidden="true" />
      <div className="container position-relative">
        <RevealOnScroll>
          <header className="beidaq-home-header text-center">
            <h2 className="beidaq-home-title">تواصل معنا</h2>
            <p className="beidaq-home-subtitle">
              إذا عندك أي استفسار أو ملاحظة، فريق بيدق جاهز لخدمتك.
            </p>
            <div className="beidaq-home-divider" />
          </header>
        </RevealOnScroll>

        <div className="row g-4 g-lg-5 align-items-stretch">
          <div className="col-lg-5">
            <RevealOnScroll delay={100}>
              <div className="beidaq-contact-info h-100">
                {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => (
                  <div className="beidaq-contact-card" key={label}>
                    <div className="beidaq-contact-card-icon beidaq-float-icon">
                      <Icon aria-hidden="true" />
                    </div>
                    <div>
                      <span className="beidaq-contact-card-label">{label}</span>
                      {href ? (
                        <a href={href} className="beidaq-contact-card-value">
                          {value}
                        </a>
                      ) : (
                        <p className="beidaq-contact-card-value mb-0">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>

          <div className="col-lg-7">
            <RevealOnScroll delay={180}>
              <form className="beidaq-contact-form" onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="beidaq-form-label" htmlFor="contact-name">
                      الاسم الكامل
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="beidaq-form-input"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="beidaq-form-label" htmlFor="contact-email">
                      البريد الإلكتروني
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="beidaq-form-input"
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="beidaq-form-label" htmlFor="contact-phone">
                      رقم الجوال
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className="beidaq-form-input"
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="beidaq-form-label" htmlFor="contact-subject">
                      الموضوع
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="beidaq-form-input"
                      placeholder="موضوع رسالتك"
                    />
                  </div>
                  <div className="col-12">
                    <label className="beidaq-form-label" htmlFor="contact-message">
                      الرسالة
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="beidaq-form-input beidaq-form-textarea"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="beidaq-contact-submit">
                      <FaPaperPlane aria-hidden="true" />
                      <span>إرسال الرسالة</span>
                    </button>
                  </div>
                </div>
              </form>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
