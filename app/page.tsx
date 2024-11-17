"use client";

import { useState, useEffect } from "react";
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
  calculateNetTotal,
  calculateVatTotal,
  calculateGrossTotal,
} from "@/lib/useMathHelpers";
import {
  BankAccount,
  BuyerCompany,
  InvoiceData,
  PDFProps,
} from "@/types/globals";
import {
  createInvoice,
  getSellerCompanies,
  getBuyersForSeller,
  getBankAccounts,
} from "@/server/invoices";

import { ApiResponse, SellerCompany } from "@/types/globals";
import { useToast } from "@/hooks/use-toast";

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

  const isValidData =
    data.items.length > 0 && data.invoiceNumber && data.dateIssued;

  if (!isClient || !isValidData) {
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
  const { toast } = useToast();
  const [companiesData, setCompaniesData] = useState<
    ApiResponse<SellerCompany[]>
  >({
    success: false,
  });
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
      companyId: "",
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
  const [buyers, setBuyers] = useState<BuyerCompany[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isNewBuyer, setIsNewBuyer] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await getSellerCompanies();
      setCompaniesData(response);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchBuyersAndAccounts = async () => {
      if (invoiceData.seller.companyId) {
        // Fetch buyers
        const buyersResult = await getBuyersForSeller(
          invoiceData.seller.companyId
        );
        if (buyersResult.success && buyersResult.data) {
          const formattedBuyers = buyersResult.data.map((buyer) => ({
            ...buyer,
            sellerId: invoiceData.seller.companyId,
          }));
          setBuyers(formattedBuyers);
        }

        // Fetch bank accounts
        const accountsResult = await getBankAccounts(
          invoiceData.seller.companyId
        );
        if (accountsResult.success && accountsResult.data) {
          setBankAccounts(accountsResult.data);
        }
      }
    };

    fetchBuyersAndAccounts();
  }, [invoiceData.seller.companyId]);

  const handleCreateInvoice = async () => {
    // Validate required fields
    if (
      !invoiceData.invoiceNumber ||
      !invoiceData.dateIssued ||
      !invoiceData.dateSale
    ) {
      toast({
        title: "Błąd",
        description: "Uzupełnij podstawowe dane faktury (numer, daty)",
        variant: "destructive",
      });
      return;
    }

    if (!invoiceData.seller.companyId || !invoiceData.seller.bankAccount) {
      toast({
        title: "Błąd",
        description: "Wybierz sprzedawcę i konto bankowe",
        variant: "destructive",
      });
      return;
    }

    // Validate buyer data
    if (!isNewBuyer && !invoiceData.buyer.companyId) {
      toast({
        title: "Błąd",
        description: "Wybierz nabywcę",
        variant: "destructive",
      });
      return;
    }

    if (
      isNewBuyer &&
      (!invoiceData.buyer.name ||
        !invoiceData.buyer.address ||
        !invoiceData.buyer.nip)
    ) {
      toast({
        title: "Błąd",
        description: "Uzupełnij dane nowego nabywcy",
        variant: "destructive",
      });
      return;
    }

    // Validate items
    if (
      !invoiceData.items.length ||
      !invoiceData.items.every(
        (item) =>
          item.description &&
          item.quantity > 0 &&
          item.netPrice > 0 &&
          item.bruttoPrice > 0
      )
    ) {
      toast({
        title: "Błąd",
        description: "Uzupełnij wszystkie pozycje faktury",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare the invoice data
      const invoicePayload = {
        ...invoiceData,
        buyer: {
          ...invoiceData.buyer,
          companyId: isNewBuyer ? "0" : invoiceData.buyer.companyId,
        },
        items: invoiceData.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          netPrice: Number(item.netPrice),
          bruttoPrice: Number(item.bruttoPrice),
          vatRate: Number(item.vatRate),
        })),
      };

      const response = await createInvoice(invoicePayload);

      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Sukces",
        description: "Faktura została utworzona",
      });

      // Reset form
      setInvoiceData({
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
          companyId: "",
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
      setIsNewBuyer(false);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast({
        title: "Błąd",
        description:
          error instanceof Error
            ? error.message
            : "Nie udało się utworzyć faktury",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nowa Faktura</h1>

      <div className="space-y-6">
        {/* Invoice Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dane faktury</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Numer faktury</Label>
              <Input
                id="invoice-number"
                name="invoice-number"
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
              <Label htmlFor="date-issued">Data wystawienia</Label>
              <Input
                id="date-issued"
                name="date-issued"
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
              <Label htmlFor="date-sale">Data sprzedaży</Label>
              <Input
                id="date-sale"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprzedawca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Wybierz firmę</Label>
                <Select
                  onValueChange={(value) => {
                    const selectedCompany = companiesData.data?.find(
                      (c) => c.id === value
                    );
                    if (selectedCompany) {
                      setInvoiceData({
                        ...invoiceData,
                        seller: {
                          ...invoiceData.seller,
                          companyId: value,
                          name: selectedCompany.name,
                          address: selectedCompany.address,
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
                    {companiesData.data?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {invoiceData.seller.companyId && (
                <div className="space-y-2">
                  <Label>Konto bankowe</Label>
                  <Select
                    value={invoiceData.seller.bankAccount}
                    onValueChange={(value) => {
                      setInvoiceData({
                        ...invoiceData,
                        seller: {
                          ...invoiceData.seller,
                          bankAccount: value,
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz konto bankowe" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} - {account.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seller-name">Nazwa</Label>
                  <Input
                    name="seller-name"
                    id="seller-name"
                    value={invoiceData.seller.name}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seller-nip">NIP</Label>
                  <Input
                    name="seller-nip"
                    id="seller-nip"
                    value={invoiceData.seller.nip}
                    readOnly
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="seller-address">Adres</Label>
                  <Input
                    name="seller-address"
                    id="seller-address"
                    value={invoiceData.seller.address}
                    readOnly
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
            <CardContent>
              <div className="space-y-4">
                {invoiceData.seller.companyId && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Label>Wybierz istniejącego nabywcę</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsNewBuyer(!isNewBuyer)}
                      >
                        {isNewBuyer ? "Wybierz istniejącego" : "Dodaj nowego"}
                      </Button>
                    </div>

                    {!isNewBuyer ? (
                      <Select
                        value={invoiceData.buyer.companyId}
                        onValueChange={(value) => {
                          const selectedBuyer = buyers.find(
                            (b) => b.id === value
                          );
                          if (selectedBuyer) {
                            setInvoiceData({
                              ...invoiceData,
                              buyer: {
                                companyId: value,
                                name: selectedBuyer.name,
                                address: selectedBuyer.address,
                                nip: selectedBuyer.nip,
                              },
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz nabywcę" />
                        </SelectTrigger>
                        <SelectContent>
                          {buyers.map((buyer) => (
                            <SelectItem key={buyer.id} value={buyer.id}>
                              {buyer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label>Nazwa firmy</Label>
                          <Input
                            value={invoiceData.buyer.name}
                            onChange={(e) =>
                              setInvoiceData({
                                ...invoiceData,
                                buyer: {
                                  ...invoiceData.buyer,
                                  companyId: "0",
                                  name: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Adres</Label>
                          <Input
                            value={invoiceData.buyer.address}
                            onChange={(e) =>
                              setInvoiceData({
                                ...invoiceData,
                                buyer: {
                                  ...invoiceData.buyer,
                                  address: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>NIP</Label>
                          <Input
                            value={invoiceData.buyer.nip}
                            onChange={(e) =>
                              setInvoiceData({
                                ...invoiceData,
                                buyer: {
                                  ...invoiceData.buyer,
                                  nip: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4"
              >
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor={`item-description-${index}`}>Opis</Label>
                  <Input
                    id={`item-description-${index}`}
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      newItems[index].description = e.target.value;
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor={`item-quantity-${index}`}>Ilość</Label>
                  <Input
                    id={`item-quantity-${index}`}
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
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`item-net-price-${index}`}>Cena netto</Label>
                  <Input
                    id={`item-net-price-${index}`}
                    type="number"
                    step="0.01"
                    value={item.netPrice}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      const netValue = Number(e.target.value);
                      const vatRate = newItems[index].vatRate;
                      newItems[index] = {
                        ...newItems[index],
                        netPrice: netValue,
                        bruttoPrice: netValue * (1 + vatRate / 100),
                      };
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`item-vat-rate-${index}`}>Stawka VAT</Label>
                  <Select
                    value={String(item.vatRate)}
                    onValueChange={(value) => {
                      const newItems = [...invoiceData.items];
                      const vatRate = Number(value);
                      newItems[index] = {
                        ...newItems[index],
                        vatRate,
                        bruttoPrice:
                          newItems[index].netPrice * (1 + vatRate / 100),
                      };
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="23">23%</SelectItem>
                      <SelectItem value="8">8%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="0">0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`item-brutto-price-${index}`}>
                    Cena brutto
                  </Label>
                  <Input
                    id={`item-brutto-price-${index}`}
                    type="number"
                    step="0.01"
                    value={item.bruttoPrice}
                    readOnly
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={invoiceData.items.length === 1}
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

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Anuluj</Button>
          <Button onClick={handleCreateInvoice}>Zapisz fakturę</Button>
        </div>

        {/* PDF Preview */}
        <div className="mt-6">
          <PDFPreview data={invoiceData} />
        </div>
      </div>
    </div>
  );
}
