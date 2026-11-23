"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { saveHeroPresentationSettings } from "../server/hero-presentation-actions";
import type { HeroLocalizedText, HeroPresentationSettings } from "../hero-presentation";

type Locale = "en" | "fr";
type LocalizedKey = "kicker" | "title" | "subtitle" | "mobileSubtitle";

async function compressImage(file: File) {
  if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > 15 * 1024 * 1024) throw new Error("Choose an image smaller than 15 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const fit = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
    for (const scale of [1, 0.8, 0.65, 0.5, 0.4]) {
      const width = Math.max(1, Math.round(image.naturalWidth * fit * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * fit * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the image.");
      context.drawImage(image, 0, 0, width, height);
      for (const quality of [0.84, 0.72, 0.6, 0.48, 0.36]) {
        const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
        if (compressed?.type === "image/webp" && compressed.size <= 100_000) return compressed;
      }
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  throw new Error("This image could not be reduced below 100 KB. Try a smaller or simpler image.");
}

function LocalizedFields({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
}: {
  label: string;
  value: HeroLocalizedText;
  onChange: (locale: Locale, value: string) => void;
  multiline?: boolean;
  maxLength: number;
}) {
  return (
    <div className="dashboard-hero__localized">
      <p>{label}</p>
      <div className="dashboard-seo-grid">
        {(["en", "fr"] as const).map((locale) => (
          <label key={locale}>{locale === "en" ? "English" : "French"}
            {multiline ? (
              <textarea value={value[locale]} onChange={(event) => onChange(locale, event.target.value)} maxLength={maxLength} rows={3} required />
            ) : (
              <input value={value[locale]} onChange={(event) => onChange(locale, event.target.value)} maxLength={maxLength} required />
            )}
            <small>{value[locale].length}/{maxLength}</small>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function HeroPresentationManagement({ initialSettings }: { initialSettings: HeroPresentationSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(() => structuredClone(initialSettings));
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saveToast, setSaveToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!saveToast) return;
    const timeout = window.setTimeout(() => setSaveToast(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [saveToast]);

  function updateLocalized(key: LocalizedKey, locale: Locale, value: string) {
    setSettings((current) => ({ ...current, [key]: { ...current[key], [locale]: value } }));
  }

  function updateAction(action: "primaryAction" | "secondaryAction", field: "label" | "href", locale: Locale, value: string) {
    setSettings((current) => ({
      ...current,
      [action]: field === "label"
        ? { ...current[action], label: { ...current[action].label, [locale]: value } }
        : { ...current[action], href: value },
    }));
  }

  function updateCard(index: number, patch: Partial<HeroPresentationSettings["cards"][number]>) {
    setSettings((current) => ({
      ...current,
      cards: current.cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card),
    }));
  }

  function updateCardText(index: number, key: "title" | "description", locale: Locale, value: string) {
    const card = settings.cards[index];
    updateCard(index, { [key]: { ...card[key], [locale]: value } });
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setUploadingImage(index);
    setNotice(null);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, `hero-card-${index + 1}.webp`);
      const response = await fetch("/api/files", { method: "POST", body: formData, credentials: "same-origin" });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "Image upload failed. Please try again.";
        throw new Error(message);
      }
      if (typeof result !== "string" || !/^https:\/\//i.test(result)) throw new Error("Image storage returned an invalid URL.");
      updateCard(index, { image: result });
      setNotice({ type: "success", text: `Card ${index + 1} image uploaded. Save to publish the change.` });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Image upload failed." });
    } finally {
      setUploadingImage(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || uploadingImage !== null) return;
    setSaving(true);
    setSaveToast(null);
    try {
      await saveHeroPresentationSettings(settings);
      setSaveToast({ type: "success", text: "Hero presentation saved and published." });
      router.refresh();
    } catch (error) {
      setSaveToast({ type: "error", text: error instanceof Error ? error.message : "Could not save the hero presentation." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-seo dashboard-hero" aria-labelledby="dashboard-hero-title">
      <header className="dashboard-seo__heading">
        <div>
          <p className="transfer-eyebrow">Homepage · First impression</p>
          <h2 id="dashboard-hero-title">Hero presentation</h2>
          <p>Edit the bilingual homepage introduction, calls to action, and three featured experience cards.</p>
        </div>
      </header>

      {notice && <p className={`transfer-notice transfer-notice--${notice.type}`} role="status">{notice.text}</p>}

      <form className="dashboard-seo__form" onSubmit={submit}>
        <fieldset className="dashboard-seo-panel">
          <legend><span>01</span> Hero copy</legend>
          <div className="dashboard-hero__fields">
            <LocalizedFields label="Eyebrow" value={settings.kicker} onChange={(locale, value) => updateLocalized("kicker", locale, value)} maxLength={120} />
            <label className="dashboard-hero__destination">Coordinates<input value={settings.coordinates} onChange={(event) => setSettings((current) => ({ ...current, coordinates: event.target.value }))} maxLength={120} required /></label>
            <LocalizedFields label="Title" value={settings.title} onChange={(locale, value) => updateLocalized("title", locale, value)} maxLength={180} />
            <LocalizedFields label="Description · desktop" value={settings.subtitle} onChange={(locale, value) => updateLocalized("subtitle", locale, value)} multiline maxLength={1200} />
            <LocalizedFields label="Description · mobile" value={settings.mobileSubtitle} onChange={(locale, value) => updateLocalized("mobileSubtitle", locale, value)} multiline maxLength={500} />
          </div>
        </fieldset>

        <fieldset className="dashboard-seo-panel">
          <legend><span>02</span> Hero buttons</legend>
          <div className="dashboard-hero__fields">
            {(["primaryAction", "secondaryAction"] as const).map((action, index) => (
              <div className="dashboard-hero__action" key={action}>
                <h3>{index === 0 ? "Primary button" : "Secondary button"}</h3>
                <LocalizedFields label="Button label" value={settings[action].label} onChange={(locale, value) => updateAction(action, "label", locale, value)} maxLength={100} />
                <label className="dashboard-hero__destination">Destination<input value={settings[action].href} onChange={(event) => updateAction(action, "href", "en", event.target.value)} maxLength={1200} placeholder="#contact or https://example.com" required /><small>Use a section anchor, a path on this website, or an HTTPS URL.</small></label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="dashboard-seo-panel">
          <legend><span>03</span> Featured cards</legend>
          <div className="dashboard-hero__cards">
            {settings.cards.map((card, index) => (
              <section className="dashboard-hero__card" key={index} aria-labelledby={`dashboard-hero-card-${index}`}>
                <h3 id={`dashboard-hero-card-${index}`}>Card {index + 1}</h3>
                <LocalizedFields label="Card title" value={card.title} onChange={(locale, value) => updateCardText(index, "title", locale, value)} maxLength={120} />
                <LocalizedFields label="Card description" value={card.description} onChange={(locale, value) => updateCardText(index, "description", locale, value)} multiline maxLength={500} />
                <label className="dashboard-hero__destination">Card destination<input value={card.href} onChange={(event) => updateCard(index, { href: event.target.value })} maxLength={1200} placeholder="#surf-packages or https://example.com" required /></label>
                <div className="dashboard-seo-image-field">
                  <label>Image URL<input type="url" value={card.image} onChange={(event) => updateCard(index, { image: event.target.value })} maxLength={1200} placeholder="https://…" required /></label>
                  <div className="dashboard-seo-image-field__tools">
                    <div className="dashboard-seo-image-field__preview"><img src={card.image} alt={`Preview of card ${index + 1}`} /></div>
                    <label className="dashboard-seo-upload">{uploadingImage === index ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event, index)} disabled={uploadingImage !== null} /></label>
                  </div>
                  <small>Choose a JPEG, PNG, or WebP image. Uploaded images are compressed before storage.</small>
                </div>
              </section>
            ))}
          </div>
        </fieldset>

        <footer className="dashboard-seo__actions">
          <p>Changes publish to the English and French homepage hero.</p>
          <button type="submit" disabled={saving || uploadingImage !== null}>{saving ? "Publishing…" : "Save presentation"}<span aria-hidden="true">→</span></button>
        </footer>
      </form>

      {saveToast && typeof document !== "undefined" && createPortal(
        <div className={`dashboard-hero__toast dashboard-hero__toast--${saveToast.type}`} role={saveToast.type === "error" ? "alert" : "status"} aria-live={saveToast.type === "error" ? "assertive" : "polite"} aria-atomic="true">
          <span className="dashboard-hero__toast-icon" aria-hidden="true">{saveToast.type === "success" ? "✓" : "!"}</span>
          <p>{saveToast.text}</p>
          <button type="button" aria-label="Dismiss notification" onClick={() => setSaveToast(null)}>×</button>
        </div>,
        document.body,
      )}
    </section>
  );
}