import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChartProps {
  data: any[];
  title: string;
  height?: number;
  className?: string;
}

interface DailyCompletionChartProps extends ChartProps {
  data: Array<{
    date: string;
    completed: number;
    created: number;
    productivity: number;
  }>;
}

interface WeeklyComparisonChartProps extends ChartProps {
  data: Array<{
    week: string;
    completed: number;
    created: number;
    productivity: number;
  }>;
}

interface CategoryBreakdownChartProps extends ChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    completionRate: number;
  }>;
}

interface ProgressChartProps extends ChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

interface ForecastChartProps extends ChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors: string[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
            <span style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Daily Completion Line Chart
export const DailyCompletionChart: React.FC<DailyCompletionChartProps> = ({
  data,
  title,
  height = 300,
  className = ''
}) => {
  const formattedData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    productivity: Math.round(item.productivity)
  }));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Created"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Weekly Comparison Bar Chart
export const WeeklyComparisonChart: React.FC<WeeklyComparisonChartProps> = ({
  data,
  title,
  height = 300,
  className = ''
}) => {
  const formattedData = data.map(item => ({
    ...item,
    week: format(parseISO(item.week), 'MMM dd'),
    productivity: Math.round(item.productivity)
  }));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="week" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="completed" fill="#10B981" name="Completed" />
          <Bar dataKey="created" fill="#3B82F6" name="Created" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Category Breakdown Pie Chart
export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data,
  title,
  height = 300,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">
              {item.completionRate}% completion
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Chart (Area Chart)
export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title,
  height = 200,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Forecast Chart
export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  title,
  height = 200,
  className = '',
  colors
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={colors[0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  className = ''
}) => {
  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500 dark:text-gray-400';
    return change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change > 0 ? '↗' : '↘';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>
              {icon}
            </div>
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className={getChangeColor(change)}>
              {getChangeIcon(change)} {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">{changeLabel}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Insights Card Component
interface InsightCardProps {
  type: 'positive' | 'neutral' | 'warning';
  title: string;
  message: string;
  icon: string;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  message,
  icon,
  className = ''
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'positive':
        return 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTypeTextColor = () => {
    switch (type) {
      case 'positive':
        return 'text-green-900 dark:text-green-100';
      case 'warning':
        return 'text-yellow-900 dark:text-yellow-100';
      default:
        return 'text-blue-900 dark:text-blue-100';
    }
  };

  const getTypeMessageColor = () => {
    switch (type) {
      case 'positive':
        return 'text-green-800 dark:text-green-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className={`rounded-lg p-6 border ${getTypeStyles()} ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className={`text-lg font-semibold mb-2 ${getTypeTextColor()}`}>{title}</h4>
          <p className={`text-sm ${getTypeMessageColor()}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}; 