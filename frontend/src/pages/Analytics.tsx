import { useAnalytics } from "@/hooks/queries";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CategoryBars,
  DailyTrendArea,
  PriorityDonut,
  ResolutionLine,
  SimpleBars,
} from "@/components/dashboard/Charts";

export default function Analytics() {
  const { data, isLoading, isError, refetch } = useAnalytics();

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
        title="Analytics"
        description="Volume, quality and throughput across the operational mailbox."
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[76px]" />)
          : data!.headline.map((item) => (
              <div key={item.label} className="panel px-4 py-3">
                <p className="label-caps truncate">{item.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
                  {item.value}
                  {item.unit}
                </p>
              </div>
            ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Priority mix</CardTitle>
              <CardDescription>Severity split across all messages</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[220px]" /> : <PriorityDonut data={data!.priority_distribution} />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Category load</CardTitle>
              <CardDescription>Where the operational effort goes</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[220px]" /> : <CategoryBars data={data!.category_distribution} />}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daily volume</CardTitle>
              <CardDescription>Received against auto-resolved</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[240px]" /> : <DailyTrendArea data={data!.daily_trend} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Resolution and SLA</CardTitle>
              <CardDescription>Handling time against SLA attainment</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[240px]" /> : <ResolutionLine data={data!.resolution_trend} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Confidence bands</CardTitle>
              <CardDescription>How certain the engine is across the corpus</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[240px]" /> : <SimpleBars data={data!.confidence_bands} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Owner workload</CardTitle>
              <CardDescription>Messages routed per accountable owner</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[240px]" /> : <SimpleBars data={data!.owner_load} color="#7E22CE" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Department load</CardTitle>
              <CardDescription>Origin of inbound operational mail</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[240px]" /> : <SimpleBars data={data!.department_load} color="#0E7490" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Action pipeline</CardTitle>
              <CardDescription>Extracted actions by state</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[240px]" /> : <SimpleBars data={data!.task_status} color="#067647" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
