export function generateSlug(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // remove non-alphanumeric characters except spaces/hyphens
    .replace(/[\s_-]+/g, '-')     // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens
}

export function getUrlToken(id) {
  if (!id) return "";
  const salt = "ghatal_guide_secret_salt_2026";
  const str = `${id}:${salt}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}
