export interface InvoiceItem {
  description: string;
  quantity: number;
  netPrice: number;
  bruttoPrice: number;
  vatRate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  dateIssued: string;
  dateSale: string;
  seller: {
    companyId: string;
    name: string;
    address: string;
    nip: string;
    bankAccount: string;
  };
  buyer: {
    name: string;
    address: string;
    nip: string;
  };
  items: InvoiceItem[];
}

export interface PDFProps {
  data: InvoiceData;
}
