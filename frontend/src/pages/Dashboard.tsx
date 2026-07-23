import { Link } from "react-router-dom";
import { ArrowUpRight, Download, RefreshCw } from "lucide-react";
import { useDashboard } from "@/hooks/queries";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  CategoryBars,
  DailyTrendArea,
  PriorityDonut,
  ResolutionLine,
} from "@/components/dashboard/Charts";
import { TriageQueue } from "@/components/dashboard/TriageQueue";
import { ResponsibleAIPanel } from "@/components/dashboard/ResponsibleAIPanel";
import { formatDateTime } from "@/lib/utils";

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Operations command centre"
        description={
          data
            ? `Live triage across the operational mailbox · updated ${formatDateTime(data.generated_at)}`
            : "Live triage across the operational mailbox"
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => refetch()}>
              <RefreshCw /> Refresh
            </Button>
            <Button variant="primary">
              <Download /> Export brief
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[92px]" />)
          : data?.kpis.map((kpi, index) => <KpiCard key={kpi.key} kpi={kpi} index={index} />)}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Priority distribution</CardTitle>
              <CardDescription>How the mailbox splits across severity</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[220px]" />
            ) : (
              <PriorityDonut data={data!.charts.priority_distribution} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Category distribution</CardTitle>
              <CardDescription>Where operational load is concentrated</CardDescription>
            </div>
            <Link
              to="/analytics"
              className="flex items-center gap-1 text-2xs font-semibold text-brand-600 hover:underline"
            >
              Full analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[220px]" />
            ) : (
              <CategoryBars data={data!.charts.category_distribution} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daily email trend</CardTitle>
              <CardDescription>Received against auto-resolved, last 14 days</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[240px]" /> : <DailyTrendArea data={data!.charts.daily_trend} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Resolution trend</CardTitle>
              <CardDescription>Average handling time against SLA attainment</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[240px]" />
            ) : (
              <ResolutionLine data={data!.charts.resolution_trend} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Next in the triage queue</CardTitle>
            <CardDescription>Ranked by priority, then by risk score</CardDescription>
          </div>
          <Link to="/inbox" className="text-2xs font-semibold text-brand-600 hover:underline">
            Open inbox
          </Link>
        </CardHeader>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <TriageQueue items={data!.queue} />
        )}
      </Card>

      <div className="mt-4">
        <p className="label-caps pb-2">Responsible AI status</p>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[92px]" />
            ))}
          </div>
        ) : (
          <ResponsibleAIPanel items={data!.responsible_ai} />
        )}
      </div>
    </div>
  );
}
