import type { Folder } from "@/lib/types/library";

/** "dsd" or "dsd + 1 other folder", as Fathom labels a call's folder path. */
export function folderPathLabel(folders: Folder[]): string {
  if (folders.length === 0) return "";
  const extra = folders.length - 1;
  if (extra === 0) return folders[0].name;
  return `${folders[0].name} + ${extra} other folder${extra === 1 ? "" : "s"}`;
}
