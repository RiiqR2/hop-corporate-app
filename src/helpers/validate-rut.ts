export const isValidRUT = (rut: string): boolean => {
  const cleaned = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  if (cleaned.length < 8 || cleaned.length > 9) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDV = 11 - (sum % 11);
  let expectedDVStr = "";

  if (expectedDV === 11) {
    expectedDVStr = "0";
  } else if (expectedDV === 10) {
    expectedDVStr = "K";
  } else {
    expectedDVStr = expectedDV.toString();
  }

  return dv === expectedDVStr;
};