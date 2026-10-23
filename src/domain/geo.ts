import { z } from "zod";

/** Régions métropolitaines. L'identifiant sert de clé stable (URL, albums). */
export const REGIONS = {
  ara: "Auvergne-Rhône-Alpes",
  bfc: "Bourgogne-Franche-Comté",
  bre: "Bretagne",
  cvl: "Centre-Val de Loire",
  cor: "Corse",
  ges: "Grand Est",
  hdf: "Hauts-de-France",
  idf: "Île-de-France",
  nor: "Normandie",
  naq: "Nouvelle-Aquitaine",
  occ: "Occitanie",
  pdl: "Pays de la Loire",
  pac: "Provence-Alpes-Côte d'Azur",
} as const;

export type RegionId = keyof typeof REGIONS;

interface Department {
  readonly name: string;
  readonly region: RegionId;
}

const department = (name: string, region: RegionId): Department => ({
  name,
  region,
});

/** Départements métropolitains, indexés par code INSEE. */
export const DEPARTMENTS = {
  "01": department("Ain", "ara"),
  "02": department("Aisne", "hdf"),
  "03": department("Allier", "ara"),
  "04": department("Alpes-de-Haute-Provence", "pac"),
  "05": department("Hautes-Alpes", "pac"),
  "06": department("Alpes-Maritimes", "pac"),
  "07": department("Ardèche", "ara"),
  "08": department("Ardennes", "ges"),
  "09": department("Ariège", "occ"),
  "10": department("Aube", "ges"),
  "11": department("Aude", "occ"),
  "12": department("Aveyron", "occ"),
  "13": department("Bouches-du-Rhône", "pac"),
  "14": department("Calvados", "nor"),
  "15": department("Cantal", "ara"),
  "16": department("Charente", "naq"),
  "17": department("Charente-Maritime", "naq"),
  "18": department("Cher", "cvl"),
  "19": department("Corrèze", "naq"),
  "2A": department("Corse-du-Sud", "cor"),
  "2B": department("Haute-Corse", "cor"),
  "21": department("Côte-d'Or", "bfc"),
  "22": department("Côtes-d'Armor", "bre"),
  "23": department("Creuse", "naq"),
  "24": department("Dordogne", "naq"),
  "25": department("Doubs", "bfc"),
  "26": department("Drôme", "ara"),
  "27": department("Eure", "nor"),
  "28": department("Eure-et-Loir", "cvl"),
  "29": department("Finistère", "bre"),
  "30": department("Gard", "occ"),
  "31": department("Haute-Garonne", "occ"),
  "32": department("Gers", "occ"),
  "33": department("Gironde", "naq"),
  "34": department("Hérault", "occ"),
  "35": department("Ille-et-Vilaine", "bre"),
  "36": department("Indre", "cvl"),
  "37": department("Indre-et-Loire", "cvl"),
  "38": department("Isère", "ara"),
  "39": department("Jura", "bfc"),
  "40": department("Landes", "naq"),
  "41": department("Loir-et-Cher", "cvl"),
  "42": department("Loire", "ara"),
  "43": department("Haute-Loire", "ara"),
  "44": department("Loire-Atlantique", "pdl"),
  "45": department("Loiret", "cvl"),
  "46": department("Lot", "occ"),
  "47": department("Lot-et-Garonne", "naq"),
  "48": department("Lozère", "occ"),
  "49": department("Maine-et-Loire", "pdl"),
  "50": department("Manche", "nor"),
  "51": department("Marne", "ges"),
  "52": department("Haute-Marne", "ges"),
  "53": department("Mayenne", "pdl"),
  "54": department("Meurthe-et-Moselle", "ges"),
  "55": department("Meuse", "ges"),
  "56": department("Morbihan", "bre"),
  "57": department("Moselle", "ges"),
  "58": department("Nièvre", "bfc"),
  "59": department("Nord", "hdf"),
  "60": department("Oise", "hdf"),
  "61": department("Orne", "nor"),
  "62": department("Pas-de-Calais", "hdf"),
  "63": department("Puy-de-Dôme", "ara"),
  "64": department("Pyrénées-Atlantiques", "naq"),
  "65": department("Hautes-Pyrénées", "occ"),
  "66": department("Pyrénées-Orientales", "occ"),
  "67": department("Bas-Rhin", "ges"),
  "68": department("Haut-Rhin", "ges"),
  "69": department("Rhône", "ara"),
  "70": department("Haute-Saône", "bfc"),
  "71": department("Saône-et-Loire", "bfc"),
  "72": department("Sarthe", "pdl"),
  "73": department("Savoie", "ara"),
  "74": department("Haute-Savoie", "ara"),
  "75": department("Paris", "idf"),
  "76": department("Seine-Maritime", "nor"),
  "77": department("Seine-et-Marne", "idf"),
  "78": department("Yvelines", "idf"),
  "79": department("Deux-Sèvres", "naq"),
  "80": department("Somme", "hdf"),
  "81": department("Tarn", "occ"),
  "82": department("Tarn-et-Garonne", "occ"),
  "83": department("Var", "pac"),
  "84": department("Vaucluse", "pac"),
  "85": department("Vendée", "pdl"),
  "86": department("Vienne", "naq"),
  "87": department("Haute-Vienne", "naq"),
  "88": department("Vosges", "ges"),
  "89": department("Yonne", "bfc"),
  "90": department("Territoire de Belfort", "bfc"),
  "91": department("Essonne", "idf"),
  "92": department("Hauts-de-Seine", "idf"),
  "93": department("Seine-Saint-Denis", "idf"),
  "94": department("Val-de-Marne", "idf"),
  "95": department("Val-d'Oise", "idf"),
} as const satisfies Record<string, Department>;

export type DepartmentCode = keyof typeof DEPARTMENTS;

const departmentCodes = Object.keys(DEPARTMENTS) as [
  DepartmentCode,
  ...DepartmentCode[],
];
const regionIds = Object.keys(REGIONS) as [RegionId, ...RegionId[]];

export const departmentCodeSchema = z.enum(departmentCodes);
export const regionIdSchema = z.enum(regionIds);

export function departmentName(code: DepartmentCode): string {
  return DEPARTMENTS[code].name;
}

/** La région se déduit du département : elle n'est jamais stockée sur le club. */
export function regionOfDepartment(code: DepartmentCode): RegionId {
  return DEPARTMENTS[code].region;
}

export function regionName(id: RegionId): string {
  return REGIONS[id];
}

/** Départements d'une région (pour filtrer en base, où la région n'est pas stockée). */
export function departmentsOfRegion(id: RegionId): DepartmentCode[] {
  return departmentCodes.filter((code) => DEPARTMENTS[code].region === id);
}
