"use server";

import nodemailer from "nodemailer";

export type ContactMessageInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
  companyFax: string;
};

export type ContactMessageResult = {
  success: boolean;
  message: string;
};

function readField(value: unknown, label: string, maximum: number, required = true) {
  if (typeof value !== "string") throw new Error(`${label} is invalid.`);
  const result = value.trim();
  if (required && !result) throw new Error(`${label} is required.`);
  if (result.length > maximum) throw new Error(`${label} is too long.`);
  return result;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function sendContactMessage(input: ContactMessageInput): Promise<ContactMessageResult> {
  let stage: "validation" | "smtp_send" = "validation";
  try {
    if (typeof input !== "object" || input === null) throw new Error("Message details are invalid.");
    const trap = readField(input.companyFax, "Company fax", 200, false);
    if (trap) return { success: true, message: "Message sent." };

    const name = readField(input.name, "Name", 120);
    const email = readField(input.email, "Email", 254);
    const phone = readField(input.phone, "Phone", 60, false);
    const message = readField(input.message, "Message", 5000);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

    const host = process.env.SMTP_HOST;
    const port = Number.parseInt(process.env.SMTP_PORT ?? "", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const destination = process.env.CONTACT_EMAIL;
    if (!host || !Number.isInteger(port) || !smtpUser || !smtpPassword || !destination) {
      throw new Error("The contact form is not configured. Please try again later.");
    }

    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPassword },
    });
    const safeName = name.replace(/[\r\n]/g, " ");
    const phoneLine = phone ? `\nPhone: ${phone}` : "";
    stage = "smtp_send";
    const delivery = await transporter.sendMail({
      from: `Mh Traveling Website <${smtpUser}>`,
      to: destination,
      replyTo: email,
      subject: `New website enquiry from ${safeName}`,
      text: `Name: ${name}\nEmail: ${email}${phoneLine}\n\nMessage:\n${message}`,
      html: `<h2>New website enquiry</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p>${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}<p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
    if (delivery.accepted.length === 0 || delivery.rejected.length > 0) {
      console.error("Contact form delivery failed.", {
        stage: "recipient_rejected",
        acceptedCount: delivery.accepted.length,
        rejectedCount: delivery.rejected.length,
      });
      return { success: false, message: "We couldn't send your message. Please try again later." };
    }
    return { success: true, message: "Message accepted by email provider." };
  } catch (error) {
    if (stage === "smtp_send") {
      const mailError = typeof error === "object" && error !== null
        ? error as { code?: unknown; responseCode?: unknown; command?: unknown }
        : {};
      const safeString = (value: unknown) => typeof value === "string"
        ? value.replace(/[^a-z0-9 _-]/gi, "").slice(0, 40)
        : undefined;
      console.error("Contact form delivery failed.", {
        stage,
        code: safeString(mailError.code),
        responseCode: typeof mailError.responseCode === "number" ? mailError.responseCode : undefined,
        command: safeString(mailError.command),
      });
    }
    return {
      success: false,
      message: stage === "validation" && error instanceof Error
        ? error.message
        : "We couldn't send your message. Please try again later.",
    };
  }
}