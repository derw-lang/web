export function toBase64(file: File, onFinish: (base64: string) => void): void {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => onFinish(reader.result?.toString() || "");
}
