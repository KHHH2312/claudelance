import { Home, Target, SquarePen, Users, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
};

// Single source of truth so the desktop header and mobile bottom nav never drift.
export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  {
    href: "/bounties",
    label: "Bounties",
    icon: Target,
    match: (p) => p === "/bounties" || p.startsWith("/bounties/") || p.startsWith("/bounty/"),
  },
  {
    href: "/post",
    label: "Post",
    icon: SquarePen,
    match: (p) => p === "/post" || p.startsWith("/post/"),
  },
  {
    href: "/workers",
    label: "Workers",
    icon: Users,
    match: (p) => p.startsWith("/workers") || p.startsWith("/worker/"),
  },
  {
    href: "/revenue",
    label: "Revenue",
    icon: Landmark,
    match: (p) => p === "/revenue" || p.startsWith("/revenue/"),
  },
];
