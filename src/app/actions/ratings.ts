"use server";

import { createClient } from "@/lib/supabase/server";

const MIN_SCORE = 0;
const MAX_SCORE = 10;

type ItemType = "album" | "track";

type RateInput = {
  itemType: ItemType;
  itemId: string;
  score: number;
  itemName: string;
  itemArtist: string;
  itemImageUrl: string | null;
};

export async function rateItem(
  input: RateInput
): Promise<{ ok: boolean; score?: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je bent niet ingelogd." };

  let score = Math.round(input.score * 10) / 10;
  if (Number.isNaN(score)) return { ok: false, error: "Ongeldige score." };
  score = Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));

  const { error } = await supabase.from("ratings").upsert(
    {
      user_id: user.id,
      item_type: input.itemType,
      item_id: input.itemId,
      score,
      item_name: input.itemName,
      item_artist: input.itemArtist,
      item_image_url: input.itemImageUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item_type,item_id" }
  );

  if (error) {
    console.error("rateItem failed:", error.message);
    return { ok: false, error: "Opslaan mislukt." };
  }
  return { ok: true, score };
}

export async function removeRating(input: {
  itemType: ItemType;
  itemId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je bent niet ingelogd." };

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("item_type", input.itemType)
    .eq("item_id", input.itemId);

  if (error) {
    console.error("removeRating failed:", error.message);
    return { ok: false, error: "Verwijderen mislukt." };
  }
  return { ok: true };
}

export async function getRatingsForItems(
  items: { itemType: ItemType; itemId: string }[]
): Promise<Record<string, number>> {
  if (items.length === 0) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const ids = Array.from(new Set(items.map((i) => i.itemId)));
  const { data, error } = await supabase
    .from("ratings")
    .select("item_type, item_id, score")
    .eq("user_id", user.id)
    .in("item_id", ids);

  if (error || !data) return {};

  const map: Record<string, number> = {};
  for (const row of data) {
    map[`${row.item_type}:${row.item_id}`] = Number(row.score);
  }
  return map;
}
