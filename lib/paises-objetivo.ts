/**
 * 28 países objetivo de la campaña comercial 2026, agrupados por continente.
 * Los `slug` coinciden con `paises.id` en la DB.
 */

export interface PaisObjetivo {
  slug: string;
  nombre: string;
  continente: "Africa" | "America" | "Asia" | "Europa";
}

export const paisesObjetivo: PaisObjetivo[] = [
  // Africa (8)
  { slug: "benin",            nombre: "Benín",            continente: "Africa" },
  { slug: "burkina-faso",     nombre: "Burkina Faso",     continente: "Africa" },
  { slug: "burundi",          nombre: "Burundi",          continente: "Africa" },
  { slug: "camerun",          nombre: "Camerún",          continente: "Africa" },
  { slug: "chad",             nombre: "Chad",             continente: "Africa" },
  { slug: "congo",            nombre: "Congo",            continente: "Africa" },
  { slug: "costa-de-marfil",  nombre: "Costa de Marfíl",  continente: "Africa" },
  { slug: "senegal",          nombre: "Senegal",          continente: "Africa" },
  // America (7)
  { slug: "bolivia",              nombre: "Bolivia",              continente: "America" },
  { slug: "colombia",             nombre: "Colombia",             continente: "America" },
  { slug: "guatemala",            nombre: "Guatemala",            continente: "America" },
  { slug: "mexico",               nombre: "México",               continente: "America" },
  { slug: "peru",                 nombre: "Perú",                 continente: "America" },
  { slug: "republica-dominicana", nombre: "República Dominicana", continente: "America" },
  { slug: "uruguay",              nombre: "Uruguay",              continente: "America" },
  // Asia (2)
  { slug: "indonesia", nombre: "Indonesia", continente: "Asia" },
  { slug: "libano",    nombre: "Líbano",    continente: "Asia" },
  // Europa (11)
  { slug: "albania",          nombre: "Albania",          continente: "Europa" },
  { slug: "bulgaria",         nombre: "Bulgaria",         continente: "Europa" },
  { slug: "eslovaquia",       nombre: "Eslovaquia",       continente: "Europa" },
  { slug: "eslovenia",        nombre: "Eslovenia",        continente: "Europa" },
  { slug: "estonia",          nombre: "Estonia",          continente: "Europa" },
  { slug: "hungria",          nombre: "Hungría",          continente: "Europa" },
  { slug: "letonia",          nombre: "Letonia",          continente: "Europa" },
  { slug: "lituania",          nombre: "Lituania",         continente: "Europa" },
  { slug: "montenegro",       nombre: "Montenegro",       continente: "Europa" },
  { slug: "republica-checa",  nombre: "República Checa",  continente: "Europa" },
  { slug: "rumania",          nombre: "Rumanía",          continente: "Europa" },
];

export const CONTINENTE_ORDEN: PaisObjetivo["continente"][] = ["America", "Africa", "Europa", "Asia"];
