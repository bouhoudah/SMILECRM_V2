import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const Card = ({ title, value, icon: Icon, trend, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default Card;