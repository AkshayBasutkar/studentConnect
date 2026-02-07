import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  TrendingUp 
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b'];

  const pieData = stats ? [
    { name: 'Approved', value: stats.approvedParticipations },
    { name: 'Pending', value: stats.pendingReviews },
    { name: 'Rejected', value: stats.rejectedParticipations },
  ] : [];

  const activityData = [
    { name: 'Mon', value: 4 },
    { name: 'Tue', value: 3 },
    { name: 'Wed', value: 7 },
    { name: 'Thu', value: 2 },
    { name: 'Fri', value: 5 },
    { name: 'Sat', value: 8 },
    { name: 'Sun', value: 1 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening in your participation portfolio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Events" 
          value={stats?.totalEvents || 0} 
          icon={Calendar} 
          trend="+2 this week"
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatsCard 
          title="Participations" 
          value={stats?.totalParticipations || 0} 
          icon={FileText} 
          trend="Overall total"
          color="text-indigo-500"
          bg="bg-indigo-500/10"
        />
        <StatsCard 
          title="Pending Reviews" 
          value={stats?.pendingReviews || 0} 
          icon={Clock} 
          trend="Needs attention"
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatsCard 
          title="Approved" 
          value={stats?.approvedParticipations || 0} 
          icon={CheckCircle2} 
          trend="Success rate"
          color="text-green-500"
          bg="bg-green-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation Status Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Participation submissions over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current status of submissions</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Simple Legend */}
            <div className="absolute bottom-4 flex gap-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Approved</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Pending</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, color, bg }: any) {
  return (
    <Card className="shadow-sm border border-border/60 hover:border-border transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
        <div className="flex flex-col mt-3">
          <span className="text-3xl font-bold font-display">{value}</span>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-[350px] col-span-2 rounded-xl" />
        <Skeleton className="h-[350px] col-span-1 rounded-xl" />
      </div>
    </div>
  );
}
