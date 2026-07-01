"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

import type { UserRole } from "@/lib/types";
import { canManageLocationsAndAssets } from "@/lib/permissions";

type HeaderProps = {
  userName: string;
  userRole: UserRole;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assets", label: "Assets" },
];

export function Header({ userName, userRole }: HeaderProps) {
  const pathname = usePathname();
  const items = canManageLocationsAndAssets(userRole)
    ? [...navItems, { href: "/sites/manage", label: "Site Setup" }]
    : navItems;

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Asset Management System
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {userName}
          </p>
        </div>
        <SignOutButton />
      </div>
      <nav className="mt-6 flex gap-4 border-b border-gray-200">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
