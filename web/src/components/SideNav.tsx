"use client";

import type { FC } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import {
  Globe01,
  Home01,
  LogOut01,
  Luggage01,
  Menu02,
  User01,
  XClose,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { LogoutButton } from "@/components/LogoutButton";
import { cx } from "@/utils/cx";

export interface NavItem {
  label: string;
  href: string;
  icon: FC<{ className?: string }>;
}

const defaultItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home01 },
  { label: "Trips", href: "/trips", icon: Luggage01 },
  { label: "Account", href: "/account", icon: User01 },
];

// A nested route such as `/trips/123` should keep its parent item highlighted.
const isItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

interface NavListProps {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}

const NavList = ({ items, pathname, onNavigate }: NavListProps) => (
  <nav aria-label="Main" className="flex-1">
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cx(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-md font-semibold outline-brand transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                active
                  ? "bg-active text-secondary_hover"
                  : "text-secondary hover:bg-primary_hover hover:text-secondary_hover",
              )}
            >
              <item.icon
                className={cx(
                  "size-5 shrink-0 transition-inherit-all",
                  active
                    ? "text-fg-brand-primary"
                    : "text-fg-quaternary group-hover:text-fg-quaternary_hover",
                )}
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);

const SideNavContent = ({ items, pathname, onNavigate }: NavListProps) => (
  <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6">
    <Link
      href="/"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg px-1 outline-brand focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-solid">
        <Globe01 className="size-5 text-white" />
      </span>
      <span className="truncate text-lg font-semibold text-primary">
        Travel Planner
      </span>
    </Link>

    <NavList items={items} pathname={pathname} onNavigate={onNavigate} />

    <div className="border-t border-secondary pt-4">
      <LogoutButton
        color="tertiary"
        size="md"
        iconLeading={LogOut01}
        noTextPadding
        className="w-full justify-start gap-3 px-3 text-md"
      />
    </div>
  </div>
);

interface SideNavProps {
  /** Navigation links to render. Defaults to Dashboard and Trips. */
  items?: NavItem[];
}

export const SideNav = ({ items = defaultItems }: SideNavProps) => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [renderedPathname, setRenderedPathname] = useState(pathname);

  // Navigating away closes the drawer, including via the browser's back button.
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setIsDrawerOpen(false);
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-70 shrink-0 border-r border-secondary bg-primary lg:block">
        <SideNavContent items={items} pathname={pathname} />
      </aside>

      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-secondary bg-primary px-4 py-3 lg:hidden">
        <Button
          color="tertiary"
          size="md"
          aria-label="Open navigation"
          iconLeading={Menu02}
          onClick={() => setIsDrawerOpen(true)}
          className="-ml-2"
        />
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid">
            <Globe01 className="size-4.5 text-white" />
          </span>
          <span className="text-md font-semibold text-primary">
            Travel Planner
          </span>
        </Link>
      </header>

      <ModalOverlay
        isDismissable
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        className="fixed inset-0 z-50 bg-overlay/70 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out lg:hidden"
      >
        <Modal className="h-full w-70 max-w-[85vw] entering:animate-in entering:slide-in-from-left exiting:animate-out exiting:slide-out-to-left">
          <Dialog
            aria-label="Navigation"
            className="relative h-full bg-primary shadow-xl outline-hidden"
          >
            {({ close }) => (
              <>
                <Button
                  color="tertiary"
                  size="sm"
                  aria-label="Close navigation"
                  iconLeading={XClose}
                  onClick={close}
                  className="absolute top-4 right-3 z-10"
                />
                <SideNavContent
                  items={items}
                  pathname={pathname}
                  onNavigate={close}
                />
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
};
