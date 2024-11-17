import { InvoiceItem } from "@/types/globals";

const roundTo2Decimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};

const formatNumberInput = (value: string): string => {
  return value.replace(/^0+(?=\d)/, "").replace(/[^\d.,]/g, "");
};

const calculateNetTotal = (items: InvoiceItem[]): number => {
  return roundTo2Decimals(
    items.reduce((sum, item) => sum + item.quantity * item.netPrice, 0)
  );
};

const calculateVatTotal = (items: InvoiceItem[]): number => {
  return roundTo2Decimals(
    items.reduce((sum, item) => {
      const vatAmount = item.vatRate
        ? item.quantity * item.netPrice * (item.vatRate / 100)
        : 0;
      return sum + vatAmount;
    }, 0)
  );
};

const calculateGrossTotal = (items: InvoiceItem[]): number => {
  return roundTo2Decimals(
    items.reduce((sum, item) => sum + item.quantity * item.bruttoPrice, 0)
  );
};

export {
  roundTo2Decimals,
  formatNumberInput,
  calculateNetTotal,
  calculateVatTotal,
  calculateGrossTotal,
};
