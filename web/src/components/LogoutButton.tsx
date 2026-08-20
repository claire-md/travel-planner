"use client";

import { useRouter } from "next/navigation";
import { Button } from "./base/buttons/button";
import callApi from "@/utils/callApi";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await callApi("/api/auth/logout", "POST", {}, "Failed to logout");
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
};
