import React from "react";
import { prisma } from "@/lib/db";
import ProductGallery from "@/components/ProductGallery";
import SaveContactButton from "@/components/SaveContactButton";
import InquiryForm from "@/components/InquiryForm";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

const ICON_MAP: Record<string, string> = {
  website: "fa-solid fa-globe",
  instagram: "fa-brands fa-instagram",
  facebook: "fa-brands fa-facebook",
  twitter: "fa-brands fa-x-twitter",
  linkedin: "fa-brands fa-linkedin",
  youtube: "fa-brands fa-youtube",
  tiktok: "fa-brands fa-tiktok",
  whatsapp: "fa-brands fa-whatsapp",
  telegram: "fa-brands fa-telegram",
};

function getYoutubeEmbedUrl(url: string) {
  const v = url.trim();
  if (v.includes("youtube.com") || v.includes("youtu.be")) {
    let vidId = "";
    if (v.includes("youtu.be/")) {
      vidId = v.split("youtu.be/")[1].split("?")[0];
    } else if (v.includes("v=")) {
      vidId = v.split("v=")[1].split("&")[0];
    }
    return `https://www.youtube.com/embed/${vidId}?autoplay=1&mute=1&loop=1&playlist=${vidId}&controls=1&rel=0&playsinline=1`;
  }
  return null;
}

export default async function HomePage() {
  // Query business details in a single connection checkout
  const business = await prisma.business.findFirst({
    where: { is_active: true },
  });

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] p-4 text-center">
        <div className="bg-white border border-[#d8e4ee] rounded-2xl p-8 max-w-md shadow-lg">
          <i className="fa-solid fa-circle-exclamation text-red-500 text-5xl mb-4"></i>
          <h2 className="text-2xl font-bold text-rexon-navy mb-2">Service Unavailable</h2>
          <p className="text-slate-500 mb-0">No active business record found in the database.</p>
        </div>
      </div>
    );
  }

  const contacts = await prisma.contacts.findMany({
    where: { business_id: business.id, is_active: true },
    orderBy: { display_order: "asc" },
  });

  const links = await prisma.links.findMany({
    where: { business_id: business.id, is_active: true },
    orderBy: { display_order: "asc" },
  });

  const gallery = await prisma.gallery_images.findMany({
    where: { business_id: business.id, is_active: true },
    orderBy: { display_order: "asc" },
  });

  const youtubeEmbedUrl = business.video_url ? getYoutubeEmbedUrl(business.video_url) : null;

  return (
    <>
      {/* Navbar */}
      <Navbar profileImageUrl={business.profile_image_url} businessName={business.name} />

      {/* Page Shell */}
      <div className="pt-24 pb-12 w-full z-10 relative">
        <div className="max-w-[580px] mx-auto px-4">
          <div className="bg-white border border-[#d8e4ee] rounded-[20px] shadow-[0_16px_48px_rgba(26,45,79,0.14)] overflow-hidden relative before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-[5px] before:bg-gradient-to-r before:from-rexon-navy before:via-rexon-blue before:to-[#00aaff]">
            <div className="p-8 md:p-6 pb-6">
              
              {/* Profile section */}
              <div className="text-center">
                {business.profile_image_url ? (
                  <img
                    src={business.profile_image_url}
                    alt={business.name}
                    className="w-[110px] h-[110px] rounded-full object-contain bg-white p-1.5 border-3 border-rexon-blue shadow-[0_6px_20px_rgba(0,133,212,0.2)] mx-auto mb-4"
                  />
                ) : (
                  <div className="w-[110px] h-[110px] rounded-full bg-rexon-blue-light border-3 border-rexon-blue flex items-center justify-center text-rexon-blue text-4xl mx-auto mb-4">
                    <i className="fa-solid fa-industry"></i>
                  </div>
                )}

                <h1 className="text-xl md:text-2xl lg:text-[1.65rem] font-extrabold text-rexon-navy tracking-wide mb-1 leading-normal">
                  {business.name.trim()}
                </h1>
                
                {business.tagline && (
                  <p className="text-slate-500 text-[0.93rem] leading-relaxed max-w-[38ch] mx-auto mb-4">
                    {business.tagline.trim()}
                  </p>
                )}
              </div>

              <hr className="border-t border-[#d8e4ee] my-5" />

              {/* Contact numbers */}
              {contacts.length > 0 && (
                <div className="grid gap-2.5">
                  {contacts.map((c) => {
                    const isPhone = c.contact_type.toLowerCase() === "phone";
                    return (
                      <a
                        key={c.id}
                        href={isPhone ? `tel:${c.value.trim()}` : `mailto:${c.value.trim()}`}
                        className={`min-h-[48px] rounded-lg font-semibold text-[0.95rem] py-3 px-4 flex items-center justify-center gap-2 transition-all no-underline cursor-pointer select-none active:scale-[0.98] ${
                          isPhone
                            ? "bg-rexon-blue hover:bg-rexon-blue-dark text-white hover:shadow-[0_6px_18px_rgba(0,133,212,0.2)]"
                            : "bg-transparent border border-rexon-blue text-rexon-blue hover:bg-rexon-blue hover:text-white"
                        }`}
                      >
                        <i className={`fa-solid ${isPhone ? "fa-phone" : "fa-envelope"} text-sm`}></i>
                        <span>{c.label.trim()}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Social and Footprints Link matrices */}
              {links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2.5 mt-4">
                  {links.map((l) => (
                    <a
                      key={l.id}
                      href={l.url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[46px] h-[46px] rounded-lg border border-[#d8e4ee] bg-[#f4f7fa] text-slate-500 flex items-center justify-center text-[1.05rem] transition-all hover:bg-rexon-blue hover:border-rexon-blue hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(0,133,212,0.28)]"
                      aria-label={l.platform.trim()}
                    >
                      <i className={ICON_MAP[l.platform.toLowerCase()] || "fa-solid fa-link"}></i>
                    </a>
                  ))}
                </div>
              )}

              {/* Address Map Link */}
              {business.address && (
                <div className="text-center mt-5">
                  <a
                    href={business.map_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 text-slate-500 hover:text-rexon-blue text-[0.88rem] no-underline leading-relaxed border-b border-dashed border-[#d8e4ee] hover:border-rexon-blue pb-0.5 transition-all text-center max-w-[85%]"
                  >
                    <i className="fa-solid fa-location-dot text-rexon-blue mt-1 shrink-0"></i>
                    <span>{business.address.trim()}</span>
                  </a>
                </div>
              )}

              <hr className="border-t border-[#d8e4ee] my-5" />

              {/* Autoplay Loop Visualizer Video */}
              {business.video_url && (
                <div className="my-5 p-[1.15rem_1.2rem] bg-[#f4f7fa] border border-[#d8e4ee] rounded-[14px]">
                  <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-rexon-blue mb-[0.85rem] flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-play text-sm"></i>About Us
                  </p>
                  <div className="rounded-xl overflow-hidden border border-[#d8e4ee] shadow-[0_4px_14px_rgba(26,45,79,0.08)] bg-black">
                    {youtubeEmbedUrl ? (
                      <iframe
                        src={youtubeEmbedUrl}
                        title="Rexon Hydraulics Video"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="w-full aspect-[16/10] border-none block"
                      />
                    ) : (
                      <video
                        autoPlay
                        muted
                        loop
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full aspect-[16/10] border-none block"
                      >
                        <source src={business.video_url.trim()} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* About description */}
              {business.about && (
                <div className="my-5 p-[1.15rem_1.2rem] bg-[#f4f7fa] border border-[#d8e4ee] rounded-[14px]">
                  <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-rexon-blue mb-[0.85rem] flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-info text-sm"></i>About Us
                  </p>
                  <p className="text-[0.93rem] text-slate-500 leading-[1.75] mb-0 whitespace-pre-line">
                    {business.about.trim()}
                  </p>
                </div>
              )}

              {/* Products Gallery Slider */}
              {gallery.length > 0 && (
                <div className="my-5">
                  <ProductGallery gallery={gallery} businessName={business.name} />
                </div>
              )}

              <hr className="border-t border-[#d8e4ee] my-5" />

              {/* Save VCard Module */}
              <SaveContactButton />

              <hr className="border-t border-[#d8e4ee] my-5" />

              {/* Inquiry capturing Form */}
              <div id="inquiry" className="scroll-mt-20">
                <InquiryForm />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
