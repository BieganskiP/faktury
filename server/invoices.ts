"use server";
import { InvoiceData } from "@/types/globals";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Seller Company Actions
export async function addSellerCompany(data: {
  name: string;
  address: string;
  nip: string;
  bankAccounts: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  }[];
}) {
  try {
    const company = await prisma.sellerCompany.create({
      data: {
        name: data.name,
        address: data.address,
        nip: data.nip,
        bankAccounts: {
          create: data.bankAccounts,
        },
      },
      include: {
        bankAccounts: true,
      },
    });
    revalidatePath("/");
    return { success: true, data: company };
  } catch (error) {
    console.error("Failed to add seller company:", error);
    return { success: false, error: "Failed to add seller company" };
  }
}

export async function addBankAccount(data: {
  sellerId: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
}) {
  try {
    const bankAccount = await prisma.bankAccount.create({
      data: {
        sellerId: data.sellerId,
        accountName: data.accountName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
      },
    });
    revalidatePath("/");
    return { success: true, data: bankAccount };
  } catch (error) {
    console.error("Failed to add bank account:", error);
    return { success: false, error: "Failed to add bank account" };
  }
}

export async function getSellerCompanies() {
  try {
    const companies = await prisma.sellerCompany.findMany({
      include: {
        bankAccounts: true,
      },
    });
    return { success: true, data: companies };
  } catch (error) {
    console.error("Failed to get seller companies:", error);
    return { success: false, error: "Failed to get seller companies" };
  }
}

export async function getBankAccounts(sellerId: string) {
  try {
    const accounts = await prisma.bankAccount.findMany({
      where: {
        sellerId: sellerId,
      },
    });
    return { success: true, data: accounts };
  } catch (error) {
    console.error("Failed to get bank accounts:", error);
    return { success: false, error: "Failed to get bank accounts" };
  }
}

export async function deleteBankAccount(id: string) {
  try {
    await prisma.bankAccount.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete bank account:", error);
    return { success: false, error: "Failed to delete bank account" };
  }
}

export async function updateSellerCompany(
  id: string,
  data: {
    name?: string;
    address?: string;
    nip?: string;
  }
) {
  try {
    const company = await prisma.sellerCompany.update({
      where: { id },
      data,
      include: {
        bankAccounts: true,
      },
    });
    revalidatePath("/");
    return { success: true, data: company };
  } catch (error) {
    console.error("Failed to update seller company:", error);
    return { success: false, error: "Failed to update seller company" };
  }
}

// Buyer Company Actions
export async function addBuyerCompany(data: {
  name: string;
  address: string;
  nip: string;
  sellerId: string;
}) {
  try {
    const buyer = await prisma.buyerCompany.create({
      data: {
        name: data.name,
        address: data.address,
        nip: data.nip,
        sellers: {
          connect: { id: data.sellerId },
        },
      },
    });
    revalidatePath("/");
    return { success: true, data: buyer };
  } catch (error) {
    console.error("Failed to add buyer company:", error);
    return { success: false, error: "Failed to add buyer company" };
  }
}

export async function getBuyersForSeller(sellerId: string) {
  try {
    const buyers = await prisma.buyerCompany.findMany({
      where: {
        OR: [
          {
            sellers: {
              some: {
                id: sellerId,
              },
            },
          },
          {
            id: "0",
          },
        ],
      },
    });
    return { success: true, data: buyers };
  } catch (error) {
    console.error("Failed to get buyers:", error);
    return { success: false, error: "Failed to get buyers" };
  }
}

// Invoice Actions
export async function createInvoice(data: InvoiceData) {
  "use server";

  try {
    let buyerId = data.buyer.companyId;

    if (buyerId === "0") {
      const newBuyer = await prisma.buyerCompany.create({
        data: {
          name: data.buyer.name,
          address: data.buyer.address,
          nip: data.buyer.nip,
          sellers: {
            connect: { id: data.seller.companyId },
          },
        },
      });
      buyerId = newBuyer.id;
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        dateIssued: new Date(data.dateIssued),
        dateSale: new Date(data.dateSale),
        seller: {
          connect: { id: data.seller.companyId },
        },
        buyer: {
          connect: { id: buyerId },
        },
        bankAccount: data.seller.bankAccount
          ? {
              connect: { id: data.seller.bankAccount },
            }
          : undefined,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            netPrice: Number(item.netPrice),
            bruttoPrice: Number(item.bruttoPrice),
            vatRate: Number(item.vatRate),
          })),
        },
      },
      include: {
        seller: true,
        buyer: true,
        bankAccount: true,
        items: true,
      },
    });

    revalidatePath("/");
    return { success: true, data: invoice };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

export async function getInvoicesList(sellerId?: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: sellerId
        ? {
            sellerId: sellerId,
          }
        : undefined,
      select: {
        id: true,
        invoiceNumber: true,
        dateIssued: true,
        dateSale: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          select: {
            netPrice: true,
            bruttoPrice: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        dateIssued: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedInvoices = invoices.map((invoice) => ({
      ...invoice,
      dateIssued: invoice.dateIssued.toISOString(),
      dateSale: invoice.dateSale.toISOString(),
      totals: {
        netTotal: invoice.items.reduce(
          (sum, item) => sum + item.netPrice * item.quantity,
          0
        ),
        bruttoTotal: invoice.items.reduce(
          (sum, item) => sum + item.bruttoPrice * item.quantity,
          0
        ),
      },
    }));

    return {
      success: true,
      data: transformedInvoices,
    };
  } catch (error) {
    console.error("Failed to get invoices:", error);
    return {
      success: false,
      error: "Failed to get invoices",
    };
  }
}

export async function getInvoiceDetails(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        seller: true,
        buyer: true,
        items: true,
      },
    });
    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }
    return { success: true, data: invoice };
  } catch (error) {
    console.error("Failed to get invoice details:", error);
    return { success: false, error: "Failed to get invoice details" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    // Validate input
    if (!id) {
      throw new Error("Invoice ID is required");
    }

    // First delete related items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id },
    });

    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete invoice",
    };
  }
}

export async function deleteBuyerCompany(id: string) {
  try {
    await prisma.buyerCompany.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete buyer company:", error);
    return { success: false, error: "Failed to delete buyer company" };
  }
}

export async function deleteSellerCompany(id: string) {
  try {
    // First delete all related invoices and buyer relationships
    await prisma.$transaction([
      prisma.invoice.deleteMany({
        where: { sellerId: id },
      }),
      prisma.sellerCompany.delete({
        where: { id },
      }),
    ]);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete seller company:", error);
    return { success: false, error: "Failed to delete seller company" };
  }
}

export async function updateBuyerCompany(
  id: string,
  data: {
    name?: string;
    address?: string;
    nip?: string;
  }
) {
  try {
    const buyer = await prisma.buyerCompany.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return { success: true, data: buyer };
  } catch (error) {
    console.error("Failed to update buyer company:", error);
    return { success: false, error: "Failed to update buyer company" };
  }
}

export async function updateBankAccount(
  id: string,
  data: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    sellerId: string;
  }
) {
  try {
    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        accountName: data.accountName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
      },
    });
    revalidatePath("/");
    return { success: true, data: bankAccount };
  } catch (error) {
    console.error("Failed to update bank account:", error);
    return { success: false, error: "Failed to update bank account" };
  }
}
