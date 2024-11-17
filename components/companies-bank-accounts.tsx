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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addBankAccount,
  deleteBankAccount,
  updateBankAccount,
  getBankAccounts,
} from "@/server/invoices";
import { BankAccount } from "@/types/globals";

type BankAccountsDialogProps = {
  sellerId: string;
  sellerName: string;
};

export function BankAccountsDialog({
  sellerId,
  sellerName,
}: BankAccountsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null
  );

  const [formData, setFormData] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
  });

  const resetForm = () => {
    setFormData({ accountName: "", bankName: "", accountNumber: "" });
    setIsAddingNew(false);
    setEditingAccount(null);
  };

  const loadAccounts = async () => {
    const result = await getBankAccounts(sellerId);
    if (result.success && result.data) {
      setAccounts(result.data);
    }
  };

  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen) {
      await loadAccounts();
    }
    setOpen(newOpen);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;

      if (editingAccount) {
        result = await updateBankAccount(editingAccount.id, {
          ...formData,
          sellerId,
        });
      } else {
        result = await addBankAccount({
          sellerId,
          ...formData,
        });
      }

      if (result.success) {
        toast({
          title: "Sukces",
          description: `Konto bankowe zostało ${
            editingAccount ? "zaktualizowane" : "dodane"
          }`,
        });
        resetForm();
        loadAccounts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error managing bank account:", error);
      toast({
        title: "Błąd",
        description: `Nie udało się ${
          editingAccount ? "zaktualizować" : "dodać"
        } konta bankowego`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      const result = await deleteBankAccount(accountId);
      if (result.success) {
        toast({
          title: "Sukces",
          description: "Konto bankowe zostało usunięte",
        });
        loadAccounts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć konta bankowego",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
    });
    setIsAddingNew(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Zarządzaj kontami bankowymi</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Konta bankowe - {sellerName}</DialogTitle>
          <DialogDescription>
            Zarządzaj kontami bankowymi firmy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isAddingNew && (
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj nowe konto
            </Button>
          )}

          {isAddingNew && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Nazwa konta</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Nazwa banku</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Numer konta</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingAccount ? "Zapisz zmiany" : "Dodaj konto"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Anuluj
                </Button>
              </div>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa konta</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Numer konta</TableHead>
                <TableHead className="w-[100px]">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(account)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
