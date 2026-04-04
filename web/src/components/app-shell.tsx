import {
  ArrowPathRoundedSquareIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DocumentArrowUpIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "~/lib/auth";
import { Avatar } from "~/components/ui/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDescription,
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
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "~/components/ui/sidebar";
import { StackedLayout } from "~/components/ui/stacked-layout";
import { Text } from "~/components/ui/text";

const navItems = [
  {
    label: "Budget",
    to: "/budget",
    icon: BanknotesIcon,
  },
  {
    label: "Accounts",
    to: "/accounts",
    icon: CreditCardIcon,
  },
  {
    label: "Chat",
    to: "/chat",
    icon: ChatBubbleLeftRightIcon,
  },
] as const;

const transactionNavItems = [
  {
    label: "Primary",
    description: "Create and review individual transactions.",
    to: "/transactions",
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    label: "Bulk",
    description: "Upload, review, and import a CSV batch.",
    to: "/transactions/bulk",
    icon: DocumentArrowUpIcon,
  },
] as const;

const calculatorNavItems = [
  {
    label: "Mortgage",
    description: "PITI, amortization, and a simple adjustable-rate model.",
    to: "/calculators/mortgage",
    icon: BanknotesIcon,
  },
  {
    label: "Loan",
    description: "APR with fees, payoff schedule, and payment summary.",
    to: "/calculators/loan",
    icon: CreditCardIcon,
  },
  {
    label: "Debt Payoff",
    description: "Payoff date, interest saved, and the accelerator effect.",
    to: "/calculators/debt-payoff",
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    label: "Saved Scenarios",
    description: "Review saved sessions, duplicate them, and branch ideas.",
    to: "/calculators",
    icon: Squares2X2Icon,
  },
  {
    label: "Compare",
    description: "Put two saved scenarios side by side.",
    to: "/calculators/compare",
    icon: ArrowsRightLeftIcon,
  },
] as const;

const isTransactionPath = (pathname: string) =>
  pathname === "/transactions" || pathname.startsWith("/transactions/");

const isCalculatorPath = (pathname: string) =>
  pathname === "/calculators" || pathname.startsWith("/calculators/");

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
            {navItems.slice(0, 1).map(({ icon: Icon, label, to }) => (
              <NavbarItem key={to} href={to} current={pathname === to}>
                <Icon />
                <NavbarLabel>{label}</NavbarLabel>
              </NavbarItem>
            ))}
            <div className="flex items-center gap-1">
              <NavbarItem
                href="/transactions"
                current={isTransactionPath(pathname)}
              >
                <ArrowPathRoundedSquareIcon />
                <NavbarLabel>Transactions</NavbarLabel>
              </NavbarItem>
              <Dropdown>
                <DropdownButton
                  as={NavbarItem}
                  aria-label="Open transactions navigation"
                >
                  <ChevronDownIcon />
                </DropdownButton>
                <DropdownMenu anchor="bottom end">
                  <DropdownSection>
                    {transactionNavItems.map(
                      ({ description, icon: Icon, label, to }) => (
                        <DropdownItem key={to} href={to}>
                          <Icon />
                          <DropdownLabel>{label}</DropdownLabel>
                          <DropdownDescription>
                            {description}
                          </DropdownDescription>
                        </DropdownItem>
                      ),
                    )}
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </div>
            {navItems.slice(1).map(({ icon: Icon, label, to }) => (
              <NavbarItem key={to} href={to} current={pathname === to}>
                <Icon />
                <NavbarLabel>{label}</NavbarLabel>
              </NavbarItem>
            ))}
            <div className="flex items-center gap-1">
              <NavbarItem
                href="/calculators"
                current={isCalculatorPath(pathname)}
              >
                <Squares2X2Icon />
                <NavbarLabel>Calculators</NavbarLabel>
              </NavbarItem>
              <Dropdown>
                <DropdownButton
                  as={NavbarItem}
                  aria-label="Open calculators navigation"
                >
                  <ChevronDownIcon />
                </DropdownButton>
                <DropdownMenu anchor="bottom end">
                  <DropdownSection>
                    {calculatorNavItems.map(
                      ({ description, icon: Icon, label, to }) => (
                        <DropdownItem key={to} href={to}>
                          <Icon />
                          <DropdownLabel>{label}</DropdownLabel>
                          <DropdownDescription>
                            {description}
                          </DropdownDescription>
                        </DropdownItem>
                      ),
                    )}
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </div>
          </NavbarSection>
          <NavbarSection>
            <Dropdown>
              <DropdownButton
                as="button"
                aria-label="Open account menu"
                className="flex items-center gap-3 rounded-full border border-zinc-950/10 bg-white/85 px-2 py-1.5 shadow-sm transition hover:border-zinc-950/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
              >
                <Avatar
                  className="size-9 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  initials={initials}
                  alt={displayName}
                  src={user?.image}
                />
                <div className="hidden text-left lg:block">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    {displayName}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user?.email}
                  </div>
                </div>
                <ChevronDownIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
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
                    <DropdownDescription>
                      End this session and return to the login screen.
                    </DropdownDescription>
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
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Budget
              </div>
            </div>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              {navItems.slice(0, 1).map(({ icon: Icon, label, to }) => (
                <SidebarItem key={to} href={to} current={pathname === to}>
                  <Icon />
                  <SidebarLabel>{label}</SidebarLabel>
                </SidebarItem>
              ))}
              <div className="space-y-1 pt-2">
                <SidebarHeading>Transactions</SidebarHeading>
                <div className="ml-2 space-y-0.5 border-l border-zinc-950/8 pl-2 dark:border-white/10">
                  {transactionNavItems.map(({ icon: Icon, label, to }) => (
                    <SidebarItem key={to} href={to} current={pathname === to}>
                      <Icon />
                      <SidebarLabel>{label}</SidebarLabel>
                    </SidebarItem>
                  ))}
                </div>
              </div>
              {navItems.slice(1).map(({ icon: Icon, label, to }) => (
                <SidebarItem key={to} href={to} current={pathname === to}>
                  <Icon />
                  <SidebarLabel>{label}</SidebarLabel>
                </SidebarItem>
              ))}
              <div className="space-y-1 pt-2">
                <SidebarHeading>Calculators</SidebarHeading>
                <div className="ml-2 space-y-0.5 border-l border-zinc-950/8 pl-2 dark:border-white/10">
                  {calculatorNavItems.map(({ icon: Icon, label, to }) => (
                    <SidebarItem key={to} href={to} current={pathname === to}>
                      <Icon />
                      <SidebarLabel>{label}</SidebarLabel>
                    </SidebarItem>
                  ))}
                </div>
              </div>
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
