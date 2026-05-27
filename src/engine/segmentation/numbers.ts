export function classifyNumericLike(text: string): "number" | "date" | "identifier" | undefined {
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(text)) return "date";
  if (/^[A-Za-z]+-\d+$/i.test(text)) return "identifier";
  if (/^\d+(?:[.,]\d+)?$/.test(text)) return "number";
  return undefined;
}
