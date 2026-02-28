"use client";

import Image from "next/image";
import { Star, Edit2, Trash2, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  popularityScore: number;
  profitMargin: number;
  imageUrl?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

function ProfitabilityBadge({ margin }: { margin: number }) {
  let color: string;
  let label: string;
  let Icon: React.ElementType;

  if (margin >= 60) {
    color = "bg-emerald-100 text-emerald-700 border-emerald-200";
    label = "High";
    Icon = TrendingUp;
  } else if (margin >= 40) {
    color = "bg-gold-100 text-gold-700 border-gold-200";
    label = "Good";
    Icon = Minus;
  } else if (margin >= 20) {
    color = "bg-amber-100 text-amber-700 border-amber-200";
    label = "Fair";
    Icon = TrendingDown;
  } else {
    color = "bg-rose-100 text-rose-700 border-rose-200";
    label = "Low";
    Icon = TrendingDown;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="w-3 h-3" />
      {label} ({margin.toFixed(0)}%)
    </span>
  );
}

function PopularityIndicator({ score }: { score: number }) {
  const fullStars = Math.floor(score / 20);
  const hasHalfStar = (score % 20) >= 10;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? "fill-gold-400 text-gold-400"
                : i === fullStars && hasHalfStar
                ? "fill-gold-400/50 text-gold-400"
                : "fill-slate-100 text-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-slate-500 ml-1">{score}/100</span>
    </div>
  );
}

export function MenuItemCard({ item, onEdit, onDelete, onView }: MenuItemCardProps) {
  return (
    <div className="card-hover overflow-hidden">
      <div className="flex">
        {/* Image */}
        <div className="relative w-32 h-32 flex-shrink-0 bg-slate-100">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-navy-900 truncate">{item.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-1 mt-0.5">{item.description}</p>
            </div>
            <span className="text-lg font-bold text-navy-900">${item.price.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-navy-50 text-navy-600 text-xs font-medium rounded">
              {item.category}
            </span>
            <ProfitabilityBadge margin={item.profitMargin} />
          </div>

          <div className="flex items-center justify-between mt-3">
            <PopularityIndicator score={item.popularityScore} />

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView?.(item.id)}
                className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-navy-50 rounded transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit?.(item.id)}
                className="p-1.5 text-slate-400 hover:text-gold-600 hover:bg-gold-50 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
