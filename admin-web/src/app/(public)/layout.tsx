import LandingNavbar from "@/components/LandingNavbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <LandingNavbar />
      <main>{children}</main>
    </div>
  );
}
