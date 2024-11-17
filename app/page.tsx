"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import data from "@/data/settings.json";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { numberToWords } from "@/lib/useNumbersToWords";
import {
  roundTo2Decimals,
  formatNumberInput,
  calculateNetTotal,
  calculateVatTotal,
  calculateGrossTotal,
} from "@/lib/useMathHelpers";
import { InvoiceData, PDFProps } from "@/types/globals";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/fonts/Roboto-Thin.ttf",
      fontWeight: 100,
    },
    {
      src: "/fonts/Roboto-Light.ttf",
      fontWeight: 300,
    },
    {
      src: "/fonts/Roboto-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Roboto-Medium.ttf",
      fontWeight: 500,
    },
    {
      src: "/fonts/Roboto-Bold.ttf",
      fontWeight: 700,
    },
    {
      src: "/fonts/Roboto-Black.ttf",
      fontWeight: 900,
    },
    {
      src: "/fonts/Roboto-ThinItalic.ttf",
      fontWeight: 100,
      fontStyle: "italic",
    },
    {
      src: "/fonts/Roboto-LightItalic.ttf",
      fontWeight: 300,
      fontStyle: "italic",
    },
    {
      src: "/fonts/Roboto-Italic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "/fonts/Roboto-MediumItalic.ttf",
      fontWeight: 500,
      fontStyle: "italic",
    },
    {
      src: "/fonts/Roboto-BoldItalic.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
    {
      src: "/fonts/Roboto-BlackItalic.ttf",
      fontWeight: 900,
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 10,
    fontWeight: 400,
  },
  header: {
    fontSize: 12,
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
  },
  dates: {
    marginBottom: 15,
  },
  dateLabel: {
    fontWeight: 700,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: "#000",
    marginVertical: 10,
  },
  partiesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  partySection: {
    flex: 1,
    paddingRight: 20,
  },
  partyHeader: {
    fontWeight: 700,
    marginBottom: 5,
  },
  tableContainer: {
    marginVertical: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f6f6f6",
    padding: 5,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  summarySection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  summaryLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
  },
  summaryValue: {
    width: 80,
    textAlign: "right",
  },
  totalSection: {
    marginTop: 20,
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 700,
  },
  amountInWords: {
    marginTop: 5,
    fontStyle: "italic",
  },
  bankDetails: {
    marginTop: 20,
    fontSize: 9,
  },
});

const InvoicePDF: React.FC<PDFProps> = ({ data }) => {
  try {
    const totalAmount = calculateGrossTotal(data.items);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header Section */}
          <Text style={styles.invoiceNumber}>
            Faktura VAT {data.invoiceNumber}
          </Text>

          <View style={styles.dates}>
            <Text>
              <Text style={styles.dateLabel}>Data wystawienia: </Text>
              {data.dateIssued}
            </Text>
            <Text>
              <Text style={styles.dateLabel}>Data sprzedaży: </Text>
              {data.dateSale}
            </Text>
          </View>

          <View style={styles.separator} />

          {/* Parties Section */}
          <View style={styles.partiesContainer}>
            <View style={styles.partySection}>
              <Text style={styles.partyHeader}>Sprzedawca:</Text>
              <Text>{data.seller.name}</Text>
              <Text>{data.seller.address}</Text>
              <Text>NIP: {data.seller.nip}</Text>
            </View>
            <View style={styles.partySection}>
              <Text style={styles.partyHeader}>Nabywca:</Text>
              <Text>{data.buyer.name}</Text>
              <Text>{data.buyer.address}</Text>
              <Text>NIP: {data.buyer.nip}</Text>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={{ flex: 4 }}>Opis</Text>
              <Text style={{ flex: 1, textAlign: "right" }}>Ilość</Text>
              <Text style={{ flex: 2, textAlign: "right" }}>Cena netto</Text>
              <Text style={{ flex: 1, textAlign: "right" }}>VAT</Text>
              <Text style={{ flex: 2, textAlign: "right" }}>
                Wartość brutto
              </Text>
            </View>
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={{ flex: 4 }}>{item.description}</Text>
                <Text style={{ flex: 1, textAlign: "right" }}>
                  {item.quantity}
                </Text>
                <Text style={{ flex: 2, textAlign: "right" }}>
                  {item.netPrice.toFixed(2)}
                </Text>
                <Text style={{ flex: 1, textAlign: "right" }}>
                  {item.vatRate}%
                </Text>
                <Text style={{ flex: 2, textAlign: "right" }}>
                  {item.bruttoPrice.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wartość netto:</Text>
              <Text style={styles.summaryValue}>
                {calculateNetTotal(data.items).toFixed(2)} PLN
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wartość VAT:</Text>
              <Text style={styles.summaryValue}>
                {calculateVatTotal(data.items).toFixed(2)} PLN
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wartość brutto:</Text>
              <Text style={styles.summaryValue}>
                {totalAmount.toFixed(2)} PLN
              </Text>
            </View>
          </View>

          {/* Total Amount Section */}
          <View style={styles.totalSection}>
            <Text style={styles.totalAmount}>
              Do zapłaty: {totalAmount.toFixed(2)} PLN
            </Text>
            <Text style={styles.amountInWords}>
              Słownie: {numberToWords(totalAmount)}
            </Text>
          </View>

          {/* Bank Details */}
          {data.seller.bankAccount && (
            <View style={styles.bankDetails}>
              <Text>Dane do przelewu:</Text>
              <Text>{data.seller.bankAccount}</Text>
              <Text>Termin płatności: 14 dni</Text>
            </View>
          )}
        </Page>
      </Document>
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error generating PDF. Please try again.</Text>
        </Page>
      </Document>
    );
  }
};

const PDFPreview: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDF data={data} />}
      fileName={`Faktura_${data.invoiceNumber}.pdf`}
    >
      <Button size="lg">Generuj fakturę</Button>
    </PDFDownloadLink>
  );
};

export default function Home() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    dateIssued: "",
    dateSale: "",
    seller: {
      companyId: "",
      name: "",
      address: "",
      nip: "",
      bankAccount: "",
    },
    buyer: {
      name: "",
      address: "",
      nip: "",
    },
    items: [
      {
        description: "",
        quantity: 1,
        netPrice: 0,
        bruttoPrice: 0,
        vatRate: 23,
      },
    ],
  });

  const debouncedInvoiceData = useMemo(() => invoiceData, [invoiceData]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Generator Faktur</h1>

      <div className="space-y-6">
        {/* Invoice Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dane faktury</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Numer faktury</Label>
              <Input
                id="invoiceNumber"
                placeholder="FV/2024/04/001"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateIssued">Data wystawienia</Label>
              <Input
                id="dateIssued"
                type="date"
                value={invoiceData.dateIssued}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    dateIssued: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateSale">Data sprzedaży</Label>
              <Input
                id="dateSale"
                type="date"
                value={invoiceData.dateSale}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    dateSale: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Seller Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sprzedawca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sellerCompany">Wybierz firmę</Label>
              <Select
                onValueChange={(value) => {
                  const selectedCompany = data.companies.find(
                    (c) => c.id === value
                  );
                  if (selectedCompany) {
                    setInvoiceData({
                      ...invoiceData,
                      seller: {
                        ...invoiceData.seller,
                        companyId: value,
                        name: selectedCompany.name,
                        address: `${selectedCompany.address.street}, ${selectedCompany.address.postalCode} ${selectedCompany.address.city}`,
                        nip: selectedCompany.nip,
                      },
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz firmę" />
                </SelectTrigger>
                <SelectContent>
                  {data.companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellerName">Nazwa</Label>
                <Input
                  id="sellerName"
                  value={invoiceData.seller.name}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      seller: { ...invoiceData.seller, name: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerNIP">NIP</Label>
                <Input
                  id="sellerNIP"
                  value={invoiceData.seller.nip}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      seller: { ...invoiceData.seller, nip: e.target.value },
                    })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="sellerAddress">Adres</Label>
                <Input
                  id="sellerAddress"
                  value={invoiceData.seller.address}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      seller: {
                        ...invoiceData.seller,
                        address: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Nabywca</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName">Nazwa</Label>
              <Input
                id="buyerName"
                value={invoiceData.buyer.name}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    buyer: { ...invoiceData.buyer, name: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerNIP">NIP</Label>
              <Input
                id="buyerNIP"
                value={invoiceData.buyer.nip}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    buyer: { ...invoiceData.buyer, nip: e.target.value },
                  })
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="buyerAddress">Adres</Label>
              <Input
                id="buyerAddress"
                value={invoiceData.buyer.address}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    buyer: { ...invoiceData.buyer, address: e.target.value },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pozycje na fakturze</CardTitle>
            <Button
              variant="outline"
              onClick={() =>
                setInvoiceData({
                  ...invoiceData,
                  items: [
                    ...invoiceData.items,
                    {
                      description: "",
                      quantity: 1,
                      netPrice: 0,
                      bruttoPrice: 0,
                      vatRate: 23,
                    },
                  ],
                })
              }
            >
              Dodaj pozycję
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoiceData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 items-end border-b pb-4"
              >
                <div className="col-span-4 space-y-2">
                  <Label>Opis</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      newItems[index].description = e.target.value;
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label>Ilość</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      newItems[index].quantity = Number(e.target.value);
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Cena netto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.netPrice}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      const netValue = Number(
                        formatNumberInput(e.target.value)
                      );
                      const vatRate = newItems[index].vatRate || 0;

                      newItems[index] = {
                        ...newItems[index],
                        netPrice: roundTo2Decimals(netValue),
                        bruttoPrice: roundTo2Decimals(
                          netValue * (1 + vatRate / 100)
                        ),
                      };

                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Cena brutto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.bruttoPrice}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      const bruttoValue = Number(
                        formatNumberInput(e.target.value)
                      );
                      const vatRate = newItems[index].vatRate || 0;

                      newItems[index] = {
                        ...newItems[index],
                        bruttoPrice: roundTo2Decimals(bruttoValue),
                        netPrice: roundTo2Decimals(
                          bruttoValue / (1 + vatRate / 100)
                        ),
                      };

                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>VAT</Label>
                  <Select
                    value={String(item.vatRate)}
                    onValueChange={(value) => {
                      const newItems = [...invoiceData.items];
                      const vatRate = value === "null" ? 0 : Number(value);
                      const netPrice = newItems[index].netPrice;

                      newItems[index] = {
                        ...newItems[index],
                        vatRate: vatRate,
                        bruttoPrice: roundTo2Decimals(
                          netPrice * (1 + vatRate / 100)
                        ),
                      };

                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {data.vatRates.map((rate) => (
                        <SelectItem key={rate.code} value={String(rate.rate)}>
                          {rate.description} ({rate.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      const newItems = invoiceData.items.filter(
                        (_, i) => i !== index
                      );
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}

            {/* Summary section */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-end text-sm">
                <div className="w-48 grid grid-cols-2 gap-2">
                  <span>Suma netto:</span>
                  <span className="text-right">
                    {calculateNetTotal(invoiceData.items).toFixed(2)} PLN
                  </span>
                  <span>VAT:</span>
                  <span className="text-right">
                    {calculateVatTotal(invoiceData.items).toFixed(2)} PLN
                  </span>
                  <span className="font-bold">Suma brutto:</span>
                  <span className="font-bold text-right">
                    {calculateGrossTotal(invoiceData.items).toFixed(2)} PLN
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Account Selection */}
        {invoiceData.seller.companyId && (
          <Card>
            <CardHeader>
              <CardTitle>Dane do przelewu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Konto bankowe</Label>
                <Select
                  value={invoiceData.seller.bankAccount}
                  onValueChange={(value) => {
                    setInvoiceData({
                      ...invoiceData,
                      seller: { ...invoiceData.seller, bankAccount: value },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz konto bankowe" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.companies
                      .find((c) => c.id === invoiceData.seller.companyId)
                      ?.bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.departmentName} - {account.accountNumber}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Invoice Button */}
        <div className="flex justify-end mt-6">
          <PDFPreview data={debouncedInvoiceData} />
        </div>
      </div>
    </div>
  );
}
