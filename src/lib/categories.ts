export type InferredCategory = "Disposable" | "E-Juice" | "CPS" | "Devices" | "Accessories" | "Unknown";

const categoryKeywords: Record<InferredCategory, string[]> = {
  Disposable: ["disposable", "elf", "puff", "iget", "zyn", "vape pen", "turbo"],
  "E-Juice": [
    "e-juice",
    "ejuice",
    "e juice",
    "eliquid",
    "e-liquid",
    "liquid",
    "juice",
    "vape juice",
    "salt nic",
    "freebase"
  ],
  CPS: ["cps"],
  Devices: ["mod", "pod", "battery", "device", "box mod", "tank"],
  Accessories: ["coil", "glass", "case", "cable", "charger", "atomizer", "wick"],
  Unknown: [],
};

export function inferCategory(name: string): InferredCategory {
  const lowerName = name.trim().toLowerCase();

  if (lowerName.startsWith("cps")) {
    return "CPS";
  }

  if (lowerName.startsWith("disp")) {
    return "Disposable";
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === "Unknown") continue;
    if (keywords.some((kw) => lowerName.includes(kw))) {
      return category as InferredCategory;
    }
  }

  return "E-Juice";
}
