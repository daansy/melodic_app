import { createClient } from "@/lib/supabase/server";

type ItemType = "album" | "track";

export async function getMyRatings(
  itemType: ItemType,
  itemIds: string[]
): Promise<Record<string, number>> {
  if (itemIds.length === 0) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("ratings")
    .select("item_id, score")
    .eq("user_id", user.id)
    .eq("item_type", itemType)
    .in("item_id", itemIds);

  if (error || !data) return {};

  const map: Record<string, number> = {};
  for (const row of data) {
    map[row.item_id as string] = Number(row.score);
  }
  return map;
}

export async function getMyRating(
  itemType: ItemType,
  itemId: string
): Promise<number | null> {
  const map = await getMyRatings(itemType, [itemId]);
  return map[itemId] ?? null;
}
