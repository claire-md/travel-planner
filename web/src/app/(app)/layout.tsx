import type { PropsWithChildren } from "react";
import { SideNav } from "@/components/SideNav";

/** Wraps signed-in pages with the side navigation. */
const AppLayout = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-dvh flex-col lg:flex-row">
    <SideNav />
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

export default AppLayout;
