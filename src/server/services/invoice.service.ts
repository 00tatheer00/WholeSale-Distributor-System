import { prisma } from "@/lib/prisma";
import { InvoiceStatus, PaymentStatus } from "@prisma/client";
import { InvoiceRecord, InvoiceItemRecord } from "@/types/models";

export interface InvoiceQueryParams {
  search?: string;
  customerId?: string;
  statusFilter?: "ALL" | "ISSUED" | "PAID" | "CANCELLED";
  paymentStatusFilter?: "ALL" | "PAID" | "PARTIALLY_PAID" | "UNPAID";
  startDate?: string;
  endDate?: string;
  sortBy?: "invoiceDate" | "grandTotal" | "dueAmount" | "customerName";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface InvoiceQueryResult {
  invoices: InvoiceRecord[];
  totalCount: number;
  totalInvoiced: number;
  totalPaid: number;
  totalDue: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InvoiceDetailRecord extends InvoiceRecord {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyDrugLicense: string;
  companyTradeLicense: string;
  companyTin: string;
  companyInvoiceFooter: string;
  customerDrugLicense: string;
  customerPhone: string;
  customerAddress: string;
  customerProprietor: string;
  customerTin?: string | null;
  saleNumber: string;
  salesmanPhone?: string | null;
  deliveryDate?: string | null;
  paymentAllocations?: Array<{
    receiptNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
  }>;
}

/**
 * Fetch wholesale tax invoices with search, filtering, and server-side pagination
 */
export async function getInvoices(params: InvoiceQueryParams = {}): Promise<InvoiceQueryResult> {
  const {
    search = "",
    customerId,
    statusFilter = "ALL",
    paymentStatusFilter = "ALL",
    startDate,
    endDate,
    sortBy = "invoiceDate",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  try {
    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { invoiceNumber: { contains: search.trim(), mode: "insensitive" } },
        { challanNumber: { contains: search.trim(), mode: "insensitive" } },
        { customer: { pharmacyName: { contains: search.trim(), mode: "insensitive" } } },
        { customer: { customerCode: { contains: search.trim(), mode: "insensitive" } } },
        { sale: { saleNumber: { contains: search.trim(), mode: "insensitive" } } },
      ];
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter as InvoiceStatus;
    }

    if (paymentStatusFilter !== "ALL") {
      whereClause.paymentStatus = paymentStatusFilter as PaymentStatus;
    }

    if (startDate || endDate) {
      whereClause.invoiceDate = {};
      if (startDate) {
        whereClause.invoiceDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.invoiceDate.lte = end;
      }
    }

    let orderBy: any = { invoiceDate: sortOrder };
    if (sortBy === "grandTotal") {
      orderBy = { grandTotal: sortOrder };
    } else if (sortBy === "dueAmount") {
      orderBy = { dueAmount: sortOrder };
    } else if (sortBy === "customerName") {
      orderBy = { customer: { pharmacyName: sortOrder } };
    }

    const skip = (Math.max(1, page) - 1) * pageSize;

    const [totalCount, invoicesData, statsData] = await Promise.all([
      prisma.invoice.count({ where: whereClause }),
      prisma.invoice.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: pageSize,
        include: {
          customer: true,
          distributor: true,
          sale: {
            include: {
              saleItems: {
                include: {
                  medicine: true,
                  batch: true,
                },
              },
            },
          },
        },
      }),
      prisma.invoice.aggregate({
        where: whereClause,
        _sum: {
          grandTotal: true,
          paidAmount: true,
          dueAmount: true,
        },
      }),
    ]);

    const invoices: InvoiceRecord[] = invoicesData.map((inv) => {
      const grandTotal = Number(inv.grandTotal);
      const cogsTotal = Number(inv.sale?.totalCogs || 0);

      const items: InvoiceItemRecord[] =
        inv.sale?.saleItems.map((it) => ({
          medicineName: it.medicine.brandName,
          genericName: it.medicine.genericName,
          dosageForm: it.medicine.dosageForm,
          batchNumber: it.batch.batchNumber,
          expiryDate: it.batch.expiryDate.toISOString().split("T")[0],
          quantity: it.quantity,
          bonusQuantity: it.bonusQuantity,
          unitPrice: Number(it.unitTradePrice),
          tradePrice: Number(it.unitTradePrice),
          mrp: Number(it.unitMrp),
          totalAmount: Number(it.lineTotal),
        })) || [];

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        saleOrderId: inv.saleId,
        challanNumber: inv.challanNumber || `CH-${inv.invoiceNumber.slice(4)}`,
        customerId: inv.customerId,
        customerName: inv.customer.pharmacyName,
        salesmanId: inv.distributorId || "",
        salesmanName: inv.distributor?.name || "Direct Cashier / HQ",
        issueDate: inv.invoiceDate.toISOString().split("T")[0],
        dueDate: inv.dueDate.toISOString().split("T")[0],
        subtotal: Number(inv.subtotalAmount),
        discountAmount: Number(inv.discountAmount),
        taxAmount: Number(inv.taxAmount),
        grandTotal,
        cogsTotal,
        grossProfit: grandTotal - cogsTotal,
        paidAmount: Number(inv.paidAmount),
        dueAmount: Number(inv.dueAmount),
        paymentStatus: inv.paymentStatus,
        status: inv.status,
        deliveryStatus: inv.sale?.deliveryStatus || "DELIVERED",
        items,
      };
    });

    return {
      invoices,
      totalCount,
      totalInvoiced: Number(statsData._sum.grandTotal || 0),
      totalPaid: Number(statsData._sum.paidAmount || 0),
      totalDue: Number(statsData._sum.dueAmount || 0),
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    console.error("Error in getInvoices service:", error);
    return {
      invoices: [],
      totalCount: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      totalDue: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch full Invoice Detail Document with company footer and DGDA licensing info
 */
export async function getInvoiceById(id: string): Promise<InvoiceDetailRecord | null> {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }],
      },
      include: {
        customer: true,
        distributor: true,
        createdBy: true,
        paymentAllocations: {
          include: {
            payment: true,
          },
        },
        sale: {
          include: {
            saleItems: {
              include: {
                medicine: true,
                batch: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) return null;

    const company = await prisma.company.findFirst();

    const grandTotal = Number(invoice.grandTotal);
    const cogsTotal = Number(invoice.sale?.totalCogs || 0);

    const items: InvoiceItemRecord[] =
      invoice.sale?.saleItems.map((it) => ({
        medicineName: it.medicine.brandName,
        genericName: it.medicine.genericName,
        dosageForm: it.medicine.dosageForm,
        batchNumber: it.batch.batchNumber,
        expiryDate: it.batch.expiryDate.toISOString().split("T")[0],
        quantity: it.quantity,
        bonusQuantity: it.bonusQuantity,
        unitPrice: Number(it.unitTradePrice),
        tradePrice: Number(it.unitTradePrice),
        mrp: Number(it.unitMrp),
        totalAmount: Number(it.lineTotal),
      })) || [];

    const paymentAllocations = invoice.paymentAllocations.map((a) => ({
      receiptNumber: a.payment.receiptNumber,
      amount: Number(a.allocatedAmount),
      paymentDate: a.payment.paymentDate.toISOString().split("T")[0],
      paymentMethod: a.payment.paymentMethod,
    }));

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      saleOrderId: invoice.saleId,
      challanNumber: invoice.challanNumber || `CH-${invoice.invoiceNumber.slice(4)}`,
      customerId: invoice.customerId,
      customerName: invoice.customer.pharmacyName,
      salesmanId: invoice.distributorId || "",
      salesmanName: invoice.distributor?.name || "Direct Cashier / HQ",
      issueDate: invoice.invoiceDate.toISOString().split("T")[0],
      dueDate: invoice.dueDate.toISOString().split("T")[0],
      subtotal: Number(invoice.subtotalAmount),
      discountAmount: Number(invoice.discountAmount),
      taxAmount: Number(invoice.taxAmount),
      grandTotal,
      cogsTotal,
      grossProfit: grandTotal - cogsTotal,
      paidAmount: Number(invoice.paidAmount),
      dueAmount: Number(invoice.dueAmount),
      paymentStatus: invoice.paymentStatus,
      status: invoice.status,
      deliveryStatus: invoice.sale?.deliveryStatus || "DELIVERED",
      items,
      companyName: company?.name || "Apex Pharma Distributors Ltd.",
      companyAddress: company?.address || "Plot 14, Commercial Zone, Tejgaon Industrial Area, Dhaka",
      companyPhone: company?.phone || "+880 1711 000111",
      companyEmail: company?.email || "info@apexpharmadist.com",
      companyDrugLicense: company?.drugLicenseNo || "DL-DH-09182-W",
      companyTradeLicense: company?.tradeLicenseNo || "TRAD-DH-2024-8849",
      companyTin: company?.taxIdTin || "8291039182",
      companyInvoiceFooter:
        company?.invoiceFooterText ||
        "Licensed Wholesale Drug Stockist. Goods sold are subject to standard wholesale terms.",
      customerDrugLicense: invoice.customer.drugLicenseNo,
      customerPhone: invoice.customer.phone,
      customerAddress: invoice.customer.address,
      customerProprietor: invoice.customer.proprietorName || "N/A",
      customerTin: invoice.customer.taxTin,
      saleNumber: invoice.sale?.saleNumber || "SO-00000",
      salesmanPhone: invoice.distributor?.phone,
      deliveryDate: invoice.sale?.deliveryDate?.toISOString().split("T")[0] || null,
      paymentAllocations,
    };
  } catch (error) {
    console.error("Error in getInvoiceById service:", error);
    return null;
  }
}
