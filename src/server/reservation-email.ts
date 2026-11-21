import "server-only";

import nodemailer from "nodemailer";

type TransferReservationNotice = {
  id: string;
  serviceType: string;
  serviceName: string;
  departure: string;
  arrival: string;
  serviceDate: Date;
  serviceTime: string | null;
  passengerCount: number;
  luggageCount: number;
  hotelAddress: string | null;
  flightNumber: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  priceAtRequest: number | null;
  currency: string;
  createdAt: Date;
};

type ActivityReservationNotice = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  hotelAddress: string | null;
  notes: string | null;
  estimatedTotal: number;
  currency: string;
  priceNeedsConfirmation: boolean;
  createdAt: Date;
  lines: Array<{
    activityTitle: string;
    activityLocation: string;
    date: Date;
    time: string;
    rateLabel: string;
    rateUnit: string;
    ratePrice: number;
    adults: number;
    children: number;
    extras: Array<{ label: string }>;
    lineTotal: number;
  }>;
};

const ink = "#102a36";
const paper = "#f5fafc";
const signal = "#007ca3";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(value);
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function detailRows(rows: Array<[string, string]>) {
  return rows.map(([label, value]) => `
    <tr>
      <td style="padding:11px 14px;border-bottom:1px solid #e4dfd5;color:#68706d;font-size:13px;width:36%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #e4dfd5;color:${ink};font-size:14px;font-weight:600;white-space:pre-wrap;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`).join("");
}

function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const candidate = configuredUrl ?? vercelUrl ?? "https://mhtraveling.com";

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : "https://mhtraveling.com";
  } catch {
    return "https://mhtraveling.com";
  }
}

function emailLayout(
  title: string,
  subtitle: string,
  content: string,
  dashboardPath: string,
  eyebrow = "NEW RESERVATION",
  actionLabel = "Open reservation dashboard",
) {
  const dashboardUrl = `${getSiteUrl()}${dashboardPath}`;
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${paper};font-family:Arial,Helvetica,sans-serif;color:${ink};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${paper};">
      <tr><td align="center" style="padding:32px 14px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#fffefa;">
          <tr><td style="padding:22px 28px;background:${ink};border-bottom:5px solid ${signal};">
            <div style="font-size:12px;line-height:1.2;font-weight:700;letter-spacing:1.6px;color:#fff;">MH TRAVELLING</div>
            <div style="margin-top:8px;font-size:11px;line-height:1.4;color:#c9cbc7;">EVERY ARRIVAL, CONSIDERED.</div>
          </td></tr>
          <tr><td style="padding:32px 28px 12px;">
            <div style="font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.4px;color:${signal};">${escapeHtml(eyebrow)}</div>
            <h1 style="margin:8px 0 6px;font-size:26px;line-height:1.2;color:${ink};">${escapeHtml(title)}</h1>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#68706d;">${escapeHtml(subtitle)}</p>
          </td></tr>
          <tr><td style="padding:12px 28px 26px;">${content}</td></tr>
          <tr><td style="padding:22px 28px;background:#eeebe3;">
            <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:13px 18px;background:${signal};color:#fff;text-decoration:none;font-size:13px;font-weight:700;">${escapeHtml(actionLabel)}</a>
            <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#68706d;">MH Travelling · ${escapeHtml(eyebrow.toLowerCase())}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

async function deliverNotification(options: {
  kind: string;
  id: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string | null;
}): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const recipient = process.env.CONTACT_EMAIL || user;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE?.toLowerCase() === "true" ||
    (!process.env.SMTP_SECURE && port === 465);

  if (resendApiKey) {
    if (!resendFrom || !recipient) {
      console.error("Reservation email skipped: RESEND_FROM_EMAIL or CONTACT_EMAIL is missing.");
      return false;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [recipient],
          subject: options.subject.replace(/[\r\n]/g, " "),
          html: options.html,
          text: options.text,
          ...(options.replyTo ? { reply_to: options.replyTo } : {}),
        }),
      });

      if (!response.ok) {
        console.error(`Reservation email delivery failed for ${options.kind} ${options.id}.`, {
          code: "RESEND_API_ERROR",
          command: "POST /emails",
          responseCode: response.status,
        });
        return false;
      }
      return true;
    } catch (error) {
      const details = error instanceof Error
        ? error as Error & { code?: string }
        : null;
      console.error(`Reservation email delivery failed for ${options.kind} ${options.id}.`, {
        code: details?.code ?? "UNKNOWN",
        command: "POST /emails",
      });
      return false;
    }
  }

  if (!host || !user || !password || !recipient || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Reservation email skipped: SMTP settings are incomplete or invalid.");
    return false;
  }

  try {
    const delivery = await nodemailer.createTransport({
      host,
      port,
      secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: { user, pass: password },
    }).sendMail({
      from: `MH Travelling <${user}>`,
      to: recipient,
      replyTo: options.replyTo || undefined,
      subject: options.subject.replace(/[\r\n]/g, " "),
      text: options.text,
      html: options.html,
    });
    if (delivery.accepted.length === 0 || delivery.rejected.length > 0) {
      console.error(`Reservation email delivery failed for ${options.kind} ${options.id}.`, {
        code: "SMTP_RECIPIENT_REJECTED",
        acceptedCount: delivery.accepted.length,
        rejectedCount: delivery.rejected.length,
      });
      return false;
    }
    return true;
  } catch (error) {
    const details = error instanceof Error
      ? error as Error & { code?: string; command?: string; responseCode?: number }
      : null;
    console.error(`Reservation email delivery failed for ${options.kind} ${options.id}.`, {
      code: details?.code ?? "UNKNOWN",
      command: details?.command,
      responseCode: details?.responseCode,
    });
    return false;
  }
}

export async function sendContactFormNotification(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<boolean> {
  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone || "Not provided"],
    ["Message", input.message],
  ];
  const content = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e4dfd5;border-collapse:collapse;">${detailRows(rows)}</table>`;
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const safeName = input.name.replace(/[\r\n]/g, " ");

  return deliverNotification({
    kind: "contact",
    id: `website-${Date.now()}`,
    subject: `New website enquiry · ${safeName}`,
    html: emailLayout("New contact enquiry", "A visitor has sent a message from the website.", content, "/", "NEW WEBSITE MESSAGE", "Visit website"),
    text: `${text}\n\nVisit website: ${getSiteUrl()}`,
    replyTo: input.email,
  });
}

export async function sendTransferReservationNotification(request: TransferReservationNotice) {
  const serviceType = request.serviceType === "AIRPORT_ROUTE"
    ? "Airport route"
    : request.serviceType === "PRIVATE_SERVICE"
      ? "Private service"
      : "Custom transfer";
  const rows: Array<[string, string]> = [
    ["Reservation", `#${request.id.slice(-8).toUpperCase()}`],
    ["Service", `${serviceType} · ${request.serviceName}`],
    ["Route", `${request.departure} → ${request.arrival}`],
    ["Date and time", `${formatDate(request.serviceDate)} · ${request.serviceTime || "Not specified"}`],
    ["Passengers and luggage", `${request.passengerCount} passengers · ${request.luggageCount} bags`],
    ["Guest", request.customerName],
    ["Phone", request.customerPhone],
    ["Email", request.customerEmail || "Not provided"],
    ["Hotel / address", request.hotelAddress || "Not provided"],
    ["Flight number", request.flightNumber || "Not provided"],
    ["Price", request.priceAtRequest === null ? "To be confirmed" : formatCurrency(request.priceAtRequest, request.currency)],
    ["Guest notes", request.notes || "None"],
    ["Submitted", formatDate(request.createdAt)],
  ];
  const content = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e4dfd5;border-collapse:collapse;">${detailRows(rows)}</table>`;
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  await deliverNotification({
    kind: "transfer",
    id: request.id,
    subject: `New transfer reservation · ${request.customerName}`,
    html: emailLayout("New transfer request", "A guest has submitted a transfer reservation.", content, `/dashboard/requests/${request.id}`),
    text: `${text}\n\nOpen reservation dashboard: ${getSiteUrl()}/dashboard/requests/${request.id}`,
    replyTo: request.customerEmail,
  });
}

export async function sendActivityReservationNotification(reservation: ActivityReservationNotice) {
  const rows: Array<[string, string]> = [
    ["Reservation", `#${reservation.id.slice(-8).toUpperCase()}`],
    ["Guest", reservation.customerName],
    ["Phone", reservation.customerPhone],
    ["Email", reservation.customerEmail || "Not provided"],
    ["Hotel / pickup", reservation.hotelAddress || "Not provided"],
    ["Guest notes", reservation.notes || "None"],
    ["Submitted", formatDate(reservation.createdAt)],
  ];
  const activityLinesHtml = reservation.lines.map((line) => {
    const group = `${line.adults} adults${line.children ? ` · ${line.children} children` : ""}`;
    const extras = line.extras.map((extra) => extra.label).join(", ") || "None";
    return `<tr><td style="padding:14px;border-bottom:1px solid #e4dfd5;">
      <strong style="font-size:15px;color:${ink};">${escapeHtml(line.activityTitle)}</strong>
      <div style="margin-top:4px;font-size:12px;line-height:1.5;color:#68706d;">${escapeHtml(line.activityLocation)} · ${escapeHtml(formatDate(line.date))} · ${escapeHtml(line.time)}</div>
      <div style="margin-top:6px;font-size:12px;line-height:1.5;color:${ink};">${escapeHtml(line.rateLabel)} · ${escapeHtml(formatCurrency(line.ratePrice, reservation.currency))} ${escapeHtml(line.rateUnit)} · ${escapeHtml(group)}</div>
      <div style="margin-top:4px;font-size:12px;line-height:1.5;color:#68706d;">Extras: ${escapeHtml(extras)}</div>
      <div style="margin-top:8px;font-size:13px;font-weight:700;color:${ink};">${escapeHtml(formatCurrency(line.lineTotal, reservation.currency))}</div>
    </td></tr>`;
  }).join("");
  const priceLabel = reservation.priceNeedsConfirmation ? "Estimated total · to confirm" : "Estimated total";
  const content = `
    <h2 style="margin:0 0 10px;font-size:15px;color:${ink};">Activity details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e4dfd5;border-collapse:collapse;">${activityLinesHtml}</table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:12px 0 22px;background:${paper};"><tr><td style="padding:14px;font-size:13px;color:#68706d;">${escapeHtml(priceLabel)}</td><td align="right" style="padding:14px;font-size:16px;font-weight:700;color:${ink};">${escapeHtml(formatCurrency(reservation.estimatedTotal, reservation.currency))}</td></tr></table>
    <h2 style="margin:0 0 10px;font-size:15px;color:${ink};">Guest details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e4dfd5;border-collapse:collapse;">${detailRows(rows)}</table>`;
  const textLines = reservation.lines.map((line) => {
    const group = `${line.adults} adults${line.children ? `, ${line.children} children` : ""}`;
    const extras = line.extras.map((extra) => extra.label).join(", ") || "None";
    return `${line.activityTitle} · ${line.activityLocation}\n${formatDate(line.date)} · ${line.time} · ${line.rateLabel} · ${group}\nExtras: ${extras}\n${formatCurrency(line.lineTotal, reservation.currency)}`;
  });
  const text = ["Activity details", ...textLines, `${priceLabel}: ${formatCurrency(reservation.estimatedTotal, reservation.currency)}`, "", ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n");

  await deliverNotification({
    kind: "activity",
    id: reservation.id,
    subject: `New activity reservation · ${reservation.customerName}`,
    html: emailLayout("New activity request", "A guest has submitted an activity reservation.", content, `/dashboard/activity-reservations/${reservation.id}`),
    text: `${text}\n\nOpen reservation dashboard: ${getSiteUrl()}/dashboard/activity-reservations/${reservation.id}`,
    replyTo: reservation.customerEmail,
  });
}