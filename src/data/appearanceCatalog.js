const ERAS = ['antigua', 'medieval', 'renacentista', 'industrial', 'moderna'];

const HAIR_STYLES = [
  { id: 'corto_recto', label: 'Corto recto', eras: ERAS, genders: ['m', 'f'] },
  { id: 'trenza_larga', label: 'Trenza larga', eras: ['medieval', 'renacentista', 'moderna'], genders: ['f'] },
  { id: 'melena_ondulada', label: 'Melena ondulada', eras: ['antigua', 'renacentista', 'moderna'], genders: ['m', 'f'] },
  { id: 'tonsura', label: 'Tonsura', eras: ['medieval'], genders: ['m'] },
  { id: 'empolvado', label: 'Empolvado', eras: ['renacentista', 'industrial'], genders: ['m', 'f'] },
  { id: 'coleta_baja', label: 'Coleta baja', eras: ['industrial', 'moderna'], genders: ['m', 'f'] },
  { id: 'moño_alto', label: 'Moño alto', eras: ['renacentista', 'moderna'], genders: ['f'] },
];

const BEARD_STYLES = [
  { id: 'sin_barba', label: 'Sin barba', eras: ERAS },
  { id: 'bigote', label: 'Bigote', eras: ['renacentista', 'industrial', 'moderna'] },
  { id: 'corta', label: 'Barba corta', eras: ERAS },
  { id: 'larga', label: 'Barba larga', eras: ['antigua', 'medieval'] },
  { id: 'candado', label: 'Candado', eras: ['industrial', 'moderna'] },
];

const ACCESSORIES = [
  { id: 'ninguno', label: 'Ninguno', eras: ERAS, roles: ['plebeyo', 'comerciante', 'noble', 'rey', 'diplomatico'], unlock: 'base' },
  { id: 'gorro_lana', label: 'Gorro de lana', eras: ['medieval', 'industrial', 'moderna'], roles: ['plebeyo'], unlock: 'base' },
  { id: 'bufanda', label: 'Bufanda', eras: ['industrial', 'moderna'], roles: ['plebeyo', 'comerciante'], unlock: 'base' },
  { id: 'sombrero_mercader', label: 'Sombrero mercader', eras: ['renacentista', 'industrial'], roles: ['comerciante', 'diplomatico'], unlock: 'base' },
  { id: 'anillo', label: 'Anillo de sello', eras: ERAS, roles: ['comerciante', 'noble', 'rey', 'diplomatico'], unlock: 'base' },
  { id: 'monoculo', label: 'Monóculo', eras: ['industrial', 'moderna'], roles: ['comerciante', 'noble', 'diplomatico'], unlock: 'legacy_20' },
  { id: 'joya', label: 'Joya ceremonial', eras: ['renacentista', 'industrial', 'moderna'], roles: ['noble', 'rey'], unlock: 'legacy_35' },
  { id: 'tiara', label: 'Tiara', eras: ['renacentista', 'moderna'], roles: ['noble', 'rey'], unlock: 'legacy_40' },
  { id: 'corona', label: 'Corona', eras: ['medieval', 'renacentista', 'industrial', 'moderna'], roles: ['rey'], unlock: 'base' },
  { id: 'cetro', label: 'Cetro real', eras: ['medieval', 'renacentista', 'industrial'], roles: ['rey'], unlock: 'legacy_50' },
];

const CLOTHING = [
  { id: 'harapos', label: 'Harapos', tier: 'humilde', eras: ERAS, roles: ['plebeyo'] },
  { id: 'tunica', label: 'Túnica común', tier: 'comun', eras: ['antigua', 'medieval'], roles: ['plebeyo', 'comerciante', 'diplomatico'] },
  { id: 'jubon', label: 'Jubón', tier: 'fina', eras: ['renacentista'], roles: ['comerciante', 'noble', 'diplomatico'] },
  { id: 'casaca', label: 'Casaca', tier: 'noble', eras: ['industrial', 'moderna'], roles: ['noble', 'rey', 'diplomatico'] },
  { id: 'vestido_noble', label: 'Vestido noble', tier: 'noble', eras: ['renacentista', 'industrial', 'moderna'], roles: ['noble', 'rey'] },
  { id: 'armadura', label: 'Armadura ceremonial', tier: 'real', eras: ['medieval', 'renacentista'], roles: ['rey', 'noble'] },
  { id: 'manto_real', label: 'Manto real', tier: 'real', eras: ['medieval', 'renacentista', 'industrial', 'moderna'], roles: ['rey'] },
  { id: 'traje_lino', label: 'Traje de lino', tier: 'comun', eras: ['industrial', 'moderna'], roles: ['plebeyo', 'comerciante', 'diplomatico'] },
];

export const APPEARANCE_COLORS = {
  hair: ['#1f140f', '#4e342e', '#7b4f33', '#b08968', '#c8c8c8', '#f5deb3'],
  eyes: ['#2d6a4f', '#1d3557', '#7f5539', '#6d597a', '#6b705c'],
  skin: ['#f2d3b1', '#ddb892', '#c58c61', '#8d5524'],
};

export function getAppearanceCatalog() {
  return {
    hairStyles: HAIR_STYLES,
    beardStyles: BEARD_STYLES,
    accessories: ACCESSORIES,
    clothing: CLOTHING,
  };
}
