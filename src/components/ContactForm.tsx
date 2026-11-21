"use client";

import { useState, useTransition, type FormEvent } from "react";
import { translate, type Locale } from "../i18n";
import { sendContactMessage } from "../server/contact-actions";

export default function ContactForm({ locale }: { locale: Locale }) {
  const t = (phrase: string) => translate(locale, phrase);
  const formIntro = locale === "fr"
    ? {
      eyebrow: "ENVOYEZ-NOUS UN MESSAGE",
      heading: "Nous serions ravis de vous lire !",
      description: "Remplissez le formulaire et notre équipe vous répondra dès que possible.",
    }
    : {
      eyebrow: "DROP US A MESSAGE",
      heading: "We’d love to hear from you!",
      description: "Fill out the form below and we’ll get back to you as soon as possible.",
    };
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ success: boolean; message: string } | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setNotice(null);
    startTransition(async () => {
      const result = await sendContactMessage({
        name: String(values.get("name") ?? ""),
        email: String(values.get("email") ?? ""),
        phone: String(values.get("phone") ?? ""),
        message: String(values.get("message") ?? ""),
        companyFax: String(values.get("companyFax") ?? ""),
      });
      setNotice(result);
      if (result.success) form.reset();
    });
  }

  return (
    <form id="contact-form" className="contact-inquiry__form" onSubmit={submit}>
      <div className="contact-inquiry__form-head">
        <span className="contact-inquiry__form-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="m21 3-7.5 18-3.8-7.7L2 9.5 21 3Z" /><path d="M9.7 13.3 21 3" /></svg>
        </span>
        <div>
          <p>{formIntro.eyebrow}</p>
          <h2>{formIntro.heading}</h2>
          <span>{formIntro.description}</span>
        </div>
      </div>
      <div className="contact-inquiry__fields">
        <label className="contact-inquiry__field">
          <span className="sr-only">{t("Your name")}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.4-3.4 3.1-5.5 7-5.5s6.6 2.1 7 5.5" /></svg>
          <input name="name" autoComplete="name" maxLength={120} placeholder={t("Your name")} required />
        </label>
        <label className="contact-inquiry__field">
          <span className="sr-only">{t("Email address")}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m5 7 7 5.5L19 7" /></svg>
          <input name="email" type="email" autoComplete="email" maxLength={254} placeholder={t("Email address")} required />
        </label>
        <label className="contact-inquiry__field contact-inquiry__field--wide">
          <span className="sr-only">{t("Phone / WhatsApp")}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h3l1.5 4-2 1.8a15 15 0 0 0 5.2 5.2l1.8-2 4 1.5v3c0 1.1-.9 2-2 2A15.5 15.5 0 0 1 5 5.5c0-1.1.9-2 2-2z" /></svg>
          <input name="phone" type="tel" autoComplete="tel" maxLength={60} placeholder={t("Phone / WhatsApp")} />
        </label>
        <label className="contact-inquiry__field contact-inquiry__field--wide contact-inquiry__message">
          <span className="sr-only">{t("How can we help?")}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H11l-5 3v-3H4z" /><path d="M8 10h8m-8 3h5" /></svg>
          <textarea name="message" rows={4} maxLength={5000} placeholder={t("How can we help?")} required />
        </label>
        <label className="contact-inquiry__trap" aria-hidden="true" tabIndex={-1}>
          Company fax
          <input name="companyFax" autoComplete="new-password" tabIndex={-1} />
        </label>
      </div>
      <div className="contact-inquiry__submit-row">
        <button className="button-signal contact-inquiry__submit" type="submit" disabled={isPending}>
          <span>{isPending ? t("Sending message…") : t("Send message")}</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 3-7.5 18-3.8-7.7L2 9.5 21 3Z" /><path d="M9.7 13.3 21 3" /></svg>
        </button>
        <p><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{t("We’ll get back to you as soon as possible.")}</p>
      </div>
      {notice && (
        <p className={`contact-inquiry__notice${notice.success ? " is-success" : " is-error"}`} role={notice.success ? "status" : "alert"}>
          {notice.success ? t("Message sent successfully! We’ll be in touch soon.") : t("We couldn’t send your message. Please try again.")}
        </p>
      )}
    </form>
  );
}