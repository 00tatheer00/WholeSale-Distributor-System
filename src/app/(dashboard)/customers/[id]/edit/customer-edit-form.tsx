"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Store,
  ArrowLeft,
  Check,
  Building2,
  FileCheck,
  MapPin,
  CreditCard,
  FileText,
  AlertCircle,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { updateCustomerSchema, UpdateCustomerInput } from "@/validations/customer.schema";
import { updateCustomerAction } from "@/server/actions/customer.actions";
import { CustomerDetailRecord } from "@/types/models";

interface CustomerEditFormProps {
  customer: CustomerDetailRecord;
}

export function CustomerEditForm({ customer }: CustomerEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      tradeName: customer.tradeName,
      proprietorName: customer.proprietorName || "",
      customerType: customer.customerType as any,
      customerCode: customer.customerCode || "",
      drugLicenseNo: customer.drugLicenseNo,
      drugLicenseExpiry: customer.drugLicenseExpiry || "2027-12-31",
      tradeLicenseNo: customer.tradeLicenseNo || "",
      taxIdTin: customer.taxIdTin || "",
      phone: customer.phone,
      alternatePhone: customer.alternatePhone || "",
      email: customer.email || "",
      deliveryAddress: customer.deliveryAddress,
      city: customer.city || "Dhaka",
      assignedRoute: customer.assignedRoute || "Dhanmondi Route 1",
      creditLimit: customer.creditLimit,
      maxDueDays: customer.maxDueDays,
      status: customer.status as any,
      notes: "",
    },
  });

  const selectedCustomerType = watch("customerType");
  const selectedStatus = watch("status");

  const onSubmit = async (data: UpdateCustomerInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const res = await updateCustomerAction(customer.id, data);
      if (res.success) {
        router.push(`/customers/${customer.id}`);
      } else {
        setServerError(res.error || "Failed to update customer pharmacy.");
      }
    } catch (err: any) {
      setServerError("Unexpected error occurred while saving customer changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href={`/customers/${customer.id}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Customer Profile
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Edit: ${customer.tradeName}`}
        description="Update profile, contact destination, licensing information, or approved credit limit."
      />

      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Immutable Financial Safety Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Lock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Financial Safety Guardrail Active:</strong> Current outstanding due (
          <span className="font-mono font-bold">{formatCurrency(customer.currentDue)}</span>) and historical ledger records
          are strictly derived from verified transaction entries and cannot be arbitrarily modified manually.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: Business Identity & Classification */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-[#0071E3]">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Pharmacy & Business Identity</h3>
              <p className="text-xs text-muted-foreground">Store trade name, proprietor, and classification.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pharmacy Trade Name */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-foreground">
                Pharmacy / Business Trade Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                {...register("tradeName")}
                className="h-10 rounded-xl bg-muted/20 text-sm font-medium"
              />
              {errors.tradeName && (
                <p className="text-xs text-rose-500">{errors.tradeName.message}</p>
              )}
            </div>

            {/* Proprietor Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Proprietor / Pharmacist Name</Label>
              <Input
                {...register("proprietorName")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
            </div>

            {/* Classification */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Customer Classification <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedCustomerType}
                onValueChange={(val: any) => setValue("customerType", val)}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm bg-muted/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RETAIL_PHARMACY">Retail Pharmacy / Chemist</SelectItem>
                  <SelectItem value="HOSPITAL_DISPENSARY">Hospital Central Dispensary</SelectItem>
                  <SelectItem value="CLINIC_INSTITUTION">Clinic / Diagnostic Center</SelectItem>
                  <SelectItem value="SUB_DISTRIBUTOR">Sub-Distributor / Stockist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Code */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Customer Code</Label>
              <Input
                {...register("customerCode")}
                className="h-10 rounded-xl bg-muted/20 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Regulatory & Drug Licensing */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Regulatory & DGDA Licensing</h3>
              <p className="text-xs text-muted-foreground">Drug license number, validity date, and tax identification.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drug License Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Drug License Number (DGDA) <span className="text-rose-500">*</span>
              </Label>
              <Input
                {...register("drugLicenseNo")}
                className="h-10 rounded-xl bg-muted/20 text-sm font-mono"
              />
              {errors.drugLicenseNo && (
                <p className="text-xs text-rose-500">{errors.drugLicenseNo.message}</p>
              )}
            </div>

            {/* Drug License Expiry */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                License Expiry Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                {...register("drugLicenseExpiry")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
              {errors.drugLicenseExpiry && (
                <p className="text-xs text-rose-500">{errors.drugLicenseExpiry.message}</p>
              )}
            </div>

            {/* Trade License */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">City Corporation Trade License</Label>
              <Input
                {...register("tradeLicenseNo")}
                className="h-10 rounded-xl bg-muted/20 text-sm font-mono"
              />
            </div>

            {/* Tax TIN */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">e-TIN / Tax Identification</Label>
              <Input
                {...register("taxIdTin")}
                className="h-10 rounded-xl bg-muted/20 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Contact & Delivery Location */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Contact & Delivery Location</h3>
              <p className="text-xs text-muted-foreground">Order dispatch destination, primary phone, and territory.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Primary Phone Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                {...register("phone")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
              {errors.phone && (
                <p className="text-xs text-rose-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Alternate Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Alternate / Landline Phone</Label>
              <Input
                {...register("alternatePhone")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Email Address</Label>
              <Input
                type="email"
                {...register("email")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">City / Region</Label>
              <Input
                {...register("city")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-foreground">
                Physical Delivery Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                {...register("deliveryAddress")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
              {errors.deliveryAddress && (
                <p className="text-xs text-rose-500">{errors.deliveryAddress.message}</p>
              )}
            </div>

            {/* Assigned Route */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-foreground">Assigned Sales Route / Territory</Label>
              <Input
                {...register("assignedRoute")}
                className="h-10 rounded-xl bg-muted/20 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Wholesale Credit Terms */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Wholesale Credit Terms</h3>
              <p className="text-xs text-muted-foreground">Credit limit adjustments and overdue grace days.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credit Limit */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Credit Limit (AFN / ؋) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="1000"
                {...register("creditLimit")}
                className="h-10 rounded-xl bg-muted/20 text-sm font-mono font-semibold"
              />
              {errors.creditLimit && (
                <p className="text-xs text-rose-500">{errors.creditLimit.message}</p>
              )}
            </div>

            {/* Credit Days Limit */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Credit Period (Days) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="180"
                {...register("maxDueDays")}
                className="h-10 rounded-xl bg-muted/20 text-sm font-mono"
              />
              {errors.maxDueDays && (
                <p className="text-xs text-rose-500">{errors.maxDueDays.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 5: Operational Status & Notes */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Account Status & Internal Notes</h3>
              <p className="text-xs text-muted-foreground">Operational status and special billing instructions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Operating Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(val: any) => setValue("status", val)}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm bg-muted/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active (Eligible for Wholesale Orders)</SelectItem>
                  <SelectItem value="BLOCKED_OVERDUE">Blocked / Overdue Hold</SelectItem>
                  <SelectItem value="INACTIVE">Inactive (Suspended)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-foreground">Distributor Notes & Remarks</Label>
              <Textarea
                placeholder="Special delivery instructions, chemist preferences, contact timings..."
                rows={3}
                {...register("notes")}
                className="rounded-xl bg-muted/20 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            asChild
            type="button"
            variant="outline"
            className="rounded-xl h-11 px-5"
          >
            <Link href={`/customers/${customer.id}`}>Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-6 h-11 transition-all active:scale-95"
          >
            {isSubmitting ? (
              "Saving Changes..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Customer Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
