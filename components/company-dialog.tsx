"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addSellerCompany,
  addBuyerCompany,
  getSellerCompaniesSimple,
  updateSellerCompany,
  updateBuyerCompany,
} from "@/server/invoices";
import { useToast } from "@/hooks/use-toast";
import { SellerCompany, BuyerCompany } from "@/types/globals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type CompanyDialogProps<T extends BuyerCompany | SellerCompany> = {
  onCompanyAdded: (company: T) => void;
  existingCompany?: {
    type: "seller" | "buyer";
    data: T;
  };
};

export function AddCompanyDialog<T extends BuyerCompany | SellerCompany>({
  onCompanyAdded,
  existingCompany,
}: CompanyDialogProps<T>) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sellers, setSellers] = useState<{ id: string; name: string }[]>([]);

  const [sellerData, setSellerData] = useState({
    name:
      existingCompany?.type === "seller"
        ? (existingCompany.data as SellerCompany).name
        : "",
    address:
      existingCompany?.type === "seller"
        ? (existingCompany.data as SellerCompany).address
        : "",
    nip:
      existingCompany?.type === "seller"
        ? (existingCompany.data as SellerCompany).nip
        : "",
    bankAccounts:
      existingCompany?.type === "seller"
        ? (existingCompany.data as SellerCompany).bankAccounts
        : [],
  });

  const [buyerData, setBuyerData] = useState({
    name:
      existingCompany?.type === "buyer"
        ? (existingCompany.data as BuyerCompany).name
        : "",
    address:
      existingCompany?.type === "buyer"
        ? (existingCompany.data as BuyerCompany).address
        : "",
    nip:
      existingCompany?.type === "buyer"
        ? (existingCompany.data as BuyerCompany).nip
        : "",
    sellerId:
      existingCompany?.type === "buyer"
        ? (existingCompany.data as BuyerCompany).sellerId
        : "",
  });

  useEffect(() => {
    const fetchSellers = async () => {
      const result = await getSellerCompaniesSimple();
      if (result.success && result.data) {
        setSellers(result.data);
      }
    };
    fetchSellers();
  }, []);

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = existingCompany?.data?.id
        ? await updateSellerCompany(existingCompany.data.id, sellerData)
        : await addSellerCompany(sellerData);

      if (result.success && result.data) {
        toast({
          title: "Sukces",
          description: `Firma została ${
            existingCompany ? "zaktualizowana" : "dodana"
          } pomyślnie`,
        });
        onCompanyAdded(result.data as T);
        setOpen(false);
      } else {
        toast({
          title: "Błąd",
          description:
            result.error ||
            `Nie udało się ${
              existingCompany ? "zaktualizować" : "dodać"
            } firmy`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error handling seller company:", err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    }
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (existingCompany?.data?.id) {
        const updateData = {
          name: buyerData.name,
          address: buyerData.address,
          nip: buyerData.nip,
        };
        const result = await updateBuyerCompany(
          existingCompany.data.id,
          updateData
        );
        if (result.success && result.data) {
          toast({
            title: "Sukces",
            description: "Firma została zaktualizowana pomyślnie",
          });
          onCompanyAdded(result.data as T);
          setOpen(false);
        } else {
          toast({
            title: "Błąd",
            description: result.error || "Nie udało się zaktualizować firmy",
            variant: "destructive",
          });
        }
      } else {
        const result = await addBuyerCompany(buyerData);
        if (result.success && result.data) {
          toast({
            title: "Sukces",
            description: "Firma została dodana pomyślnie",
          });
          onCompanyAdded(result.data as T);
          setOpen(false);
        } else {
          toast({
            title: "Błąd",
            description: result.error || "Nie udało się dodać firmy",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Error handling buyer company:", err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {existingCompany ? "Edytuj dane firmy" : "Dodaj firmę"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nową firmę</DialogTitle>
          <DialogDescription>
            Wypełnij dane firmy. Możesz dodać firmę jako sprzedawcę lub nabywcę.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="seller" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seller">Sprzedawca</TabsTrigger>
            <TabsTrigger value="buyer">Nabywca</TabsTrigger>
          </TabsList>

          <TabsContent value="seller">
            <form onSubmit={handleSellerSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="seller-name">Nazwa firmy</Label>
                <Input
                  id="seller-name"
                  value={sellerData.name}
                  onChange={(e) =>
                    setSellerData({ ...sellerData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller-address">Adres</Label>
                <Input
                  id="seller-address"
                  value={sellerData.address}
                  onChange={(e) =>
                    setSellerData({ ...sellerData, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller-nip">NIP</Label>
                <Input
                  id="seller-nip"
                  value={sellerData.nip}
                  onChange={(e) =>
                    setSellerData({ ...sellerData, nip: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {existingCompany ? "Zapisz zmiany" : "Dodaj sprzedawcę"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="buyer">
            <form onSubmit={handleBuyerSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="buyer-name">Nazwa firmy</Label>
                <Input
                  id="buyer-name"
                  value={buyerData.name}
                  onChange={(e) =>
                    setBuyerData({ ...buyerData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyer-address">Adres</Label>
                <Input
                  id="buyer-address"
                  value={buyerData.address}
                  onChange={(e) =>
                    setBuyerData({ ...buyerData, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyer-nip">NIP</Label>
                <Input
                  id="buyer-nip"
                  value={buyerData.nip}
                  onChange={(e) =>
                    setBuyerData({ ...buyerData, nip: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller-select">Sprzedawca</Label>
                <Select
                  value={buyerData.sellerId}
                  onValueChange={(value) =>
                    setBuyerData({ ...buyerData, sellerId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <span>
                      {sellers.find((s) => s.id === buyerData.sellerId)?.name ||
                        "Wybierz sprzedawcę"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                {existingCompany ? "Zapisz zmiany" : "Dodaj nabywcę"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
