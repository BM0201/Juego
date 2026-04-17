import { COUNTRY_WINDOWS } from '../data/configs/setupConfig.js';

export function buildCountryOptions(year) {
  const window = COUNTRY_WINDOWS.find((item) => year >= item.start && year <= item.end);
  return window ? window.options : ['Francia', 'España', 'Italia'];
}
