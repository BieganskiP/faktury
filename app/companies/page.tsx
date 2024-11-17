import { getSellerCompanies, getBuyerCompanies } from "@/server/invoices";

import { CompaniesClient } from "@/components/companies-client";
import { BuyerCompaniesClient } from "@/components/buyer-company-client";

export default async function Companies() {
  const sellerCompanies = await getSellerCompanies();
  const buyerCompanies = await getBuyerCompanies();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CompaniesClient initialCompanies={sellerCompanies} />
      <BuyerCompaniesClient initialCompanies={buyerCompanies} />
    </div>
  );
}
