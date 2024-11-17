"use client";
import { ApiResponse, BuyerCompany } from "@/types/globals";
import { useState } from "react";
import { deleteBuyerCompany } from "@/server/invoices";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type BuyerCompaniesClientProps = {
  initialCompanies: ApiResponse<BuyerCompany[]>;
};

export function BuyerCompaniesClient({
  initialCompanies,
}: BuyerCompaniesClientProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState(initialCompanies);

  const handleDelete = async (id: string) => {
    const result = await deleteBuyerCompany(id);
    if (result.success) {
      setCompanies({
        ...companies,
        data: companies.data?.filter((company) => company.id !== id),
      });
      toast({
        title: "Kontrahent usunięty",
        description: "Kontrahent został pomyślnie usunięty.",
      });
    } else {
      toast({
        title: "Błąd",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kontrahenci</h1>
      </div>
      <div>
        {companies.success ? (
          <ul className="space-y-2">
            {companies?.data?.map((company) => (
              <li
                key={company.id}
                className="flex justify-between items-center p-4 border rounded-lg shadow-sm"
              >
                <span>
                  {company.name}, {company.address}, {company.nip}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(company.id)}
                >
                  Usuń
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nie udało się załadować kontrahentów.</p>
        )}
      </div>
    </>
  );
}
