export const formatUsd = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export function normalizedDecimalString(decimalString)
{
    if (!decimalString)
        return '';

    const s = decimalString.trim();

    const m = s.match(/^([+-])?(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
    if (!m) return false;

    const sign = m[1] === "-" ? "-" : "";
    let intPart = m[2] ?? "0";
    let fracPart = m[3] ?? m[4] ?? "";

    intPart = intPart.replace(/^0+(?=\d)/, "");
    fracPart = fracPart.replace(/0+$/, "");

    let normalized = sign + intPart + (fracPart ? "." + fracPart : "");

    if (normalized === "-0") normalized = "0";

    return normalized;
}

export function decimalStringsEqual(aString, bString)
{
    const a = normalizedDecimal(aString);
    const b = normalizedDecimal(bString);
    return a === b;
}

export function validDecimalString(decimalString)
{
    if (!decimalString)
        return false;

    const s = decimalString?.trim();

    const m = s.match(/^([+-])?(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
    if (!m) return false;

    const sign = m[1] === "-" ? "-" : "";
    if (sign)
        return false;

    let intPart = m[2] ?? "0";
    let fracPart = m[3] ?? m[4] ?? "";

    if (fracPart.length > 4) return false;

    const intNoLeading = intPart.replace(/^0+(?=\d)/, "");
    const totalDigits = (intNoLeading === "0" ? 1 : intNoLeading.length) + fracPart.length;
    if (totalDigits > 14) return false;

    let normalized = sign + intPart + (fracPart ? "." + fracPart : "");

    if (normalized === "-0") normalized = "0";

    if (normalized == '0' || normalized == '0.0') return false;

    return true;
}