"use client";

import { useState, useEffect } from "react";
import {
  getInvoicesList,
  getSellerCompanies,
  deleteInvoice,
} from "@/server/invoices";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SellerCompany } from "@/types/globals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Create a separate interface for invoice list items
interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  dateIssued: string; // Changed from Date to string to match API response
  dateSale: string; // Changed from Date to string to match API response
  seller: {
    id: string;
    name: string;
  };
  buyer: {
    id: string;
    name: string;
  };
  items: {
    netPrice: number;
    bruttoPrice: number;
    quantity: number;
  }[];
  totals: {
    netTotal: number;
    bruttoTotal: number;
  };
}

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [sellers, setSellers] = useState<SellerCompany[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{
    id: string;
    number: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSellers = async () => {
      const response = await getSellerCompanies();
      if (response.success && response.data) {
        setSellers(response.data);
      }
    };
    loadSellers();
  }, []);

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      const response = await getInvoicesList(selectedSeller || undefined);
      if (response.success && response.data) {
        setInvoices(response.data);
      }
      setIsLoading(false);
    };
    loadInvoices();
  }, [selectedSeller]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteInvoice(invoiceToDelete.id);

      if (response.success) {
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice.id !== invoiceToDelete.id)
        );
        toast({
          title: "Sukces",
          description: `Faktura ${invoiceToDelete.number} została usunięta`,
        });
        setDialogOpen(false);
      } else {
        throw new Error(response.error);
      }
    } catch {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć faktury",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setInvoiceToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista faktur</h1>
        <div className="w-72">
          <Select
            value={selectedSeller || undefined}
            onValueChange={setSelectedSeller}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtruj po sprzedawcy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie faktury</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div>Ładowanie...</div>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-500">
                      Data wystawienia: {formatDate(invoice.dateIssued)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sprzedawca: {invoice.seller.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Nabywca: {invoice.buyer.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="text-right">
                      <p className="text-sm">
                        Netto: {invoice.totals.netTotal.toFixed(2)} PLN
                      </p>
                      <p className="font-medium">
                        Brutto: {invoice.totals.bruttoTotal.toFixed(2)} PLN
                      </p>
                    </div>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        disabled={isDeleting}
                        onClick={() =>
                          setInvoiceToDelete({
                            id: invoice.id,
                            number: invoice.invoiceNumber,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Czy na pewno chcesz usunąć tę fakturę?</DialogTitle>
              <DialogDescription>
                {invoiceToDelete && (
                  <>
                    Faktura {invoiceToDelete.number} zostanie trwale usunięta.
                    Tej operacji nie można cofnąć.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setInvoiceToDelete(null);
                }}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteInvoice}
                disabled={isDeleting}
              >
                {isDeleting ? "Usuwanie..." : "Usuń"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
