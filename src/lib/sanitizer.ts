/**
 * Unique Trick: High-performance input sanitizer helper
 * Strips script tags, HTML tags, and dangerous executable characters from strings
 * to protect API endpoints against XSS and injection attacks.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "");
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized as T;
}
