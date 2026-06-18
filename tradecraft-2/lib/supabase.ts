// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Annotation } from "./rubric";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY; // server-side only

// Supabase is OPTIONAL. Without it, annotation still works and renders inline —
// you just don't get a shareable public URL. Add it when you want share links.
export const supabaseConfigured = Boolean(url && key);

function db() {
  if (!supabaseConfigured) throw new Error("Supabase not configured");
  return createClient(url!, key!);
}

export interface StoredProfile {
  id: string;
  name: string;
  role: string;
  annotation: Annotation;
  created_at?: string;
}

export async function saveProfile(p: {
  name: string;
  role: string;
  annotation: Annotation;
}): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const { data, error } = await db()
    .from("profiles")
    .insert({ name: p.name, role: p.role, annotation: p.annotation })
    .select("id")
    .single();
  if (error) {
    console.error("saveProfile", error.message);
    return null;
  }
  return data.id as string;
}

export async function getProfile(id: string): Promise<StoredProfile | null> {
  if (!supabaseConfigured) return null;
  const { data, error } = await db()
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as StoredProfile;
}
