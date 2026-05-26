export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function albumSlug(title: string, artist: string): string {
  return `${slugify(title)}--${slugify(artist)}`;
}

