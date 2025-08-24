import { Suspense } from "react";
import DescriptionClient from "./DescriptionClient";
import { PageLoader } from "@/components/common/PageLoader";

export default function DescriptionPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DescriptionClient />
    </Suspense>
  );
}
