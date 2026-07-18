export const STAFF_ROLE = "staff";

export const isStaffRole = (role?: string | null) =>
  role?.trim().toLowerCase() === STAFF_ROLE;

export const getHomeRouteForRole = (role?: string | null) =>
  isStaffRole(role)
    ? "/(staff-tabs)/staff-home"
    : role
      ? "/(user-tabs)/home"
      : "/(guest-tabs)/home";
