"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur text-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Vape Shack Bulacan
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    {user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-full bg-[#10a37f] text-white text-sm font-medium hover:bg-[#1a7f64] transition-colors disabled:opacity-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            
             {/* Mobile Menu Button */}
             <button 
               className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
               onClick={() => setIsMenuOpen(!isMenuOpen)}
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
               </svg>
             </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
          {isMenuOpen && (
          <div className="md:hidden py-3 space-y-2 bg-white">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-700 font-medium border-b border-gray-100 mb-2">
                  {user.email}
                </div>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 rounded-full bg-[#10a37f] text-white text-sm font-medium hover:bg-[#1a7f64] transition-colors disabled:opacity-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-colors text-center"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-colors text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
