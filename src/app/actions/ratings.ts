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

  let score = Math.round(input.score * 10) / 10; // 1 decimaal
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
