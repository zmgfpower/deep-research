export function downloadFile(
  content: string,
  filename: string,
  fileType: string
) {
  // Prepending a BOM sequence at the beginning of the text file to encoded as UTF-8.
  const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([BOM, content], { type: fileType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
