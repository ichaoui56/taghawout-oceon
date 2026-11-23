"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSurfPackageReservationStatus } from "../server/surf-package-actions";
import type { ManagedSurfPackageReservation } from "../server/surf-package-catalog";
import type { SurfPackageReservationStatus } from "@prisma/client";
import DashboardActionToast from "./DashboardActionToast";

const statuses: { value: SurfPackageReservationStatus; label: string }[] = [
  { value: "NEW", label: "Needs review" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

type ReservationView = "cards" | "table";
type ReservationGroup = { date: string; items: ManagedSurfPackageReservation[] };
type PageToken = number | "before" | "after";

const pageSizes = [10, 25, 50, 100] as const;

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function groupByBookingDay(items: ManagedSurfPackageReservation[]): ReservationGroup[] {
  const grouped = new Map<string, ManagedSurfPackageReservation[]>();
  for (const item of [...items].sort((first, second) => second.bookingDate.localeCompare(first.bookingDate) || first.bookingTime.localeCompare(second.bookingTime))) {
    const day = grouped.get(item.bookingDate) ?? [];
    day.push(item);
    grouped.set(item.bookingDate, day);
  }
  return [...grouped].map(([date, dayItems]) => ({ date, items: dayItems }));
}

function paginateGroups(groups: ReservationGroup[], pageSize: number): ReservationGroup[][] {
  const pages: ReservationGroup[][] = [];
  let page: ReservationGroup[] = [];
  let pageItemCount = 0;
  for (const group of groups) {
    if (page.length && pageItemCount + group.items.length > pageSize) {
      pages.push(page);
      page = [];
      pageItemCount = 0;
    }
    page.push(group);
    pageItemCount += group.items.length;
  }
  if (page.length) pages.push(page);
  return pages;
}

function getPageTokens(currentPage: number, pageCount: number): PageToken[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const visible = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount])]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((first, second) => first - second);
  return visible.flatMap((page, index) => {
    const next = visible[index + 1];
    return next && next - page > 1
      ? [page, (next - page === 2 ? page + 1 : index === 0 ? "before" : "after") as PageToken]
      : [page];
  });
}

function getCustomerInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function SurfPackageReservationManagement({ items }: { items: ManagedSurfPackageReservation[] }) {
  const router = useRouter();
  const [view, setView] = useState<ReservationView>("cards");
  const [statusFilter, setStatusFilter] = useState<SurfPackageReservationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(10);
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const invalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);
  const filteredItems = items.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (invalidDateRange) return false;
    if (fromDate && item.bookingDate < fromDate) return false;
    if (toDate && item.bookingDate > toDate) return false;
    if (!normalizedSearch) return true;
    return [item.packageTitle, item.customerName, item.customerPhone, item.customerEmail ?? "", item.notes ?? "", item.bookingTime, item.status]
      .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
  });
  const sortedItems = [...filteredItems].sort((first, second) => second.bookingDate.localeCompare(first.bookingDate) || first.bookingTime.localeCompare(second.bookingTime));
  const groups = groupByBookingDay(filteredItems);
  const pages = paginateGroups(groups, pageSize);
  const pageCount = Math.max(1, view === "cards" ? pages.length : Math.ceil(filteredItems.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const currentGroups = pages[activePage - 1] ?? [];
  const pageStartIndex = (activePage - 1) * pageSize;
  const pageItems = sortedItems.slice(pageStartIndex, pageStartIndex + pageSize);
  const itemsBeforePage = view === "cards"
    ? pages.slice(0, activePage - 1).reduce((total, pageGroups) => total + pageGroups.reduce((count, group) => count + group.items.length, 0), 0)
    : pageStartIndex;
  const currentPageItems = currentGroups.reduce((total, group) => total + group.items.length, 0);
  const paginationStart = view === "cards" ? itemsBeforePage : pageStartIndex;
  const paginationEnd = view === "cards" ? itemsBeforePage + currentPageItems : Math.min(pageStartIndex + pageSize, filteredItems.length);
  const pageTokens = getPageTokens(activePage, pageCount);
  const reservationStats = [
    { status: "ALL" as const, label: "Total reservations", value: items.length, note: "All surf packages", icon: "▤", style: "total" },
    { status: "NEW" as const, label: "Awaiting review", value: items.filter((item) => item.status === "NEW").length, note: "Need your attention", icon: "↗", style: "new" },
    { status: "CONFIRMED" as const, label: "Confirmed", value: items.filter((item) => item.status === "CONFIRMED").length, note: "Bookings confirmed", icon: "◷", style: "confirmed" },
    { status: "COMPLETED" as const, label: "Completed", value: items.filter((item) => item.status === "COMPLETED").length, note: "Guest journeys served", icon: "✓", style: "completed" },
    { status: "CANCELLED" as const, label: "Cancelled", value: items.filter((item) => item.status === "CANCELLED").length, note: "Closed reservations", icon: "×", style: "cancelled" },
  ];

  async function changeStatus(id: string, status: SurfPackageReservationStatus) {
    setPendingId(id);
    setNotice(null);
    try {
      await updateSurfPackageReservationStatus(id, status);
      setNotice({ type: "success", text: `Reservation marked ${statuses.find((item) => item.value === status)?.label.toLowerCase() ?? "updated"}.` });
      router.refresh();
    } catch (reason) {
      setNotice({ type: "error", text: reason instanceof Error ? reason.message : "Could not update reservation status." });
    } finally {
      setPendingId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setStatusFilter("ALL");
    setPage(1);
    setNotice(null);
  }

  function renderStatus(item: ManagedSurfPackageReservation) {
    return (
      <label className="surf-package-reservation__status">Status
        <select value={item.status} disabled={pendingId === item.id} onChange={(event) => void changeStatus(item.id, event.target.value as SurfPackageReservationStatus)}>
          {statuses.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}
        </select>
      </label>
    );
  }

  function renderReservation(item: ManagedSurfPackageReservation) {
    return (
      <article className={`transfer-request-card${item.status === "NEW" ? " is-new" : ""}`} key={item.id}>
        <div className="transfer-request-card__open" style={{ cursor: "default" }}>
          <span className="transfer-request-card__topline">
            <span className="transfer-request-card__time"><span aria-hidden="true">◷</span>{item.bookingTime}</span>
            <span className={`transfer-status transfer-status--${item.status.toLowerCase()}`}>{statuses.find((status) => status.value === item.status)?.label}</span>
          </span>
          <span className="transfer-request-card__guest">
            <span className="transfer-request-card__avatar" aria-hidden="true">{getCustomerInitials(item.customerName)}</span>
            <span><strong>{item.customerName}</strong><small>{item.customerEmail || item.customerPhone}</small>{item.customerEmail && <small>{item.customerPhone}</small>}</span>
          </span>
          <span className="transfer-request-card__service">
            <strong>{item.packageTitle}</strong>
            <small>{formatDay(item.bookingDate)}</small>
            {item.notes && <small>{item.notes}</small>}
          </span>
          <span className="transfer-request-card__meta">
            <span><small>Guests</small><strong>{item.guests}</strong></span>
            <span><small>Per person</small><strong>{formatCurrency(item.pricePerPerson, item.currency)}</strong></span>
            <span><small>Total</small><strong>{formatCurrency(item.estimatedTotal, item.currency)}</strong></span>
            <span>{renderStatus(item)}</span>
          </span>
        </div>
      </article>
    );
  }

  function renderTableReservation(item: ManagedSurfPackageReservation) {
    return (
      <tr key={item.id} className={item.status === "NEW" ? "is-new" : ""}>
        <td><div className="transfer-request-guest"><span className="transfer-request-card__avatar" aria-hidden="true">{getCustomerInitials(item.customerName)}</span><span><strong>{item.customerName}</strong><small>{item.customerEmail || item.customerPhone}</small>{item.customerEmail && <small>{item.customerPhone}</small>}</span></div></td>
        <td><strong>{item.packageTitle}</strong><small>{formatCurrency(item.pricePerPerson, item.currency)} / person</small></td>
        <td><strong>{formatDay(item.bookingDate)}</strong><small>{item.bookingTime}</small></td>
        <td><strong>{item.guests} {item.guests === 1 ? "guest" : "guests"}</strong></td>
        <td><strong>{formatCurrency(item.estimatedTotal, item.currency)}</strong></td>
        <td><span className={`transfer-status transfer-status--${item.status.toLowerCase()}`}>{statuses.find((status) => status.value === item.status)?.label}</span>{renderStatus(item)}</td>
      </tr>
    );
  }

  function renderPagination() {
    return (
      <nav className="transfer-request-pagination" aria-label="Surf package reservation pages">
        <div className="transfer-request-pagination__summary">
          <label htmlFor="surf-package-page-size">{view === "cards" ? "Reservations per page" : "Rows per page"}</label>
          <select id="surf-package-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value) as (typeof pageSizes)[number]); setPage(1); }}>
            {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <span className="transfer-request-pagination__range">{filteredItems.length ? `${paginationStart + 1}–${paginationEnd} of ${filteredItems.length}` : "0 results"}</span>
        </div>
        <div className="transfer-request-pagination__controls">
          <button type="button" className="transfer-request-pagination__direction" onClick={() => setPage(activePage - 1)} disabled={activePage === 1} aria-label="Previous page"><span aria-hidden="true">←</span><span>Previous</span></button>
          <div className="transfer-request-pagination__pages">
            {pageTokens.map((token, index) => token === "before" || token === "after"
              ? <span className="transfer-request-pagination__ellipsis" key={`${token}-${index}`} aria-hidden="true">…</span>
              : <button type="button" key={token} className={activePage === token ? "is-current" : ""} aria-current={activePage === token ? "page" : undefined} aria-label={`Page ${token}`} onClick={() => setPage(token)}>{token}</button>)}
          </div>
          <button type="button" className="transfer-request-pagination__direction" onClick={() => setPage(activePage + 1)} disabled={activePage === pageCount} aria-label="Next page"><span>Next</span><span aria-hidden="true">→</span></button>
        </div>
      </nav>
    );
  }

  return (
    <section className="surf-package-reservations" aria-labelledby="surf-package-reservations-title">
      <section className="transfer-request-kpis" aria-label="Surf package reservation statistics">
        {reservationStats.map((stat) => (
          <button
            type="button"
            key={stat.status}
            className={`transfer-request-kpi transfer-request-kpi--${stat.style}${statusFilter === stat.status ? " is-selected" : ""}`}
            aria-pressed={statusFilter === stat.status}
            onClick={() => {
              setStatusFilter(stat.status);
              setPage(1);
            }}
          >
            <span className="transfer-request-kpi__icon" aria-hidden="true">{stat.icon}</span>
            <span className="transfer-request-kpi__label">{stat.label}</span>
            <strong>{stat.value.toString().padStart(2, "0")}</strong>
            <small>{stat.note}</small>
          </button>
        ))}
      </section>
      <section className="transfer-panel transfer-requests-panel">
        <div className="transfer-panel__heading">
          <div><p className="transfer-eyebrow">Guest bookings</p><h2 id="surf-package-reservations-title">Surf package reservations</h2></div>
          <span>{filteredItems.length} of {items.length} shown</span>
        </div>
        <div className="transfer-requests-toolbar">
          <label className="transfer-requests-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search guest, package, phone or email" aria-label="Search surf package reservations" autoComplete="off" />
            {search && <button type="button" onClick={() => { setSearch(""); setPage(1); }} aria-label="Clear search">×</button>}
          </label>
          <fieldset className="transfer-request-date-filter">
            <legend>Booking date range</legend>
            <label>From<input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} aria-label="Booking date from" /></label>
            <span aria-hidden="true">→</span>
            <label>To<input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setPage(1); }} aria-label="Booking date to" /></label>
            {(fromDate || toDate) && <button type="button" className="transfer-request-date-filter__clear" onClick={() => { setFromDate(""); setToDate(""); setPage(1); }} aria-label="Clear date range">×</button>}
          </fieldset>
          <div className="transfer-requests-toolbar__end">
            <p>{invalidDateRange ? "Choose a valid date range" : statusFilter === "ALL" ? "Newest bookings first" : `${statuses.find((status) => status.value === statusFilter)?.label} · newest first`}</p>
            <div className="transfer-request-view-toggle" role="group" aria-label="Reservation display">
              <button type="button" className={view === "cards" ? "is-active" : ""} aria-pressed={view === "cards"} onClick={() => { setView("cards"); setPage(1); }}><span aria-hidden="true">▦</span> Cards</button>
              <button type="button" className={view === "table" ? "is-active" : ""} aria-pressed={view === "table"} onClick={() => { setView("table"); setPage(1); }}><span aria-hidden="true">☷</span> Table</button>
            </div>
          </div>
        </div>

      {notice && <DashboardActionToast type={notice.type} message={notice.text} onDismiss={() => setNotice(null)} />}
      {items.length === 0 ? (
        <div className="transfer-empty"><span aria-hidden="true">✳</span><h3>No surf package reservations yet</h3><p>New package bookings will appear here when guests submit a reservation.</p></div>
      ) : filteredItems.length === 0 ? (
        <div className="transfer-empty transfer-empty--compact"><span aria-hidden="true">⌕</span><h3>{invalidDateRange ? "Check your date range" : "No matching reservations"}</h3><p>{invalidDateRange ? "The start date must be on or before the end date." : "Try a different search, date range or status filter."}</p><button type="button" onClick={clearFilters}>Clear filters</button></div>
      ) : view === "cards" ? (
        <>
          <div className="transfer-request-days">
            {currentGroups.map((group) => (
              <section className="transfer-request-day" key={group.date} aria-label={`Reservations for ${formatDay(group.date)}`}>
                <header className="transfer-request-day__heading">
                  <span className="transfer-request-day__date-icon" aria-hidden="true">▦</span>
                  <div><h3>{formatDay(group.date)}</h3><p>{group.items.length} {group.items.length === 1 ? "reservation" : "reservations"}</p></div>
                  <span className="transfer-request-day__count">{group.items.length.toString().padStart(2, "0")}</span>
                </header>
                <div className="transfer-request-day__cards">{group.items.map(renderReservation)}</div>
              </section>
            ))}
          </div>
          {renderPagination()}
        </>
      ) : (
        <>
          <div className="transfer-table-wrap">
            <table className="transfer-table transfer-request-table">
              <thead><tr><th>Guest</th><th>Surf package</th><th>Booking date</th><th>Guests</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{pageItems.map(renderTableReservation)}</tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
      </section>
    </section>
  );
}