"use client";

import React, { useState } from "react";

export default function InquiryForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  const clearErrors = () => {
    setNameError("");
    setMobileError("");
    setMessageError("");
    setStatus({ type: null, text: "" });
  };

  const validateField = (field: "name" | "mobile" | "message", val: string) => {
    const v = val.trim();
    if (field === "name") {
      if (v.length > 0 && v.length < 2) {
        setNameError("Name must be at least 2 characters.");
      } else {
        setNameError("");
      }
    } else if (field === "mobile") {
      let m = v.replace(/\s/g, "").replace(/-/g, "");
      if (m.startsWith("+91")) m = m.slice(3);
      else if (m.startsWith("91") && m.length === 12) m = m.slice(2);
      else if (m.startsWith("0")) m = m.slice(1);

      if (m.length > 0 && !/^[6-9]\d{9}$/.test(m)) {
        setMobileError("Enter a valid 10-digit Indian mobile number.");
      } else {
        setMobileError("");
      }
    } else if (field === "message") {
      if (v.length > 0 && v.length < 10) {
        setMessageError("Message must be at least 10 characters.");
      } else {
        setMessageError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const n = name.trim();
    const mRaw = mobile.trim();
    const msg = message.trim();

    let hasError = false;

    if (!n) {
      setNameError("Name is required.");
      hasError = true;
    } else if (n.length < 2) {
      setNameError("Name must be at least 2 characters.");
      hasError = true;
    }

    let mNormalized = mRaw.replace(/\s/g, "").replace(/-/g, "");
    if (mNormalized.startsWith("+91")) mNormalized = mNormalized.slice(3);
    else if (mNormalized.startsWith("91") && mNormalized.length === 12) mNormalized = mNormalized.slice(2);
    else if (mNormalized.startsWith("0")) mNormalized = mNormalized.slice(1);

    if (!mRaw) {
      setMobileError("Mobile number is required.");
      hasError = true;
    } else if (!/^[6-9]\d{9}$/.test(mNormalized)) {
      setMobileError("Enter a valid 10-digit Indian mobile number.");
      hasError = true;
    }

    if (!msg) {
      setMessageError("Message / query is required.");
      hasError = true;
    } else if (msg.length < 10) {
      setMessageError("Message must be at least 10 characters.");
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, mobile: mRaw, message: msg }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // Open WhatsApp in a new tab
        window.open(data.wa_link, "_blank");

        setStatus({
          type: "success",
          text: "Enquiry sent! WhatsApp has been opened for you.",
        });

        // Reset form
        setName("");
        setMobile("");
        setMessage("");
      } else {
        setStatus({
          type: "error",
          text: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-[1.15rem_1.2rem] bg-[#f4f7fa] border border-[#d8e4ee] rounded-[14px]">
      <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-rexon-blue mb-[0.85rem] flex items-center gap-1.5">
        <i className="fa-brands fa-whatsapp text-sm"></i>Send Enquiry via WhatsApp
      </p>

      <div className="grid gap-3.5">
        {/* Name */}
        <div>
          <label htmlFor="inq-name" className="block text-slate-700 text-[0.85rem] font-semibold mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="inq-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            onBlur={() => validateField("name", name)}
            className={`w-full bg-white border rounded-lg text-[0.95rem] py-2 px-3.5 transition-all outline-none ${
              nameError
                ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-[#d8e4ee] focus:border-rexon-blue focus:ring-4 focus:ring-rexon-blue/10"
            }`}
            placeholder="Enter your name"
            maxLength={255}
            autoComplete="name"
          />
          {nameError && <div className="text-red-500 text-[0.82rem] mt-1">{nameError}</div>}
        </div>

        {/* Mobile */}
        <div>
          <label htmlFor="inq-mobile" className="block text-slate-700 text-[0.85rem] font-semibold mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            id="inq-mobile"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value.replace(/[^\d+]/g, ""));
              setMobileError("");
            }}
            onBlur={() => validateField("mobile", mobile)}
            className={`w-full bg-white border rounded-lg text-[0.95rem] py-2 px-3.5 transition-all outline-none ${
              mobileError
                ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-[#d8e4ee] focus:border-rexon-blue focus:ring-4 focus:ring-rexon-blue/10"
            }`}
            placeholder="Enter 10-digit Indian mobile number"
            maxLength={13}
            autoComplete="tel"
            inputMode="numeric"
          />
          {mobileError && <div className="text-red-500 text-[0.82rem] mt-1">{mobileError}</div>}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="inq-message" className="block text-slate-700 text-[0.85rem] font-semibold mb-1">
            Message / Query *
          </label>
          <textarea
            id="inq-message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setMessageError("");
            }}
            onBlur={() => validateField("message", message)}
            className={`w-full bg-white border rounded-lg text-[0.95rem] py-2 px-3.5 transition-all outline-none resize-none ${
              messageError
                ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-[#d8e4ee] focus:border-rexon-blue focus:ring-4 focus:ring-rexon-blue/10"
            }`}
            rows={4}
            placeholder="Describe your requirement..."
            maxLength={1000}
          />
          {messageError && <div className="text-red-500 text-[0.82rem] mt-1">{messageError}</div>}
          <div className="text-[0.76rem] text-slate-400 text-right mt-1">
            <span>{message.length}</span> / 1000
          </div>
        </div>

        {/* Status notification */}
        {status.type && (
          <div
            className={`text-[0.88rem] py-2.5 px-3.5 border rounded-lg animate-fade-in ${
              status.type === "success"
                ? "bg-[#e8f8f0] border-[#a8e0bf] text-[#1a7a45]"
                : "bg-[#fdf0f0] border-[#f0b8b8] text-[#c0392b]"
            }`}
          >
            {status.text}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1fba56] text-white font-bold py-3 px-5 rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none hover:shadow-[0_8px_22px_rgba(37,211,102,0.3)] shadow-md"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <i className="fa-brands fa-whatsapp text-lg"></i>
              <span>Send via WhatsApp</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
