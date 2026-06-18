// app/p/[id]/page.tsx
import Profile from "@/components/Profile";
import { getProfile } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProfile(id);
  if (!p) notFound();
  return <Profile a={p.annotation} name={p.name} role={p.role} />;
}
