"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateProfileSchema, UpdateProfileInput } from "@/validations/auth.schema";
import { updateProfileAction } from "@/server/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileEditorFormProps {
  initialName: string;
  initialPhone: string;
  email: string;
}

export function ProfileEditorForm({
  initialName,
  initialPhone,
  email,
}: ProfileEditorFormProps) {
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialName,
      phone: initialPhone,
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const result = await updateProfileAction(data);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to update profile details.");
        return;
      }

      setSuccessMessage(result.message || "Profile details saved successfully.");
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {successMessage && (
        <Alert variant="success" className="py-2.5">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium">
          Full Display Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            className="pl-9 text-xs"
            disabled={isSubmitting}
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-[11px] text-destructive font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email (Read-only for security) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="email" className="text-xs font-medium">
            Login Email Address
          </Label>
          <span className="text-[10px] text-muted-foreground">Primary Login Identifier</span>
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            defaultValue={email}
            readOnly
            disabled
            className="pl-9 text-xs bg-muted/50 cursor-not-allowed text-muted-foreground"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs font-medium">
          Contact Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+880 1711 000000"
            className="pl-9 text-xs"
            disabled={isSubmitting}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-[11px] text-destructive font-medium">
            {errors.phone.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="sm"
        className="w-full text-xs font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Saving Changes...
          </>
        ) : (
          "Save Profile Changes"
        )}
      </Button>
    </form>
  );
}
