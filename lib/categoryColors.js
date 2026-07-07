

export const CATEGORY_COLORS = {
  "Alkali Metal": { hex: "#C8402C", label: "flame-crimson" },
  "Alkaline Earth Metal": { hex: "#E3A72E", label: "flame-gold" },
  "Transition Metal": { hex: "#D9B44A", label: "amber" },
  "Post-transition Metal": { hex: "#2F9E6E", label: "flame-copper" },
  Metalloid: { hex: "#3E9C8F", label: "teal" },
  Nonmetal: { hex: "#3E7CB1", label: "flame-azure" },
  Halogen: { hex: "#7C4DAA", label: "flame-violet" },
  "Noble Gas": { hex: "#A85CC1", label: "orchid" },
  Lanthanide: { hex: "#C1638A", label: "rose" },
  Actinide: { hex: "#8A5FBF", label: "indigo" },
};

export function categoryColor(category) {
  return CATEGORY_COLORS[category]?.hex || "#64748B";
}
