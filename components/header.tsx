"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { copy } from "@/locale";
import { spacing } from "@/lib/spacing";

const brandLabel = copy.header.brand;
const catalogLabel = copy.header.nav.catalog;
const adminLabel = copy.header.nav.admin;

const NAV_ITEMS = [
  { href: "/", label: catalogLabel },
  { href: "/admin", label: adminLabel },
] as const;

const styles = {
  header: "border-b border-border bg-background",
  container: `mx-auto flex w-full max-w-5xl flex-col gap-3 px-${spacing.normal} py-${spacing.sm} sm:flex-row sm:items-center sm:justify-between`,
  brand: "text-base font-semibold tracking-tight",
  nav: "flex items-center gap-2",
  navLink: (isActive: boolean) =>
    cn(buttonVariants({ variant: isActive ? "secondary" : "ghost" })),
};

const renderNavItems = (pathname: string) => {
  return NAV_ITEMS.map((item) => {
    const isActive =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={styles.navLink(isActive)}
      >
        {item.label}
      </Link>
    );
  });
};

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <span className={styles.brand}>{brandLabel}</span>
        <nav className={styles.nav}>{renderNavItems(pathname)}</nav>
      </div>
    </header>
  );
};
