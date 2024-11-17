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
    bankAccount?: string;
    name: string;
    address: string;
    nip: string;
  };
  buyer: {
    companyId: string;
    name: string;
    address: string;
    nip: string;
  };
  items: InvoiceItem[];
}

export interface PDFProps {
  data: InvoiceData;
}

export type BankAccount = {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  sellerId: string;
};

export type SellerCompany = {
  id: string;
  name: string;
  address: string;
  nip: string;
  bankAccounts: BankAccount[];
};

export type BuyerCompany = {
  id: string;
  name: string;
  address: string;
  nip: string;
  sellerId: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
