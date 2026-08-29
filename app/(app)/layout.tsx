import { Sidebar } from "@/components/Sidebar";
import { getCurrentTeamMember } from "@/lib/actions/profile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentMember = await getCurrentTeamMember();

  return (
    <div className="flex min-h-screen">
      <Sidebar currentMember={currentMember} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
