"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deletePrivateTransferService,
  deleteTransferLocation,
  deleteTransferRoute,
  savePrivateTransferService,
  saveTransferLocation,
  saveTransferRoute,
  signOutTransferDashboard,
} from "../server/transfer-actions";
import type {
  PrivateServiceData,
  TransferDashboardData,
  TransferDashboardUser,
  TransferLocationData,
  TransferRequestData,
  TransferRouteData,
} from "../transfers/types";
import type { ManagedActivity } from "../activities";
import ActivityManagement from "./ActivityManagement";
import ActivityCatalogDetails from "./ActivityCatalogDetails";
import ActivityReservationManagement from "./ActivityReservationManagement";
import ActivityReservationDetails from "./ActivityReservationDetails";
import TransferRequestDetails from "./TransferRequestDetails";
import type { ManagedActivityReservation } from "../server/activity-reservations";
import BlogManagement from "./BlogManagement";
import DashboardAccountSettings from "./DashboardAccountSettings";
import DashboardSeoManagement from "./DashboardSeoManagement";
import ConciergeManagement from "./ConciergeManagement";
import type { SiteSeoSettings } from "../seo";
import type { ConciergeSectionSettings } from "../concierge";
import type { ManagedBlogPost } from "../server/blog-catalog";
import GoogleReviewsManagement from "./GoogleReviewsManagement";
import type { GoogleReviewsSettings, ManagedGoogleReview } from "../server/google-reviews";
import type { DashboardPage } from "./TransferDashboardWrapper";

type Props = {
  user: TransferDashboardUser;
  data: TransferDashboardData;
  page: DashboardPage;
  managedActivities: ManagedActivity[];
  managedActivityCount: number;
  activityDetail: ManagedActivity | null;
  activityReservations: ManagedActivityReservation[];
  activityReservationCount: number;
  managedBlogs: ManagedBlogPost[];
  managedGoogleReviews: ManagedGoogleReview[];
  managedGoogleReviewCount: number;
  googleReviewSettings: GoogleReviewsSettings | null;
  managedBlogCount: number;
  siteSeoSettings: SiteSeoSettings | null;
  conciergeSettings: ConciergeSectionSettings | null;
  transferRequestDetail: TransferRequestData | null;
  activityReservationDetail: ManagedActivityReservation | null;
};

type DashboardTab = "routes" | "private" | "locations";
type AddMode = "choose" | "route" | "service" | "location" | null;
type RequestStatusFilter = TransferRequestData["status"] | "ALL";
type RequestView = "cards" | "table";
type RequestPageSize = 10 | 25 | 50 | 100;

const transferTabs: { id: Exclude<DashboardTab, "requests">; label: string; icon: string }[] = [
  { id: "routes", label: "Transferts aéroport & trajets", icon: "✈" },
  { id: "private", label: "Sorties privées", icon: "◇" },
  { id: "locations", label: "Transfert sur mesure", icon: "⌖" },
];

const requestServiceTypes: Record<DashboardTab, TransferRequestData["serviceType"]> = {
  routes: "AIRPORT_ROUTE",
  private: "PRIVATE_SERVICE",
  locations: "CUSTOM_ROUTE",
};

const statusLabels: Record<TransferRequestData["status"], string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusClasses: Record<TransferRequestData["status"], string> = {
  NEW: "transfer-status--new",
  CONFIRMED: "transfer-status--confirmed",
  COMPLETED: "transfer-status--completed",
  CANCELLED: "transfer-status--cancelled",
};

const kindLabels: Record<PrivateServiceData["kind"], string> = {
  OUTING: "Private outing",
  PRIVATE_VISIT: "Private visit",
  CHAUFFEUR: "Chauffeur",
};

const SIDEBAR_COLLAPSED_KEY = "morocco-dashboard-sidebar-collapsed";

function DashboardIcon({ name }: { name: "grid" | "calendar" | "users" | "package" | "activity" | "star" | "content" | "settings" | "search" | "bell" | "logout" | "surf" | "coach" | "travel" | "pin" | "card" | "arrow" }) {
  const paths: Record<typeof name, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    package: <><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8M12 13v8" /></>,
    activity: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    content: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.82 1.82-.06-.06A1.7 1.7 0 0 0 16 18.36a1.7 1.7 0 0 0-1 .64l-.1.18V21h-2.6v-1.82l-.1-.18a1.7 1.7 0 0 0-1-.64 1.7 1.7 0 0 0-1.88.34l-.06.06-1.82-1.82.06-.06A1.7 1.7 0 0 0 7.84 15a1.7 1.7 0 0 0-.64-1l-.18-.1H5.2v-2.6h1.82l.18-.1a1.7 1.7 0 0 0 .64-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06L9.26 6.44l.06.06A1.7 1.7 0 0 0 11.2 6.16a1.7 1.7 0 0 0 1-.64l.1-.18V3.52h2.6V5.34l.1.18a1.7 1.7 0 0 0 1 .64 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.82 1.82-.06.06A1.7 1.7 0 0 0 19.36 9a1.7 1.7 0 0 0 .64 1l.18.1H22v2.6h-1.82l-.18.1a1.7 1.7 0 0 0-.64 1Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    surf: <><path d="M3 18c3-5 6-10 11-12 3 3 5 7 7 12-5 3-12 3-18 0Z" /><path d="M3 21c4-2 7-2 11 0 3 1 5 1 7 0" /></>,
    coach: <><circle cx="9" cy="8" r="4" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 9h5M19.5 6.5v5" /></>,
    travel: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h3" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function formatCurrency(price: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function formatRequestDay(date: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function privateServiceImageSrc(image: string) {
  if (image.startsWith("data:image/") || /^https?:\/\//i.test(image)) return image;
  return `https://images.unsplash.com/${image || "photo-1501785888041-af3ef285b470"}?auto=format&fit=crop&w=720&q=80`;
}

async function compressPrivateImage(file: File) {
  if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 15 MB.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const initialScale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
    const qualities = [0.86, 0.74, 0.62, 0.5, 0.38];
    for (const scale of [1, 0.85, 0.7, 0.58, 0.48, 0.4]) {
      const width = Math.max(1, Math.round(image.naturalWidth * initialScale * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * initialScale * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the image.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      for (const quality of qualities) {
        const compressed = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (compressed?.type === "image/webp" && compressed.size <= 100_000) {
          return compressed;
        }
      }
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  throw new Error("This image could not be reduced below 100 KB. Try a simpler or smaller photo.");
}

function PrivateImageUpload({ initialImage, initialAlt, initialAltFr }: { initialImage: string; initialAlt: string; initialAltFr: string }) {
  const [image, setImage] = useState(initialImage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const compressed = await compressPrivateImage(file);
      const uploadForm = new FormData();
      uploadForm.append("file", compressed, "outing.webp");
      const response = await fetch("/api/files", {
        method: "POST",
        body: uploadForm,
        credentials: "same-origin",
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Image upload failed. Please try again.";
        throw new Error(message);
      }
      if (typeof result !== "string" || !/^https:\/\//i.test(result)) {
        throw new Error("Image storage returned an invalid URL.");
      }
      setImage(result);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setBusy(false);
      input.value = "";
    }
  }

  return (
    <div className="transfer-image-upload">
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="imageUploadPending" value={busy ? "true" : "false"} />
      <div className="transfer-image-upload__preview">
        <img src={privateServiceImageSrc(image)} alt="" />
        <div>
          <strong>{image.startsWith("https://") ? "Image enregistrée sur Pinata" : image ? "Image actuelle" : "Image de la sortie"}</strong>
          <small>{busy ? "Compression puis envoi sécurisé vers Pinata…" : image.startsWith("https://") ? "Servie depuis votre passerelle Pinata." : "Choisissez une image pour la compresser et l’envoyer vers Pinata."}</small>
        </div>
      </div>
      <div className="transfer-image-upload__controls">
        <label className="transfer-image-upload__button">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} disabled={busy} />
          <span aria-hidden="true">↑</span>{busy ? "Compression en cours…" : image ? "Changer l’image" : "Choisir une image"}
        </label>
        {image && (
          <button type="button" className="transfer-image-upload__remove" disabled={busy} onClick={() => setImage("")}>
            Retirer
          </button>
        )}
      </div>
      <p className="transfer-image-upload__hint">JPEG, PNG ou WebP · 15 Mo maximum avant compression · WebP de 100 Ko maximum envoyé sur Pinata.</p>
      {error && <p className="transfer-form-error" role="alert">{error}</p>}
      <label className="transfer-image-upload__alt">Description de l’image (accessibilité)
        <input name="imageAlt" defaultValue={initialAlt} maxLength={240} placeholder="Décrivez brièvement la photo" />
      </label>
      <label className="transfer-image-upload__alt">Description de l’image (français)
        <input name="imageAltFr" defaultValue={initialAltFr} maxLength={240} placeholder="Décrivez brièvement la photo" />
      </label>
    </div>
  );
}

function PrivateServiceStartTimes({ initialTimes }: { initialTimes: string[] }) {
  const [times, setTimes] = useState(initialTimes);
  const [time, setTime] = useState("");

  function addTime() {
    if (!time || times.includes(time) || times.length >= 24) return;
    setTimes([...times, time].sort());
    setTime("");
  }

  return (
    <div className="transfer-start-times">
      <label>Heures de départ
        <div className="transfer-start-times__entry">
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          <button type="button" onClick={addTime} disabled={!time || times.includes(time) || times.length >= 24}>
            Ajouter
          </button>
        </div>
      </label>
      <input type="hidden" name="startTimes" value={JSON.stringify(times)} />
      {times.length > 0 ? (
        <div className="transfer-start-times__list" aria-label="Heures ajoutées">
          {times.map((item) => (
            <span key={item}>
              {Number(item.slice(0, 2))}h{item.slice(3)}
              <button type="button" aria-label={`Retirer ${item}`} onClick={() => setTimes(times.filter((entry) => entry !== item))}>×</button>
            </span>
          ))}
        </div>
      ) : <small>Ajoutez une ou plusieurs heures pour afficher les choix dans le formulaire de réservation.</small>}
    </div>
  );
}

export default function TransferDashboard({
  user,
  data,
  page,
  managedActivities,
  managedActivityCount,
  activityDetail,
  activityReservations,
  activityReservationCount,
  managedBlogs,
  managedGoogleReviews,
  managedGoogleReviewCount,
  googleReviewSettings,
  managedBlogCount,
  siteSeoSettings,
  conciergeSettings,
  transferRequestDetail,
  activityReservationDetail,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("routes");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requestCategory, setRequestCategory] = useState<DashboardTab>("routes");
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatusFilter>("ALL");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestView, setRequestView] = useState<RequestView>("cards");
  const [requestDateFrom, setRequestDateFrom] = useState("");
  const [requestDateTo, setRequestDateTo] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const [requestPageSize, setRequestPageSize] = useState<RequestPageSize>(10);
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [editingRoute, setEditingRoute] = useState<TransferRouteData | null>(null);
  const [editingService, setEditingService] = useState<PrivateServiceData | null>(null);
  const [editingLocation, setEditingLocation] = useState<TransferLocationData | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isAdmin = user.role === "ADMIN";
  const requestsByCategory: Record<DashboardTab, TransferRequestData[]> = {
    routes: data.requests.filter((request) => request.serviceType === requestServiceTypes.routes),
    private: data.requests.filter((request) => request.serviceType === requestServiceTypes.private),
    locations: data.requests.filter((request) => request.serviceType === requestServiceTypes.locations),
  };
  const categoryRequests = requestsByCategory[requestCategory];
  const newRequests = data.requests.filter((request) => request.status === "NEW").length;
  const categoryNewRequests = categoryRequests.filter((request) => request.status === "NEW").length;
  const categoryConfirmedRequests = categoryRequests.filter((request) => request.status === "CONFIRMED").length;
  const categoryCompletedRequests = categoryRequests.filter((request) => request.status === "COMPLETED").length;
  const categoryCancelledRequests = categoryRequests.filter((request) => request.status === "CANCELLED").length;
  const invalidRequestDateRange = Boolean(requestDateFrom && requestDateTo && requestDateFrom > requestDateTo);
  const visibleRequests = categoryRequests.filter((request) => {
    const matchesStatus = requestStatusFilter === "ALL" || request.status === requestStatusFilter;
    const travelDate = request.serviceDate.slice(0, 10);
    const matchesDateRange = !invalidRequestDateRange &&
      (!requestDateFrom || travelDate >= requestDateFrom) &&
      (!requestDateTo || travelDate <= requestDateTo);
    const query = requestSearch.trim().toLocaleLowerCase();
    const matchesSearch = !query || [
      request.customerName,
      request.customerPhone,
      request.serviceName,
      request.departure,
      request.arrival ?? "",
    ].some((value) => value.toLocaleLowerCase().includes(query));
    return matchesStatus && matchesSearch && matchesDateRange;
  });
  const sortedVisibleRequests = [...visibleRequests].sort((first, second) =>
    Date.parse(second.createdAt) - Date.parse(first.createdAt),
  );
  const requestPageCount = Math.max(1, Math.ceil(sortedVisibleRequests.length / requestPageSize));
  const currentRequestPage = Math.min(requestPage, requestPageCount);
  const pageStartIndex = (currentRequestPage - 1) * requestPageSize;
  const paginatedRequests = sortedVisibleRequests.slice(pageStartIndex, pageStartIndex + requestPageSize);
  const paginationPages: (number | "start-ellipsis" | "end-ellipsis")[] = [];
  if (requestPageCount <= 7) {
    paginationPages.push(...Array.from({ length: requestPageCount }, (_, index) => index + 1));
  } else {
    paginationPages.push(1);
    if (currentRequestPage > 3) paginationPages.push("start-ellipsis");
    for (let pageNumber = Math.max(2, currentRequestPage - 1); pageNumber <= Math.min(requestPageCount - 1, currentRequestPage + 1); pageNumber += 1) {
      paginationPages.push(pageNumber);
    }
    if (currentRequestPage < requestPageCount - 2) paginationPages.push("end-ellipsis");
    paginationPages.push(requestPageCount);
  }
  const requestGroups = [...sortedVisibleRequests.reduce((groups, request) => {
    const date = request.serviceDate.slice(0, 10);
    const requests = groups.get(date) ?? [];
    requests.push(request);
    groups.set(date, requests);
    return groups;
  }, new Map<string, TransferRequestData[]>()).entries()]
    .map(([date, requests]) => [
      date,
      requests,
    ] as const);
  const recentRequests = [...data.requests]
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .slice(0, 5);
  const departureLocations = data.locations.filter((location) => location.isDeparture);
  const arrivalLocations = data.locations.filter((location) => location.isArrival);
  const heading = page === "overview"
    ? "Overview"
    : page === "requests"
      ? "Transfer requests"
      : page === "request-detail"
        ? "Transfer request details"
      : page === "activities"
        ? "Manage activities"
          : page === "activity-detail"
            ? "Activity details"
        : page === "activity-reservations"
          ? "Activity reservations"
          : page === "activity-reservation-detail"
            ? "Activity reservation details"
          : page === "blogs"
            ? "Journal management"
          : page === "reviews"
            ? "Customer reviews"
          : page === "settings"
            ? "Account settings"
          : page === "seo"
            ? "Website SEO"
          : "Transfer management";

  useEffect(() => {
    try {
      if (window.matchMedia("(max-width: 640px)").matches) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) !== "true");
      }
    } catch (error) {
      console.warn("Could not restore dashboard sidebar preferences.", error);
    }
  }, []);

  function toggleSidebar() {
    setSidebarOpen((open) => {
      const nextOpen = !open;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(!nextOpen));
      } catch (error) {
        console.warn("Could not save dashboard sidebar state.", error);
      }
      return nextOpen;
    });
  }

  async function signOut() {
    await signOutTransferDashboard();
  }

  function refresh() {
    router.refresh();
  }

  function closeEditor() {
    setAddMode(null);
    setEditingRoute(null);
    setEditingService(null);
    setEditingLocation(null);
  }

  function startAdd() {
    setNotice(null);
    setEditingRoute(null);
    setEditingService(null);
    setEditingLocation(null);
    setAddMode("choose");
  }

  function editRoute(route: TransferRouteData) {
    setEditingRoute(route);
    setEditingService(null);
    setEditingLocation(null);
    setAddMode("route");
  }

  function editService(service: PrivateServiceData) {
    setEditingRoute(null);
    setEditingService(service);
    setEditingLocation(null);
    setAddMode("service");
  }

  function editLocation(location: TransferLocationData) {
    setEditingRoute(null);
    setEditingService(null);
    setEditingLocation(location);
    setAddMode("location");
  }

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      refresh();
      setNotice({ type: "success", text: success });
      return true;
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitRoute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const saved = await runAction(
      () => saveTransferRoute({
        id: editingRoute?.id,
        from: String(values.get("from") ?? ""),
        fromFr: String(values.get("fromFr") ?? ""),
        to: String(values.get("to") ?? ""),
        toFr: String(values.get("toFr") ?? ""),
        price: Number(values.get("price")),
        notes: String(values.get("notes") ?? ""),
        notesFr: String(values.get("notesFr") ?? ""),
        isActive: values.get("isActive") === "on",
      }),
      editingRoute ? "Airport transfer updated." : "Airport transfer added.",
    );
    if (saved) closeEditor();
  }

  async function submitService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (values.get("imageUploadPending") === "true") {
      setNotice({ text: "Wait for the image upload to finish before saving.", type: "error" });
      return;
    }
    let startTimes: unknown;
    try {
      startTimes = JSON.parse(String(values.get("startTimes") ?? "[]"));
    } catch {
      setNotice({ text: "The activity start times could not be read. Please add them again.", type: "error" });
      return;
    }
    if (!Array.isArray(startTimes) || startTimes.some((item) => typeof item !== "string")) {
      setNotice({ text: "The activity start times are invalid. Please add them again.", type: "error" });
      return;
    }
    const saved = await runAction(
      () => savePrivateTransferService({
        id: editingService?.id,
        name: String(values.get("name") ?? ""),
        nameFr: String(values.get("nameFr") ?? ""),
        kind: String(values.get("kind") ?? "OUTING") as PrivateServiceData["kind"],
        description: String(values.get("description") ?? ""),
        descriptionFr: String(values.get("descriptionFr") ?? ""),
        price: Number(values.get("price")),
        passengerLimit: Number(values.get("passengerLimit")),
        duration: String(values.get("duration") ?? "Demi-journée"),
        durationFr: String(values.get("durationFr") ?? ""),
        startTimes,
        image: String(values.get("image") ?? ""),
        imageAlt: String(values.get("imageAlt") ?? ""),
        imageAltFr: String(values.get("imageAltFr") ?? ""),
        isActive: values.get("isActive") === "on",
      }),
      editingService ? "Private outing updated." : "Private outing added.",
    );
    if (saved) closeEditor();
  }

  async function submitLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const saved = await runAction(
      () => saveTransferLocation({
        id: editingLocation?.id,
        name: String(values.get("name") ?? ""),
        nameFr: String(values.get("nameFr") ?? ""),
        isActive: values.get("isActive") === "on",
        isDeparture: values.get("isDeparture") === "on",
        isArrival: values.get("isArrival") === "on",
      }),
      editingLocation ? "Location updated." : "Location added.",
    );
    if (saved) closeEditor();
  }

  function removeRoute(route: TransferRouteData) {
    if (window.confirm("Delete this route? Existing requests will keep their saved route details.")) {
      void runAction(() => deleteTransferRoute(route.id), "Route deleted.");
    }
  }

  function removeService(service: PrivateServiceData) {
    if (window.confirm("Delete this private outing? Existing requests will keep their saved details.")) {
      void runAction(() => deletePrivateTransferService(service.id), "Private outing deleted.");
    }
  }

  function removeLocation(location: TransferLocationData) {
    if (window.confirm(`Remove ${location.name} from the custom-transfer options?`)) {
      void runAction(() => deleteTransferLocation(location.id), "Location deleted.");
    }
  }

  const isEditing = Boolean(editingRoute || editingService || editingLocation);

  return (
    <div
      className={`transfer-dashboard${sidebarOpen ? "" : " transfer-dashboard--sidebar-collapsed"}`}
    >
      <aside className="transfer-sidebar" id="transfer-dashboard-sidebar">
        <a className="transfer-brand" href="/" aria-label="Taghazout Ocean home">
          <span className="transfer-brand__mark"><DashboardIcon name="surf" /></span>
          <span><strong>TAGHAZOUT</strong><small>OCEAN · SURF &amp; TRAVEL</small></span>
        </a>
        <nav aria-label="Dashboard sections" className="transfer-sidebar__nav" onClick={(event) => {
          if (window.matchMedia("(max-width: 640px)").matches && (event.target as HTMLElement).closest("a")) {
            setSidebarOpen(false);
          }
        }}>
          <div className="transfer-sidebar__group">
            <p className="transfer-sidebar__group-label">Operations</p>
            <Link href="/dashboard" className={page === "overview" ? "is-active" : ""} title="Dashboard">
              <span><DashboardIcon name="grid" /></span><span>Dashboard</span>
            </Link>
            <Link href="/dashboard/requests" className={page === "requests" || page === "request-detail" ? "is-active" : ""} title="Bookings">
              <span><DashboardIcon name="calendar" /></span><span>Bookings</span>
              {newRequests > 0 && <b className="transfer-sidebar__alert-count">{newRequests}</b>}
            </Link>
            {isAdmin && (
              <Link href="/dashboard/transfers" className={page === "transfers" ? "is-active" : ""} title="Surf Packages">
                <span><DashboardIcon name="package" /></span><span>Packages</span>
                <b className="transfer-sidebar__count">{data.routes.length + data.services.length + data.locations.length}</b>
              </Link>
            )}
            {isAdmin && (
              <Link href="/dashboard/activities" className={page === "activities" ? "is-active" : ""} title="Surf Lessons">
                <span><DashboardIcon name="surf" /></span><span>Surf Lessons</span>
              </Link>
            )}
            {isAdmin && (
              <Link href="/dashboard/requests" title="Customers">
                <span><DashboardIcon name="users" /></span><span>Customers</span>
              </Link>
            )}
            {isAdmin && (
              <Link href="/dashboard/activity-reservations" className={page === "activity-reservations" || page === "activity-reservation-detail" ? "is-active" : ""} title="Activity reservations">
                <span><DashboardIcon name="card" /></span><span>Bookings</span>
                <b className="transfer-sidebar__count">{activityReservationCount}</b>
              </Link>
            )}
          </div>
          {isAdmin && (
            <div className="transfer-sidebar__group">
              <p className="transfer-sidebar__group-label">Catalogue &amp; content</p>
              <Link href="/dashboard/activities" className={page === "activities" || page === "activity-detail" ? "is-active" : ""} title="Activities">
                <span><DashboardIcon name="activity" /></span><span>Activities</span>
                <b className="transfer-sidebar__count">{managedActivityCount}</b>
              </Link>
              <Link href="/dashboard/blogs" className={page === "blogs" ? "is-active" : ""} title="Blog / Content">
                <span><DashboardIcon name="content" /></span><span>Blog / Content</span>
                <b className="transfer-sidebar__count">{managedBlogCount}</b>
              </Link>
              <Link href="/dashboard/reviews" className={page === "reviews" ? "is-active" : ""} title="Reviews">
                <span><DashboardIcon name="star" /></span><span>Reviews</span>
                <b className="transfer-sidebar__count">{managedGoogleReviewCount}</b>
              </Link>
              <Link href="/dashboard/concierge" className={page === "concierge" ? "is-active" : ""} title="Concierge">
                <span><DashboardIcon name="pin" /></span><span>Concierge</span>
              </Link>
              <Link href="/dashboard/seo" className={page === "seo" ? "is-active" : ""} title="Website SEO settings">
                <span aria-hidden="true">⌕</span><span>Website SEO</span>
              </Link>
            </div>
          )}
          <div className="transfer-sidebar__group transfer-sidebar__group--account">
            <p className="transfer-sidebar__group-label">Account</p>
            <Link href="/dashboard/settings" className={page === "settings" ? "is-active" : ""} title="Settings">
              <span><DashboardIcon name="settings" /></span><span>Settings</span>
            </Link>
          </div>
        </nav>
        <div className="transfer-sidebar__profile">
          <span className="transfer-sidebar__profile-avatar">{user.username.slice(0, 2).toUpperCase()}</span>
          <div><strong>{user.username}</strong><small>{user.role}</small></div>
          <button type="button" onClick={signOut} aria-label="Log out" title="Log out"><DashboardIcon name="logout" /></button>
        </div>
      </aside>

      <button
        type="button"
        className={`transfer-dashboard__mobile-backdrop${sidebarOpen ? " is-open" : ""}`}
        aria-label="Close navigation"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={() => setSidebarOpen(false)}
      />

      <button
        type="button"
        className="transfer-sidebar-resize"
        role="button"
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={sidebarOpen}
        aria-controls="transfer-dashboard-sidebar"
        tabIndex={0}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        onClick={toggleSidebar}
      >
        <span aria-hidden="true" />
      </button>

      <main className="transfer-dashboard__main">
        <header className="transfer-dashboard__topbar">
          <a className="transfer-dashboard__header-brand" href="/" aria-label="Taghazout Ocean home">
            <span className="transfer-brand__mark">TO</span>
            <span><strong>Taghazout</strong><small>Ocean · Operations</small></span>
          </a>
          <div className="transfer-dashboard__topbar-start">
            <label className="transfer-dashboard__search">
              <DashboardIcon name="search" />
              <span className="sr-only">Search dashboard</span>
              <input type="search" placeholder="Search anything..." aria-label="Search dashboard" />
            </label>
            <button
              type="button"
              className="transfer-sidebar-toggle"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="transfer-dashboard-sidebar"
              onClick={toggleSidebar}
            >
              <span aria-hidden="true">{sidebarOpen ? "‹" : "☰"}</span>
            </button>
            <div className="transfer-dashboard__breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>{heading}</strong></div>
          </div>
          <div className="transfer-dashboard__topbar-actions">
            <button type="button" className="transfer-dashboard__notification" aria-label="Notifications"><DashboardIcon name="bell" /><span>2</span></button>
            <a className="transfer-dashboard__website-link" href="/" target="_blank" rel="noreferrer">View website <span aria-hidden="true">↗</span></a>
            <button type="button" className="transfer-dashboard__account" aria-label="Open account menu" aria-haspopup="menu">
              <span className="transfer-dashboard__account-avatar">{user.username.slice(0, 2).toUpperCase()}</span>
              <span className="transfer-dashboard__account-name"><strong>{user.username}</strong><small>{user.role}</small></span>
              <span className="transfer-dashboard__account-chevron" aria-hidden="true">⌄</span>
            </button>
            <button type="button" className="transfer-dashboard__logout" onClick={signOut}>
              <span aria-hidden="true">↗</span><span>Log out</span>
            </button>
          </div>
        </header>

        <div className="transfer-dashboard__content">
          <header className="transfer-page-heading">
            <div>
              <p className="transfer-eyebrow">Travel operations · Morocco</p>
              <h1>{heading}</h1>
              <p>{page === "overview" ? "A clear view of your bookings, routes and guest experiences." : page === "requests" ? "Review guest details and keep every booking moving." : page === "request-detail" ? "Full guest, journey and booking details." : page === "activities" ? "Create and publish experiences with complete content and flexible pricing." : page === "activity-detail" ? "Complete content, schedule and booking setup for this experience." : page === "activity-reservations" ? "Review guest requests, confirm availability and manage every experience booking." : page === "activity-reservation-detail" ? "Guest details, scheduled activities and booking status." : page === "blogs" ? "Create stories, control publication, and manage search and social previews." : page === "reviews" ? "Add and publish customer reviews, profile photos, and your Google location." : page === "settings" ? "Update your dashboard username and password." : page === "seo" ? "Manage global metadata, crawling, verification, social previews, and structured identity." : "Manage all transfer options from one place."}</p>
            </div>
            {isAdmin && page === "transfers" && (
              <button type="button" className="transfer-add-button" onClick={startAdd}>
                <span aria-hidden="true">＋</span> Ajouter
              </button>
            )}
          </header>

          {isAdmin && page === "transfers" && (
            <nav className="transfer-type-tabs" aria-label="Transfer types">
              {transferTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={activeTab === tab.id ? "is-active" : ""}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setNotice(null);
                    closeEditor();
                  }}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <b>
                    {tab.id === "routes"
                      ? data.routes.length
                      : tab.id === "private"
                        ? data.services.length
                        : data.locations.length}
                  </b>
                </button>
              ))}
            </nav>
          )}

          {page === "overview" && (
            <>
              <div className="ocean-overview-top">
                <section className="ocean-overview-hero">
                  <div>
                    <p>Welcome back, {user.username}</p>
                    <h2>Let's Keep the<br /><strong>Ocean Moving</strong></h2>
                    <span>Manage your bookings, track your activities and grow your business in Taghazout.</span>
                    <Link href="/dashboard/requests">View Bookings <DashboardIcon name="arrow" /></Link>
                  </div>
                </section>

                <section className="ocean-kpi-grid" aria-label="Dashboard statistics">
                  {[
                    { label: "Total Bookings", value: data.requests.length, change: "+12%", icon: "calendar" as const, spark: "M2 38 C18 34 24 20 40 24 S66 29 78 15 S94 16 108 5" },
                    { label: "Happy Customers", value: new Set(data.requests.map((request) => request.customerPhone || request.customerName)).size, change: "+18%", icon: "users" as const, spark: "M2 36 C16 30 26 28 40 31 S61 18 76 20 S94 13 108 8" },
                    { label: "Reviews", value: managedGoogleReviewCount, change: "+0.2", icon: "star" as const, spark: "M2 38 C16 32 25 20 40 28 S63 30 76 20 S92 14 108 9" },
                    { label: "Packages Sold", value: managedActivityCount + data.services.length, change: "+5%", icon: "package" as const, spark: "M2 38 C18 32 24 27 39 29 S58 14 74 19 S94 10 108 5" },
                  ].map((item) => (
                    <article className="ocean-kpi-card" key={item.label}>
                      <span className="ocean-kpi-card__icon"><DashboardIcon name={item.icon} /></span>
                      <div><small>{item.label}</small><strong>{item.value}</strong><span>{item.change}</span></div>
                      <svg className="ocean-kpi-card__spark" viewBox="0 0 110 44" preserveAspectRatio="none" aria-hidden="true"><path d={item.spark} /></svg>
                    </article>
                  ))}
                </section>
              </div>

              {isAdmin && (
                <div className="ocean-overview-grid">
                  <section className="ocean-analytics-card" aria-label="Booking analytics">
                    <header><div><DashboardIcon name="activity" /><h2>Booking Analytics</h2></div><button type="button">Last 30 Days <span aria-hidden="true">⌄</span></button></header>
                    <div className="ocean-analytics-chart">
                      <div className="ocean-analytics-chart__grid"><i /><i /><i /><i /><i /></div>
                      <svg viewBox="0 0 620 240" preserveAspectRatio="none" role="img" aria-label="Booking trend over the last seven days">
                        <defs><linearGradient id="oceanChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#08b5de" stopOpacity="0.24" /><stop offset="1" stopColor="#08b5de" stopOpacity="0" /></linearGradient></defs>
                        <path className="ocean-analytics-chart__fill" d="M20 196 C65 180 78 138 120 145 S178 164 218 120 S286 94 330 112 S395 142 435 116 S504 62 600 74 L600 220 L20 220Z" />
                        <path className="ocean-analytics-chart__line" d="M20 196 C65 180 78 138 120 145 S178 164 218 120 S286 94 330 112 S395 142 435 116 S504 62 600 74" />
                        {[{x:20,y:196,v:"Mon"},{x:120,y:145,v:"Tue"},{x:218,y:120,v:"Wed"},{x:330,y:112,v:"Thu"},{x:435,y:116,v:"Fri"},{x:520,y:92,v:"Sat"},{x:600,y:74,v:"Sun"}].map((point) => <g key={point.v}><circle className="ocean-analytics-chart__point" cx={point.x} cy={point.y} r="7"><title>{point.v}: booking activity</title></circle></g>)}
                      </svg>
                      <div className="ocean-analytics-chart__labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                    </div>
                  </section>

                  <section className="ocean-activity-card" aria-label="Recent activity">
                    <header><div><DashboardIcon name="activity" /><h2>Recent Activity</h2></div><Link href="/dashboard/requests">View All <DashboardIcon name="arrow" /></Link></header>
                    <div className="ocean-activity-list">
                      {recentRequests.slice(0, 4).map((request, index) => (
                        <Link href="/dashboard/requests" className="ocean-activity-item" key={request.id}>
                          <span className={`ocean-activity-item__icon ocean-activity-item__icon--${index % 4}`}><DashboardIcon name={index === 0 ? "calendar" : index === 1 ? "card" : index === 2 ? "users" : "star"} /></span>
                          <span><strong>{index === 0 ? "New booking received" : index === 1 ? "Payment confirmed" : index === 2 ? "New customer registered" : "Review submitted"}</strong><small>{request.customerName}</small></span>
                          <b>{index === 1 ? "Paid" : "+1"}</b>
                        </Link>
                      ))}
                      {!recentRequests.length && <div className="ocean-activity-empty">New customer activity will appear here.</div>}
                    </div>
                  </section>

                  <aside className="ocean-promo-card">
                    <div className="ocean-promo-card__copy"><small>Explore Taghazout</small><h2>Discover<br />Morocco</h2><p>Surf, relax and explore<br />the Atlantic coast.</p><Link href="/activities">Explore More <DashboardIcon name="arrow" /></Link></div>
                    <svg className="ocean-promo-card__waves" viewBox="0 0 420 260" preserveAspectRatio="none" aria-hidden="true"><path d="M0 205C72 150 126 164 190 205c74 47 142-48 230-18v73H0Z" /><path d="M0 230c95-62 163-25 225 5 72 35 126-27 195-20v45H0Z" /></svg>
                  </aside>
                </div>
              )}

              <section className="ocean-services" aria-label="Popular services">
                <header><div><DashboardIcon name="star" /><h2>Popular Services</h2></div><Link href="/dashboard/activities">View All <DashboardIcon name="arrow" /></Link></header>
                <div className="ocean-services-grid">
                  {[
                    { title: "Surf Lessons", detail: "Learn to surf with experts", icon: "surf" as const },
                    { title: "Surf Packages", detail: "Complete surf holidays", icon: "calendar" as const },
                    { title: "Surf Coaching", detail: "Improve your skills", icon: "coach" as const },
                    { title: "Travel Experiences", detail: "Discover Morocco", icon: "travel" as const },
                    { title: "Local Adventures", detail: "Explore Taghazout", icon: "pin" as const },
                  ].map((service) => <Link href="/dashboard/activities" className="ocean-service-card" key={service.title}><span><DashboardIcon name={service.icon} /></span><div><strong>{service.title}</strong><small>{service.detail}</small></div></Link>)}
                </div>
              </section>
            </>
          )}

          {notice && <p className={`transfer-notice transfer-notice--${notice.type}`} role="status">{notice.text}</p>}

          {page === "activities" && isAdmin && <ActivityManagement items={managedActivities} />}

          {page === "blogs" && isAdmin && <BlogManagement items={managedBlogs} />}

          {page === "reviews" && isAdmin && googleReviewSettings && <GoogleReviewsManagement reviews={managedGoogleReviews} initialSettings={googleReviewSettings} />}

          {page === "settings" && <DashboardAccountSettings username={user.username} role={user.role} />}

          {page === "seo" && isAdmin && siteSeoSettings && <DashboardSeoManagement initialSettings={siteSeoSettings} />}

          {page === "concierge" && isAdmin && conciergeSettings && <ConciergeManagement initialSettings={conciergeSettings} />}

          {page === "activity-detail" && isAdmin && activityDetail && (
            <ActivityCatalogDetails item={activityDetail} />
          )}

          {page === "activity-reservations" && isAdmin && (
            <ActivityReservationManagement items={activityReservations} />
          )}

          {page === "activity-reservation-detail" && isAdmin && activityReservationDetail && (
            <ActivityReservationDetails item={activityReservationDetail} />
          )}

          {page === "request-detail" && transferRequestDetail && (
            <TransferRequestDetails request={transferRequestDetail} />
          )}

          {page === "requests" && (
            <>
              <nav className="transfer-type-tabs" aria-label="Request types">
                {transferTabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    className={requestCategory === tab.id ? "is-active" : ""}
                    aria-current={requestCategory === tab.id ? "page" : undefined}
                    onClick={() => {
                      setRequestCategory(tab.id);
                      setRequestPage(1);
                    }}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    <span>{tab.label}</span>
                    <b>{requestsByCategory[tab.id].length}</b>
                  </button>
                ))}
              </nav>

              <section className="transfer-request-kpis" aria-label="Request statistics for selected type">
                {([
                  { status: "ALL", label: "Total requests", value: categoryRequests.length, note: "In this request type", icon: "▤", style: "total" },
                  { status: "NEW", label: "Awaiting review", value: categoryNewRequests, note: "Need your attention", icon: "↗", style: "new" },
                  { status: "CONFIRMED", label: "Confirmed", value: categoryConfirmedRequests, note: "Journeys booked", icon: "◷", style: "confirmed" },
                  { status: "COMPLETED", label: "Completed", value: categoryCompletedRequests, note: "Guest journeys served", icon: "✓", style: "completed" },
                  { status: "CANCELLED", label: "Cancelled", value: categoryCancelledRequests, note: "Closed requests", icon: "×", style: "cancelled" },
                ] as const).map((stat) => (
                  <button
                    type="button"
                    key={stat.status}
                    className={`transfer-request-kpi transfer-request-kpi--${stat.style}${requestStatusFilter === stat.status ? " is-selected" : ""}`}
                    aria-pressed={requestStatusFilter === stat.status}
                    onClick={() => { setRequestStatusFilter(stat.status); setRequestPage(1); }}
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
                  <div><p className="transfer-eyebrow">Your inbox</p><h2>{transferTabs.find((tab) => tab.id === requestCategory)?.label}</h2></div>
                  <span>{visibleRequests.length} of {categoryRequests.length} shown</span>
                </div>
                <div className="transfer-requests-toolbar">
                  <label className="transfer-requests-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      value={requestSearch}
                      onChange={(event) => { setRequestSearch(event.target.value); setRequestPage(1); }}
                      placeholder="Search guest, service or destination"
                      aria-label="Search transfer requests"
                      autoComplete="off"
                    />
                    {requestSearch && <button type="button" onClick={() => { setRequestSearch(""); setRequestPage(1); }} aria-label="Clear search">×</button>}
                  </label>
                  <fieldset className="transfer-request-date-filter">
                    <legend>Travel date range</legend>
                    <label>From<input type="date" value={requestDateFrom} max={requestDateTo || undefined} onChange={(event) => { setRequestDateFrom(event.target.value); setRequestPage(1); }} aria-label="Travel date from" /></label>
                    <span aria-hidden="true">→</span>
                    <label>To<input type="date" value={requestDateTo} min={requestDateFrom || undefined} onChange={(event) => { setRequestDateTo(event.target.value); setRequestPage(1); }} aria-label="Travel date to" /></label>
                    {(requestDateFrom || requestDateTo) && <button type="button" className="transfer-request-date-filter__clear" onClick={() => { setRequestDateFrom(""); setRequestDateTo(""); setRequestPage(1); }} aria-label="Clear date range">×</button>}
                  </fieldset>
                  <div className="transfer-requests-toolbar__end">
                    <p>{invalidRequestDateRange ? "Choose a valid date range" : requestStatusFilter === "ALL" ? "Newest requests first" : `${statusLabels[requestStatusFilter]} · newest first`}</p>
                    <div className="transfer-request-view-toggle" role="group" aria-label="Request display">
                      <button type="button" className={requestView === "cards" ? "is-active" : ""} aria-pressed={requestView === "cards"} onClick={() => setRequestView("cards")}>
                        <span aria-hidden="true">▦</span> Cards
                      </button>
                      <button type="button" className={requestView === "table" ? "is-active" : ""} aria-pressed={requestView === "table"} onClick={() => setRequestView("table")}>
                        <span aria-hidden="true">☷</span> Table
                      </button>
                    </div>
                  </div>
                </div>
                {categoryRequests.length === 0 ? (
                  <div className="transfer-empty"><span aria-hidden="true">✳</span><h3>No reservations in this category</h3><p>Requests for this transfer type will appear here when guests book through your website.</p></div>
                ) : visibleRequests.length === 0 ? (
                  <div className="transfer-empty transfer-empty--compact"><span aria-hidden="true">⌕</span><h3>{invalidRequestDateRange ? "Check your date range" : "No matching requests"}</h3><p>{invalidRequestDateRange ? "The start date must be on or before the end date." : "Try a different search, date range or status filter."}</p><button type="button" onClick={() => { setRequestSearch(""); setRequestStatusFilter("ALL"); setRequestDateFrom(""); setRequestDateTo(""); setRequestPage(1); }}>Clear filters</button></div>
                ) : requestView === "cards" ? (
                  <div className="transfer-request-days">
                    {requestGroups.map(([date, requests]) => (
                      <section className="transfer-request-day" key={date} aria-label={`Requests for ${formatRequestDay(date)}`}>
                        <header className="transfer-request-day__heading">
                          <span className="transfer-request-day__date-icon" aria-hidden="true">▦</span>
                          <div><h3>{formatRequestDay(date)}</h3><p>{requests.length} {requests.length === 1 ? "reservation" : "reservations"}</p></div>
                          <span className="transfer-request-day__count">{requests.length.toString().padStart(2, "0")}</span>
                        </header>
                        <div className="transfer-request-day__cards">
                          {requests.map((request) => (
                            <article className={`transfer-request-card${request.status === "NEW" ? " is-new" : ""}`} key={request.id}>
                              <Link href={`/dashboard/requests/${request.id}`} className="transfer-request-card__open" aria-label={`Open ${request.customerName} request`}>
                                <span className="transfer-request-card__topline">
                                  <span className="transfer-request-card__time"><span aria-hidden="true">◷</span>{request.serviceTime || "Time not set"}</span>
                                  <span className={`transfer-status ${statusClasses[request.status]}`}>{statusLabels[request.status]}</span>
                                </span>
                                <span className="transfer-request-card__guest">
                                  <span className="transfer-request-card__avatar" aria-hidden="true">{request.customerName.slice(0, 1).toUpperCase()}</span>
                                  <span><strong>{request.customerName}</strong><small>{request.customerPhone}</small></span>
                                  <span className="transfer-request-card__arrow" aria-hidden="true">↗</span>
                                </span>
                                <span className="transfer-request-card__service"><strong>{request.serviceName}</strong><small>{request.departure}{request.arrival ? ` → ${request.arrival}` : ""}</small></span>
                                <span className="transfer-request-card__meta">
                                  <span><small>Guests</small><strong>{request.passengerCount}</strong></span>
                                  <span><small>Luggage</small><strong>{request.luggageCount} {request.luggageCount === 1 ? "bag" : "bags"}</strong></span>
                                  {request.serviceType === "PRIVATE_SERVICE" && request.status === "CONFIRMED" && <span className="transfer-reserved-slot"><b aria-hidden="true">×</b> Réservé</span>}
                                </span>
                              </Link>
                            </article>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="transfer-table-wrap">
                      <table className="transfer-table transfer-request-table">
                        <thead><tr><th>Guest</th><th>Service</th><th>Travel date</th><th>Passengers</th><th>Status</th><th><span className="transfer-sr-only">Open request</span></th></tr></thead>
                        <tbody>
                          {paginatedRequests.map((request) => (
                            <tr key={request.id} className={request.status === "NEW" ? "is-new" : ""}>
                              <td>
                                <Link className="transfer-request-guest transfer-request-guest__link" href={`/dashboard/requests/${request.id}`} aria-label={`Open ${request.customerName} request`}><span aria-hidden="true">{request.customerName.slice(0, 1).toUpperCase()}</span><span><strong>{request.customerName}</strong><small>{request.customerPhone}</small></span></Link>
                              </td>
                              <td><strong>{request.serviceName}</strong><small>{request.departure}{request.arrival ? ` → ${request.arrival}` : ""}</small></td>
                              <td>
                                <strong>{formatDate(request.serviceDate)}</strong>
                                <small>{request.serviceTime || "Time not set"}</small>
                                {request.serviceType === "PRIVATE_SERVICE" && request.status === "CONFIRMED" && (
                                  <span className="transfer-reserved-slot"><b aria-hidden="true">×</b> Réservé</span>
                                )}
                              </td>
                              <td><strong>{request.passengerCount} guests</strong><small>{request.luggageCount} bags</small></td>
                              <td><span className={`transfer-status ${statusClasses[request.status]}`}>{statusLabels[request.status]}</span></td>
                              <td><Link href={`/dashboard/requests/${request.id}`} className="transfer-row-open" aria-label={`Open ${request.customerName} request`}>↗</Link></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <nav className="transfer-request-pagination" aria-label="Transfer request pages">
                      <div className="transfer-request-pagination__summary">
                        <label htmlFor="transfer-request-page-size">Rows per page</label>
                        <select
                          id="transfer-request-page-size"
                          value={requestPageSize}
                          onChange={(event) => {
                            setRequestPageSize(Number(event.target.value) as RequestPageSize);
                            setRequestPage(1);
                          }}
                        >
                          {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                        <span className="transfer-request-pagination__range">
                          {pageStartIndex + 1}–{Math.min(pageStartIndex + requestPageSize, sortedVisibleRequests.length)} of {sortedVisibleRequests.length}
                        </span>
                      </div>
                      <div className="transfer-request-pagination__controls">
                        <button type="button" className="transfer-request-pagination__direction" onClick={() => setRequestPage(currentRequestPage - 1)} disabled={currentRequestPage === 1} aria-label="Previous page">
                          <span aria-hidden="true">←</span><span>Previous</span>
                        </button>
                        <div className="transfer-request-pagination__pages">
                          {paginationPages.map((pageNumber) => typeof pageNumber === "number" ? (
                            <button
                              type="button"
                              key={pageNumber}
                              className={pageNumber === currentRequestPage ? "is-current" : ""}
                              aria-current={pageNumber === currentRequestPage ? "page" : undefined}
                              aria-label={`Page ${pageNumber}`}
                              onClick={() => setRequestPage(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          ) : (
                            <span key={pageNumber} className="transfer-request-pagination__ellipsis" aria-hidden="true">…</span>
                          ))}
                        </div>
                        <button type="button" className="transfer-request-pagination__direction" onClick={() => setRequestPage(currentRequestPage + 1)} disabled={currentRequestPage === requestPageCount} aria-label="Next page">
                          <span>Next</span><span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </nav>
                  </>
                )}
              </section>
            </>
          )}

          {page === "transfers" && isAdmin && activeTab === "routes" && (
            <section className="transfer-catalog-section" aria-label="Airport transfers and routes">
              <div className="transfer-catalog-intro">
                <div><p className="transfer-eyebrow">Votre réseau de trajets</p><h2>Chaque route, à votre tarif.</h2><p>Ajoutez vos destinations, définissez le prix et laissez une remarque utile pour chaque trajet.</p></div>
                <span aria-hidden="true">✈</span>
              </div>
              {data.routes.length ? (
                <div className="transfer-route-grid">
                  {data.routes.map((route) => (
                    <article key={route.id} className={`transfer-route-card${route.isActive ? "" : " is-inactive"}`}>
                      <div className="transfer-route-card__top">
                        <span className="transfer-route-card__icon" aria-hidden="true">✈</span>
                        <span className={`transfer-live-badge${route.isActive ? "" : " is-hidden"}`}>{route.isActive ? "En ligne" : "Masqué"}</span>
                      </div>
                      <div className="transfer-route-card__journey">
                        <div><small>From</small><strong>{route.from}</strong></div><i aria-hidden="true" /><div><small>To</small><strong>{route.to}</strong></div>
                      </div>
                      <div className="transfer-route-card__price">{formatCurrency(route.price, route.currency)}<small>par trajet</small></div>
                      <p className="transfer-route-card__notes">{route.notes || "Aucune remarque pour ce trajet."}</p>
                      {isAdmin && <div className="transfer-card-actions">
                        <button type="button" onClick={() => editRoute(route)}>Modifier <span aria-hidden="true">↗</span></button>
                        <button type="button" className="is-danger" onClick={() => removeRoute(route)}>Supprimer</button>
                      </div>}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="transfer-empty"><span aria-hidden="true">✈</span><h3>Vos trajets commencent ici</h3><p>Ajoutez votre première liaison et définissez son prix ainsi que les remarques utiles.</p>{isAdmin && <button type="button" className="transfer-add-button" onClick={startAdd}>＋ Ajouter un trajet</button>}</div>
              )}
            </section>
          )}

          {page === "transfers" && isAdmin && activeTab === "private" && (
            <section className="transfer-catalog-section" aria-label="Private outings">
              <div className="transfer-catalog-intro transfer-catalog-intro--private">
                <div><p className="transfer-eyebrow">Des expériences à votre image</p><h2>Sorties privées</h2><p>Gérez les départs, la capacité et le tarif de chaque expérience.</p></div>
                <span aria-hidden="true">◇</span>
              </div>
              {data.services.length ? (
                <div className="transfer-outing-grid">
                  {data.services.map((service) => (
                    <article key={service.id} className={`transfer-outing-card${service.isActive ? "" : " is-inactive"}`}>
                      <div className="transfer-outing-card__top">
                        <span className="transfer-outing-card__kind">{kindLabels[service.kind]}</span>
                        <span className={`transfer-live-badge${service.isActive ? "" : " is-hidden"}`}>{service.isActive ? "En ligne" : "Masqué"}</span>
                      </div>
                      <img className="transfer-outing-card__image" src={privateServiceImageSrc(service.image)} alt={service.imageAlt} loading="lazy" />
                      <h3>{service.name}</h3>
                      <p className="transfer-outing-card__description">{service.description || "Aucune remarque pour cette sortie."}</p>
                      <div className="transfer-outing-card__facts">
                        <div><span>Capacité</span><strong>{service.passengerLimit} personnes</strong></div>
                        <div><span>Durée</span><strong>{service.duration}</strong></div>
                        <div><span>Heures de départ</span><strong>{service.startTimes.length ? service.startTimes.map((time) => `${Number(time.slice(0, 2))}h${time.slice(3)}`).join(" · ") : "À définir"}</strong></div>
                      </div>
                      <div className="transfer-outing-card__prices">
                        <div><span>Sortie privée</span><strong>{formatCurrency(service.price, service.currency)}</strong></div>
                      </div>
                      {isAdmin && <div className="transfer-card-actions">
                        <button type="button" onClick={() => editService(service)}>Modifier <span aria-hidden="true">↗</span></button>
                        <button type="button" className="is-danger" onClick={() => removeService(service)}>Supprimer</button>
                      </div>}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="transfer-empty"><span aria-hidden="true">◇</span><h3>Créez votre première sortie</h3><p>Ajoutez son nom, sa capacité, son tarif privé et ses heures de départ.</p>{isAdmin && <button type="button" className="transfer-add-button" onClick={startAdd}>＋ Ajouter une sortie</button>}</div>
              )}
            </section>
          )}

          {page === "transfers" && isAdmin && activeTab === "locations" && (
            <section className="transfer-catalog-section" aria-label="Custom transfer locations">
              <div className="transfer-catalog-intro transfer-catalog-intro--custom">
                <div><p className="transfer-eyebrow">Trajets sur mesure</p><h2>Départs & arrivées</h2><p>Choisissez les lieux disponibles dans chaque menu du formulaire de réservation.</p></div>
                <span aria-hidden="true">⌖</span>
              </div>
              <div className="transfer-location-columns">
                {([
                  { title: "Départs disponibles", icon: "↗", places: departureLocations, role: "departure" },
                  { title: "Arrivées disponibles", icon: "↙", places: arrivalLocations, role: "arrival" },
                ] as const).map((group) => (
                  <section className="transfer-location-panel" key={group.role}>
                    <header><span aria-hidden="true">{group.icon}</span><div><h3>{group.title}</h3><small>{group.places.length} lieux proposés</small></div></header>
                    {group.places.length ? (
                      <div className="transfer-location-list">
                        {group.places.map((location) => (
                          <article key={location.id} className={!location.isActive ? "is-inactive" : ""}>
                            <span className="transfer-location-pin" aria-hidden="true">⌖</span>
                            <div><strong>{location.name}</strong><small>{location.isActive ? "Visible dans le formulaire" : "Désactivé"}</small></div>
                            {isAdmin && <button type="button" aria-label={`Modifier ${location.name}`} onClick={() => editLocation(location)}>Éditer</button>}
                            {isAdmin && <button type="button" className="transfer-location-remove" aria-label={`Supprimer ${location.name}`} onClick={() => removeLocation(location)}>×</button>}
                          </article>
                        ))}
                      </div>
                    ) : <p className="transfer-location-empty">Aucun lieu ajouté pour le moment.</p>}
                  </section>
                ))}
              </div>
            </section>
          )}

          {addMode && (
            <div className="transfer-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}>
              <section className="transfer-editor-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-editor-title">
                <header className="transfer-editor-modal__heading">
                  <div>
                    <p className="transfer-eyebrow">{isEditing ? "Mettre à jour le catalogue" : "Ajouter au catalogue"}</p>
                    <h2 id="transfer-editor-title">
                      {addMode === "choose" ? "Que souhaitez-vous ajouter ?" :
                        addMode === "route" ? (editingRoute ? "Modifier un trajet" : "Nouveau trajet") :
                          addMode === "service" ? (editingService ? "Modifier une sortie" : "Nouvelle sortie privée") :
                            (editingLocation ? "Modifier un lieu" : "Nouveau lieu personnalisé")}
                    </h2>
                  </div>
                  <button type="button" aria-label="Fermer" onClick={closeEditor}>×</button>
                </header>

                {addMode === "choose" && (
                  <div className="transfer-add-choices">
                    {transferTabs.map((tab) => (
                      <button type="button" key={tab.id} onClick={() => setAddMode(tab.id === "routes" ? "route" : tab.id === "private" ? "service" : "location")}>
                        <span aria-hidden="true">{tab.icon}</span><strong>{tab.label}</strong><small>{tab.id === "routes" ? "Destination, tarif et remarques" : tab.id === "private" ? "Capacité, tarif et heures de départ" : "Gérer les lieux de départ et d’arrivée"}</small><i aria-hidden="true">→</i>
                      </button>
                    ))}
                  </div>
                )}

                {addMode === "route" && (
                  <form className="transfer-editor transfer-modal-form" onSubmit={submitRoute} key={`route-${editingRoute?.id ?? "new"}`}>
                    <div className="transfer-field-pair">
                      <label>Departure (English)<input name="from" defaultValue={editingRoute?.from ?? ""} placeholder="e.g. Agadir Airport" required maxLength={120} /></label>
                      <label>Départ (français)<input name="fromFr" defaultValue={editingRoute?.fromFr ?? ""} placeholder="Ex. Aéroport d’Agadir" required maxLength={120} /></label>
                      <label>Arrival (English)<input name="to" defaultValue={editingRoute?.to ?? ""} placeholder="e.g. Taghazout" required maxLength={120} /></label>
                      <label>Arrivée (français)<input name="toFr" defaultValue={editingRoute?.toFr ?? ""} placeholder="Ex. Taghazout" required maxLength={120} /></label>
                    </div>
                    <label>Prix du trajet (€)<input name="price" type="number" min="0" max="100000" step="0.5" defaultValue={editingRoute?.price ?? ""} placeholder="30" required /></label>
                    <div className="transfer-field-pair">
                      <label>Trip notes (English)<textarea name="notes" rows={3} maxLength={500} defaultValue={editingRoute?.notes ?? ""} /></label>
                      <label>Remarques (français)<textarea name="notesFr" rows={3} maxLength={500} defaultValue={editingRoute?.notesFr ?? ""} /></label>
                    </div>
                    <label className="transfer-checkbox"><input name="isActive" type="checkbox" defaultChecked={editingRoute?.isActive ?? true} /><span>Afficher ce trajet sur le site</span></label>
                    <div className="transfer-editor__actions"><button type="submit" disabled={busy}>{busy ? "Enregistrement…" : isEditing ? "Enregistrer les modifications" : "Ajouter le trajet"} <span aria-hidden="true">→</span></button><button type="button" className="transfer-cancel" onClick={closeEditor}>Annuler</button></div>
                  </form>
                )}

                {addMode === "service" && (
                  <form className="transfer-editor transfer-modal-form" onSubmit={submitService} key={`service-${editingService?.id ?? "new"}`}>
                    <div className="transfer-field-pair">
                      <label>Outing name (English)<input name="name" defaultValue={editingService?.name ?? ""} required maxLength={120} /></label>
                      <label>Nom de la sortie (français)<input name="nameFr" defaultValue={editingService?.nameFr ?? ""} placeholder="Ex. Excursion à Paradise Valley" required maxLength={120} /></label>
                    </div>
                    <div className="transfer-field-pair">
                      <label>Nombre maximum de personnes<input name="passengerLimit" type="number" min="1" max="100" defaultValue={editingService?.passengerLimit ?? 8} required /></label>
                      <label>Prix sortie privée (€)<input name="price" type="number" min="0" max="100000" step="0.5" defaultValue={editingService?.price ?? ""} placeholder="80" required /></label>
                    </div>
                    <div className="transfer-field-pair transfer-field-pair--start-times">
                      <label>Duration (English)<input name="duration" defaultValue={editingService?.duration ?? "Half day"} required maxLength={80} /></label>
                      <label>Durée (français)<input name="durationFr" defaultValue={editingService?.durationFr ?? "Demi-journée"} required maxLength={80} /></label>
                      <PrivateServiceStartTimes initialTimes={editingService?.startTimes ?? []} />
                    </div>
                    <input type="hidden" name="kind" value={editingService?.kind ?? "OUTING"} />
                    <div className="transfer-field-pair">
                      <label>Outing description (English)<textarea name="description" rows={3} maxLength={500} defaultValue={editingService?.description ?? ""} /></label>
                      <label>Description de la sortie (français)<textarea name="descriptionFr" rows={3} maxLength={500} defaultValue={editingService?.descriptionFr ?? ""} /></label>
                    </div>
                    <PrivateImageUpload initialImage={editingService?.image ?? ""} initialAlt={editingService?.imageAlt ?? ""} initialAltFr={editingService?.imageAltFr ?? ""} />
                    <label className="transfer-checkbox"><input name="isActive" type="checkbox" defaultChecked={editingService?.isActive ?? true} /><span>Afficher cette sortie sur le site</span></label>
                    <div className="transfer-editor__actions"><button type="submit" disabled={busy}>{busy ? "Enregistrement…" : isEditing ? "Enregistrer les modifications" : "Ajouter la sortie"} <span aria-hidden="true">→</span></button><button type="button" className="transfer-cancel" onClick={closeEditor}>Annuler</button></div>
                  </form>
                )}

                {addMode === "location" && (
                  <form className="transfer-editor transfer-modal-form" onSubmit={submitLocation} key={`location-${editingLocation?.id ?? "new"}`}>
                    <div className="transfer-field-pair">
                      <label>Location name (English)<input name="name" defaultValue={editingLocation?.name ?? ""} placeholder="e.g. Agadir Airport" required maxLength={120} /></label>
                      <label>Nom du lieu (français)<input name="nameFr" defaultValue={editingLocation?.nameFr ?? ""} placeholder="Ex. Aéroport d’Agadir" required maxLength={120} /></label>
                    </div>
                    <fieldset className="transfer-location-roles">
                      <legend>Afficher ce lieu dans les menus</legend>
                      <label className="transfer-checkbox"><input name="isDeparture" type="checkbox" defaultChecked={editingLocation?.isDeparture ?? true} /><span>Départ</span></label>
                      <label className="transfer-checkbox"><input name="isArrival" type="checkbox" defaultChecked={editingLocation?.isArrival ?? true} /><span>Arrivée</span></label>
                    </fieldset>
                    <label className="transfer-checkbox"><input name="isActive" type="checkbox" defaultChecked={editingLocation?.isActive ?? true} /><span>Activer ce lieu dans le formulaire</span></label>
                    <div className="transfer-editor__actions"><button type="submit" disabled={busy}>{busy ? "Enregistrement…" : isEditing ? "Enregistrer les modifications" : "Ajouter le lieu"} <span aria-hidden="true">→</span></button><button type="button" className="transfer-cancel" onClick={closeEditor}>Annuler</button></div>
                  </form>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
