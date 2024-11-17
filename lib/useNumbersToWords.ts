export const numberToWords = (amount: number): string => {
  const units = [
    "",
    "jeden",
    "dwa",
    "trzy",
    "cztery",
    "pięć",
    "sześć",
    "siedem",
    "osiem",
    "dziewięć",
  ];
  const teens = [
    "dziesięć",
    "jedenaście",
    "dwanaście",
    "trzynaście",
    "czternaście",
    "piętnaście",
    "szesnaście",
    "siedemnaście",
    "osiemnaście",
    "dziewiętnaście",
  ];
  const tens = [
    "",
    "dziesięć",
    "dwadzieścia",
    "trzydzieści",
    "czterdzieści",
    "pięćdziesiąt",
    "sześćdziesiąt",
    "siedemdziesiąt",
    "osiemdziesiąt",
    "dziewięćdziesiąt",
  ];
  const hundreds = [
    "",
    "sto",
    "dwieście",
    "trzysta",
    "czterysta",
    "pięćset",
    "sześćset",
    "siedemset",
    "osiemset",
    "dziewięćset",
  ];
  const thousands = ["", "tysiąc", "tysiące", "tysięcy"];

  const getUnit = (num: number): string => units[num];
  const getTeen = (num: number): string => teens[num - 10];
  const getTen = (num: number): string => tens[Math.floor(num / 10)];
  const getHundred = (num: number): string => hundreds[Math.floor(num / 100)];
  const getThousand = (num: number): string => {
    if (num === 1) return thousands[1];
    if (num > 1 && num < 5) return thousands[2];
    return thousands[3];
  };

  const convert = (num: number): string => {
    if (num === 0) return "zero";
    if (num < 10) return getUnit(num);
    if (num < 20) return getTeen(num);
    if (num < 100) return `${getTen(num)} ${getUnit(num % 10)}`.trim();
    if (num < 1000) return `${getHundred(num)} ${convert(num % 100)}`.trim();
    if (num < 1000000)
      return `${convert(Math.floor(num / 1000))} ${getThousand(
        Math.floor(num / 1000)
      )} ${convert(num % 1000)}`.trim();
    return "number too large";
  };

  const zloty = Math.floor(amount);
  const grosze = Math.round((amount - zloty) * 100);

  return `${convert(zloty)} PLN ${convert(grosze)} gr`.trim();
};
