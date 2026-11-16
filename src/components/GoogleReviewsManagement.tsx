"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteManagedGoogleReview, saveGoogleReviewSettings, saveManagedGoogleReview } from "../server/google-review-actions";
import type { GoogleReviewsSettings, ManagedGoogleReview } from "../server/google-reviews";

type ReviewDraft = Omit<ManagedGoogleReview, "id"> & { id: string | null };

function emptyReview(): ReviewDraft {
  return {
    id: null,
    name: "",
    dateAdded: new Date().toISOString().slice(0, 10),
    photoUrl: "",
    message: "",
    messageFr: "",
    rating: 5,
    isPublished: true,
    isDemo: false,
  };
}

async function compressProfileImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPEG, PNG, or WebP image.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Choose an image smaller than 15 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    for (const quality of [0.86, 0.74, 0.62, 0.5, 0.38]) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the image.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob?.type === "image/webp" && blob.size <= 100_000) return blob;
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  throw new Error("This photo could not be reduced below 100 KB. Choose a smaller image.");
}

async function uploadProfileImage(file: File) {
  const blob = await compressProfileImage(file);
  const form = new FormData();
  form.append("file", blob, "customer-review-profile.webp");
  const response = await fetch("/api/files", { method: "POST", body: form, credentials: "same-origin" });
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

export default function GoogleReviewsManagement({
  reviews,
  initialSettings,
}: {
  reviews: ManagedGoogleReview[];
  initialSettings: GoogleReviewsSettings;
}) {
  const router = useRouter();
  const editorRef = useRef<HTMLFormElement>(null);
  const [settings, setSettings] = useState(initialSettings);
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const editorOpen = draft !== null;

  useEffect(() => {
    if (!editorOpen) return;
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    editorRef.current?.querySelector<HTMLInputElement>('input:not([type="file"])')?.focus({ preventScroll: true });
  }, [editorOpen]);

  function updateDraft<K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file || !draft) return;
    setUploading(true);
    setNotice(null);
    try {
      updateDraft("photoUrl", await uploadProfileImage(file));
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not upload this photo." });
    } finally {
      setUploading(false);
    }
  }

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      await saveGoogleReviewSettings(settings);
      setNotice({ type: "success", text: "Google profile settings saved." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not save Google profile settings." });
    } finally {
      setBusy(false);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || busy || uploading) return;
    setBusy(true);
    setNotice(null);
    try {
      await saveManagedGoogleReview(draft.id, draft);
      setDraft(null);
      setNotice({ type: "success", text: draft.id ? "Review updated." : "Review added." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not save this review." });
    } finally {
      setBusy(false);
    }
  }

  async function removeReview(review: ManagedGoogleReview) {
    if (!window.confirm(`Delete the review from ${review.name}?`)) return;
    setNotice(null);
    try {
      await deleteManagedGoogleReview(review.id);
      setNotice({ type: "success", text: "Review deleted." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not delete this review." });
    }
  }

  return (
    <section className="google-review-management" aria-labelledby="google-review-management-title">
      <header className="google-review-management__heading">
        <div>
          <p className="transfer-eyebrow">Homepage · Social proof</p>
          <h2 id="google-review-management-title">Google reviews</h2>
          <p>Manage customer quotes, profile photos, and Google profile details. Publish only verified customer feedback; demo samples stay hidden.</p>
        </div>
        <button type="button" className="transfer-add-button" onClick={() => { setNotice(null); setDraft(emptyReview()); }}>
          <span aria-hidden="true">＋</span> Add a review
        </button>
      </header>

      {notice && <p className={`transfer-notice transfer-notice--${notice.type}`} role="status">{notice.text}</p>}

      <form className="google-review-management__settings transfer-panel" onSubmit={submitSettings}>
        <div className="transfer-panel__heading">
          <div><p className="transfer-eyebrow">Google profile</p><h3>Location and links</h3></div>
          <button className="transfer-primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
        </div>
        <div className="google-review-management__settings-grid">
          <label>Business location<input value={settings.location} onChange={(event) => setSettings((current) => ({ ...current, location: event.target.value }))} maxLength={240} placeholder="Agadir, Morocco" /></label>
          <label>Google profile / Maps URL<input type="url" value={settings.googleUrl} onChange={(event) => setSettings((current) => ({ ...current, googleUrl: event.target.value }))} maxLength={1200} placeholder="https://maps.google.com/..." /></label>
          <label>HostelGrowth badge URL <small>Optional. The certification badge is shown only when this is set.</small><input type="url" value={settings.HostelGrowthUrl} onChange={(event) => setSettings((current) => ({ ...current, HostelGrowthUrl: event.target.value }))} maxLength={1200} placeholder="https://www.HostelGrowth.io/..." /></label>
        </div>
      </form>

      {draft && (
        <form ref={editorRef} className="google-review-management__editor transfer-panel" onSubmit={submitReview}>
          <div className="transfer-panel__heading">
            <div><p className="transfer-eyebrow">{draft.id ? "Edit review" : "New review"}</p><h3>Customer details</h3></div>
            <button type="button" className="transfer-icon-button" aria-label="Close review editor" onClick={() => setDraft(null)}>×</button>
          </div>
          <div className="google-review-management__form-grid">
            <label>Customer name<input required value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} maxLength={120} /></label>
            <label>Review date<input required type="date" value={draft.dateAdded} onChange={(event) => updateDraft("dateAdded", event.target.value)} /></label>
            <label>Star rating<select value={draft.rating} onChange={(event) => updateDraft("rating", Number(event.target.value))}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}</select></label>
            <label className="google-review-management__photo-field">Profile picture<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={uploading} />{uploading && <small>Uploading photo…</small>}</label>
            <label className="google-review-management__message-field">Review message · English<textarea required value={draft.message} onChange={(event) => updateDraft("message", event.target.value)} maxLength={5000} rows={4} /></label>
            <label className="google-review-management__message-field">Review message · French <small>Optional</small><textarea value={draft.messageFr} onChange={(event) => updateDraft("messageFr", event.target.value)} maxLength={5000} rows={4} /></label>
            <label className="google-review-management__publish"><input type="checkbox" checked={draft.isDemo} onChange={(event) => setDraft((current) => current ? { ...current, isDemo: event.target.checked, isPublished: event.target.checked ? false : current.isPublished } : current)} /> Demo sample · cannot publish while checked</label>
            <label className="google-review-management__publish"><input type="checkbox" checked={draft.isPublished} disabled={draft.isDemo} onChange={(event) => updateDraft("isPublished", event.target.checked)} /> Show on homepage</label>
            {draft.isDemo && <p className="google-review-management__demo-note">Replace the sample name and both sample messages with a real, authorized customer review before turning off demo status.</p>}
            {draft.photoUrl && <div className="google-review-management__photo-preview"><img src={draft.photoUrl} alt="Customer profile preview" /><button type="button" onClick={() => updateDraft("photoUrl", "")}>Remove photo</button></div>}
          </div>
          <div className="google-review-management__form-actions">
            <button className="transfer-primary-button" type="submit" disabled={busy || uploading}>{busy ? "Saving…" : "Save review"}</button>
            <button className="transfer-secondary-button" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="google-review-management__summary">
        <span><strong>{reviews.length.toString().padStart(2, "0")}</strong> total reviews</span>
        <span><strong>{reviews.filter((review) => review.isPublished).length.toString().padStart(2, "0")}</strong> published on homepage</span>
      </div>

      {reviews.length ? (
        <div className="google-review-management__list">
          {reviews.map((review) => (
            <article key={review.id} className={`google-review-management__item${review.isPublished ? "" : " is-hidden"}`}>
              {review.photoUrl ? <img src={review.photoUrl} alt="" loading="lazy" /> : <span className="google-review-management__avatar-fallback" aria-hidden="true">{review.name.slice(0, 1).toUpperCase()}</span>}
              <div className="google-review-management__item-copy">
                <div><h3>{review.name}</h3><span>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div>
                <time dateTime={review.dateAdded}>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${review.dateAdded}T00:00:00Z`))}</time>
                <p><strong>EN</strong> {review.message}</p>
                <p className="google-review-management__item-french"><strong>FR</strong> {review.messageFr}</p>
              </div>
                <span className={`google-review-management__status${review.isDemo ? " is-demo" : review.isPublished ? " is-live" : ""}`}>{review.isDemo ? "Demo · hidden" : review.isPublished ? "Published" : "Hidden"}</span>
              <div className="google-review-management__item-actions">
                <button type="button" onClick={() => { setNotice(null); setDraft({ ...review }); }}>Edit</button>
                <button type="button" onClick={() => removeReview(review)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="transfer-empty"><span aria-hidden="true">★</span><h3>No reviews yet</h3><p>Add the first customer review to show it on the homepage.</p></div>
      )}
    </section>
  );
}