import * as React from "react";
import { Metadata } from "next";
import { HelpClient } from "./help-client";

export const metadata: Metadata = {
  title: "د سیسټم جامع لارښود • System Guide & Operations Manual | PharmaDist ERP",
  description: "د افغانستان د درملو د عمده پلورونکو، سټاکیسټانو او شرکتونو لپاره بشپړ عملي کاري لارښود په پښتو، اردو او انګلیسي ژبو",
};

export default function HelpPage() {
  return <HelpClient />;
}
