const PARAM = "s";

/** Encode an array of session IDs into a URL-safe string. */
export function encodeIds(ids: string[]): string {
  return btoa(JSON.stringify(ids));
}

/** Decode the shared IDs param. Returns null if invalid. */
export function decodeIds(encoded: string): string[] | null {
  try {
    const parsed = JSON.parse(atob(encoded));
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed as string[];
    }
    return null;
  } catch {
    return null;
  }
}

/** Build an absolute share URL for the given favorites. */
export function buildShareUrl(ids: string[]): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set(PARAM, encodeIds(ids));
  return url.toString();
}

/** Read imported IDs from the current URL, if present. Returns null otherwise. */
export function readImportParam(): string[] | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(PARAM);
  if (!raw) return null;
  return decodeIds(raw);
}

/** Remove the import param from the URL without reloading. */
export function clearImportParam(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM);
  window.history.replaceState({}, "", url.toString());
}
