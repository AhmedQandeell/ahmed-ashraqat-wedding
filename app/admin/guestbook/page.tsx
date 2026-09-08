import GuestbookAdminPanel from "./admin-panel";

export const metadata = {
  title: "Guestbook Admin",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function GuestbookAdminPage() {
  return <GuestbookAdminPanel />;
}
