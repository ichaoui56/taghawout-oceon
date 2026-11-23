"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSurfLesson } from "../server/surf-lesson-actions";
import type { SurfLesson } from "../surf-lessons";
import DashboardActionToast from "./DashboardActionToast";

function formatPrice(value: number | null) {
  return value === null ? "Price not set" : `${new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value)} / person`;
}

function Icon({ name }: { name: "eye" | "edit" | "delete" | "close" }) {
  const paths = {
    eye: <><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="3" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    delete: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function SurfLessonCatalogManagement({ initialLessons }: { initialLessons: SurfLesson[] }) {
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState<SurfLesson | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function removeLesson(item: SurfLesson) {
    const confirmed = window.confirm(`Permanently delete “${item.title.en}”? Existing reservation records will be kept.`);
    if (!confirmed) return;
    setDeletingId(item.id);
    setNotice(null);
    try {
      await deleteSurfLesson(item.id);
      setSelectedLesson(null);
      setNotice({ type: "success", text: `“${item.title.en}” was permanently deleted.` });
      router.refresh();
    } catch (reason) {
      setNotice({ type: "error", text: reason instanceof Error ? reason.message : "Could not delete this lesson." });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="surf-package-catalog" aria-labelledby="surf-package-catalog-title">
      <header className="dashboard-seo__heading">
        <div>
          <p className="transfer-eyebrow">Catalogue · Surf lessons</p>
          <h2 id="surf-package-catalog-title">Surf lessons</h2>
          <p>{initialLessons.length} lessons · Open a lesson to view details or edit it on its own page.</p>
        </div>
        <Link className="transfer-add-button" href="/dashboard/surf-lessons/new"><span aria-hidden="true">＋</span> Add lesson</Link>
      </header>

      {notice && <DashboardActionToast type={notice.type} message={notice.text} onDismiss={() => setNotice(null)} />}

      {initialLessons.length ? (
        <div className="surf-package-catalog__grid">
          {initialLessons.map((item) => (
            <article className="surf-package-catalog-card" key={item.id}>
              <div className="surf-package-catalog-card__image">
                <img src={item.image} alt={item.imageAlt.en} />
                <div className="surf-package-catalog-card__badges">
                  <span className={item.published ? "is-published" : "is-hidden"}>{item.published ? "Published" : "Hidden"}</span>
                  {item.popular && <span className="is-popular">Most popular</span>}
                  {item.showOnHomepage && <span className="is-homepage">Homepage</span>}
                </div>
              </div>
              <div className="surf-package-catalog-card__body">
                <div className="surf-package-catalog-card__heading">
                  <div><h3>{item.title.en}</h3><p>{item.duration.en}</p></div>
                  <strong>{formatPrice(item.pricePerPerson)}</strong>
                </div>
                <p className="surf-package-catalog-card__description">{item.description.en}</p>
                <div className="surf-package-catalog-card__meta"><span>{item.activities.length} included activities</span><span>{item.startTimes.length} start times</span></div>
                <div className="surf-package-catalog-card__actions">
                  <button type="button" className="surf-package-icon-button" aria-label={`View ${item.title.en} details`} title="View details" onClick={() => setSelectedLesson(item)}><Icon name="eye" /></button>
                  <Link className="surf-package-icon-button" href={`/dashboard/surf-lessons/${item.id}`} aria-label={`Edit ${item.title.en}`} title="Edit lesson"><Icon name="edit" /></Link>
                  <button type="button" className="surf-package-icon-button surf-package-icon-button--danger" disabled={deletingId === item.id} aria-label={`Permanently delete ${item.title.en}`} title="Delete permanently" onClick={() => void removeLesson(item)}><Icon name="delete" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surf-package-catalog__empty"><h3>No surf lessons</h3><p>Create a lesson to publish your surf offers.</p><Link className="transfer-add-button" href="/dashboard/surf-lessons/new">Add lesson</Link></div>
      )}

      {selectedLesson && (
        <div className="surf-package-details-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedLesson(null);
        }}>
          <aside className="surf-package-details-drawer" role="dialog" aria-modal="true" aria-labelledby="surf-package-details-title">
            <header className="surf-package-details-drawer__header">
              <div><p className="transfer-eyebrow">Lesson details</p><h2 id="surf-package-details-title">{selectedLesson.title.en}</h2></div>
              <button type="button" className="surf-package-icon-button" aria-label="Close lesson details" onClick={() => setSelectedLesson(null)}><Icon name="close" /></button>
            </header>
            <img className="surf-package-details-drawer__image" src={selectedLesson.image} alt={selectedLesson.imageAlt.en} />
            <div className="surf-package-details-drawer__price">{formatPrice(selectedLesson.pricePerPerson)}</div>
            <dl className="surf-package-details-drawer__facts">
              <div><dt>Duration</dt><dd>{selectedLesson.duration.en} · {selectedLesson.duration.fr}</dd></div>
              <div><dt>Published</dt><dd>{selectedLesson.published ? "Yes" : "No"}</dd></div>
              <div><dt>Most popular</dt><dd>{selectedLesson.popular ? "Yes" : "No"}</dd></div>
              <div><dt>Homepage feature</dt><dd>{selectedLesson.showOnHomepage ? "Yes" : "No"}</dd></div>
              <div><dt>Start times</dt><dd>{selectedLesson.startTimes.length ? selectedLesson.startTimes.join(" · ") : "Not configured"}</dd></div>
            </dl>
            <section className="surf-package-details-drawer__copy"><h3>Description · English</h3><p>{selectedLesson.description.en}</p><h3>Description · French</h3><p>{selectedLesson.description.fr}</p></section>
            <section className="surf-package-details-drawer__activities"><h3>Included activities</h3><ul>{selectedLesson.activities.map((activity, index) => <li key={`${selectedLesson.id}-detail-${index}`}>{activity.en}<small>{activity.fr}</small></li>)}</ul></section>
            <footer className="surf-package-details-drawer__actions">
              <Link className="transfer-add-button" href={`/dashboard/surf-lessons/${selectedLesson.id}`}><Icon name="edit" /> Edit lesson</Link>
              <button type="button" className="surf-package-icon-button surf-package-icon-button--danger" aria-label="Permanently delete lesson" title="Delete permanently" disabled={deletingId === selectedLesson.id} onClick={() => void removeLesson(selectedLesson)}><Icon name="delete" /></button>
            </footer>
          </aside>
        </div>
      )}
    </section>
  );
}
