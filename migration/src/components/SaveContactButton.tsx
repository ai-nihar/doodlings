"use client";

import React, { useState } from "react";

export default function SaveContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  const startDownload = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "/vcf?t=" + Date.now();
    document.body.appendChild(iframe);
    
    // Cleanup iframe after download starts
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 3000);
  };

  const handleClose = () => {
    setIsOpen(false);
    startDownload();
  };

  return (
    <>
      <div className="my-5">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-rexon-navy hover:bg-rexon-blue text-white font-bold text-[1rem] py-3.5 px-6 rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] hover:shadow-[0_8px_22px_rgba(0,133,212,0.3)] shadow-md"
        >
          <i className="fa-solid fa-address-card text-lg"></i>
          <span>Save Contact</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className="absolute inset-0 bg-[#081020]/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          />

          {/* Dialog Body */}
          <div className="relative bg-white border border-[#d8e4ee] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl z-10 transition-all transform animate-scale-up">
            {/* Header */}
            <div className="bg-[#e8f4fc] border-b border-[#d8e4ee] py-4 px-5 flex items-center justify-between">
              <h5 className="font-bold text-rexon-navy text-lg flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-rexon-blue"></i>
                <span>How To Save Contact</span>
              </h5>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-none outline-none cursor-pointer text-xl font-bold leading-none p-1"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <p className="text-slate-500 text-[0.95rem] mb-4">
                Close this popup to start downloading the contact card.
              </p>
              <ol className="list-decimal text-slate-600 text-[0.9rem] pl-5 space-y-2 mb-4">
                <li>Open the downloaded <strong className="text-rexon-navy">.vcf</strong> file.</li>
                <li>Tap <strong className="text-rexon-navy">Import</strong> or <strong className="text-rexon-navy">Add Contact</strong>.</li>
                <li>Choose save location if prompted (Phone / Google / iCloud).</li>
                <li>Details will be added to your address book.</li>
              </ol>
              <p className="text-slate-400 text-[0.82rem] leading-normal border-t border-[#d8e4ee] pt-3">
                If the file does not open directly, navigate to your Contacts app and select <strong>Import from .vcf file</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
