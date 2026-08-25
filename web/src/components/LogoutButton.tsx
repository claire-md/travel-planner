"use client";

import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "./base/buttons/button";
import callApi from "@/utils/callApi";

export const LogoutButton = ({
  children = "Logout",
  ...props
}: ButtonProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await callApi("/api/auth/logout", "POST", {}, "Failed to logout");
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button {...props} onClick={handleLogout}>
      {children}
    </Button>
  );
};
