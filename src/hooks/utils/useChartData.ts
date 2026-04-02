import { useEffect, useState } from 'react';

const NUMBER_OF_WEEKS = 5;
const WEEK_LABELS = ['1-7', '8-14', '15-21', '22-28', '29-31'];

const generateWeeklyData = (total: number, weeks: number): number[] =>
  Array(weeks).fill(total / weeks);

const getYTicks = (values: number[], ticks = 4): number[] => {
  const max = Math.max(...values);
  const step = Math.ceil(max / ticks / 10_000) * 10_000;
  return Array.from({ length: ticks + 1 }, (_, i) => i * step);
};

const getCurrentWeekIndex = (): number => {
  const today = new Date();
  const currentDay = today.getDate();

  if (currentDay <= 7) return 0;
  if (currentDay <= 14) return 1;
  if (currentDay <= 21) return 2;
  if (currentDay <= 28) return 3;
  return 4;
};

const formatYAxisLabel = (value: number) =>
  value >= 1000 ? `${value / 1000}k` : `${value}`;
export const useChartData = (totalAmount: number | null) => {
  const [data, setData] = useState<number[]>([]);
  const [yTicks, setYTicks] = useState<number[]>([]);
  const [weekLabels, setWeekLabels] = useState<string[]>([]);

  useEffect(() => {
    if (totalAmount != null) {
      const fullData = generateWeeklyData(totalAmount, NUMBER_OF_WEEKS);
      const currentWeekIndex = getCurrentWeekIndex();

      const visibleData = fullData.slice(0, currentWeekIndex + 1);
      const visibleLabels = WEEK_LABELS.slice(0, currentWeekIndex + 1);

      setData(visibleData);
      setWeekLabels(visibleLabels);
      setYTicks(getYTicks(visibleData));
    }
  }, [totalAmount]);

  return {
    data,
    yTicks,
    weekLabels,
    formatYAxisLabel,
  };
};