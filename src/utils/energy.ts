import {
  Appliance,
  EnergyConsumption,
  CategoryConsumption,
  ApplianceCategory,
  TrendData,
  ComparisonData,
} from '../types';
import { format, subDays } from 'date-fns';

// Constants
const DEFAULT_ELECTRICITY_RATE = 0.12; // $ per kWh
const CO2_FACTOR = 0.92; // kg CO2 per kWh (average)
const TREES_CO2_ABSORPTION = 21.77; // kg CO2 per tree per year

/**
 * Calculate energy consumption for a single appliance
 * Formula: Energy (kWh) = (Power × Time × Quantity) / 1000
 */
export const calculateApplianceConsumption = (
  appliance: Appliance,
  days: number = 1
): number => {
  const { powerRating, hoursPerDay, quantity, isActive } = appliance;
  
  if (!isActive) return 0;
  
  const dailyConsumption = (powerRating * hoursPerDay * quantity) / 1000;
  return dailyConsumption * days;
};

/**
 * Calculate cost based on consumption
 */
export const calculateCost = (
  consumptionKWh: number,
  rate: number = DEFAULT_ELECTRICITY_RATE
): number => {
  return consumptionKWh * rate;
};

/**
 * Calculate CO2 emissions from energy consumption
 */
export const calculateCO2Emissions = (
  consumptionKWh: number,
  co2Factor: number = CO2_FACTOR
): number => {
  return consumptionKWh * co2Factor;
};

/**
 * Convert CO2 to tree equivalents
 */
export const co2ToTrees = (co2Kg: number): number => {
  return co2Kg / TREES_CO2_ABSORPTION;
};

/**
 * Calculate detailed energy consumption for each appliance
 */
export const calculateEnergyConsumptions = (
  appliances: Appliance[],
  rate: number = DEFAULT_ELECTRICITY_RATE,
  co2Factor: number = CO2_FACTOR
): EnergyConsumption[] => {
  const totalDailyConsumption = appliances.reduce(
    (sum, app) => sum + calculateApplianceConsumption(app, 1),
    0
  );

  return appliances.map((appliance) => {
    const dailyConsumption = calculateApplianceConsumption(appliance, 1);
    const monthlyConsumption = dailyConsumption * 30;
    const dailyCost = calculateCost(dailyConsumption, rate);
    const monthlyCost = calculateCost(monthlyConsumption, rate);
    const co2Emissions = calculateCO2Emissions(monthlyConsumption, co2Factor);
    const percentage =
      totalDailyConsumption > 0
        ? (dailyConsumption / totalDailyConsumption) * 100
        : 0;

    return {
      applianceId: appliance.id,
      applianceName: appliance.name,
      dailyConsumption,
      monthlyConsumption,
      dailyCost,
      monthlyCost,
      co2Emissions,
      percentage,
    };
  });
};

/**
 * Calculate consumption by category
 */
export const calculateConsumptionByCategory = (
  appliances: Appliance[],
  rate: number = DEFAULT_ELECTRICITY_RATE
): CategoryConsumption[] => {
  const categoryMap = new Map<ApplianceCategory, number>();

  appliances.forEach((appliance) => {
    const consumption = calculateApplianceConsumption(appliance, 30); // monthly
    const current = categoryMap.get(appliance.category) || 0;
    categoryMap.set(appliance.category, current + consumption);
  });

  const totalConsumption = Array.from(categoryMap.values()).reduce(
    (sum, val) => sum + val,
    0
  );

  return Array.from(categoryMap.entries()).map(([category, consumption]) => ({
    category,
    consumption,
    cost: calculateCost(consumption, rate),
    percentage: totalConsumption > 0 ? (consumption / totalConsumption) * 100 : 0,
  }));
};

/**
 * Get top N consuming appliances
 */
export const getTopConsumers = (
  consumptions: EnergyConsumption[],
  count: number = 3
): EnergyConsumption[] => {
  return [...consumptions]
    .sort((a, b) => b.dailyConsumption - a.dailyConsumption)
    .slice(0, count);
};

/**
 * Calculate comparison between two periods
 */
export const calculateComparison = (
  current: number,
  previous: number
): ComparisonData => {
  const percentageChange =
    previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isImprovement = current < previous;

  return {
    current,
    previous,
    percentageChange: Math.abs(percentageChange),
    isImprovement,
  };
};

/**
 * Generate trend data for a time period
 */
export const generateTrendData = (
  usageRecords: any[],
  days: number,
  _rate: number = DEFAULT_ELECTRICITY_RATE
): TrendData[] => {
  const trendData: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');

    const record = usageRecords.find((r) => r.date === dateString);

    if (record) {
      trendData.push({
        date: dateString,
        consumption: record.totalConsumption,
        cost: record.totalCost,
        co2: record.totalCO2,
      });
    } else {
      trendData.push({
        date: dateString,
        consumption: 0,
        cost: 0,
        co2: 0,
      });
    }
  }

  return trendData;
};

/**
 * Calculate potential savings based on optimization suggestions
 */
export const calculatePotentialSavings = (
  appliances: Appliance[],
  optimizationFactor: number = 0.2 // 20% reduction
): number => {
  const totalConsumption = appliances.reduce(
    (sum, app) => sum + calculateApplianceConsumption(app, 30),
    0
  );
  return totalConsumption * optimizationFactor;
};

/**
 * Format energy value with unit
 */
export const formatEnergy = (kWh: number): string => {
  if (kWh < 1) {
    return `${(kWh * 1000).toFixed(0)} Wh`;
  }
  return `${kWh.toFixed(2)} kWh`;
};

/**
 * Format cost with currency
 */
export const formatCost = (cost: number, currency: string = '$'): string => {
  return `${currency}${cost.toFixed(2)}`;
};

/**
 * Format CO2 emissions
 */
export const formatCO2 = (co2Kg: number): string => {
  if (co2Kg < 1) {
    return `${(co2Kg * 1000).toFixed(0)} g CO₂`;
  }
  return `${co2Kg.toFixed(2)} kg CO₂`;
};

/**
 * Get default appliances database
 */
export const getDefaultAppliances = () => {
  const now = new Date();
  return [
    { id: 'def-1', name: 'LED Bulb', category: ApplianceCategory.LIGHTING, powerRating: 10, hoursPerDay: 4, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-2', name: 'CFL Bulb', category: ApplianceCategory.LIGHTING, powerRating: 15, hoursPerDay: 4, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-3', name: 'Ceiling Fan', category: ApplianceCategory.COOLING, powerRating: 75, hoursPerDay: 8, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-4', name: 'Air Conditioner', category: ApplianceCategory.COOLING, powerRating: 1500, hoursPerDay: 4, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-5', name: 'Refrigerator', category: ApplianceCategory.KITCHEN, powerRating: 150, hoursPerDay: 24, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-6', name: 'Microwave', category: ApplianceCategory.KITCHEN, powerRating: 1000, hoursPerDay: 0.5, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-7', name: 'TV', category: ApplianceCategory.ENTERTAINMENT, powerRating: 100, hoursPerDay: 4, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-8', name: 'Laptop', category: ApplianceCategory.OFFICE, powerRating: 65, hoursPerDay: 8, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-9', name: 'Washing Machine', category: ApplianceCategory.LAUNDRY, powerRating: 500, hoursPerDay: 1, quantity: 1, isActive: true, createdAt: now },
    { id: 'def-10', name: 'Water Heater', category: ApplianceCategory.HEATING, powerRating: 2000, hoursPerDay: 2, quantity: 1, isActive: true, createdAt: now },
  ];
};

/**
 * Validate appliance data
 */
export const validateAppliance = (appliance: Partial<Appliance>): string[] => {
  const errors: string[] = [];

  if (!appliance.name || appliance.name.trim() === '') {
    errors.push('Appliance name is required');
  }

  if (!appliance.powerRating || appliance.powerRating <= 0) {
    errors.push('Power rating must be greater than 0');
  }

  if (!appliance.hoursPerDay || appliance.hoursPerDay < 0 || appliance.hoursPerDay > 24) {
    errors.push('Hours per day must be between 0 and 24');
  }

  if (!appliance.quantity || appliance.quantity < 1) {
    errors.push('Quantity must be at least 1');
  }

  return errors;
};
