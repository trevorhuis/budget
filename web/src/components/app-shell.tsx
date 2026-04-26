import {
  ArrowPathRoundedSquareIcon,
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/20/solid";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState, type ComponentType, type SVGProps } from "react";

import { useAuth } from "~/lib/auth";
import { Avatar } from "~/components/ui/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSection,
} from "~/components/ui/dropdown";
import {
  Navbar,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "~/components/ui/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "~/components/ui/sidebar";
import { StackedLayout } from "~/components/ui/stacked-layout";
import { Text } from "~/components/ui/text";

const isPrimaryTransactionsPath = (pathname: string) =>
  pathname === "/transactions" ||
  (pathname.startsWith("/transactions/") &&
    !pathname.startsWith("/transactions/bulk"));

type AppNavLink = {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title?: string;
  isCurrent: (pathname: string) => boolean;
};

const appNavLinks: AppNavLink[] = [
  {
    label: "Budget",
    to: "/budget",
    icon: BanknotesIcon,
    isCurrent: (pathname) => pathname === "/budget",
  },
  {
    label: "Transactions",
    to: "/transactions",
    icon: ArrowPathRoundedSquareIcon,
    isCurrent: isPrimaryTransactionsPath,
  },
  {
    label: "Import",
    to: "/transactions/bulk",
    icon: DocumentArrowUpIcon,
    title: "Upload, review, and import a CSV batch",
    isCurrent: (pathname) => pathname.startsWith("/transactions/bulk"),
  },
  {
    label: "Accounts",
    to: "/accounts",
    icon: CreditCardIcon,
    isCurrent: (pathname) => pathname === "/accounts",
  },
  {
    label: "Chat",
    to: "/chat",
    icon: ChatBubbleLeftRightIcon,
    isCurrent: (pathname) => pathname === "/chat",
  },
];

const getUserInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

export function AppShell() {
  const { signOut, user } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = user?.name?.trim() || user?.email || "Budget User";
  const initials = getUserInitials(displayName);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      window.location.assign("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <div className="flex items-center gap-3 rounded-lg p-2">
              <span className="rounded-md bg-zinc-950 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-zinc-950">
                Budget
              </span>
            </div>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection className="max-lg:hidden">
            {appNavLinks.map(({ icon: Icon, isCurrent, label, title, to }) => (
              <NavbarItem
                key={to}
                href={to}
                title={title}
                current={isCurrent(pathname)}
              >
                <Icon />
                <NavbarLabel>{label}</NavbarLabel>
              </NavbarItem>
            ))}
          </NavbarSection>
          <NavbarSection>
            <Dropdown>
              <DropdownButton
                as="button"
                aria-label={`Account menu for ${displayName}`}
                className="rounded-full border border-zinc-950/10 bg-white/85 p-0.5 shadow-sm transition hover:border-zinc-950/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/25"
              >
                <Avatar
                  className="size-9 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  initials={initials}
                  alt={displayName}
                  src={user?.image}
                />
              </DropdownButton>
              <DropdownMenu anchor="bottom end">
                <DropdownHeader>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    {displayName}
                  </div>
                  <Text>{user?.email}</Text>
                </DropdownHeader>
                <DropdownDivider />
                <DropdownSection>
                  <DropdownItem onClick={handleSignOut} disabled={isSigningOut}>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </DropdownLabel>
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="px-2 py-2">
              <div className="flex items-center rounded-lg p-2">
                <span className="rounded-md bg-zinc-950 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-zinc-950">
                  Budget
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection className="gap-1">
              {appNavLinks.map(({ icon: Icon, isCurrent, label, title, to }) => (
                <SidebarItem
                  key={to}
                  href={to}
                  title={title}
                  current={isCurrent(pathname)}
                >
                  <Icon />
                  <SidebarLabel>{label}</SidebarLabel>
                </SidebarItem>
              ))}
            </SidebarSection>
            <SidebarSpacer />
          </SidebarBody>
          <SidebarFooter>
            <div className="rounded-2xl border border-zinc-950/8 bg-zinc-950/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <Avatar
                  className="size-10 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  initials={initials}
                  alt={displayName}
                  src={user?.image}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                    {displayName}
                  </div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user?.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-950/10 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-950/5 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <ArrowRightStartOnRectangleIcon className="size-4" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Outlet />
    </StackedLayout>
  );
}
