"use server";

import { sendContactFormNotification } from "./reservation-email";

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

export async function sendContactMessage(input: ContactMessageInput): Promise<ContactMessageResult> {
  try {
    if (typeof input !== "object" || input === null) throw new Error("Message details are invalid.");
    const trap = readField(input.companyFax, "Company fax", 200, false);
    if (trap) return { success: true, message: "Message sent." };

    const name = readField(input.name, "Name", 120);
    const email = readField(input.email, "Email", 254);
    const phone = readField(input.phone, "Phone", 60, false);
    const message = readField(input.message, "Message", 5000);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

    const delivered = await sendContactFormNotification({ name, email, phone, message });
    if (!delivered) return { success: false, message: "We couldn't send your message. Please try again later." };
    return { success: true, message: "Message accepted by email provider." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "We couldn't send your message. Please try again later.",
    };
  }
}