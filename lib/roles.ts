// Role model for the dashboard.
//
// NOTE: this is presentation-level gating driven by the role switcher in the
// topbar — it decides what each role *sees and can do in the UI*, nothing
// more. It is NOT a security boundary: there is no login yet, so anyone can
// flip roles. When real auth lands, the server must re-check every one of
// these permissions before trusting a request.

export type Role = "KretivWork" | "Chef Ammar";

export type Permission =
  | "approveStatement"   // sign off the weekly commission statement
  | "recordPayment"      // mark a commission invoice as paid
  | "editSettings"       // commission rate, payment method, integrations
  | "importOrders"       // bring in order CSVs
  | "bookShipment"       // create a courier booking
  | "adjustStock";       // change inventory counts

// KretivWork runs the operation and bills for it; Chef Ammar is the brand
// owner who approves what he is billed. Approval sits with Chef Ammar
// precisely so the party raising the invoice cannot also sign it off.
const PERMISSIONS: Record<Role, Permission[]> = {
  KretivWork: ["recordPayment", "editSettings", "importOrders", "bookShipment", "adjustStock"],
  "Chef Ammar": ["approveStatement"],
};

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

/** Explains, in Malay, why an action is unavailable to the current role. */
export function deniedReason(role: Role): string {
  return role === "Chef Ammar"
    ? "Hanya pasukan KretivWork boleh buat tindakan ini."
    : "Hanya Chef Ammar boleh buat tindakan ini.";
}
