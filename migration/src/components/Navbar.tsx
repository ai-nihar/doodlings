"use client";

import React, { useState } from "react";

interface NavbarProps {
  profileImageUrl: string | null;
  businessName: string;
}

export default function Navbar({ profileImageUrl, businessName }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-rexon-navy border-b-3 border-rexon-blue py-3.5 px-4 shadow-[0_2px_16px_rgba(26,45,79,0.25)]">
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          className="flex items-center gap-[0.6rem] font-bold text-[1rem] text-white hover:text-white/95 no-underline leading-[1.2] select-none"
        >
          {profileImageUrl && (
            <img
              src={profileImageUrl}
              alt={businessName}
              className="w-[40px] h-[40px] object-contain rounded-md bg-white p-[2px]"
            />
          )}
          <span>{businessName.trim()}</span>
        </a>

        {/* Toggler button for mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="lg:hidden text-white/80 hover:text-white border border-rexon-blue/50 rounded-lg p-2 focus:outline-none cursor-pointer flex items-center justify-center"
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="w-5 h-5 flex flex-col justify-between items-center relative">
            <span className={`block w-full h-[2px] bg-white rounded transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-[9px]" : ""}`} />
            <span className={`block w-full h-[2px] bg-white rounded transition-opacity duration-200 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`block w-full h-[2px] bg-white rounded transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-[9px]" : ""}`} />
          </span>
        </button>

        {/* Navbar Links */}
        <div
          id="navbarNav"
          className={`${
            isOpen ? "block" : "hidden"
          } w-full lg:flex lg:items-center lg:w-auto mt-2 lg:mt-0 transition-all duration-300 ease-in-out`}
        >
          <ul className="list-none m-0 p-0 flex flex-col lg:flex-row lg:items-center gap-1">
            <li className="nav-item">
              <a
                href="#inquiry"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 text-[0.9rem] font-medium text-white/75 hover:text-white hover:bg-rexon-blue/25 p-[0.45rem_0.85rem] rounded-full transition-all no-underline w-fit"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
                <span>Enquiry</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
