'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { copy } from '@/locale';
import { spacing } from '@/lib/spacing';
import { ROUTES } from '@/constants';
import { LogoutButton } from '@/app/admin/components/LogoutButton';

const brandLabel = copy.header.brand;
const catalogLabel = copy.header.nav.catalog;
const adminLabel = copy.header.nav.admin;

const styles = {
  header: 'border-b border-border bg-background mb-5',
  container: `mx-auto flex w-full max-w-5xl flex-col gap-3 px-${spacing.normal} py-${spacing.sm} sm:flex-row sm:items-center sm:justify-between`,
  brand: 'text-base font-semibold tracking-tight',
  nav: 'flex items-center gap-2',
  navLink: (isActive: boolean) =>
    cn(buttonVariants({ variant: isActive ? 'secondary' : 'ghost' })),
};

export const Header = () => {
  const pathname = usePathname();
  const isCatalogActive = pathname === '/';
  const isAdminSection = pathname.startsWith('/admin');

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <span className={styles.brand}>{brandLabel}</span>
        <nav className={styles.nav}>
          <Link
            href='/'
            aria-current={isCatalogActive ? 'page' : undefined}
            className={styles.navLink(isCatalogActive)}
          >
            {catalogLabel}
          </Link>
          {isAdminSection ? (
            <LogoutButton />
          ) : (
            <Link href={ROUTES.ADMIN_HOME} className={styles.navLink(false)}>
              {adminLabel}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
