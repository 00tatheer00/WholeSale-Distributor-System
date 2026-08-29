import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const cookieStore = await cookies();
  const session =
    cookieStore.get("wmdms_session")?.value ||
    cookieStore.get("wmdms_demo_session")?.value;

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
