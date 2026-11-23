"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MAX_EXPERIENCE_GALLERY_ENTRIES, type ExperienceGalleryEntry } from "../experience-gallery";
import { saveExperienceGallery } from "../server/experience-gallery-actions";
import DashboardActionToast from "./DashboardActionToast";

async function compressImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > 15 * 1024 * 1024) throw new Error("Choose an image smaller than 15 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const fit = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
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

async function uploadImage(file: File) {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed, "experience-gallery.webp");
  const response = await fetch("/api/files", { method: "POST", body: formData, credentials: "same-origin" });
  const result: unknown = await response.json();
  if (!response.ok) {
    const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
      ? result.error
      : "Image upload failed. Please try again.";
    throw new Error(message);
  }
  if (typeof result !== "string" || !/^https:\/\//i.test(result)) throw new Error("Image storage returned an invalid URL.");
  return result;
}

export default function ExperienceGalleryManagement({ initialEntries }: { initialEntries: ExperienceGalleryEntry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(() => structuredClone(initialEntries));
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saveToast, setSaveToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function updateEntry(id: string, updates: Partial<ExperienceGalleryEntry>) {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...updates } : entry));
  }

  function addEntry() {
    setEntries((current) => [...current, {
      id: `gallery-${crypto.randomUUID()}`,
      image: "",
      title: { en: "", fr: "" },
    }]);
    setNotice(null);
  }

  function moveEntry(index: number, direction: -1 | 1) {
    setEntries((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
      return reordered;
    });
  }

  async function upload(event: ChangeEvent<HTMLInputElement>, id: string) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setUploadingId(id);
    setNotice(null);
    try {
      const image = await uploadImage(file);
      updateEntry(id, { image });
      setNotice({ type: "success", text: "Image uploaded. Save to publish the change." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Image upload failed." });
    } finally {
      setUploadingId(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || uploadingId !== null) return;
    setSaving(true);
    setNotice(null);
    setSaveToast(null);
    try {
      await saveExperienceGallery(entries);
      setSaveToast({ type: "success", text: "Experience gallery saved and published." });
      router.refresh();
    } catch (error) {
      setSaveToast({ type: "error", text: error instanceof Error ? error.message : "Could not save the experience gallery." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-seo dashboard-experience-gallery" aria-labelledby="dashboard-experience-gallery-title">
      <header className="dashboard-seo__heading">
        <div>
          <p className="transfer-eyebrow">Homepage · Experiences</p>
          <h2 id="dashboard-experience-gallery-title">Experience gallery</h2>
          <p>Manage the images and bilingual captions displayed in the homepage gallery. Items appear in the order shown here.</p>
        </div>
        <button type="button" className="transfer-add-button" onClick={addEntry} disabled={entries.length >= MAX_EXPERIENCE_GALLERY_ENTRIES}>
          <span aria-hidden="true">＋</span> Add image
        </button>
      </header>

      {notice && <p className={`transfer-notice transfer-notice--${notice.type}`} role="status">{notice.text}</p>}
      {saveToast && <DashboardActionToast type={saveToast.type} message={saveToast.text} onDismiss={() => setSaveToast(null)} />}

      <form className="dashboard-seo__form" onSubmit={submit}>
        {entries.length ? (
          <div className="dashboard-experience-gallery__items">
            {entries.map((entry, index) => (
              <article className="dashboard-experience-gallery__item" key={entry.id}>
                <div className="dashboard-experience-gallery__preview">
                  {entry.image && <img src={entry.image} alt="" />}
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="dashboard-experience-gallery__fields">
                  <label>Image URL<input type="text" inputMode="url" value={entry.image} onChange={(event) => updateEntry(entry.id, { image: event.target.value })} maxLength={1200} required placeholder="https://… or /images/photo.webp" /></label>
                  <div className="dashboard-seo-grid">
                    <label>Title · English<input value={entry.title.en} onChange={(event) => updateEntry(entry.id, { title: { ...entry.title, en: event.target.value } })} maxLength={120} required /></label>
                    <label>Titre · Français<input value={entry.title.fr} onChange={(event) => updateEntry(entry.id, { title: { ...entry.title, fr: event.target.value } })} maxLength={120} required /></label>
                  </div>
                  <label className="dashboard-seo-upload">{uploadingId === entry.id ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event, entry.id)} disabled={uploadingId !== null} /></label>
                </div>
                <div className="dashboard-experience-gallery__actions" aria-label={`Image ${index + 1} controls`}>
                  <button type="button" aria-label={`Move image ${index + 1} up`} title="Move up" onClick={() => moveEntry(index, -1)} disabled={index === 0 || saving || uploadingId !== null}>↑</button>
                  <button type="button" aria-label={`Move image ${index + 1} down`} title="Move down" onClick={() => moveEntry(index, 1)} disabled={index === entries.length - 1 || saving || uploadingId !== null}>↓</button>
                  <button type="button" className="is-danger" aria-label={`Remove image ${index + 1}`} title="Remove image" onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))} disabled={saving || uploadingId === entry.id}>×</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-experience-gallery__empty"><h3>No managed images</h3><p>The homepage currently uses images from the activity catalogue.</p></div>
        )}

        <footer className="dashboard-seo__actions">
          <p>{entries.length} of {MAX_EXPERIENCE_GALLERY_ENTRIES} images · Changes publish to the homepage.</p>
          <button type="submit" disabled={saving || uploadingId !== null}>{saving ? "Publishing…" : "Save gallery"}<span aria-hidden="true">→</span></button>
        </footer>
      </form>
    </section>
  );
}