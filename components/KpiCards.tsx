"use client";

import { TrendingUp, TrendingDown, Minus, Utensils, DollarSign, Award } from "lucide-react";

interface KpiData {
  totalItems: number;
  avgProfitMargin: number;
  topPerformers: number;
  itemsChange?: number;
  marginChange?: number;
  topChange?: number;
}

interface KpiCardsProps {
  data: KpiData;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  const trendColors = {
    up: "text-emerald-600 bg-emerald-50",
    down: "text-rose-600 bg-rose-50",
    neutral: "text-slate-600 bg-slate-50",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="card-hover p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-navy-900 mt-2">{value}</p>
          <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
        </div>
        <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-navy-600" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            <TrendIcon className="w-3 h-3" />
            {trendValue}
          </span>
          <span className="text-slate-400 text-xs">vs last month</span>
        </div>
      )}
    </div>
  );
}

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard
        title="Total Menu Items"
        value={data.totalItems.toString()}
        subtitle="Across all categories"
        icon={Utensils}
        trend={data.itemsChange && data.itemsChange > 0 ? "up" : data.itemsChange && data.itemsChange < 0 ? "down" : "neutral"}
        trendValue={data.itemsChange ? `${Math.abs(data.itemsChange)}%` : "0%"}
      />
      <KpiCard
        title="Avg. Profit Margin"
        value={`${data.avgProfitMargin.toFixed(1)}%`}
        subtitle="Menu-wide profitability"
        icon={DollarSign}
        trend={data.marginChange && data.marginChange > 0 ? "up" : data.marginChange && data.marginChange < 0 ? "down" : "neutral"}
        trendValue={data.marginChange ? `${Math.abs(data.marginChange)}%` : "0%"}
      />
      <KpiCard
        title="Top Performers"
        value={data.topPerformers.toString()}
        subtitle="Star items driving revenue"
        icon={Award}
        trend={data.topChange && data.topChange > 0 ? "up" : data.topChange && data.topChange < 0 ? "down" : "neutral"}
        trendValue={data.topChange ? `${Math.abs(data.topChange)}%` : "0%"}
      />
    </div>
  );
}
