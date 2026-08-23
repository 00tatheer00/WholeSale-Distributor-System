"use server";

import { revalidatePath } from "next/cache";
import { customerSchema, updateCustomerSchema, CustomerInput, UpdateCustomerInput } from "@/validations/customer.schema";
import {
  getCustomers,
  getCustomerById,
  getCustomerLedger,
  createCustomer,
  updateCustomer,
  toggleCustomerStatus,
  CustomerQueryParams,
  CustomerQueryResult,
} from "@/server/services/customer.service";
import { CustomerRecord, CustomerDetailRecord, CustomerLedgerEntry, CustomerFinancialSummary } from "@/types/models";
import { CustomerStatus } from "@prisma/client";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getCustomersAction(
  params?: CustomerQueryParams
): Promise<ActionResult<CustomerQueryResult>> {
  try {
    const result = await getCustomers(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getCustomersAction error:", error);
    return { success: false, error: "Failed to retrieve customers list." };
  }
}

export async function getCustomersListAction(): Promise<ActionResult<CustomerRecord[]>> {
  try {
    const result = await getCustomers({ pageSize: 100 });
    return { success: true, data: result.customers };
  } catch (error: any) {
    console.error("getCustomersListAction error:", error);
    return { success: false, error: "Failed to retrieve customers list." };
  }
}

export async function getCustomerByIdAction(
  id: string
): Promise<ActionResult<CustomerDetailRecord>> {
  try {
    if (!id || id === "new") {
      return { success: false, error: "Invalid customer ID" };
    }
    const customer = await getCustomerById(id);
    if (!customer) {
      return { success: false, error: "Customer pharmacy not found." };
    }
    return { success: true, data: customer };
  } catch (error: any) {
    console.error("getCustomerByIdAction error:", error);
    return { success: false, error: "Failed to retrieve customer details." };
  }
}

export async function getCustomerLedgerAction(
  id: string
): Promise<ActionResult<{ customer: CustomerRecord | null; ledger: CustomerLedgerEntry[]; summary: CustomerFinancialSummary | null }>> {
  try {
    if (!id) {
      return { success: false, error: "Invalid customer ID" };
    }
    const result = await getCustomerLedger(id);
    if (!result.customer) {
      return { success: false, error: "Customer not found." };
    }
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getCustomerLedgerAction error:", error);
    return { success: false, error: "Failed to retrieve customer ledger." };
  }
}

export async function createCustomerAction(
  data: CustomerInput
): Promise<ActionResult<CustomerRecord>> {
  try {
    const parsed = customerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid customer data" };
    }

    const result = await createCustomer(parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/customers");
    revalidatePath("/sales");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: result.data,
      message: `Pharmacy "${parsed.data.tradeName}" onboarded successfully.`,
    };
  } catch (error: any) {
    console.error("createCustomerAction error:", error);
    return { success: false, error: "Failed to onboard customer pharmacy." };
  }
}

export async function updateCustomerAction(
  id: string,
  data: UpdateCustomerInput
): Promise<ActionResult<CustomerRecord>> {
  try {
    if (!id) {
      return { success: false, error: "Missing customer ID" };
    }

    const parsed = updateCustomerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid customer data" };
    }

    const result = await updateCustomer(id, parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    revalidatePath(`/customers/${id}/ledger`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: result.data,
      message: `Pharmacy "${parsed.data.tradeName}" updated successfully.`,
    };
  } catch (error: any) {
    console.error("updateCustomerAction error:", error);
    return { success: false, error: "Failed to update customer details." };
  }
}

export async function toggleCustomerStatusAction(
  id: string,
  newStatus: CustomerStatus
): Promise<ActionResult> {
  try {
    if (!id) {
      return { success: false, error: "Missing customer ID" };
    }

    const result = await toggleCustomerStatus(id, newStatus);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Customer status updated to ${newStatus}.`,
    };
  } catch (error: any) {
    console.error("toggleCustomerStatusAction error:", error);
    return { success: false, error: "Failed to update customer status." };
  }
}
