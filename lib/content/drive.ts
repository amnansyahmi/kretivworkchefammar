// Google Drive link handling.
//
// This uses Drive's own embed endpoints rather than the Drive API, because the
// app has no login and therefore no OAuth token to call the API with. The
// trade-off is real and worth stating plainly: an embed only renders for
// people whose browser can already see the file, so the folder must be shared
// ("Anyone with the link can view") for the preview to work for everyone. If
// the folder stays private, the embed shows Google's sign-in/permission page
// instead — the app still works, you just don't get an inline preview.
//
// Swapping to the Drive API later means replacing buildEmbedUrl() and adding
// an OAuth flow; the rest of the content module doesn't care.

export type DriveKind = "folder" | "file" | "document" | "spreadsheet" | "presentation" | "unknown";

export type DriveRef = {
  kind: DriveKind;
  id: string;
  /** URL that renders inside an iframe, or null when we can't build one. */
  embedUrl: string | null;
  /** The original link, for opening in a new tab. */
  url: string;
};

const PATTERNS: { kind: Exclude<DriveKind, "unknown">; regex: RegExp }[] = [
  { kind: "folder", regex: /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)/ },
  { kind: "file", regex: /drive\.google\.com\/file\/d\/([\w-]+)/ },
  { kind: "document", regex: /docs\.google\.com\/document\/d\/([\w-]+)/ },
  { kind: "spreadsheet", regex: /docs\.google\.com\/spreadsheets\/d\/([\w-]+)/ },
  { kind: "presentation", regex: /docs\.google\.com\/presentation\/d\/([\w-]+)/ },
];

function embedFor(kind: DriveKind, id: string): string | null {
  switch (kind) {
    // embeddedfolderview is Drive's built-in iframe listing; #grid shows
    // thumbnails, which is what you want for video/photo content.
    case "folder": return `https://drive.google.com/embeddedfolderview?id=${id}#grid`;
    case "file": return `https://drive.google.com/file/d/${id}/preview`;
    case "document": return `https://docs.google.com/document/d/${id}/preview`;
    case "spreadsheet": return `https://docs.google.com/spreadsheets/d/${id}/preview`;
    case "presentation": return `https://docs.google.com/presentation/d/${id}/embed`;
    default: return null;
  }
}

/**
 * Recognises the Drive/Docs link shapes people actually paste — including
 * `?usp=sharing` suffixes, `/u/0/` account prefixes and the older
 * `open?id=` form.
 */
export function parseDriveUrl(raw: string): DriveRef | null {
  const url = raw.trim();
  if (!url) return null;

  for (const { kind, regex } of PATTERNS) {
    const match = url.match(regex);
    if (match) return { kind, id: match[1], embedUrl: embedFor(kind, match[1]), url };
  }

  // Legacy share form: drive.google.com/open?id=XXX — the id alone doesn't
  // say whether it's a file or a folder, so treat it as a file, which is the
  // far more common case for a shared link.
  const legacy = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (legacy) return { kind: "file", id: legacy[1], embedUrl: embedFor("file", legacy[1]), url };

  if (/^https?:\/\//i.test(url)) return { kind: "unknown", id: "", embedUrl: null, url };
  return null;
}

export function isDriveUrl(raw: string): boolean {
  const ref = parseDriveUrl(raw);
  return ref !== null && ref.kind !== "unknown";
}
