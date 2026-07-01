import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getCurrentProfile } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const displayName = profile.full_name ?? profile.email;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Header userName={displayName} />
      {children}
    </div>
  );
}
