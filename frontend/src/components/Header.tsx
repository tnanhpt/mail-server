import React from "react";
import logo from "@/assets/images/mail.png";

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/60 backdrop-blur-sm sticky top-0 z-40 border-b flex-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* left: logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              <img src={logo} className="max-w-full h-auto w-12" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold">GetFMail.com</span>
              <span className="text-xs text-gray-500 hidden sm:block">
                Free & Disposable
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
