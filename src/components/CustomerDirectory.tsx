"use client";

import { useState } from "react";
import type { ManagedCustomer, CustomerReservation, CustomerReservationSource } from "../server/customer-directory";

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

function sourceLabel(source: CustomerReservationSource) {
  if (source === "SURF_PACKAGE") return "Surf package";
  if (source === "SURF_LESSON") return "Surf lesson";
  return "Activity";
}

function statusClass(status: string) {
  return `transfer-status--${status.toLocaleLowerCase()}`;
}

function CustomerBookingTable({ reservations }: { reservations: CustomerReservation[] }) {
  return (
    <div className="transfer-table-wrap">
      <table className="transfer-table">
        <thead><tr><th>Reservation</th><th>Type</th><th>Booking date</th><th>Guests</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td><strong>{reservation.title}</strong></td>
              <td>{sourceLabel(reservation.source)}</td>
              <td><strong>{formatDate(reservation.bookingDate)}</strong><small>{reservation.bookingTime || "Time not set"}</small></td>
              <td>{reservation.guests}</td>
              <td><strong>{formatCurrency(reservation.estimatedTotal, reservation.currency)}</strong></td>
              <td><span className={`transfer-status ${statusClass(reservation.status)}`}>{reservation.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CustomerDirectory({ customers }: { customers: ManagedCustomer[] }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = search.trim().toLocaleLowerCase();
  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.phone, customer.email ?? ""].some((value) => value.toLocaleLowerCase().includes(query)),
  );
  const allReservations = customers.flatMap((customer) => customer.reservations);
  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? null;
  const totals = [
    { label: "Customers", value: customers.length, icon: "◉", style: "total" },
    { label: "Reservations", value: allReservations.length, icon: "▤", style: "confirmed" },
    { label: "Surf packages", value: allReservations.filter((reservation) => reservation.source === "SURF_PACKAGE").length, icon: "◇", style: "new" },
    { label: "Surf lessons", value: allReservations.filter((reservation) => reservation.source === "SURF_LESSON").length, icon: "⌁", style: "completed" },
    { label: "Activities", value: allReservations.filter((reservation) => reservation.source === "ACTIVITY").length, icon: "✳", style: "cancelled" },
  ];

  return (
    <section className="customer-directory" aria-label="Customer directory">
      <section className="transfer-request-kpis" aria-label="Customer and reservation statistics">
        {totals.map((stat) => (
          <article className={`transfer-request-kpi transfer-request-kpi--${stat.style}`} key={stat.label}>
            <span className="transfer-request-kpi__icon" aria-hidden="true">{stat.icon}</span>
            <span className="transfer-request-kpi__label">{stat.label}</span>
            <strong>{stat.value.toString().padStart(2, "0")}</strong>
            <small>Across all bookings</small>
          </article>
        ))}
      </section>

      <section className="transfer-panel transfer-requests-panel">
        <div className="transfer-panel__heading">
          <div><p className="transfer-eyebrow">Guest records</p><h2>Customers</h2></div>
          <span>{filteredCustomers.length} of {customers.length} customers</span>
        </div>
        <div className="transfer-requests-toolbar">
          <label className="transfer-requests-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone or email" aria-label="Search customers" autoComplete="off" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
          </label>
        </div>
        {filteredCustomers.length ? (
          <div className="transfer-table-wrap">
            <table className="transfer-table customer-directory__table">
              <thead><tr><th>Customer</th><th>Surf packages</th><th>Surf lessons</th><th>Activities</th><th>Total bookings</th><th>Guests</th><th>Last booking</th></tr></thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className={selectedId === customer.id ? "is-selected" : ""}>
                    <td>
                      <button type="button" className="customer-directory__select" aria-expanded={selectedId === customer.id} onClick={() => setSelectedId(selectedId === customer.id ? null : customer.id)}>
                        <strong>{customer.name}</strong><small>{customer.email || customer.phone}</small>{customer.email && <small>{customer.phone}</small>}
                      </button>
                    </td>
                    <td>{customer.surfPackageReservations}</td>
                    <td>{customer.surfLessonReservations}</td>
                    <td>{customer.activityReservations}</td>
                    <td><strong>{customer.totalReservations}</strong></td>
                    <td>{customer.totalGuests}</td>
                    <td>{formatDate(customer.lastBooking)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="transfer-empty transfer-empty--compact">
            <span aria-hidden="true">⌕</span>
            <h3>{customers.length ? "No matching customers" : "No customers yet"}</h3>
            <p>{customers.length ? "Try a different name, phone number or email." : "Customer details will be added from surf package, surf lesson and activity reservations."}</p>
            {search && <button type="button" onClick={() => setSearch("")}>Clear search</button>}
          </div>
        )}

        {selectedCustomer && (
          <section className="customer-directory__details" aria-labelledby="customer-details-title">
            <header className="transfer-panel__heading">
              <div><p className="transfer-eyebrow">Customer details</p><h2 id="customer-details-title">{selectedCustomer.name}</h2></div>
              <button type="button" className="transfer-request-date-filter__clear" onClick={() => setSelectedId(null)} aria-label="Close customer details">×</button>
            </header>
            <div className="customer-directory__contact">
              <a href={`tel:${selectedCustomer.phone}`}>{selectedCustomer.phone}</a>
              {selectedCustomer.email && <a href={`mailto:${selectedCustomer.email}`}>{selectedCustomer.email}</a>}
              <span>{selectedCustomer.totalGuests} guests across {selectedCustomer.totalReservations} reservations</span>
            </div>
            <div className="customer-directory__facts">
              <div><span>First booking</span><strong>{formatDate(selectedCustomer.firstBooking)}</strong></div>
              <div><span>Surf packages</span><strong>{selectedCustomer.surfPackageReservations}</strong></div>
              <div><span>Surf lessons</span><strong>{selectedCustomer.surfLessonReservations}</strong></div>
              <div><span>Activities</span><strong>{selectedCustomer.activityReservations}</strong></div>
              {selectedCustomer.spendByCurrency.map((spend) => <div key={spend.currency}><span>Total booked · {spend.currency}</span><strong>{formatCurrency(spend.amount, spend.currency)}</strong></div>)}
            </div>
            <h3 className="customer-directory__history-title">Reservation history</h3>
            <CustomerBookingTable reservations={selectedCustomer.reservations} />
          </section>
        )}
      </section>
    </section>
  );
}