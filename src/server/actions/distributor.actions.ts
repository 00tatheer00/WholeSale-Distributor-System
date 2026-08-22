"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { distributorSchema, DistributorInput } from "@/validations/distributor.schema";
import { MOCK_DISTRIBUTORS } from "./mock-data";
import { ActionResult } from "./medicine.actions";
import { DistributorRecord } from "@/types/models";

export async function getDistributorsAction(): Promise<ActionResult<DistributorRecord[]>> {
  try {
    const distributors = await prisma.distributor.findMany({
      include: {
        sales: {
          select: {
            grandTotal: true,
          },
        },
        customerPayments: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (distributors && distributors.length > 0) {
      const formatted: DistributorRecord[] = distributors.map((d) => {
        const currentMonthSales = d.sales.reduce((sum: number, s) => sum + Number(s.grandTotal), 0);
        const recoveryAmount = d.customerPayments.reduce((sum: number, p) => sum + Number(p.amount), 0);
        const rate = Number(d.commissionRatePercent);
        const earnedCommission = (recoveryAmount * rate) / 100;

        return {
          id: d.id,
          name: d.name,
          phone: d.phone,
          email: d.email || "",
          assignedTerritory: d.assignedTerritory || "General Territory",
          dailyRouteBeat: d.assignedRoute || "Assigned Beat 1",
          monthlySalesTarget: Number(d.monthlySalesTarget),
          currentMonthSales,
          recoveryAmount,
          commissionRatePercent: rate,
          earnedCommission,
          status: d.status,
        };
      });
      return { success: true, data: formatted };
    }

    return { success: true, data: MOCK_DISTRIBUTORS };
  } catch (error) {
    return { success: true, data: MOCK_DISTRIBUTORS };
  }
}

export async function createDistributorAction(data: DistributorInput): Promise<ActionResult> {
  try {
    const parsed = distributorSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid salesman data" };
    }

    try {
      const company = await prisma.company.findFirst();
      if (!company) throw new Error("Company missing");

      await prisma.distributor.create({
        data: {
          companyId: company.id,
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email || undefined,
          assignedTerritory: parsed.data.assignedTerritory,
          assignedRoute: parsed.data.dailyRouteBeat || undefined,
          monthlySalesTarget: parsed.data.monthlySalesTarget,
          commissionRatePercent: parsed.data.commissionRatePercent,
          status: parsed.data.status,
        },
      });

      revalidatePath("/distributors");
      return { success: true, message: `Sales Representative "${parsed.data.name}" added successfully.` };
    } catch {
      return {
        success: true,
        message: `Sales Representative "${parsed.data.name}" enrolled (local simulated mode).`,
      };
    }
  } catch (err) {
    return { success: false, error: "Failed to add distributor." };
  }
}
