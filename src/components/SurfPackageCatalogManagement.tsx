"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSurfPackage } from "../server/surf-package-actions";
import type { SurfPackage } from "../surf-packages";
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

export default function SurfPackageCatalogManagement({ initialPackages }: { initialPackages: SurfPackage[] }) {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<SurfPackage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function removePackage(item: SurfPackage) {
    const confirmed = window.confirm(`Permanently delete “${item.title.en}”? Existing reservation records will be kept.`);
    if (!confirmed) return;
    setDeletingId(item.id);
    setNotice(null);
    try {
      await deleteSurfPackage(item.id);
      setSelectedPackage(null);
      setNotice({ type: "success", text: `“${item.title.en}” was permanently deleted.` });
      router.refresh();
    } catch (reason) {
      setNotice({ type: "error", text: reason instanceof Error ? reason.message : "Could not delete this package." });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="surf-package-catalog" aria-labelledby="surf-package-catalog-title">
      <header className="dashboard-seo__heading">
        <div>
          <p className="transfer-eyebrow">Catalogue · Surf holidays</p>
          <h2 id="surf-package-catalog-title">Surf packages</h2>
          <p>{initialPackages.length} packages · Open a package to view details or edit it on its own page.</p>
        </div>
        <Link className="transfer-add-button" href="/dashboard/surf-packages/new"><span aria-hidden="true">＋</span> Add package</Link>
      </header>

      {notice && <DashboardActionToast type={notice.type} message={notice.text} onDismiss={() => setNotice(null)} />}

      {initialPackages.length ? (
        <div className="surf-package-catalog__grid">
          {initialPackages.map((item) => (
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
                  <button type="button" className="surf-package-icon-button" aria-label={`View ${item.title.en} details`} title="View details" onClick={() => setSelectedPackage(item)}><Icon name="eye" /></button>
                  <Link className="surf-package-icon-button" href={`/dashboard/surf-packages/${item.id}`} aria-label={`Edit ${item.title.en}`} title="Edit package"><Icon name="edit" /></Link>
                  <button type="button" className="surf-package-icon-button surf-package-icon-button--danger" disabled={deletingId === item.id} aria-label={`Permanently delete ${item.title.en}`} title="Delete permanently" onClick={() => void removePackage(item)}><Icon name="delete" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surf-package-catalog__empty"><h3>No surf packages</h3><p>Create a package to publish your surf offers.</p><Link className="transfer-add-button" href="/dashboard/surf-packages/new">Add package</Link></div>
      )}

      {selectedPackage && (
        <div className="surf-package-details-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedPackage(null);
        }}>
          <aside className="surf-package-details-drawer" role="dialog" aria-modal="true" aria-labelledby="surf-package-details-title">
            <header className="surf-package-details-drawer__header">
              <div><p className="transfer-eyebrow">Package details</p><h2 id="surf-package-details-title">{selectedPackage.title.en}</h2></div>
              <button type="button" className="surf-package-icon-button" aria-label="Close package details" onClick={() => setSelectedPackage(null)}><Icon name="close" /></button>
            </header>
            <img className="surf-package-details-drawer__image" src={selectedPackage.image} alt={selectedPackage.imageAlt.en} />
            <div className="surf-package-details-drawer__price">{formatPrice(selectedPackage.pricePerPerson)}</div>
            <dl className="surf-package-details-drawer__facts">
              <div><dt>Duration</dt><dd>{selectedPackage.duration.en} · {selectedPackage.duration.fr}</dd></div>
              <div><dt>Published</dt><dd>{selectedPackage.published ? "Yes" : "No"}</dd></div>
              <div><dt>Most popular</dt><dd>{selectedPackage.popular ? "Yes" : "No"}</dd></div>
              <div><dt>Homepage feature</dt><dd>{selectedPackage.showOnHomepage ? "Yes" : "No"}</dd></div>
              <div><dt>Start times</dt><dd>{selectedPackage.startTimes.length ? selectedPackage.startTimes.join(" · ") : "Not configured"}</dd></div>
            </dl>
            <section className="surf-package-details-drawer__copy"><h3>Description · English</h3><p>{selectedPackage.description.en}</p><h3>Description · French</h3><p>{selectedPackage.description.fr}</p></section>
            <section className="surf-package-details-drawer__activities"><h3>Included activities</h3><ul>{selectedPackage.activities.map((activity, index) => <li key={`${selectedPackage.id}-detail-${index}`}>{activity.en}<small>{activity.fr}</small></li>)}</ul></section>
            <footer className="surf-package-details-drawer__actions">
              <Link className="transfer-add-button" href={`/dashboard/surf-packages/${selectedPackage.id}`}><Icon name="edit" /> Edit package</Link>
              <button type="button" className="surf-package-icon-button surf-package-icon-button--danger" aria-label="Permanently delete package" title="Delete permanently" disabled={deletingId === selectedPackage.id} onClick={() => void removePackage(selectedPackage)}><Icon name="delete" /></button>
            </footer>
          </aside>
        </div>
      )}
    </section>
  );
}
