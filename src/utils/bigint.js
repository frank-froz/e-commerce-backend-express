// 🔧 Utilidades para BigInt
// Conversión de BigInt a String para serialización JSON

/**
 * Convierte BigInt a String recursivamente para serialización JSON
 * PostgreSQL BIGINT/SERIAL8 se convierten a JavaScript BigInt,
 * que no pueden ser serializados a JSON directamente.
 * 
 * @param {*} obj - Objeto a convertir
 * @returns {*} Objeto con BigInts convertidos a strings
 */
function convertBigIntToString(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
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
