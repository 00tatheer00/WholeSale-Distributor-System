import * as React from "react";
import { requireAuth } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ProfileEditorForm } from "./profile-editor-form";
import { PasswordChangeForm } from "./password-change-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, Calendar, Building2, UserCircle } from "lucide-react";

export default async function AdminProfilePage() {
  const authContext = await requireAuth();
  const profile = authContext.profile;
  const userEmail = profile?.email || authContext.authUser?.email || "admin@pharmadist.local";

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Admin Profile & Security"
        description="Manage your executive account details, security credentials, and company associations."
        badge={
          <Badge variant="outline" className="font-semibold text-primary">
            {profile?.role || "ADMIN"}
          </Badge>
        }
      />

      {/* Profile Overview Card */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {profile?.name || "Administrator"}
                </h2>
                <Badge variant="success" className="text-[10px]">
                  {profile?.status || "ACTIVE"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground font-mono">
                {userEmail}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1.5">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>{profile?.company?.name || "Apex Pharma Distributors Ltd."}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Role: {profile?.role || "SUPER_ADMIN"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Verified Identity</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Edit & Password Change Forms */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Profile Information Editor */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold">Personal Information</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Update your display name and contact phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditorForm
              initialName={profile?.name || ""}
              initialPhone={profile?.phone || ""}
              email={userEmail}
            />
          </CardContent>
        </Card>

        {/* Right: Security & Password Update */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold">Change Password</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Update your account password using secure local bcrypt encryption.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
