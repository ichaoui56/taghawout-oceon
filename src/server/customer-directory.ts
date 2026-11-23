import "server-only";

import { getActivityReservations } from "./activity-reservations";
import { getSurfLessonReservations } from "./surf-lesson-catalog";
import { getSurfPackageReservations } from "./surf-package-catalog";

export type CustomerReservationSource = "SURF_PACKAGE" | "SURF_LESSON" | "ACTIVITY";

export type CustomerReservation = {
  id: string;
  source: CustomerReservationSource;
  title: string;
  bookingDate: string;
  bookingTime: string;
  guests: number;
  estimatedTotal: number;
  currency: string;
  status: string;
};

export type ManagedCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalReservations: number;
  surfPackageReservations: number;
  surfLessonReservations: number;
  activityReservations: number;
  totalGuests: number;
  firstBooking: string;
  lastBooking: string;
  spendByCurrency: { currency: string; amount: number }[];
  reservations: CustomerReservation[];
};

type ReservationContact = {
  id: string;
  source: CustomerReservationSource;
  title: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  bookingDate: string;
  bookingTime: string;
  guests: number;
  estimatedTotal: number;
  currency: string;
  status: string;
  createdAt: string;
};

type CustomerAccumulator = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  reservations: CustomerReservation[];
};

function normalizedIdentity(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase();
}

function identityKeys(contact: ReservationContact) {
  const keys: string[] = [];
  const email = contact.customerEmail ? normalizedIdentity(contact.customerEmail) : "";
  const phone = contact.customerPhone.replace(/\D/g, "");
  if (email) keys.push(`email:${email}`);
  if (phone) keys.push(`phone:${phone}`);
  if (!keys.length) keys.push(`name:${normalizedIdentity(contact.customerName)}`);
  return keys;
}

export async function getManagedCustomers(): Promise<ManagedCustomer[]> {
  if (!process.env.DATABASE_URL) return [];

  const [packages, lessons, activities] = await Promise.all([
    getSurfPackageReservations(),
    getSurfLessonReservations(),
    getActivityReservations(),
  ]);

  const contacts: ReservationContact[] = [
    ...packages.map((reservation): ReservationContact => ({
      id: reservation.id,
      source: "SURF_PACKAGE",
      title: reservation.packageTitle,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      customerEmail: reservation.customerEmail,
      bookingDate: reservation.bookingDate,
      bookingTime: reservation.bookingTime,
      guests: reservation.guests,
      estimatedTotal: reservation.estimatedTotal,
      currency: reservation.currency,
      status: reservation.status,
      createdAt: reservation.createdAt,
    })),
    ...lessons.map((reservation): ReservationContact => ({
      id: reservation.id,
      source: "SURF_LESSON",
      title: reservation.lessonTitle,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      customerEmail: reservation.customerEmail,
      bookingDate: reservation.bookingDate,
      bookingTime: reservation.bookingTime,
      guests: reservation.guests,
      estimatedTotal: reservation.estimatedTotal,
      currency: reservation.currency,
      status: reservation.status,
      createdAt: reservation.createdAt,
    })),
    ...activities.map((reservation): ReservationContact => {
      const sortedLines = [...reservation.lines].sort((first, second) => first.date.localeCompare(second.date) || first.time.localeCompare(second.time));
      const firstLine = sortedLines[0];
      return {
        id: reservation.id,
        source: "ACTIVITY",
        title: [...new Set(sortedLines.map((line) => line.activityTitle))].join(", ") || "Activity booking",
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail,
        bookingDate: firstLine?.date ?? reservation.createdAt.slice(0, 10),
        bookingTime: firstLine?.time ?? "",
        guests: reservation.lines.reduce((total, line) => total + line.adults + line.children, 0),
        estimatedTotal: reservation.estimatedTotal,
        currency: reservation.currency,
        status: reservation.status,
        createdAt: reservation.createdAt,
      };
    }),
  ].sort((first, second) => first.createdAt.localeCompare(second.createdAt));

  const customers = new Map<string, CustomerAccumulator>();
  const identityIndex = new Map<string, string>();
  let nextCustomerNumber = 1;

  for (const contact of contacts) {
    const keys = identityKeys(contact);
    const matches = [...new Set(keys.flatMap((key) => {
      const match = identityIndex.get(key);
      return match ? [match] : [];
    }))];
    let customerId = matches[0] ?? keys[0] ?? `customer-${nextCustomerNumber++}`;
    let customer = customers.get(customerId);

    if (!customer) {
      customer = {
        id: customerId,
        name: contact.customerName,
        phone: contact.customerPhone,
        email: contact.customerEmail,
        reservations: [],
      };
      customers.set(customerId, customer);
    }

    for (const duplicateId of matches.slice(1)) {
      const duplicate = customers.get(duplicateId);
      if (!duplicate) continue;
      customer.reservations.push(...duplicate.reservations);
      customers.delete(duplicateId);
      for (const [key, indexedId] of identityIndex) {
        if (indexedId === duplicateId) identityIndex.set(key, customerId);
      }
    }

    customer.name = contact.customerName || customer.name;
    customer.phone = contact.customerPhone || customer.phone;
    customer.email = contact.customerEmail || customer.email;
    customer.reservations.push({
      id: `${contact.source}:${contact.id}`,
      source: contact.source,
      title: contact.title,
      bookingDate: contact.bookingDate,
      bookingTime: contact.bookingTime,
      guests: contact.guests,
      estimatedTotal: contact.estimatedTotal,
      currency: contact.currency,
      status: contact.status,
    });
    for (const key of keys) identityIndex.set(key, customerId);
  }

  return [...customers.values()].map((customer): ManagedCustomer => {
    const reservations = [...customer.reservations].sort((first, second) => second.bookingDate.localeCompare(first.bookingDate) || second.bookingTime.localeCompare(first.bookingTime));
    const spend = new Map<string, number>();
    for (const reservation of reservations) {
      spend.set(reservation.currency, (spend.get(reservation.currency) ?? 0) + reservation.estimatedTotal);
    }
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      totalReservations: reservations.length,
      surfPackageReservations: reservations.filter((reservation) => reservation.source === "SURF_PACKAGE").length,
      surfLessonReservations: reservations.filter((reservation) => reservation.source === "SURF_LESSON").length,
      activityReservations: reservations.filter((reservation) => reservation.source === "ACTIVITY").length,
      totalGuests: reservations.reduce((total, reservation) => total + reservation.guests, 0),
      firstBooking: reservations.reduce((first, reservation) => reservation.bookingDate < first ? reservation.bookingDate : first, reservations[0]?.bookingDate ?? ""),
      lastBooking: reservations[0]?.bookingDate ?? "",
      spendByCurrency: [...spend].map(([currency, amount]) => ({ currency, amount })),
      reservations,
    };
  }).sort((first, second) => second.lastBooking.localeCompare(first.lastBooking) || first.name.localeCompare(second.name));
}