import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));

export { getLocalStorage, setLocalStorage };

const SUFFIXES = [
  "", "K", "M", "B", "T", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ",
  "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX",
  "AY", "AZ", "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BK", "BL",
  "BM", "BN", "BO", "BP", "BQ", "BR", "BS", "BT", "BU", "BV", "BW", "BX", "BY", "BZ"
];

export function formatChronoValue(num: number, decimals: number = 2): string {
  if (num < 1000) {
    return Math.floor(num).toString();
  }
  
  let exp = 0;
  let value = num;
  
  while (value >= 1000 && exp < SUFFIXES.length - 1) {
    value /= 1000;
    exp++;
  }
  
  const suffix = SUFFIXES[exp];
  
  if (exp === 0) {
    return Math.floor(num).toString();
  }
  
  if (exp === 1) {
    return value.toFixed(1) + suffix;
  }
  
  return value.toFixed(decimals) + suffix;
}
