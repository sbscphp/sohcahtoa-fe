import type { UserPermission } from "@/app/admin/_lib/atoms/admin-auth-atom";

/**
 * Maps a top-level route prefix to the module name that must appear in the
 * user's `userPermissions` with action "view" for the user to access it.
 *
 * A value of `null` means the route is open to all authenticated users.
 */
export const ROUTE_PERMISSION_MAP: Record<string, string | null> = {
  "/admin/dashboard": null,
  "/admin/transactions": "TRANSACTION",
  "/admin/transient-wallets": "TRANSIENT_WALLET",
  "/admin/settlement": "SETTLEMENT",
  "/admin/agent": "AGENT",
  "/admin/outlet": "OUTLET",
  "/admin/customer": "CUSTOMER",
  "/admin/tickets": "INCIDENCE",
  "/admin/user-management": "USER_MANAGEMENT",
  "/admin/regulatory": "REGULATORY",
  "/admin/report": "REPORTS",
  "/admin/audit-trail": "AUDIT_TRAIL",
  "/admin/settings/rate": "RATE",
  "/admin/settings/workflow": "WORKFLOW",
  "/admin/settings": null,
};

/**
 * Priority-ordered list of top-level routes used when resolving the first
 * route a user can access (e.g. after login or when navigating back from an
 * unauthorized page).  Dashboard is always first because it has no module
 * requirement and is the natural home screen.
 */
/** Includes agent/customer for users whose only view permission is those modules. */
export const ORDERED_NAV_ROUTES = [
  "/admin/dashboard",
  "/admin/transactions",
  "/admin/transient-wallets",
  "/admin/settlement",
  "/admin/customer",
  "/admin/outlet",
  "/admin/tickets",
  "/admin/user-management",
  "/admin/regulatory",
  "/admin/report",
  "/admin/audit-trail",
  "/admin/agent",
  "/admin/settings",
];

/**
 * Returns `true` when the user holds a permission entry for the given module
 * and action.  Defaults to checking the "view" action which gates read access
 * to a section.
 */
export function hasModuleAccess(
  userPermissions: UserPermission[],
  module: string,
  action = "view"
): boolean {
  return userPermissions.some(
    (p) => p.module === module && p.action === action
  );
}

/**
 * Returns the required module key for the given pathname using longest-prefix
 * matching, so that sub-routes (e.g. `/admin/transactions/123`) inherit the
 * permission of their parent route.
 *
 * Returns `null`      – route is open to all authenticated users.
 * Returns `undefined` – route is not found in the map; skip permission check.
 */
export function getRequiredModule(pathname: string): string | null | undefined {
  const sorted = Object.keys(ROUTE_PERMISSION_MAP).sort(
    (a, b) => b.length - a.length
  );
  for (const route of sorted) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return ROUTE_PERMISSION_MAP[route];
    }
  }
  return undefined;
}

/**
 * Iterates `ORDERED_NAV_ROUTES` and returns the first route for which the
 * user holds a view permission (or that requires no permission at all).
 * Falls back to `/admin/settings` which is always open to authenticated users.
 */
export function getFirstAccessibleRoute(
  userPermissions: UserPermission[]
): string {
  for (const route of ORDERED_NAV_ROUTES) {
    const requiredModule = ROUTE_PERMISSION_MAP[route];
    if (
      requiredModule === null ||
      requiredModule === undefined ||
      hasModuleAccess(userPermissions, requiredModule)
    ) {
      return route;
    }
  }
  return "/admin/settings";
}
