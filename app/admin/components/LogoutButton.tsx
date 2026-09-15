"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { copy } from "@/locale";
import { ROUTES } from "@/constants";
import { logout } from "@/api/auth/logout";

const logoutLabel = copy.admin.logout;

const styles = {
  button: "cursor-pointer",
};

export const LogoutButton = () => {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === ROUTES.LOGIN) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={styles.button}
      onClick={handleLogout}
    >
      {logoutLabel}
    </Button>
  );
};
