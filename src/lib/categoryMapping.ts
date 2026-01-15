// Map Square reporting category names to simple filter labels
export function mapToSimpleCategory(squareCategoryName: string | null): string | null {
  if (!squareCategoryName) return null;
  
  const lower = squareCategoryName.toLowerCase();
  
  // Map to "Juices"
  if (
    lower.includes("juice") ||
    lower.includes("liquid") ||
    lower.includes("e-liquid") ||
    lower.includes("eliquid") ||
    lower.includes("salt nic") ||
    lower.includes("freebase")
  ) {
    return "Juices";
  }
  
  // Map to "Disposable"
  if (
    lower.includes("disposable") ||
    lower.includes("puff") ||
    lower.includes("vape pen")
  ) {
    return "Disposable";
  }
  
  // Map to "Closed Pod System"
  if (
    lower.includes("pod") ||
    lower.includes("closed") ||
    lower.includes("system") ||
    lower.includes("device") ||
    lower.includes("mod")
  ) {
    return "Closed Pod System";
  }
  
  // Default: return null to exclude unmapped categories
  return null;
}
