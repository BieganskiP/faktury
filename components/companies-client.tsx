"use client";

import { AddCompanyDialog } from "@/components/company-dialog";
import { Button } from "@/components/ui/button";
import { deleteSellerCompany } from "@/server/invoices";
import { useState } from "react";
import { ApiResponse, SellerCompany } from "@/types/globals";
import { BankAccountsDialog } from "@/components/companies-bank-accounts";
type CompaniesClientProps = {
  initialCompanies: ApiResponse<SellerCompany[]>;
};

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const [companies, setCompanies] = useState(initialCompanies);

  const handleDelete = async (id: string) => {
    const result = await deleteSellerCompany(id);
    if (result.success) {
      setCompanies({
        ...companies,
        data: companies.data?.filter((company) => company.id !== id),
      });
    }
  };
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Firmy</h1>
        <AddCompanyDialog
          onCompanyAdded={(newCompany: SellerCompany) => {
            setCompanies({
              ...companies,
              data: [...(companies.data || []), newCompany],
            });
          }}
        />
      </div>
      <div>
        {companies.success ? (
          <ul className="space-y-2">
            {companies?.data?.map((company) => (
              <li
                key={company.id}
                className="flex justify-between items-center"
              >
                <span>
                  {company.name}, {company.address}, {company.nip},{" "}
                  {company.bankAccounts
                    .map((bankAccount) => bankAccount.accountName)
                    .join(", ")}
                </span>
                <div className="flex gap-2">
                  <BankAccountsDialog
                    sellerId={company.id}
                    sellerName={company.name}
                  />
                  <Button
                    onClick={() => handleDelete(company.id)}
                    variant="destructive"
                  >
                    Usuń
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nie udało się załadować firm.</p>
        )}
      </div>
    </>
  );
}
