import Navigation from "@/components/Navigation";
import { LogoutForm } from "@/components/LogoutForm";
import { MainFooter } from "@/components/MainFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navigation logoutSlot={<LogoutForm />} />
      <div className="flex flex-1 flex-col">{children}</div>
      <MainFooter />
    </div>
  );
}
