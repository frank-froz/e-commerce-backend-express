// 🔧 Utilidades para BigInt y Decimal
// Conversión de BigInt a String y Decimal a Number para serialización JSON

const { Decimal } = require('@prisma/client/runtime/library');

/**
 * Convierte BigInt a String y Decimal a Number recursivamente para serialización JSON
 * PostgreSQL BIGINT/SERIAL8 se convierten a JavaScript BigInt,
 * PostgreSQL DECIMAL/NUMERIC se convierten a Prisma Decimal,
 * que no pueden ser serializados a JSON directamente.
 * 
 * @param {*} obj - Objeto a convertir
 * @returns {*} Objeto con BigInts convertidos a strings y Decimals a números
 */
function convertBigIntToString(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  // Convertir Decimal de Prisma a número
  if (obj instanceof Decimal) {
    return parseFloat(obj.toString());
  }
  
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  
  if (typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertBigIntToString(obj[key]);
      }
    }
    return converted;
  }
  
  return obj;
}

module.exports = {
  convertBigIntToString
};
