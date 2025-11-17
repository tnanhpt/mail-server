import React, { useState } from "react";

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/60 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* left: logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">📧</span>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold">Temp Mail</span>
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
