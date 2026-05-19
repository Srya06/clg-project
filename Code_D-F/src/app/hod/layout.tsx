/**
 * HOD auth pages (login, change-password, forgot-password) share this layout.
 * These pages are outside the (auth) group to avoid the student auth wrapper,
 * and are also outside (dashboard) so the HOD sidebar doesn't appear.
 */
export default function HodAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
