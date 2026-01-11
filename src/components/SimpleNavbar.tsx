"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, User, Settings, LogOut, Menu, X, ChevronDown, Layers, Mail, Link as LinkIcon, FileText, Globe, Scan, Lock } from "lucide-react";

export default function SimpleNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock page scroll when mobile menu is open (prevents iOS/Android scroll weirdness)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close menus on route change
  useEffect(() => {
    closeMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setFeaturesMenuOpen(false);
  };

  const securityTools = [
    { name: "Email Analyzer", path: "/email-analyzer", icon: Mail },
    { name: "URL Scanner", path: "/url-scanner", icon: LinkIcon },
    { name: "File Scanner", path: "/file-scanner", icon: FileText },
    { name: "Threat Analyzer", path: "/threat-analyzer", icon: Shield },
    { name: "URL Analyzer", path: "/url-analyzer", icon: Globe },
    { name: "Vulnerability Scanner", path: "/vulnerability-scanner", icon: Scan },
  ];

  return (
    <>
      <nav 
        className={`navbar transition-all duration-300 ${
          scrolled ? "bg-slate-950/90 shadow-md" : ""
        } pt-[env(safe-area-inset-top)]`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-2xl font-bold text-blue-400">
          <Shield className="h-6 w-6" />
          <span className="bg-gradient-to-r from-blue-400 to-sky-500 bg-clip-text text-transparent">NeuraSec</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <div className="relative">
                <button 
                  onClick={() => setFeaturesMenuOpen(!featuresMenuOpen)}
                  className={`flex items-center gap-1 relative ${
                    pathname === "/features" || pathname.includes("/email-analyzer") || 
                    pathname.includes("/url-scanner") || pathname.includes("/file-scanner") || 
                    pathname.includes("/threat-analyzer") || pathname.includes("/url-analyzer") || 
                    pathname.includes("/vulnerability-scanner") 
                      ? "text-blue-400" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Features
                  <ChevronDown className={`h-4 w-4 transition-transform ${featuresMenuOpen ? "rotate-180" : ""}`} />
                  {(pathname === "/features" || pathname.includes("/email-analyzer") || 
                    pathname.includes("/url-scanner") || pathname.includes("/file-scanner") || 
                    pathname.includes("/threat-analyzer") || pathname.includes("/url-analyzer") || 
                    pathname.includes("/vulnerability-scanner")) && (
                    <motion.div 
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
                <AnimatePresence>
                  {featuresMenuOpen && (
                    <motion.div 
                      className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-lg py-1 z-50"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        href="/features" 
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        onClick={closeMenus}
                      >
                        <Layers className="h-4 w-4" />
                        All Features
                      </Link>
                      <div className="border-t border-slate-800 my-1"></div>
                      {securityTools.map((tool, index) => (
                        <Link 
                          key={index}
                          href={tool.path} 
                          className={`flex items-center gap-2 px-4 py-2 ${
                            pathname === tool.path 
                              ? "bg-blue-500/10 text-blue-400" 
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                          onClick={closeMenus}
                        >
                          <tool.icon className="h-4 w-4" />
                          {tool.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link 
                href="/rewards" 
                className={`relative ${pathname === "/rewards" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                Rewards
                {pathname === "/rewards" && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
              <Link 
                href="/leaderboard" 
                className={`relative ${pathname === "/leaderboard" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                Leaderboard
                {pathname === "/leaderboard" && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
              <div className="relative">
                <button 
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer p-1 rounded-full hover:bg-slate-800/50"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="max-w-[100px] truncate">{user?.username || user?.email || "User"}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-lg py-1 z-50"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        onClick={closeMenus}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        onClick={closeMenus}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <div className="border-t border-slate-800 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/features" 
                className={`relative ${pathname === "/features" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                Features
                {pathname === "/features" && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
              <Link href="/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                Log in
              </Link>
              <Link 
                href="/register" 
                className="btn btn-primary flex items-center gap-1"
              >
                Sign up
                <Shield className="h-4 w-4 ml-1" />
              </Link>
            </>
          )}
        </div>

        <button 
          className={`md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 ${
            menuOpen ? "invisible" : ""
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
          aria-hidden={menuOpen}
          tabIndex={menuOpen ? -1 : 0}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      </nav>

      {/* Mobile overlay menu MUST be outside <nav> to avoid backdrop-filter containing block issues on iOS */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop */}
            <button
              aria-label="Close menu"
              className="absolute inset-0 w-full h-full bg-black/60"
              onClick={closeMenus}
              type="button"
            />

            {/* Drawer */}
            <motion.aside
              className="absolute left-0 top-0 h-[100svh] w-[86%] max-w-sm bg-slate-950 border-r border-slate-800 shadow-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-y-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-lg font-bold text-blue-400" onClick={closeMenus}>
                  <Shield className="h-5 w-5" />
                  <span className="bg-gradient-to-r from-blue-400 to-sky-500 bg-clip-text text-transparent">NeuraSec</span>
                </Link>
                <button
                  type="button"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                  onClick={closeMenus}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="w-full py-4 px-4 flex flex-col gap-5">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-200 font-medium truncate">{user?.username || user?.email || "User"}</span>
                      <span className="text-sm text-slate-500">Member</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-800 my-1"></div>
                  <div className="flex items-center justify-between text-slate-200 px-3">
                    <span className="font-medium">Security Tools</span>
                  </div>
                  {securityTools.map((tool, index) => (
                    <Link 
                      key={index}
                      href={tool.path} 
                      className={`flex items-center gap-2 p-3 rounded-lg ${
                        pathname === tool.path 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "text-slate-400 hover:bg-slate-900"
                      }`}
                      onClick={closeMenus}
                    >
                      <tool.icon className="h-5 w-5" />
                      {tool.name}
                    </Link>
                  ))}
                  <Link 
                    href="/features" 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      pathname === "/features" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                    onClick={closeMenus}
                  >
                    <Layers className="h-5 w-5" />
                    All Features
                  </Link>
                  <div className="border-t border-slate-800 my-1"></div>
                  <Link 
                    href="/rewards" 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      pathname === "/rewards" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                    onClick={closeMenus}
                  >
                    Rewards
                  </Link>
                  <Link 
                    href="/leaderboard" 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      pathname === "/leaderboard" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                    onClick={closeMenus}
                  >
                    Leaderboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      pathname === "/profile" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                    onClick={closeMenus}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <Link 
                    href="/scans" 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      pathname === "/scans" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                    onClick={closeMenus}
                  >
                    <Lock className="h-5 w-5" />
                    Scan History
                  </Link>
                  <Link 
                    href="/settings" 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      pathname === "/settings" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                    onClick={closeMenus}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                  <div className="border-t border-slate-800 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-3 text-left text-red-400 hover:bg-slate-900 rounded-lg"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/features" 
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      pathname === "/features" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                    onClick={closeMenus}
                  >
                    <Layers className="h-5 w-5" />
                    Features
                  </Link>
                  <div className="border-t border-slate-800 my-1"></div>
                  <Link 
                    href="/login" 
                    className="flex items-center gap-2 p-4 text-slate-400 hover:bg-slate-900 rounded-lg justify-center"
                    onClick={closeMenus}
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn btn-primary p-4 text-center flex items-center justify-center gap-2"
                    onClick={closeMenus}
                  >
                    Sign up
                    <Shield className="h-5 w-5" />
                  </Link>
                </>
              )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 