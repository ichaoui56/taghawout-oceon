"use client";

import { useState, type FormEvent, type InvalidEvent } from "react";
import { createPortal } from "react-dom";
import { submitSurfPackageReservation } from "../server/surf-package-actions";
import type { Locale } from "../i18n";
import type { SurfPackage } from "../surf-packages";

const copy = {
  en: {
    heading: "Request this package",
    date: "Start date",
    time: "Start time",
    guests: "People",
    guestsRequired: "Enter the number of people.",
    guestsRange: "Enter a whole number from 1 to 30.",
    required: "Please complete this field.",
    invalid: "Check this field and try again.",
    name: "Full name",
    phone: "Phone number",
    email: "Email address (optional)",
    notes: "Notes (optional)",
    total: "Estimated total",
    submit: "Send reservation request",
    saving: "Sending…",
    close: "Close reservation form",
    successTitle: "Request received",
    success: "Your request is saved. Our team will confirm the package details with you.",
    error: "Could not submit your request. Please try again.",
  },
  fr: {
    heading: "Demander cette formule",
    date: "Date de début",
    time: "Heure de départ",
    guests: "Personnes",
    guestsRequired: "Indiquez le nombre de personnes.",
    guestsRange: "Indiquez un nombre entier entre 1 et 30.",
    required: "Veuillez remplir ce champ.",
    invalid: "Vérifiez ce champ puis réessayez.",
    name: "Nom complet",
    phone: "Téléphone",
    email: "Adresse e-mail (facultatif)",
    notes: "Notes (facultatif)",
    total: "Total estimé",
    submit: "Envoyer la demande",
    saving: "Envoi…",
    close: "Fermer le formulaire de réservation",
    successTitle: "Demande reçue",
    success: "Votre demande est enregistrée. Notre équipe confirmera les détails avec vous.",
    error: "Impossible d’envoyer la demande. Veuillez réessayer.",
  },
} as const;

function formatPrice(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SurfPackageReservationDialog({
  packageItem,
  locale,
  onClose,
}: {
  packageItem: SurfPackage;
  locale: Locale;
  onClose: () => void;
}) {
  const text = copy[locale];
  const [guestsInput, setGuestsInput] = useState("1");
  const [bookingTime, setBookingTime] = useState(packageItem.startTimes[0] ?? "");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const parsedGuests = guestsInput.trim() ? Number(guestsInput) : NaN;
  const guestsValid = Number.isInteger(parsedGuests) && parsedGuests >= 1 && parsedGuests <= 30;
  const guestsError = guestsValid ? "" : guestsInput.trim() ? text.guestsRange : text.guestsRequired;
  const total = guestsValid ? (packageItem.pricePerPerson ?? 0) * parsedGuests : null;

  function clearError() {
    if (error) setError("");
  }

  function handleInvalid(event: InvalidEvent<HTMLFormElement>) {
    event.preventDefault();
    const field = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const fieldLabels: Record<string, string> = {
      bookingDate: text.date,
      bookingTime: text.time,
      guests: text.guests,
      customerName: text.name,
      customerPhone: text.phone,
      customerEmail: text.email,
      notes: text.notes,
    };
    const label = fieldLabels[field.name] ?? text.invalid;
    setError(`${label}: ${field.validity.valueMissing ? text.required : text.invalid}`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || packageItem.pricePerPerson === null) return;
    if (!guestsValid) {
      setError(`${text.guests}: ${guestsError}`);
      return;
    }
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      await submitSurfPackageReservation({
        packageId: packageItem.id,
        bookingDate: formData.get("bookingDate"),
        bookingTime,
        guests: parsedGuests,
        customerName: formData.get("customerName"),
        customerPhone: formData.get("customerPhone"),
        customerEmail: formData.get("customerEmail"),
        notes: formData.get("notes"),
      });
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.error);
    } finally {
      setSaving(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="surf-package-booking-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="surf-package-booking" role="dialog" aria-modal="true" aria-labelledby="surf-package-booking-title">
        <header className="surf-package-booking__header">
          <div>
            <p className="surf-eyebrow surf-eyebrow--blue">{packageItem.title[locale]}</p>
            <h2 id="surf-package-booking-title">{submitted ? text.successTitle : text.heading}</h2>
          </div>
          <button type="button" aria-label={text.close} onClick={onClose}>×</button>
        </header>

        {submitted ? (
          <div className="surf-package-booking__success" role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            <p>{text.success}</p>
            <strong>{formatPrice(total ?? 0, locale)}</strong>
            <button type="button" className="surf-button surf-button--deep" onClick={onClose}>{locale === "fr" ? "Terminé" : "Done"}</button>
          </div>
        ) : (
          <form className="surf-package-booking__form" onSubmit={submit} onInvalidCapture={handleInvalid} onChange={clearError}>
            <div className="surf-package-booking__grid">
              <label>{text.date}<input name="bookingDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
              <label>{text.time}<select value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} required>
                {packageItem.startTimes.map((time) => <option value={time} key={time}>{time}</option>)}
              </select></label>
              <label>{text.guests}<input name="guests" type="number" inputMode="numeric" min="1" max="30" step="1" value={guestsInput} aria-invalid={!guestsValid} aria-describedby="surf-package-guests-error" onChange={(event) => setGuestsInput(event.target.value)} required />
                {!guestsValid && <small id="surf-package-guests-error" className="surf-package-booking__field-error" aria-live="polite">{guestsError}</small>}
              </label>
              <label>{text.name}<input name="customerName" autoComplete="name" maxLength={120} required /></label>
              <label>{text.phone}<input name="customerPhone" type="tel" autoComplete="tel" maxLength={80} required /></label>
              <label>{text.email}<input name="customerEmail" type="email" autoComplete="email" maxLength={254} /></label>
              <label className="surf-package-booking__notes">{text.notes}<textarea name="notes" rows={3} maxLength={1500} /></label>
            </div>

            <div className="surf-package-booking__total">
              <span>{formatPrice(packageItem.pricePerPerson ?? 0, locale)} × {guestsValid ? parsedGuests : "—"} {text.guests.toLowerCase()}</span>
              <strong><small>{text.total}</small>{total === null ? "—" : formatPrice(total, locale)}</strong>
            </div>
            {error && <p className="surf-package-booking__error" role="alert">{error}</p>}
            <button className="surf-button surf-button--deep" type="submit" disabled={saving}>{saving ? text.saving : text.submit}<span aria-hidden="true">→</span></button>
          </form>
        )}
      </section>
    </div>,
    document.body,
  );
}