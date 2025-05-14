"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gérer les clics en dehors du dropdown pour le fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: "Accueil", href: "/" },
    {
      label: "Articles",
      href: "#",
      dropdown: [
        { label: "Bijoux", href: "/categories/bijoux" },
        { label: "Minis", href: "/categories/minis" },
        { label: "Halloween", href: "/categories/halloween" },
        { label: "Pokémon", href: "/categories/pokemon" },
        { label: "Divers", href: "/categories/divers" },
      ],
    },
    { label: "Galerie", href: "/galerie" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-gray-900"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src="/images/creations/creasoka_logo.webp"
                  alt="Crea'Soka Logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold text-creasoka">Crea'Soka</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="relative" ref={dropdownRef}>
                  <button
                    className={cn(
                      "flex items-center text-base font-medium transition-colors relative px-2 py-1 rounded-md",
                      pathname.includes(item.href)
                        ? "text-creasoka"
                        : "text-gray-700 dark:text-gray-300 hover:text-creasoka dark:hover:text-creasoka"
                    )}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "ml-1 h-4 w-4 transition-transform duration-200",
                        isDropdownOpen ? "rotate-180" : ""
                      )}
                    />

                    {/* Underline animation */}
                    <motion.span
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-creasoka"
                      initial={{ width: "0%" }}
                      animate={{
                        width: pathname.includes(item.href) ? "100%" : "0%",
                      }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>

                  {/* Dropdown menu avec correction */}
                  <div
                    className={cn(
                      "absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 z-[100]",
                      isDropdownOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 -translate-y-2 invisible"
                    )}
                  >
                    <div className="py-1">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors",
                            pathname === dropdownItem.href
                              ? "text-creasoka bg-gray-100 dark:bg-gray-700"
                              : "text-gray-700 dark:text-gray-300 hover:text-creasoka hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-base font-medium transition-colors relative px-2 py-1 rounded-md",
                    pathname === item.href
                      ? "text-creasoka"
                      : "text-gray-700 dark:text-gray-300 hover:text-creasoka dark:hover:text-creasoka"
                  )}
                >
                  {item.label}

                  {/* Underline animation */}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-creasoka"
                    initial={{ width: "0%" }}
                    animate={{ width: pathname === item.href ? "100%" : "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-10 h-10 flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-white dark:bg-gray-900 md:hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={closeMenu}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src="/images/creations/creasoka_logo.webp"
                    alt="Crea'Soka Logo"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-creasoka">
                  Crea'Soka
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white w-10 h-10 flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Fermer le menu</span>
                </Button>
              </div>
            </div>

            <nav className="flex flex-col space-y-6 pb-8">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.label} className="space-y-4">
                    <div className="font-medium text-lg flex items-center text-gray-800 dark:text-white">
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </div>
                    <div className="pl-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-600">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          className={cn(
                            "block py-1 text-gray-600 dark:text-gray-300 hover:text-creasoka dark:hover:text-creasoka transition-colors",
                            pathname === dropdownItem.href
                              ? "text-creasoka font-medium"
                              : ""
                          )}
                          onClick={closeMenu}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "font-medium text-lg py-1",
                      pathname === item.href
                        ? "text-creasoka"
                        : "text-gray-800 dark:text-white hover:text-creasoka dark:hover:text-creasoka transition-colors"
                    )}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
