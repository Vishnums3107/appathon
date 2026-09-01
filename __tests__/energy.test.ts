import {
  calculateApplianceConsumption,
  calculateCO2Emissions,
  calculateEnergyConsumptions,
} from '../src/utils/energy';
import { Appliance, ApplianceCategory } from '../src/types';

const appliance: Appliance = {
  id: 'test-device',
  name: 'Desk lamp',
  category: ApplianceCategory.LIGHTING,
  powerRating: 10,
  hoursPerDay: 5,
  quantity: 2,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('energy calculations', () => {
  it('calculates consumption from power, time, and quantity', () => {
    expect(calculateApplianceConsumption(appliance)).toBe(0.1);
    expect(calculateApplianceConsumption(appliance, 30)).toBe(3);
  });

  it('excludes inactive appliances from consumption', () => {
    expect(calculateApplianceConsumption({ ...appliance, isActive: false })).toBe(0);
  });

  it('uses the configured emission factor throughout appliance analytics', () => {
    expect(calculateCO2Emissions(12, 0.5)).toBe(6);
    const result = calculateEnergyConsumptions([appliance], 0.2, 0.5)[0];
    expect(result.monthlyConsumption).toBe(3);
    expect(result.monthlyCost).toBeCloseTo(0.6);
    expect(result.co2Emissions).toBe(1.5);
  });
});
