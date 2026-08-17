/**
 * Convert numerical currency amounts into Indian numbering system words.
 * Handles Lakhs and Crores.
 * Example: 184500.50 => "Rupees One Lakh Eighty Four Thousand Five Hundred and Fifty Paise Only"
 */

const units = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertGroup(n: number): string {
  let str = '';
  if (n >= 100) {
    str += units[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += units[n] + ' ';
  }
  return str.trim();
}

export function numberToWordsIndian(num: number): string {
  if (isNaN(num) || num === 0) {
    return 'Rupees Zero Only';
  }

  const rounded = Math.round(num * 100) / 100;
  const integerPart = Math.floor(rounded);
  const paisePart = Math.round((rounded - integerPart) * 100);

  let temp = integerPart;
  let words = '';

  if (temp === 0) {
    words = 'Zero';
  } else {
    // Crores (1,00,00,000)
    const crores = Math.floor(temp / 10000000);
    temp %= 10000000;

    // Lakhs (1,00,000)
    const lakhs = Math.floor(temp / 100000);
    temp %= 100000;

    // Thousands (1,000)
    const thousands = Math.floor(temp / 1000);
    temp %= 1000;

    // Hundreds and tens
    const remaining = temp;

    if (crores > 0) {
      words += convertGroup(crores) + ' Crore ';
    }
    if (lakhs > 0) {
      words += convertGroup(lakhs) + ' Lakh ';
    }
    if (thousands > 0) {
      words += convertGroup(thousands) + ' Thousand ';
    }
    if (remaining > 0) {
      words += convertGroup(remaining) + ' ';
    }
  }

  words = words.trim();

  let result = `Rupees ${words}`;

  if (paisePart > 0) {
    result += ` and ${convertGroup(paisePart)} Paise`;
  }

  result += ' Only';

  return result;
}
