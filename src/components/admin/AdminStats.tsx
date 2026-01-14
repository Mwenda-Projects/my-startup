import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Briefcase, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalItems: number;
    totalServices: number;
    totalTransactions: number;
    pendingReports: number;
    pendingWithdrawals: number;
    totalRevenue: number;
  };
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Items Listed",
      value: stats.totalItems,
      icon: ShoppingBag,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Services Listed",
      value: stats.totalServices,
      icon: Briefcase,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Transactions",
      value: stats.totalTransactions,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Platform Revenue",
      value: `KES ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
