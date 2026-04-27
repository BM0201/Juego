const clothingPalette = {
  harapos: '#8d6e63',
  tunica: '#778da9',
  jubon: '#7f5539',
  casaca: '#3d405b',
  vestido_noble: '#9a8c98',
  armadura: '#8d99ae',
  manto_real: '#6a040f',
  traje_lino: '#adb5bd',
};

const accessoryLabels = {
  corona: '♛',
  cetro: '⚚',
  anillo: '◍',
  monoculo: '◐',
  joya: '✦',
  tiara: '❖',
  sombrero_mercader: '◖',
  gorro_lana: '⌂',
  bufanda: '≈',
  ninguno: '',
};

function beardPath(styleId) {
  switch (styleId) {
    case 'bigote':
      return 'M75 95 Q100 102 125 95';
    case 'corta':
      return 'M78 98 Q100 120 122 98';
    case 'larga':
      return 'M80 95 Q100 135 120 95';
    case 'candado':
      return 'M95 96 Q100 115 105 96';
    default:
      return '';
  }
}

function hairHeight(styleId) {
  if (styleId === 'tonsura') return 22;
  if (styleId === 'moño_alto') return 8;
  if (styleId === 'trenza_larga') return 14;
  return 18;
}

export default function AvatarRenderer({ appearance, age = 16, name, compact = false }) {
  const size = compact ? 120 : 180;
  const beard = beardPath(appearance?.beardStyleId || 'sin_barba');
  const hairY = hairHeight(appearance?.hairStyleId);

  return (
    <svg viewBox="0 0 200 240" width={size} height={size} className="avatar-svg" role="img" aria-label={`Avatar de ${name}`}>
      <rect x="0" y="0" width="200" height="240" rx="18" fill="#0b132b" />
      <ellipse cx="100" cy="185" rx="56" ry="42" fill={clothingPalette[appearance?.clothingId] || '#6c757d'} />
      <circle cx="100" cy="88" r="42" fill={appearance?.skinTone || '#ddb892'} />
      <ellipse cx="100" cy={hairY} rx="44" ry="30" fill={appearance?.hairColor || '#4e342e'} />
      <circle cx="84" cy="84" r="5" fill={appearance?.eyeColor || '#1d3557'} />
      <circle cx="116" cy="84" r="5" fill={appearance?.eyeColor || '#1d3557'} />
      <path d="M89 104 Q100 110 111 104" stroke="#2b2d42" strokeWidth="2" fill="none" />
      <path d="M94 120 Q100 125 106 120" stroke="#7f5539" strokeWidth="2" fill="none" />

      {beard ? <path d={beard} stroke={appearance?.hairColor || '#4e342e'} strokeWidth="5" fill="none" /> : null}

      {appearance?.facialTrait === 'cicatriz' ? <line x1="120" y1="70" x2="110" y2="95" stroke="#7f5539" strokeWidth="2" /> : null}
      {appearance?.facialTrait === 'pecas' ? (
        <>
          <circle cx="91" cy="94" r="1.3" fill="#7f5539" />
          <circle cx="97" cy="97" r="1.3" fill="#7f5539" />
          <circle cx="110" cy="96" r="1.3" fill="#7f5539" />
        </>
      ) : null}

      {appearance?.accessoryId !== 'ninguno' ? (
        <text x="100" y="32" textAnchor="middle" fontSize="26" fill="#ffd166">{accessoryLabels[appearance?.accessoryId] || '✶'}</text>
      ) : null}

      {age >= 60 ? <text x="168" y="26" fontSize="14" fill="#e0e1dd">+canas</text> : null}
    </svg>
  );
}
