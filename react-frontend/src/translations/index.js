import { en } from './en';
import { kh } from './kh';

export const translations = {
  en,
  kh
};

export const getTranslation = (lang, path) => {
  const keys = path.split('.');
  let value = translations[lang] || translations.en;
  
  for (const key of keys) {
    if (value && value[key]) {
      value = value[key];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
      break;
    }
  }
  
  return value || path;
};

