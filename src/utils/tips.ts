import { Appliance, EnergyTip, ApplianceCategory, EnergyConsumption } from '../types';

/**
 * Generate personalized energy-saving tips based on usage patterns
 */
export const generateEnergyTips = (
  appliances: Appliance[],
  consumptions: EnergyConsumption[]
): EnergyTip[] => {
  const tips: EnergyTip[] = [];
  let tipId = 1;

  // Sort by consumption to identify high consumers
  const sortedConsumptions = [...consumptions].sort(
    (a, b) => b.dailyConsumption - a.dailyConsumption
  );

  // General tips
  tips.push({
    id: `tip-${tipId++}`,
    title: 'Turn Off Unused Appliances',
    description:
      'Make it a habit to turn off lights, fans, and electronics when not in use. Even small savings add up!',
    category: 'General',
    potentialSavings: 5,
    priority: 'high',
    isPersonalized: false,
  });

  // Check for high-consumption appliances
  sortedConsumptions.slice(0, 3).forEach((consumption) => {
    const appliance = appliances.find((a) => a.id === consumption.applianceId);
    if (!appliance) return;

    switch (appliance.category) {
      case ApplianceCategory.COOLING:
        if (appliance.powerRating > 1000) {
          tips.push({
            id: `tip-${tipId++}`,
            title: 'Optimize Air Conditioner Usage',
            description: `Your ${appliance.name} is a top consumer. Set temperature to 24-26°C and use timer mode to save up to 30% energy.`,
            category: ApplianceCategory.COOLING,
            potentialSavings: consumption.monthlyConsumption * 0.3,
            priority: 'high',
            isPersonalized: true,
          });
        } else {
          tips.push({
            id: `tip-${tipId++}`,
            title: 'Use Fans Efficiently',
            description: `Turn off ${appliance.name} when leaving the room. Ceiling fans consume less power than AC.`,
            category: ApplianceCategory.COOLING,
            potentialSavings: consumption.monthlyConsumption * 0.2,
            priority: 'medium',
            isPersonalized: true,
          });
        }
        break;

      case ApplianceCategory.LIGHTING:
        tips.push({
          id: `tip-${tipId++}`,
          title: 'Switch to LED Bulbs',
          description:
            'Replace traditional bulbs with LEDs. They use 75% less energy and last 25 times longer.',
          category: ApplianceCategory.LIGHTING,
          potentialSavings: consumption.monthlyConsumption * 0.75,
          priority: 'high',
          isPersonalized: true,
        });
        break;

      case ApplianceCategory.HEATING:
        tips.push({
          id: `tip-${tipId++}`,
          title: 'Reduce Water Heater Usage',
          description: `Your ${appliance.name} is energy-intensive. Lower temperature setting and use insulation to reduce consumption by 20%.`,
          category: ApplianceCategory.HEATING,
          potentialSavings: consumption.monthlyConsumption * 0.2,
          priority: 'high',
          isPersonalized: true,
        });
        break;

      case ApplianceCategory.KITCHEN:
        if (appliance.name.toLowerCase().includes('refrigerator')) {
          tips.push({
            id: `tip-${tipId++}`,
            title: 'Maintain Your Refrigerator',
            description:
              'Clean coils regularly, check door seals, and avoid opening frequently to improve efficiency.',
            category: ApplianceCategory.KITCHEN,
            potentialSavings: consumption.monthlyConsumption * 0.15,
            priority: 'medium',
            isPersonalized: true,
          });
        }
        break;

      case ApplianceCategory.LAUNDRY:
        tips.push({
          id: `tip-${tipId++}`,
          title: 'Wash with Cold Water',
          description:
            'Use cold water for laundry whenever possible. It saves energy and is gentler on clothes.',
          category: ApplianceCategory.LAUNDRY,
          potentialSavings: consumption.monthlyConsumption * 0.4,
          priority: 'medium',
          isPersonalized: true,
        });
        break;
    }
  });

  // Check for appliances running long hours
  appliances.forEach((appliance) => {
    if (appliance.hoursPerDay > 12 && appliance.category !== ApplianceCategory.KITCHEN) {
      tips.push({
        id: `tip-${tipId++}`,
        title: `Reduce ${appliance.name} Usage`,
        description: `Your ${appliance.name} runs ${appliance.hoursPerDay} hours daily. Try reducing usage by 2-3 hours to save energy.`,
        category: appliance.category,
        potentialSavings: (appliance.powerRating * 3 * 30) / 1000,
        priority: 'high',
        isPersonalized: true,
      });
    }
  });

  // Additional general tips
  tips.push(
    {
      id: `tip-${tipId++}`,
      title: 'Use Natural Light',
      description:
        'Open curtains during the day to reduce lighting needs. Natural light is free and healthy!',
      category: 'General',
      potentialSavings: 3,
      priority: 'medium',
      isPersonalized: false,
    },
    {
      id: `tip-${tipId++}`,
      title: 'Unplug Chargers',
      description:
        'Unplug phone and laptop chargers when not in use. They draw power even when idle.',
      category: 'General',
      potentialSavings: 2,
      priority: 'low',
      isPersonalized: false,
    },
    {
      id: `tip-${tipId++}`,
      title: 'Regular Maintenance',
      description:
        'Keep appliances well-maintained. Clean filters, check seals, and service equipment regularly.',
      category: 'General',
      potentialSavings: 5,
      priority: 'medium',
      isPersonalized: false,
    }
  );

  return tips;
};

/**
 * Get weather-based energy tips
 */
export const getWeatherBasedTips = (
  temperature: number,
  season: string,
  humidity: number
): EnergyTip[] => {
  const tips: EnergyTip[] = [];
  let tipId = 100;

  if (temperature > 30) {
    tips.push({
      id: `weather-tip-${tipId++}`,
      title: 'Hot Weather Alert',
      description:
        'Close curtains during peak sun hours to keep rooms cool naturally. Use fans before switching to AC.',
      category: ApplianceCategory.COOLING,
      potentialSavings: 10,
      priority: 'high',
      isPersonalized: true,
    });
  }

  if (temperature < 15) {
    tips.push({
      id: `weather-tip-${tipId++}`,
      title: 'Cold Weather Tip',
      description:
        'Wear warm clothes indoors and use localized heating instead of central heating to save energy.',
      category: ApplianceCategory.HEATING,
      potentialSavings: 15,
      priority: 'high',
      isPersonalized: true,
    });
  }

  if (season === 'summer') {
    tips.push({
      id: `weather-tip-${tipId++}`,
      title: 'Summer Energy Saving',
      description:
        'Set AC temperature to 24-26°C. Every degree lower increases energy consumption by 6%.',
      category: ApplianceCategory.COOLING,
      potentialSavings: 12,
      priority: 'high',
      isPersonalized: true,
    });
  }

  if (season === 'winter') {
    tips.push({
      id: `weather-tip-${tipId++}`,
      title: 'Winter Efficiency',
      description:
        'Use natural sunlight for heating. Open curtains during sunny days and close them at night.',
      category: ApplianceCategory.HEATING,
      potentialSavings: 8,
      priority: 'medium',
      isPersonalized: true,
    });
  }

  if (humidity > 70) {
    tips.push({
      id: `weather-tip-${tipId++}`,
      title: 'High Humidity Alert',
      description:
        'Use dehumidifier mode on AC instead of full cooling. It consumes less power.',
      category: ApplianceCategory.COOLING,
      potentialSavings: 7,
      priority: 'medium',
      isPersonalized: true,
    });
  }

  return tips;
};

/**
 * Generate chatbot responses based on user queries
 */
export const generateChatbotResponse = (
  query: string,
  appliances: Appliance[],
  tips: EnergyTip[]
): { response: string; suggestions: string[] } => {
  const lowerQuery = query.toLowerCase();

  // Energy saving tips
  if (lowerQuery.includes('save') || lowerQuery.includes('reduce')) {
    const topTips = tips.slice(0, 3);
    return {
      response: `Here are my top 3 energy-saving tips for you:\n\n${topTips
        .map((tip, i) => `${i + 1}. ${tip.title}: ${tip.description}`)
        .join('\n\n')}`,
      suggestions: ['Show more tips', 'Calculate savings', 'View dashboard'],
    };
  }

  // Appliance-specific queries
  if (lowerQuery.includes('consumption') || lowerQuery.includes('usage')) {
    const totalConsumption = appliances.reduce((sum, app) => {
      return sum + (app.powerRating * app.hoursPerDay * app.quantity) / 1000;
    }, 0);

    return {
      response: `Your current daily energy consumption is ${totalConsumption.toFixed(
        2
      )} kWh. The top consumers are your ${appliances
        .slice(0, 3)
        .map((a) => a.name)
        .join(', ')}.`,
      suggestions: ['View detailed report', 'Get optimization tips', 'Set goals'],
    };
  }

  // Cost queries
  if (lowerQuery.includes('cost') || lowerQuery.includes('bill')) {
    const totalConsumption = appliances.reduce((sum, app) => {
      return sum + (app.powerRating * app.hoursPerDay * app.quantity) / 1000;
    }, 0);
    const monthlyCost = totalConsumption * 30 * 0.12;

    return {
      response: `Your estimated monthly electricity cost is $${monthlyCost.toFixed(
        2
      )}. You can reduce this by following our energy-saving tips!`,
      suggestions: ['See breakdown', 'Reduce cost', 'Compare with last month'],
    };
  }

  // CO2/Environment queries
  if (
    lowerQuery.includes('co2') ||
    lowerQuery.includes('carbon') ||
    lowerQuery.includes('environment')
  ) {
    return {
      response:
        'Great question! Your energy consumption contributes to CO₂ emissions. On average, every kWh you save prevents 0.92 kg of CO₂ from entering the atmosphere. Check your dashboard to see your carbon footprint!',
      suggestions: ['View CO₂ dashboard', 'Get green tips', 'Calculate impact'],
    };
  }

  // Goals
  if (lowerQuery.includes('goal') || lowerQuery.includes('target')) {
    return {
      response:
        'Setting goals is a great way to track progress! I recommend starting with a 10-15% reduction in your current consumption. Would you like me to help you set up a personalized goal?',
      suggestions: ['Set goal', 'View progress', 'Get recommendations'],
    };
  }

  // Default response
  return {
    response:
      "I'm your Energy Assistant! I can help you with energy-saving tips, usage analysis, cost calculations, and more. What would you like to know?",
    suggestions: [
      'How can I save energy?',
      'Show my consumption',
      'Calculate my bill',
      'Environmental impact',
    ],
  };
};
