"use client";

import { useState } from "react";
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
import { addSellerCompany, addBuyerCompany } from "@/server/invoices";
import { useToast } from "@/hooks/use-toast";
import { SellerCompany } from "@/types/globals";

type AddCompanyDialogProps = {
  onCompanyAdded: (company: SellerCompany) => void;
};

export function AddCompanyDialog({ onCompanyAdded }: AddCompanyDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [sellerData, setSellerData] = useState({
    name: "",
    address: "",
    nip: "",
    bankAccounts: [], // Empty array for initial creation
  });

  const [buyerData, setBuyerData] = useState({
    name: "",
    address: "",
    nip: "",
    sellerId: "",
  });

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await addSellerCompany(sellerData);
      if (result.success && result.data) {
        toast({
          title: "Sukces",
          description: "Firma została dodana pomyślnie",
        });
        onCompanyAdded(result.data);
        setOpen(false);
        setSellerData({ name: "", address: "", nip: "", bankAccounts: [] });
      } else {
        toast({
          title: "Błąd",
          description: result.error || "Nie udało się dodać firmy",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error adding seller company:", err);
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
      const result = await addBuyerCompany(buyerData);
      if (result.success && result.data) {
        toast({
          title: "Sukces",
          description: "Firma została dodana pomyślnie",
        });
        setOpen(false);
        setBuyerData({ name: "", address: "", nip: "", sellerId: "" });
      } else {
        toast({
          title: "Błąd",
          description: result.error || "Nie udało się dodać firmy",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error adding buyer company:", err);
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
          Dodaj firmę
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
                Dodaj sprzedawcę
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

              <Button type="submit" className="w-full">
                Dodaj nabywcę
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
