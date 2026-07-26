import { pdf } from "@react-pdf/renderer";

export async function downloadPdf(doc: NonNullable<Parameters<typeof pdf>[0]>, filename: string) {
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
