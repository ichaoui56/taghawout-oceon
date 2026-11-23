"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type InvalidEvent } from "react";
import { useRouter } from "next/navigation";
import { saveSurfPackage } from "../server/surf-package-actions";
import type { SurfPackage, SurfPackageLocaleText } from "../surf-packages";
import DashboardActionToast from "./DashboardActionToast";

type Locale = "en" | "fr";
type LocalizedKey = "title" | "duration" | "description" | "imageAlt";

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
}: {
  label: string;
  value: SurfPackageLocaleText;
  onChange: (locale: Locale, value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="surf-package-editor__localized">
      <p>{label}</p>
      <div className="dashboard-seo-grid">
        {(["en", "fr"] as const).map((locale) => (
          <label key={locale}>{locale === "en" ? "English" : "French"}
            {multiline ? (
              <textarea value={value[locale]} onChange={(event) => onChange(locale, event.target.value)} maxLength={700} rows={3} required />
            ) : (
              <input value={value[locale]} onChange={(event) => onChange(locale, event.target.value)} maxLength={200} required />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SurfPackageEditor({ initialPackage, isNew }: { initialPackage: SurfPackage; isNew: boolean }) {
  const router = useRouter();
  const [packageItem, setPackageItem] = useState(() => structuredClone(initialPackage));
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    try {
      const created = window.sessionStorage.getItem("surf-package-created");
      if (!created) return;
      window.sessionStorage.removeItem("surf-package-created");
      setNotice({ type: "success", text: "Surf package created successfully." });
    } catch {
      setNotice(null);
    }
  }, []);

  function update(patch: Partial<SurfPackage>) {
    setPackageItem((current) => ({ ...current, ...patch }));
  }

  function updateLocalized(key: LocalizedKey, locale: Locale, value: string) {
    setPackageItem((current) => ({ ...current, [key]: { ...current[key], [locale]: value } }));
  }

  function updateActivity(index: number, locale: Locale, value: string) {
    setPackageItem((current) => ({
      ...current,
      activities: current.activities.map((activity, activityIndex) => activityIndex === index
        ? { ...activity, [locale]: value }
        : activity),
    }));
  }

  function handleInvalid(event: InvalidEvent<HTMLFormElement>) {
    event.preventDefault();
    const field = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const controlLabel = field.labels?.[0]?.textContent?.trim() || "Field";
    const localizedGroup = field.closest(".surf-package-editor__localized");
    const localizedLabel = localizedGroup?.querySelector("p")?.textContent?.trim();
    const activityRow = field.closest(".surf-package-editor__activity");
    const activityIndex = activityRow
      ? Array.from(activityRow.parentElement?.querySelectorAll(".surf-package-editor__activity") ?? []).indexOf(activityRow) + 1
      : 0;
    const fieldLabel = localizedLabel
      ? `${controlLabel} — ${localizedLabel}`
      : activityIndex > 0
        ? `${controlLabel} — included activity ${activityIndex}`
        : controlLabel;
    const message = field.validity.valueMissing
      ? `Please complete ${fieldLabel}.`
      : `${fieldLabel}: ${field.validationMessage || "Please check this value."}`;
    setNotice({ type: "error", text: message });
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setUploadingImage(true);
    setNotice(null);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, "surf-package.webp");
      const response = await fetch("/api/files", { method: "POST", body: formData, credentials: "same-origin" });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "Image upload failed. Please try again.";
        throw new Error(message);
      }
      if (typeof result !== "string" || !/^https:\/\//i.test(result)) throw new Error("Image storage returned an invalid URL.");
      update({ image: result });
      setNotice({ type: "success", text: "Package image uploaded. Save changes to publish it." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Image upload failed." });
    } finally {
      setUploadingImage(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || uploadingImage) return;
    setSaving(true);
    setNotice(null);
    try {
      await saveSurfPackage(packageItem.id, packageItem, isNew);
      if (isNew) {
        try {
          window.sessionStorage.setItem("surf-package-created", "true");
        } catch {
          setNotice({ type: "success", text: "Surf package created successfully." });
        }
        router.replace(`/dashboard/surf-packages/${packageItem.id}`);
      } else {
        setNotice({ type: "success", text: "Surf package updated successfully." });
        router.refresh();
      }
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not save this package." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-seo surf-package-editor" aria-labelledby="surf-package-editor-title">
      <Link className="surf-package-editor__back" href="/dashboard/surf-packages"><span aria-hidden="true">←</span> All packages</Link>
      <header className="dashboard-seo__heading">
        <div>
          <p className="transfer-eyebrow">Catalogue · Surf holidays</p>
          <h2 id="surf-package-editor-title">{isNew ? "Add surf package" : `Edit ${packageItem.title.en}`}</h2>
          <p>Update bilingual package details, pricing, booking times, and visibility.</p>
        </div>
      </header>

      {notice && <DashboardActionToast type={notice.type} message={notice.text} onDismiss={() => setNotice(null)} />}

      <form className="dashboard-seo__form" onSubmit={submit} onInvalidCapture={handleInvalid}>
        <fieldset className="dashboard-seo-panel">
          <legend><span>01</span> Package details</legend>
          <div className="surf-package-editor__fields">
            <LocalizedFields label="Package name" value={packageItem.title} onChange={(locale, value) => updateLocalized("title", locale, value)} />
            <LocalizedFields label="Duration" value={packageItem.duration} onChange={(locale, value) => updateLocalized("duration", locale, value)} />
            <LocalizedFields label="Description" value={packageItem.description} onChange={(locale, value) => updateLocalized("description", locale, value)} multiline />
            <div className="surf-package-editor__media-pricing">
              <label className="surf-package-editor__field">Price per person · EUR
                <input type="number" min="0.01" max="100000" step="0.01" value={packageItem.pricePerPerson ?? ""} onChange={(event) => update({ pricePerPerson: event.target.value ? Number(event.target.value) : null })} placeholder="Set price to enable booking" />
                <small>Leave blank to keep package reservations disabled until the price is set.</small>
              </label>
              <div className="surf-package-editor__image-upload">
                <label className="surf-package-editor__field">Image URL
                  <input type="text" value={packageItem.image} onChange={(event) => update({ image: event.target.value })} maxLength={1200} required placeholder="https://… or /images/package.webp" />
                </label>
                <div className="surf-package-editor__image-tools">
                  {packageItem.image
                    ? <img className="surf-package-editor__preview" src={packageItem.image} alt={packageItem.imageAlt.en || "Surf package image preview"} />
                    : <div className="surf-package-editor__preview surf-package-editor__preview--empty">Image preview</div>}
                  <label className="dashboard-seo-upload">{uploadingImage ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event)} disabled={uploadingImage || saving} /></label>
                </div>
                <small className="surf-package-editor__image-hint">JPEG, PNG, or WebP. The image is compressed before upload.</small>
              </div>
            </div>
            <LocalizedFields label="Image description" value={packageItem.imageAlt} onChange={(locale, value) => updateLocalized("imageAlt", locale, value)} />
          </div>
        </fieldset>

        <fieldset className="dashboard-seo-panel">
          <legend><span>02</span> Included activities</legend>
          <div className="surf-package-editor__activities">
            <div className="surf-package-editor__subheading"><h3>Activities in this package</h3><button type="button" onClick={() => update({ activities: [...packageItem.activities, { en: "", fr: "" }] })}>Add activity</button></div>
            {packageItem.activities.map((activity, index) => (
              <div className="surf-package-editor__activity" key={`${packageItem.id}-activity-${index}`}>
                <label>English<input value={activity.en} onChange={(event) => updateActivity(index, "en", event.target.value)} maxLength={120} required /></label>
                <label>French<input value={activity.fr} onChange={(event) => updateActivity(index, "fr", event.target.value)} maxLength={120} required /></label>
                <button type="button" aria-label={`Remove activity ${index + 1}`} disabled={packageItem.activities.length <= 1} onClick={() => update({ activities: packageItem.activities.filter((_, currentIndex) => currentIndex !== index) })}>×</button>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="dashboard-seo-panel">
          <legend><span>03</span> Booking and visibility</legend>
          <div className="surf-package-editor__times">
            <div className="surf-package-editor__subheading">
              <h3>Exact start times</h3>
              <button type="button" disabled={packageItem.startTimes.length >= 20} onClick={() => update({ startTimes: [...packageItem.startTimes, ""] })}>Add time</button>
            </div>
            {packageItem.startTimes.length ? packageItem.startTimes.map((time, index) => (
              <div className="surf-package-editor__time-row" key={`${packageItem.id}-time-${index}`}>
                <label>Start time {index + 1}
                  <input type="time" step="60" value={time} required onChange={(event) => update({ startTimes: packageItem.startTimes.map((current, currentIndex) => currentIndex === index ? event.target.value : current) })} />
                </label>
                <button type="button" aria-label={`Remove start time ${index + 1}`} onClick={() => update({ startTimes: packageItem.startTimes.filter((_, currentIndex) => currentIndex !== index) })}>×</button>
              </div>
            )) : <p className="surf-package-editor__time-empty">No start times added. Reservations stay disabled until at least one time is configured.</p>}
            <small>Guests can choose only the exact times configured here. Add up to 20 times.</small>
          </div>
          <div className="surf-package-editor__options">
            <label><input type="checkbox" checked={packageItem.published} onChange={(event) => update({ published: event.target.checked, showOnHomepage: event.target.checked ? packageItem.showOnHomepage : false })} /> Published</label>
            <label><input type="checkbox" checked={packageItem.popular} onChange={(event) => update({ popular: event.target.checked })} /> Most popular</label>
            <label><input type="checkbox" checked={packageItem.showOnHomepage} disabled={!packageItem.published} onChange={(event) => update({ showOnHomepage: event.target.checked })} /> Show on homepage</label>
          </div>
        </fieldset>

        <footer className="dashboard-seo__actions">
          <p>{packageItem.id} · Prices are in EUR per person.</p>
          <button type="submit" disabled={saving || uploadingImage}>{saving ? "Saving…" : isNew ? "Create package" : "Save changes"}<span aria-hidden="true">→</span></button>
        </footer>
      </form>
    </section>
  );
}
