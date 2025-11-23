// src/utils/roleCodes.js

// ----- ROLE CODES -----
export const roleCodes = {
  ABCDE: 'student',
  EDU123: 'educator',
  ADMIN001: 'admin',
  LEAD001: 'educator',
  MASTERKEY: 'admin',
};

// ----- GET ROLE FROM CODE -----
export function getRoleFromCode(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  return roleCodes[cleanCode] || null;
}

// ----- EMAIL TO KEY HELPER -----
export const emailToKey = (email = '') =>
  email.trim().toLowerCase().replace(/\./g, '_');
