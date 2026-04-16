const COUNTRY_WINDOWS = [
  { start: 1700, end: 1799, options: ['Francia', 'España', 'Reino Unido'] },
  { start: 1800, end: 1899, options: ['Francia', 'España', 'Italia'] },
  { start: 1900, end: 1999, options: ['Francia', 'Alemania', 'Reino Unido'] },
  { start: 2000, end: 2099, options: ['Francia', 'España', 'Alemania'] },
];

export function buildCountryOptions(year) {
  const range = COUNTRY_WINDOWS.find((item) => year >= item.start && year <= item.end);
  return range ? range.options : ['Francia', 'España', 'Italia'];
}
