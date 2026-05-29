import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q")?.trim() ?? "";

  // Tekens weghalen die de Supabase 'or'-filter zouden breken.
  const query = rawQuery.replace(/[,()%]/g, "").trim();

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ users: [] });
  }

  try {
    const supabase = await createClient();

    const pattern = `%${query}%`;
    const { data, error } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, featured_badge_id")
      .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
      .eq("onboarding_completed", true)
      .limit(MAX_RESULTS);

    if (error) {
      console.error("User search failed:", error.message);
      return NextResponse.json(
        { error: "Gebruikers zoeken mislukt." },
        { status: 500 }
      );
    }

    // Zonder username kunnen we geen profiel-link maken, dus die slaan we over.
    const users = (data ?? [])
      .filter((row) => row.username)
      .map((row) => ({
        username: row.username as string,
        displayName: (row.display_name as string | null) || (row.username as string),
        avatarUrl: (row.avatar_url as string | null) ?? null,
        badgeId: (row.featured_badge_id as string | null) ?? null,
      }));

    return NextResponse.json({ users });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout";
    console.error("User search error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
