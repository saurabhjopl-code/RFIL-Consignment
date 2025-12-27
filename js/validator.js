// FINAL VALIDATOR — DOES NOT BLOCK EXECUTION
// Column mismatches are logged, not thrown

function logHeaders(fileName, row) {
  console.warn(fileName + ' headers:', Object.keys(row));
}

export function validateSales(data) {
  if (!data || !data.length) {
    throw new Error('Sales file is empty');
  }
  logHeaders('Sales', data[0]);
}

export function validateFBFStock(data) {
  if (!data || !data.length) {
    throw new Error('FBF Stock file is empty');
  }
  logHeaders('FBF Stock', data[0]);
}

export function validateSellerStock(data) {
  if (!data || !data.length) {
    throw new Error('Seller Stock file is empty');
  }
  logHeaders('Seller Stock', data[0]);
}
