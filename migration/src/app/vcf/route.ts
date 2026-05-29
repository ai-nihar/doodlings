import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const business = await prisma.business.findFirst({
      where: { is_active: true },
    });

    if (!business) {
      return new Response("Business not found", { status: 404 });
    }

    const contacts = await prisma.contacts.findMany({
      where: { business_id: business.id, is_active: true },
      orderBy: { display_order: "asc" },
    });

    const links = await prisma.links.findMany({
      where: { business_id: business.id, is_active: true },
      orderBy: { display_order: "asc" },
    });

    let photoLine = "";
    if (business.profile_image_url) {
      try {
        const response = await fetch(business.profile_image_url, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const b64 = Buffer.from(buffer).toString("base64");
          // Fold base64 to max 75 characters per line
          const foldedArr: string[] = [];
          for (let i = 0; i < b64.length; i += 75) {
            foldedArr.push(b64.slice(i, i + 75));
          }
          const folded = foldedArr.join("\r\n ");
          photoLine = `PHOTO;ENCODING=b;TYPE=JPEG:${folded}`;
        }
      } catch (err) {
        console.error("Error fetching or encoding profile image for VCF:", err);
      }
    }

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${business.name.trim()}`,
    ];

    if (business.tagline) {
      lines.push(`TITLE:${business.tagline.trim()}`);
    }

    if (photoLine) {
      lines.push(photoLine);
    }

    for (const c of contacts) {
      if (c.contact_type.toLowerCase() === "phone") {
        lines.push(`TEL;TYPE=${c.label.toUpperCase()}:${c.value.trim()}`);
      }
    }

    for (const c of contacts) {
      if (c.contact_type.toLowerCase() === "email") {
        lines.push(`EMAIL;TYPE=${c.label.toUpperCase()}:${c.value.trim()}`);
      }
    }

    if (business.address) {
      lines.push(`ADR;TYPE=WORK:;;${business.address.trim()}`);
    }

    if (business.about) {
      lines.push(`NOTE:${business.about.trim()}`);
    }

    for (const lnk of links) {
      lines.push(`URL;TYPE=${lnk.platform.toUpperCase()}:${lnk.url.trim()}`);
    }

    lines.push("END:VCARD");

    const vcfContent = lines.join("\r\n");

    const filename = `${business.name.trim()}.vcf`;

    return new Response(vcfContent, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("VCF download failed:", error);
    return new Response("Server error", { status: 503 });
  }
}
