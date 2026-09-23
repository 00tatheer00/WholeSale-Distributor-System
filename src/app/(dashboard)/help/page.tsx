import * as React from "react";
import { Metadata } from "next";
import { HelpClient } from "./help-client";

export const metadata: Metadata = {
  title: "System Guide & Operations Manual | PharmaDist ERP",
  description: "Official Step-by-Step Wholesale Medicine Distribution Guide in English per DRAP standards.",
};

export default function HelpPage() {
  return <HelpClient />;
}

