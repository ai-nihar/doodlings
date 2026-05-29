import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MOBILE_RE = /^[6-9]\d{9}$/;

function validateInquiry(name: string, mobile: string, message: string) {
  name = (name || "").trim();
  mobile = (mobile || "").trim().replace(/\s/g, "").replace(/-/g, "");
  message = (message || "").trim();

  if (!name) return { valid: false, error: "Name is required." };
  if (name.length < 2) return { valid: false, error: "Name must be at least 2 characters." };
  if (name.length > 255) return { valid: false, error: "Name is too long." };

  if (!mobile) return { valid: false, error: "Mobile number is required." };
  
  // Normalize mobile
  let clean = mobile;
  if (clean.startsWith("+91")) {
    clean = clean.slice(3);
  } else if (clean.startsWith("91") && clean.length === 12) {
    clean = clean.slice(2);
  } else if (clean.startsWith("0")) {
    clean = clean.slice(1);
  }

  if (!MOBILE_RE.test(clean)) {
    return { valid: false, error: "Enter a valid 10-digit Indian mobile number." };
  }

  if (!message) return { valid: false, error: "Message / query is required." };
  if (message.length < 10) return { valid: false, error: "Message must be at least 10 characters." };

  return { valid: true, error: "", cleanMobile: clean };
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const name = body.name || "";
    const mobile = body.mobile || "";
    const message = body.message || "";

    const { valid, error, cleanMobile } = validateInquiry(name, mobile, message);
    if (!valid || !cleanMobile) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // Retrieve active business for WhatsApp number
    const business = await prisma.business.findFirst({
      where: { is_active: true },
    });

    const rawWaNumber = business?.whatsapp_number || "";
    const waNumber = rawWaNumber.replace(/\+/g, "").replace(/\s/g, "");

    // Get real client IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // Save inquiry to DB
    await prisma.inquiries.create({
      data: {
        name: name.trim(),
        mobile: cleanMobile,
        message: message.trim(),
        ip_address: ip,
        submitted_at: new Date(),
      },
    });

    // Build WhatsApp deep-link
    const waText = `Hello Rexon Hydraulics,\n\nName: ${name.trim()}\nMobile: ${cleanMobile}\n\nQuery: ${message.trim()}`;
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    return NextResponse.json({ ok: true, wa_link: waLink }, { status: 200 });
  } catch (error: any) {
    console.error("Inquiry logging failed:", error);
    return NextResponse.json({ ok: false, error: "Server error. Please try again." }, { status: 500 });
  }
}
