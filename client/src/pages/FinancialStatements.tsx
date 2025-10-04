import { FinancialStatements as FinancialStatementsComponent } from "@/components/FinancialStatements";
import { AppLayout } from "@/components/layout/AppLayout";

export function FinancialStatementsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <FinancialStatementsComponent />
      </div>
    </AppLayout>
  );
}