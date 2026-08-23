"use server";

import { revalidatePath } from "next/cache";
import {
  distributorSchema,
  distributorExpenseSchema,
  DistributorInput,
  DistributorExpenseInput,
} from "@/validations/distributor.schema";
import {
  getDistributors,
  getDistributorById,
  createDistributor,
  updateDistributor,
  toggleDistributorStatus,
  recordDistributorExpense,
  DistributorQueryParams,
  DistributorQueryResult,
} from "@/server/services/distributor.service";
import { DistributorRecord, DistributorDetailRecord } from "@/types/models";
import { DistributorStatus } from "@prisma/client";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getDistributorsAction(
  params?: DistributorQueryParams
): Promise<ActionResult<DistributorQueryResult>> {
  try {
    const result = await getDistributors(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getDistributorsAction error:", error);
    return { success: false, error: "Failed to fetch sales representatives." };
  }
}

export async function getDistributorsListAction(): Promise<ActionResult<DistributorRecord[]>> {
  try {
    const result = await getDistributors({ pageSize: 100 });
    return { success: true, data: result.distributors };
  } catch (error: any) {
    console.error("getDistributorsListAction error:", error);
    return { success: false, error: "Failed to fetch distributor list." };
  }
}

export async function getDistributorByIdAction(
  id: string
): Promise<ActionResult<DistributorDetailRecord>> {
  try {
    if (!id) return { success: false, error: "Missing distributor ID" };
    const distributor = await getDistributorById(id);
    if (!distributor) return { success: false, error: "Sales representative not found." };
    return { success: true, data: distributor };
  } catch (error: any) {
    console.error("getDistributorByIdAction error:", error);
    return { success: false, error: "Failed to fetch distributor details." };
  }
}

export async function createDistributorAction(
  data: DistributorInput
): Promise<ActionResult> {
  try {
    const parsed = distributorSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid salesman data" };
    }

    const result = await createDistributor(parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/distributors");
    revalidatePath("/sales");
    revalidatePath("/profit");
    return {
      success: true,
      data: result.data,
      message: `Sales Representative "${parsed.data.name}" enrolled successfully.`,
    };
  } catch (error: any) {
    console.error("createDistributorAction error:", error);
    return { success: false, error: "Failed to create sales representative." };
  }
}

export async function updateDistributorAction(
  id: string,
  data: DistributorInput
): Promise<ActionResult> {
  try {
    const parsed = distributorSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }

    const result = await updateDistributor(id, parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/distributors");
    revalidatePath(`/distributors/${id}`);
    revalidatePath("/profit");
    return { success: true, message: `Representative "${parsed.data.name}" updated successfully.` };
  } catch (error: any) {
    console.error("updateDistributorAction error:", error);
    return { success: false, error: "Failed to update distributor." };
  }
}

export async function toggleDistributorStatusAction(
  id: string,
  newStatus: DistributorStatus
): Promise<ActionResult> {
  try {
    const result = await toggleDistributorStatus(id, newStatus);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/distributors");
    revalidatePath(`/distributors/${id}`);
    return { success: true, message: `Status updated to ${newStatus}.` };
  } catch (error: any) {
    console.error("toggleDistributorStatusAction error:", error);
    return { success: false, error: "Failed to toggle status." };
  }
}

export async function recordDistributorExpenseAction(
  data: DistributorExpenseInput
): Promise<ActionResult> {
  try {
    const parsed = distributorExpenseSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid expense data" };
    }

    const result = await recordDistributorExpense(parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath(`/distributors/${data.distributorId}`);
    revalidatePath("/distributors");
    revalidatePath("/expenses");
    revalidatePath("/profit");
    return { success: true, message: "Representative operating expense logged." };
  } catch (error: any) {
    console.error("recordDistributorExpenseAction error:", error);
    return { success: false, error: "Failed to log distributor expense." };
  }
}
