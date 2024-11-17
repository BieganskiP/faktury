import { getSellerCompanies } from "@/server/invoices";

import { CompaniesClient } from "@/components/companies-client";

export default async function Companies() {
  const sellerCompanies = await getSellerCompanies();

  return (
    <div className="container mx-auto p-6">
      <CompaniesClient initialCompanies={sellerCompanies} />
    </div>
  );
}
