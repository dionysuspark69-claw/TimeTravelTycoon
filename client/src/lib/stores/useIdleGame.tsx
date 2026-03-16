import { create } from "zustand";
import { subscribeWithSelector, persist } from "zustand/middleware";
import { useArtifacts } from "./useArtifacts";
import { useAudio } from "./useAudio";
import { useChronoMeter } from "./useChronoMeter";
import { usePrestigePerks } from "./usePrestigePerks";
import { toast } from "sonner";
import { getPrestigeRequirements } from "../utils";

export interface TimePeriod {
  id: string;
  name: string;
  era: string;
  baseFare: number;
  unlockCost: number;
  color: string;
  description: string;
  speedModifier: number;
  revenueModifier: number;
  customerGenModifier: number;
  pros: string[];
  cons: string[];
  specialTrait?: {
    id: string;
    label: string;
    description: string;
    icon: string;
  };
}

/**
 * Computes the unlock cost for a destination based on its index.
 * 
 * Scaling Strategy:
 * - First 6 destinations (indices 0-5): Manual costs for smooth onboarding [0, 500, 1500, 2000, 3500, 5000]
 * - Remaining destinations (indices 6+): Exponential scaling with base 20,000 and exponent 1.22
 * - Costs are rounded to nearest 5,000 for clean numbers
 * 
 * This hybrid approach preserves the early game experience while making
 * mid/late game destinations ~1.6x more expensive to extend progression.
 */
function computeUnlockCost(index: number): number {
  // First 6 destinations (0-5) keep their current costs
  const manualCosts = [0, 500, 1500, 2000, 3500, 5000];
  if (index < 6) {
    return manualCosts[index];
  }
  
  // Remaining destinations use exponential scaling
  const baseCost = 20000;
  const exponent = 1.22;
  const cost = baseCost * Math.pow(exponent, index - 6);
  
  // Round to nearest 5000
  return Math.round(cost / 5000) * 5000;
}

export const TIME_PERIODS: TimePeriod[] = [
  {
    id: "dinosaur",
    name: "Dinosaur Era",
    era: "65 Million BC",
    baseFare: 10,
    unlockCost: computeUnlockCost(0),
    color: "#2ecc71",
    description: "Watch the mighty dinosaurs roam!",
    speedModifier: 1.0,
    revenueModifier: 1.0,
    customerGenModifier: 1.0,
    pros: ["Balanced experience"],
    cons: []
  },
  {
    id: "egypt",
    name: "Ancient Egypt",
    era: "2500 BC",
    baseFare: 25,
    unlockCost: computeUnlockCost(1),
    color: "#f39c12",
    description: "Visit the pyramids being built!",
    speedModifier: 0.8,
    revenueModifier: 1.5,
    customerGenModifier: 1.0,
    pros: ["Easily Impressed: +50% revenue"],
    cons: ["Primitive Routes: -20% speed"],
    specialTrait: { id: "artifact_rich", label: "Artifact Rich", icon: "🏺", description: "Higher artifact drop chance" }
  },
  {
    id: "rome",
    name: "Ancient Rome",
    era: "100 AD",
    baseFare: 40,
    unlockCost: computeUnlockCost(2),
    color: "#c0392b",
    description: "Witness the glory of the Roman Empire!",
    speedModifier: 1.1,
    revenueModifier: 1.4,
    customerGenModifier: 1.2,
    pros: ["Imperial Splendor: +40% revenue", "Road Network: +10% speed", "Empire Travelers: +20% customers"],
    cons: [],
    specialTrait: { id: "busy_hub", label: "Busy Hub", icon: "🏛️", description: "More customers arrive here" }
  },
  {
    id: "medieval",
    name: "Medieval Times",
    era: "1200 AD",
    baseFare: 50,
    unlockCost: computeUnlockCost(3),
    color: "#9b59b6",
    description: "Experience knights and castles!",
    speedModifier: 1.0,
    revenueModifier: 1.2,
    customerGenModifier: 1.3,
    pros: ["Popular Era: +30% customer generation", "Historic Interest: +20% revenue"],
    cons: [],
    specialTrait: { id: "artifact_rich", label: "Artifact Rich", icon: "⚔️", description: "Relics hide in every corner" }
  },
  {
    id: "viking",
    name: "Viking Age",
    era: "900 AD",
    baseFare: 60,
    unlockCost: computeUnlockCost(4),
    color: "#34495e",
    description: "Sail with legendary Norse warriors!",
    speedModifier: 0.9,
    revenueModifier: 1.6,
    customerGenModifier: 0.9,
    pros: ["Legendary Tales: +60% revenue"],
    cons: ["Rough Seas: -10% speed", "Fierce Reputation: -10% customers"]
  },
  {
    id: "renaissance",
    name: "Renaissance",
    era: "1500 AD",
    baseFare: 75,
    unlockCost: computeUnlockCost(5),
    color: "#e67e22",
    description: "Witness the rebirth of art and science!",
    speedModifier: 1.2,
    revenueModifier: 1.3,
    customerGenModifier: 0.9,
    pros: ["Cultural Boom: +30% revenue", "Stable Routes: +20% speed"],
    cons: ["Elite Tourism: -10% customer generation"]
  },
  {
    id: "industrial",
    name: "Industrial Revolution",
    era: "1850 AD",
    baseFare: 100,
    unlockCost: computeUnlockCost(6),
    color: "#95a5a6",
    description: "See the age of steam and steel!",
    speedModifier: 1.5,
    revenueModifier: 1.0,
    customerGenModifier: 1.2,
    pros: ["Steam Power: +50% speed", "Working Class: +20% customers"],
    cons: [],
    specialTrait: { id: "speed_hub", label: "Speed Hub", icon: "⚙️", description: "Trip speed bonus is doubled here" }
  },
  {
    id: "wildwest",
    name: "Wild West",
    era: "1880 AD",
    baseFare: 125,
    unlockCost: computeUnlockCost(7),
    color: "#e74c3c",
    description: "Live the cowboy adventure!",
    speedModifier: 0.7,
    revenueModifier: 2.0,
    customerGenModifier: 0.8,
    pros: ["High Stakes: +100% revenue"],
    cons: ["Dangerous Territory: -30% speed", "Cautious Travelers: -20% customers"],
    specialTrait: { id: "high_value", label: "High Value", icon: "🤠", description: "High stakes mean high rewards" }
  },
  {
    id: "roaring20s",
    name: "Roaring Twenties",
    era: "1925 AD",
    baseFare: 175,
    unlockCost: computeUnlockCost(8),
    color: "#f1c40f",
    description: "Dance through the jazz age!",
    speedModifier: 1.3,
    revenueModifier: 1.5,
    customerGenModifier: 1.4,
    pros: ["Party Era: +40% customers", "Wealthy Tourists: +50% revenue", "Modern Travel: +30% speed"],
    cons: [],
    specialTrait: { id: "busy_hub", label: "Busy Hub", icon: "🎷", description: "Everyone wants to party in the 20s" }
  },
  {
    id: "spaceage",
    name: "Space Age",
    era: "1969 AD",
    baseFare: 225,
    unlockCost: computeUnlockCost(9),
    color: "#3498db",
    description: "Join the race to the moon!",
    speedModifier: 1.8,
    revenueModifier: 1.2,
    customerGenModifier: 1.0,
    pros: ["Rocket Tech: +80% speed", "Scientific Interest: +20% revenue"],
    cons: [],
    specialTrait: { id: "speed_hub", label: "Speed Hub", icon: "🚀", description: "Fastest trip speed in the game" }
  },
  {
    id: "future",
    name: "Future City",
    era: "2500 AD",
    baseFare: 300,
    unlockCost: computeUnlockCost(10),
    color: "#1abc9c",
    description: "See the world of tomorrow!",
    speedModifier: 2.0,
    revenueModifier: 0.8,
    customerGenModifier: 1.1,
    pros: ["Advanced Tech: +100% speed", "Curious Minds: +10% customers"],
    cons: ["Jaded Tourists: -20% revenue"],
    specialTrait: { id: "speed_hub", label: "Speed Hub", icon: "🌆", description: "Advanced tech doubles speed bonus" }
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Metropolis",
    era: "2077 AD",
    baseFare: 350,
    unlockCost: computeUnlockCost(11),
    color: "#e91e63",
    description: "Neon-lit streets and corporate intrigue!",
    speedModifier: 1.6,
    revenueModifier: 1.8,
    customerGenModifier: 0.7,
    pros: ["High Tech: +60% speed", "Premium Clients: +80% revenue"],
    cons: ["Dangerous Streets: -30% customers"],
    specialTrait: { id: "high_value", label: "High Value", icon: "💎", description: "Premium clients pay extra per trip" }
  },
  {
    id: "farfuture",
    name: "Far Future",
    era: "5000 AD",
    baseFare: 500,
    unlockCost: computeUnlockCost(12),
    color: "#9b59b6",
    description: "Explore the distant future!",
    speedModifier: 0.5,
    revenueModifier: 5.0,
    customerGenModifier: 0.5,
    pros: ["Extreme Premium: +400% revenue"],
    cons: ["Unstable Timelines: -50% speed", "Risky Travel: -50% customers"],
    specialTrait: { id: "high_value", label: "High Value", icon: "⭐", description: "Extreme premium fares" }
  },
  {
    id: "triassic",
    name: "Triassic Period",
    era: "230 Million BC",
    baseFare: 550,
    unlockCost: computeUnlockCost(13),
    color: "#8B4513",
    description: "Dawn of the dinosaurs!",
    speedModifier: 0.9,
    revenueModifier: 1.3,
    customerGenModifier: 0.8,
    pros: ["Ancient Wonders: +30% revenue"],
    cons: ["Primitive Era: -10% speed", "Sparse Population: -20% customers"]
  },
  {
    id: "cambrian",
    name: "Cambrian Explosion",
    era: "540 Million BC",
    baseFare: 600,
    unlockCost: computeUnlockCost(14),
    color: "#20B2AA",
    description: "Witness life's grand diversity burst!",
    speedModifier: 0.7,
    revenueModifier: 2.0,
    customerGenModifier: 0.6,
    pros: ["Primordial Premium: +100% revenue"],
    cons: ["Oceanic Chaos: -30% speed", "Limited Appeal: -40% customers"]
  },
  {
    id: "iceage",
    name: "Ice Age",
    era: "12,000 BC",
    baseFare: 650,
    unlockCost: computeUnlockCost(15),
    color: "#B0E0E6",
    description: "Brave the frozen tundra!",
    speedModifier: 0.6,
    revenueModifier: 1.7,
    customerGenModifier: 0.7,
    pros: ["Extreme Tourism: +70% revenue"],
    cons: ["Frozen Routes: -40% speed", "Harsh Conditions: -30% customers"]
  },
  {
    id: "stoneage",
    name: "Stone Age",
    era: "10,000 BC",
    baseFare: 700,
    unlockCost: computeUnlockCost(16),
    color: "#A0522D",
    description: "Experience humanity's first steps!",
    speedModifier: 0.8,
    revenueModifier: 1.4,
    customerGenModifier: 1.0,
    pros: ["Archaeological Value: +40% revenue"],
    cons: ["No Infrastructure: -20% speed"]
  },
  {
    id: "bronzeage",
    name: "Bronze Age",
    era: "3000 BC",
    baseFare: 750,
    unlockCost: computeUnlockCost(17),
    color: "#CD7F32",
    description: "See the birth of civilization!",
    speedModifier: 1.0,
    revenueModifier: 1.3,
    customerGenModifier: 1.1,
    pros: ["Emerging Civilization: +30% revenue", "Growing Population: +10% customers"],
    cons: []
  },
  {
    id: "mesopotamia",
    name: "Ancient Mesopotamia",
    era: "3500 BC",
    baseFare: 800,
    unlockCost: computeUnlockCost(18),
    color: "#DAA520",
    description: "Visit the cradle of civilization!",
    speedModifier: 0.9,
    revenueModifier: 1.5,
    customerGenModifier: 1.2,
    pros: ["Historic Significance: +50% revenue", "Trade Routes: +20% customers"],
    cons: ["Desert Heat: -10% speed"]
  },
  {
    id: "greece",
    name: "Ancient Greece",
    era: "500 BC",
    baseFare: 850,
    unlockCost: computeUnlockCost(19),
    color: "#4169E1",
    description: "Walk with philosophers and heroes!",
    speedModifier: 1.1,
    revenueModifier: 1.6,
    customerGenModifier: 1.3,
    pros: ["Golden Age: +60% revenue", "Naval Excellence: +10% speed", "Popular Destination: +30% customers"],
    cons: [],
    specialTrait: { id: "busy_hub", label: "Busy Hub", icon: "🏛️", description: "Golden Age attracts crowds" }
  },
  {
    id: "china",
    name: "Ancient China",
    era: "200 BC",
    baseFare: 900,
    unlockCost: computeUnlockCost(20),
    color: "#DC143C",
    description: "Discover the Great Wall and Silk Road!",
    speedModifier: 1.2,
    revenueModifier: 1.4,
    customerGenModifier: 1.4,
    pros: ["Silk Road: +20% speed", "Imperial Wealth: +40% revenue", "Mass Tourism: +40% customers"],
    cons: [],
    specialTrait: { id: "busy_hub", label: "Busy Hub", icon: "🐉", description: "Silk Road brings the masses" }
  },
  {
    id: "mayan",
    name: "Mayan Empire",
    era: "600 AD",
    baseFare: 950,
    unlockCost: computeUnlockCost(21),
    color: "#228B22",
    description: "Explore mysterious jungle temples!",
    speedModifier: 0.8,
    revenueModifier: 1.8,
    customerGenModifier: 0.9,
    pros: ["Mystical Allure: +80% revenue"],
    cons: ["Jungle Routes: -20% speed", "Remote Location: -10% customers"],
    specialTrait: { id: "artifact_rich", label: "Artifact Rich", icon: "🌿", description: "Ancient jungle hides many treasures" }
  },
  {
    id: "aztec",
    name: "Aztec Empire",
    era: "1400 AD",
    baseFare: 1000,
    unlockCost: computeUnlockCost(22),
    color: "#FF4500",
    description: "Witness the power of Tenochtitlan!",
    speedModifier: 0.9,
    revenueModifier: 1.7,
    customerGenModifier: 1.0,
    pros: ["Empire Grandeur: +70% revenue"],
    cons: ["Mountain Paths: -10% speed"]
  },
  {
    id: "inca",
    name: "Inca Empire",
    era: "1450 AD",
    baseFare: 1100,
    unlockCost: computeUnlockCost(23),
    color: "#FFD700",
    description: "Trek to Machu Picchu's heights!",
    speedModifier: 0.7,
    revenueModifier: 2.0,
    customerGenModifier: 0.8,
    pros: ["Mountain Majesty: +100% revenue"],
    cons: ["High Altitude: -30% speed", "Difficult Access: -20% customers"]
  },
  {
    id: "feudaljapan",
    name: "Feudal Japan",
    era: "1200 AD",
    baseFare: 1200,
    unlockCost: computeUnlockCost(24),
    color: "#E75480",
    description: "Train with samurai warriors!",
    speedModifier: 1.1,
    revenueModifier: 1.6,
    customerGenModifier: 1.2,
    pros: ["Samurai Culture: +60% revenue", "Disciplined Routes: +10% speed", "Popular Era: +20% customers"],
    cons: []
  },
  {
    id: "mongol",
    name: "Mongol Empire",
    era: "1250 AD",
    baseFare: 1300,
    unlockCost: computeUnlockCost(25),
    color: "#8B0000",
    description: "Ride with the great Khan!",
    speedModifier: 1.5,
    revenueModifier: 1.3,
    customerGenModifier: 0.9,
    pros: ["Horse Routes: +50% speed", "Empire Expansion: +30% revenue"],
    cons: ["Warzone: -10% customers"]
  },
  {
    id: "discovery",
    name: "Age of Discovery",
    era: "1492 AD",
    baseFare: 1400,
    unlockCost: computeUnlockCost(26),
    color: "#4682B4",
    description: "Sail to new worlds!",
    speedModifier: 1.3,
    revenueModifier: 1.5,
    customerGenModifier: 1.3,
    pros: ["Naval Tech: +30% speed", "Exploration Boom: +50% revenue", "Adventurers: +30% customers"],
    cons: []
  },
  {
    id: "frenchrev",
    name: "French Revolution",
    era: "1789 AD",
    baseFare: 1500,
    unlockCost: computeUnlockCost(27),
    color: "#0055A4",
    description: "Liberty, equality, fraternity!",
    speedModifier: 0.9,
    revenueModifier: 1.8,
    customerGenModifier: 0.8,
    pros: ["Revolutionary Interest: +80% revenue"],
    cons: ["Unstable Period: -10% speed", "Dangerous Times: -20% customers"]
  },
  {
    id: "americanrev",
    name: "American Revolution",
    era: "1776 AD",
    baseFare: 1600,
    unlockCost: computeUnlockCost(28),
    color: "#B22234",
    description: "Witness the birth of a nation!",
    speedModifier: 1.0,
    revenueModifier: 1.7,
    customerGenModifier: 1.0,
    pros: ["Historic Moment: +70% revenue"],
    cons: []
  },
  {
    id: "victorian",
    name: "Victorian Era",
    era: "1860 AD",
    baseFare: 1700,
    unlockCost: computeUnlockCost(29),
    color: "#800020",
    description: "Experience British elegance!",
    speedModifier: 1.4,
    revenueModifier: 1.4,
    customerGenModifier: 1.5,
    pros: ["Industrial Prosperity: +40% revenue", "Rail Networks: +40% speed", "Peak Tourism: +50% customers"],
    cons: []
  },
  {
    id: "ww1",
    name: "World War I",
    era: "1918 AD",
    baseFare: 1800,
    unlockCost: computeUnlockCost(30),
    color: "#556B2F",
    description: "The war to end all wars!",
    speedModifier: 0.8,
    revenueModifier: 2.0,
    customerGenModifier: 0.6,
    pros: ["Historic Significance: +100% revenue"],
    cons: ["Wartime: -20% speed", "Dangerous: -40% customers"]
  },
  {
    id: "ww2",
    name: "World War II",
    era: "1945 AD",
    baseFare: 1900,
    unlockCost: computeUnlockCost(31),
    color: "#2F4F4F",
    description: "History's greatest conflict!",
    speedModifier: 0.7,
    revenueModifier: 2.2,
    customerGenModifier: 0.6,
    pros: ["Peak Historic Value: +120% revenue"],
    cons: ["Combat Zones: -30% speed", "High Risk: -40% customers"]
  },
  {
    id: "moonlanding",
    name: "Moon Landing",
    era: "1969 AD",
    baseFare: 2000,
    unlockCost: computeUnlockCost(32),
    color: "#C0C0C0",
    description: "One small step for man!",
    speedModifier: 1.6,
    revenueModifier: 1.8,
    customerGenModifier: 1.2,
    pros: ["Space Race: +60% speed", "Iconic Moment: +80% revenue", "Global Interest: +20% customers"],
    cons: []
  },
  {
    id: "digital",
    name: "Digital Age",
    era: "2000 AD",
    baseFare: 2100,
    unlockCost: computeUnlockCost(33),
    color: "#00CED1",
    description: "The dawn of the internet!",
    speedModifier: 1.7,
    revenueModifier: 1.3,
    customerGenModifier: 1.6,
    pros: ["Tech Boom: +70% speed", "Dot-com Wealth: +30% revenue", "Connected World: +60% customers"],
    cons: []
  },
  {
    id: "atlantis",
    name: "Atlantis",
    era: "Mythical",
    baseFare: 2200,
    unlockCost: computeUnlockCost(34),
    color: "#00BFFF",
    description: "Discover the lost city beneath the waves!",
    speedModifier: 0.8,
    revenueModifier: 3.0,
    customerGenModifier: 0.7,
    pros: ["Legendary Destination: +200% revenue"],
    cons: ["Underwater: -20% speed", "Mythical Risk: -30% customers"]
  },
  {
    id: "camelot",
    name: "Camelot",
    era: "Mythical",
    baseFare: 2300,
    unlockCost: computeUnlockCost(35),
    color: "#FFD700",
    description: "Join King Arthur's round table!",
    speedModifier: 1.0,
    revenueModifier: 2.5,
    customerGenModifier: 1.0,
    pros: ["Arthurian Legend: +150% revenue"],
    cons: []
  },
  {
    id: "olympus",
    name: "Mount Olympus",
    era: "Mythical",
    baseFare: 2400,
    unlockCost: computeUnlockCost(36),
    color: "#FFFACD",
    description: "Mingle with the Greek gods!",
    speedModifier: 1.2,
    revenueModifier: 2.8,
    customerGenModifier: 0.9,
    pros: ["Divine Presence: +180% revenue", "Godly Speed: +20% speed"],
    cons: ["Divine Politics: -10% customers"]
  },
  {
    id: "steampunk",
    name: "Steampunk Era",
    era: "Alternate 1890s",
    baseFare: 2500,
    unlockCost: computeUnlockCost(37),
    color: "#B87333",
    description: "Brass, steam, and Victorian sci-fi!",
    speedModifier: 1.3,
    revenueModifier: 2.0,
    customerGenModifier: 1.3,
    pros: ["Steam Innovation: +30% speed", "Retro-Future: +100% revenue", "Unique Appeal: +30% customers"],
    cons: []
  },
  {
    id: "dieselpunk",
    name: "Dieselpunk Era",
    era: "Alternate 1940s",
    baseFare: 2600,
    unlockCost: computeUnlockCost(38),
    color: "#696969",
    description: "Diesel engines and art deco!",
    speedModifier: 1.4,
    revenueModifier: 1.9,
    customerGenModifier: 1.2,
    pros: ["Diesel Power: +40% speed", "Industrial Art: +90% revenue", "Retrofuturism: +20% customers"],
    cons: []
  },
  {
    id: "postapoc",
    name: "Post-Apocalypse",
    era: "2150 AD",
    baseFare: 2700,
    unlockCost: computeUnlockCost(39),
    color: "#8B4726",
    description: "Survive the wasteland!",
    speedModifier: 0.6,
    revenueModifier: 2.5,
    customerGenModifier: 0.6,
    pros: ["Wasteland Premium: +150% revenue"],
    cons: ["Destroyed Infrastructure: -40% speed", "Survivor Scarcity: -40% customers"]
  },
  {
    id: "mars",
    name: "Mars Colony",
    era: "2250 AD",
    baseFare: 2800,
    unlockCost: computeUnlockCost(40),
    color: "#CD5C5C",
    description: "Red planet pioneers!",
    speedModifier: 1.5,
    revenueModifier: 2.0,
    customerGenModifier: 1.0,
    pros: ["Interplanetary: +50% speed", "Colonial Premium: +100% revenue"],
    cons: []
  },
  {
    id: "asteroid",
    name: "Asteroid Belt",
    era: "2300 AD",
    baseFare: 2900,
    unlockCost: computeUnlockCost(41),
    color: "#778899",
    description: "Mine the cosmic frontier!",
    speedModifier: 1.4,
    revenueModifier: 2.2,
    customerGenModifier: 0.8,
    pros: ["Zero-G Routes: +40% speed", "Mining Boom: +120% revenue"],
    cons: ["Remote: -20% customers"]
  },
  {
    id: "jupiter",
    name: "Jupiter Station",
    era: "2400 AD",
    baseFare: 3000,
    unlockCost: computeUnlockCost(42),
    color: "#DEB887",
    description: "Orbit the gas giant!",
    speedModifier: 1.6,
    revenueModifier: 2.3,
    customerGenModifier: 0.9,
    pros: ["Deep Space: +60% speed", "Frontier Premium: +130% revenue"],
    cons: ["Far Out: -10% customers"]
  },
  {
    id: "interstellar",
    name: "Interstellar Age",
    era: "3000 AD",
    baseFare: 3200,
    unlockCost: computeUnlockCost(43),
    color: "#191970",
    description: "Cross the stars!",
    speedModifier: 1.8,
    revenueModifier: 2.5,
    customerGenModifier: 1.0,
    pros: ["FTL Travel: +80% speed", "Stellar Premium: +150% revenue"],
    cons: []
  },
  {
    id: "galactic",
    name: "Galactic Empire",
    era: "4000 AD",
    baseFare: 3400,
    unlockCost: computeUnlockCost(44),
    color: "#4B0082",
    description: "Rule the galaxy!",
    speedModifier: 1.9,
    revenueModifier: 2.8,
    customerGenModifier: 1.2,
    pros: ["Hyperlanes: +90% speed", "Imperial Wealth: +180% revenue", "Galaxy-Wide: +20% customers"],
    cons: []
  },
  {
    id: "singularity",
    name: "The Singularity",
    era: "6000 AD",
    baseFare: 3600,
    unlockCost: computeUnlockCost(45),
    color: "#FF00FF",
    description: "Transcend humanity!",
    speedModifier: 0.9,
    revenueModifier: 3.5,
    customerGenModifier: 0.7,
    pros: ["Post-Human: +250% revenue"],
    cons: ["Reality Flux: -10% speed", "Limited Participants: -30% customers"]
  },
  {
    id: "postscarcity",
    name: "Post-Scarcity",
    era: "7500 AD",
    baseFare: 3800,
    unlockCost: computeUnlockCost(46),
    color: "#7FFFD4",
    description: "Unlimited abundance!",
    speedModifier: 2.0,
    revenueModifier: 3.0,
    customerGenModifier: 1.5,
    pros: ["Infinite Resources: +100% speed", "Universal Wealth: +200% revenue", "Paradise Tourism: +50% customers"],
    cons: []
  },
  {
    id: "timeloop",
    name: "Time Loop Nexus",
    era: "10,000 AD",
    baseFare: 4000,
    unlockCost: computeUnlockCost(47),
    color: "#00FF7F",
    description: "Stuck in infinite recursion!",
    speedModifier: 0.5,
    revenueModifier: 4.0,
    customerGenModifier: 0.8,
    pros: ["Temporal Paradox: +300% revenue"],
    cons: ["Loop Lag: -50% speed", "Existential Dread: -20% customers"]
  },
  {
    id: "multiversal",
    name: "Multiversal Hub",
    era: "100,000 AD",
    baseFare: 4500,
    unlockCost: computeUnlockCost(48),
    color: "#9400D3",
    description: "Where all realities converge!",
    speedModifier: 1.5,
    revenueModifier: 4.5,
    customerGenModifier: 1.0,
    pros: ["Reality Shifting: +50% speed", "Infinite Demand: +350% revenue"],
    cons: []
  },
  {
    id: "temporal",
    name: "Temporal Singularity",
    era: "Γê₧",
    baseFare: 5000,
    unlockCost: computeUnlockCost(49),
    color: "#FF1493",
    description: "Beyond time and space!",
    speedModifier: 1.0,
    revenueModifier: 5.0,
    customerGenModifier: 0.5,
    pros: ["Ultimate Destination: +400% revenue"],
    cons: ["Timeless State: -50% customers"]
  }
];

export type CustomerState = "spawning" | "approaching" | "waiting" | "boarding" | "traveling";

export interface CustomerEntity {
  id: string;
  state: CustomerState;
  spawnTime: number;
  stateChangedTime: number;
  colorIndex: number;
  targetPosition?: [number, number, number];
  hasReachedTarget?: boolean;
  isVIP?: boolean;
  assignedMachineIndex?: number;
}

interface IdleGameState {
  chronocoins: number;
  totalEarned: number;
  
  prestigeLevel: number;
  prestigePoints: number;
  
  timeMachineLevel: number;
  timeMachineCapacity: number;
  timeMachineSpeed: number;
  timeMachineCount: number;
  
  customerGenerationRate: number;
  waitingCustomers: number;
  processingCustomers: number;
  totalCustomersServed: number;
  totalTripsCompleted: number;
  tripEndTime: number | null;
  
  totalManagerUpgrades: number;
  
  customerEntities: CustomerEntity[];
  nextCustomerId: number;
  
  unlockedDestinations: string[];
  currentDestination: string;
  
  lastUpdateTime: number;
  lastPlayTime: number;
  lastTemporalBeaconTime: number;
  
  tutorialShown: boolean;
  setTutorialShown: () => void;
  
  prestigeTutorialShown: boolean;
  setPrestigeTutorialShown: () => void;
  
  coinsPerSecond: number;
  lastClickBoostTime?: number;
  
  addChronocoins: (amount: number) => void;
  spendChronocoins: (amount: number) => boolean;
  
  calculateBulkCost: (baseCost: number, multiplier: number, currentLevel: number, quantity: number) => number;
  computeMaxAffordable: (baseCost: number, multiplier: number, currentLevel: number, availableFunds: number) => number;
  
  upgradeTimeMachine: (quantity?: number) => boolean;
  upgradeCapacity: (quantity?: number) => boolean;
  upgradeSpeed: (quantity?: number) => boolean;
  upgradeCustomerRate: (quantity?: number) => boolean;
  buyTimeMachine: (quantity?: number) => boolean;
  
  unlockDestination: (destinationId: string) => boolean;
  setDestination: (destinationId: string) => void;
  
  clickBoost: () => void;
  
  prestige: () => void;
  
  calculateOfflineEarnings: () => number;
  claimOfflineEarnings: () => void;
  
  spawnCustomerEntity: (isVIP?: boolean) => void;
  updateCustomerStates: () => void;
  markEntityReachedTarget: (entityId: string) => void;
  boardCustomers: (count: number) => void;
  
  update: (deltaTime: number, managerBonuses?: {customerRate: number, speed: number, revenue: number}, managerPerks?: {hasVIP: boolean, hasSlipstream: boolean, hasTimeShare: boolean, hasTemporalBeacon: boolean}) => void;
  
  getTimeMachineUpgradeCost: (quantity?: number) => number;
  getCapacityUpgradeCost: (quantity?: number) => number;
  getSpeedUpgradeCost: (quantity?: number) => number;
  getCustomerRateUpgradeCost: (quantity?: number) => number;
  getTimeMachineBuyCost: (quantity?: number) => number;
  
  getRevenueMultiplier: (managerBonus?: number) => number;
  getSpeedMultiplier: (managerBonus?: number) => number;
  
  getCurrentFare: () => number;
}

export const useIdleGame = create<IdleGameState>()(
  persist(
  subscribeWithSelector((set, get) => ({
    chronocoins: 0,
    totalEarned: 0,
    
    prestigeLevel: 0,
    prestigePoints: 0,
    
    timeMachineLevel: 1,
    timeMachineCapacity: 1,
    timeMachineSpeed: 1,
    timeMachineCount: 1,
    
    customerGenerationRate: 1,
    waitingCustomers: 0,
    processingCustomers: 0,
    totalCustomersServed: 0,
    totalTripsCompleted: 0,
    tripEndTime: null,
    
    totalManagerUpgrades: 0,
    
    customerEntities: [],
    nextCustomerId: 0,
    
    unlockedDestinations: ["dinosaur"],
    currentDestination: "dinosaur",
    
    lastUpdateTime: Date.now(),
    lastPlayTime: Date.now(),
    lastTemporalBeaconTime: 0,
    
    tutorialShown: false,
    setTutorialShown: () => set({ tutorialShown: true }),
    
    prestigeTutorialShown: false,
    setPrestigeTutorialShown: () => set({ prestigeTutorialShown: true }),
    
    coinsPerSecond: 0,
    lastClickBoostTime: undefined,
    
    addChronocoins: (amount) => {
      set((state) => ({
        chronocoins: state.chronocoins + amount,
        totalEarned: state.totalEarned + amount
      }));
    },
    
    spendChronocoins: (amount) => {
      const state = get();
      if (state.chronocoins >= amount) {
        set({ chronocoins: state.chronocoins - amount });
        return true;
      }
      return false;
    },
    
    calculateBulkCost: (baseCost: number, multiplier: number, currentLevel: number, quantity: number) => {
      if (quantity === 1) {
        const result = Math.floor(baseCost * Math.pow(multiplier, currentLevel - 1));
        return Math.min(result, Number.MAX_SAFE_INTEGER);
      }
      const firstCost = baseCost * Math.pow(multiplier, currentLevel - 1);
      const sum = firstCost * (Math.pow(multiplier, quantity) - 1) / (multiplier - 1);
      return Math.min(Math.round(sum), Number.MAX_SAFE_INTEGER);
    },
    
    computeMaxAffordable: (baseCost: number, multiplier: number, currentLevel: number, availableFunds: number) => {
      if (availableFunds < baseCost * Math.pow(multiplier, currentLevel - 1)) {
        return 0;
      }
      
      let lower = 1;
      let upper = 2;
      
      const state = get();
      while (true) {
        const cost = state.calculateBulkCost(baseCost, multiplier, currentLevel, upper);
        if (!isFinite(cost) || cost > availableFunds) break;
        lower = upper;
        upper *= 2;
        if (upper > 1000) break;
      }
      
      while (lower < upper - 1) {
        const mid = Math.floor((lower + upper) / 2);
        const cost = state.calculateBulkCost(baseCost, multiplier, currentLevel, mid);
        if (!isFinite(cost)) { upper = mid; continue; }
        if (cost <= availableFunds) {
          lower = mid;
        } else {
          upper = mid;
        }
      }
      
      return lower;
    },
    
    getTimeMachineUpgradeCost: (quantity: number = 1) => {
      const state = get();
      return state.calculateBulkCost(100, 1.7, state.timeMachineLevel, quantity);
    },
    
    getCapacityUpgradeCost: (quantity: number = 1) => {
      const state = get();
      return state.calculateBulkCost(50, 1.6, state.timeMachineCapacity, quantity);
    },
    
    getSpeedUpgradeCost: (quantity: number = 1) => {
      const state = get();
      return state.calculateBulkCost(75, 1.65, state.timeMachineSpeed, quantity);
    },
    
    getCustomerRateUpgradeCost: (quantity: number = 1) => {
      const state = get();
      return state.calculateBulkCost(200, 1.8, state.customerGenerationRate, quantity);
    },
    
    getTimeMachineBuyCost: (quantity: number = 1) => {
      const state = get();
      return state.calculateBulkCost(10000, 3, state.timeMachineCount, quantity);
    },
    
    upgradeTimeMachine: (quantity: number = 1) => {
      const state = get();
      const cost = state.getTimeMachineUpgradeCost(quantity);
      if (state.spendChronocoins(cost)) {
        set({ timeMachineLevel: state.timeMachineLevel + quantity });
        return true;
      }
      return false;
    },
    
    upgradeCapacity: (quantity: number = 1) => {
      const state = get();
      const cost = state.getCapacityUpgradeCost(quantity);
      if (state.spendChronocoins(cost)) {
        set({ timeMachineCapacity: state.timeMachineCapacity + quantity });
        return true;
      }
      return false;
    },
    
    upgradeSpeed: (quantity: number = 1) => {
      const state = get();
      const cost = state.getSpeedUpgradeCost(quantity);
      if (state.spendChronocoins(cost)) {
        set({ timeMachineSpeed: state.timeMachineSpeed + quantity });
        return true;
      }
      return false;
    },
    
    upgradeCustomerRate: (quantity: number = 1) => {
      const state = get();
      const cost = state.getCustomerRateUpgradeCost(quantity);
      if (state.spendChronocoins(cost)) {
        set({ customerGenerationRate: state.customerGenerationRate + quantity });
        return true;
      }
      return false;
    },
    
    buyTimeMachine: (quantity: number = 1) => {
      const state = get();
      const cost = state.getTimeMachineBuyCost(quantity);
      if (state.spendChronocoins(cost)) {
        set({ timeMachineCount: state.timeMachineCount + quantity });
        return true;
      }
      return false;
    },
    
    unlockDestination: (destinationId) => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === destinationId);
      if (!destination || state.unlockedDestinations.includes(destinationId)) {
        return false;
      }
      
      if (state.spendChronocoins(destination.unlockCost)) {
        set({
          unlockedDestinations: [...state.unlockedDestinations, destinationId],
          currentDestination: destinationId
        });
        return true;
      }
      return false;
    },
    
    setDestination: (destinationId) => {
      const state = get();
      if (state.unlockedDestinations.includes(destinationId)) {
        set({ currentDestination: destinationId });
      }
    },
    
    clickBoost: () => {
      const state = get();
      const fare = state.getCurrentFare();
      const clickRevenue = fare * 5;
      state.addChronocoins(clickRevenue);
      
      const clickTimestamp = Date.now();
      
      set({ 
        coinsPerSecond: clickRevenue,
        lastClickBoostTime: clickTimestamp
      });
      
      setTimeout(() => {
        const currentState = get();
        if (currentState.lastClickBoostTime === clickTimestamp) {
          set({ coinsPerSecond: 0 });
        }
      }, 10000);
    },
    
    prestige: () => {
      const state = get();
      const { earnReq, levelReq, countReq } = getPrestigeRequirements(state.prestigeLevel);
      if (state.totalEarned < earnReq) return;
      if (state.timeMachineLevel < levelReq) return;
      if (state.timeMachineCount < countReq) return;
      
      const points = Math.max(1, Math.floor(state.totalEarned / 10000000));
      
      // Trigger perk choice
      usePrestigePerks.getState().setPendingChoice(true);
      
      set({
        chronocoins: 0,
        totalEarned: 0,
        prestigeLevel: state.prestigeLevel + 1,
        prestigePoints: state.prestigePoints + points,
        timeMachineLevel: 1,
        timeMachineCapacity: 1,
        timeMachineSpeed: 1,
        timeMachineCount: Math.max(1, 1 + usePrestigePerks.getState().getPerkValue("machine_retention")),
        customerGenerationRate: 1,
        waitingCustomers: 0,
        processingCustomers: 0,
        tripEndTime: null,
        customerEntities: [],
        nextCustomerId: 0,
        unlockedDestinations: ["dinosaur"],
        currentDestination: "dinosaur"
      });
    },
    
    calculateOfflineEarnings: () => {
      const state = get();
      const now = Date.now();
      const timeAway = now - state.lastPlayTime;
      const minutesAway = timeAway / 1000 / 60;
      
      if (minutesAway < 1) return 0;
      
      const maxMinutes = Math.min(minutesAway, 240);
      
      const savedCps = state.coinsPerSecond;
      if (savedCps <= 0) return 0;
      const revenueMultiplier = 1 + (state.prestigePoints * 0.1);
      return Math.floor(savedCps * 60 * maxMinutes * revenueMultiplier * usePrestigePerks.getState().getPerkValue("offline_efficiency"));
    },
    
    claimOfflineEarnings: () => {
      const earnings = get().calculateOfflineEarnings();
      if (earnings > 0) {
        get().addChronocoins(earnings);
        set({ lastPlayTime: Date.now() });
      }
    },
    
    spawnCustomerEntity: (isVIP = false) => {
      const state = get();
      const id = `customer-${state.nextCustomerId}`;
      const colorIndex = state.nextCustomerId % 5;
      const now = Date.now();
      
      const newEntity: CustomerEntity = {
        id,
        state: "spawning",
        spawnTime: now,
        stateChangedTime: now,
        colorIndex,
        hasReachedTarget: false,
        isVIP
      };
      
      set({
        customerEntities: [...state.customerEntities, newEntity],
        nextCustomerId: state.nextCustomerId + 1
      });
    },
    
    updateCustomerStates: () => {
      const state = get();
      const now = Date.now();
      
      const waitingAndApproachingCount = state.customerEntities.filter(
        e => e.state === "waiting" || e.state === "approaching"
      ).length;
      
      const updatedEntities = state.customerEntities.map((entity, index) => {
        if (entity.state === "spawning" && now - entity.stateChangedTime > 100) {
          const queueIndex = state.customerEntities.filter(
            (e, i) => i < index && (e.state === "waiting" || e.state === "approaching")
          ).length;
          
          const QUEUE_START: [number, number, number] = [-6, 0, -2];
          const queuePos: [number, number, number] = [
            QUEUE_START[0] + Math.floor(queueIndex / 5) * 0.8,
            QUEUE_START[1],
            QUEUE_START[2] + (queueIndex % 5) * 0.6
          ];
          
          return { 
            ...entity, 
            state: "approaching" as CustomerState, 
            stateChangedTime: now,
            targetPosition: queuePos
          };
        }
        if (entity.state === "approaching" && entity.hasReachedTarget) {
          return { ...entity, state: "waiting" as CustomerState, stateChangedTime: now };
        }
        if (entity.state === "approaching" && now - entity.stateChangedTime > 5000) {
          return { ...entity, state: "waiting" as CustomerState, stateChangedTime: now };
        }
        return entity;
      });
      
      const hasChanges = updatedEntities.some((entity, index) => 
        entity.state !== state.customerEntities[index]?.state ||
        entity.targetPosition !== state.customerEntities[index]?.targetPosition
      );
      
      if (hasChanges) {
        set({ customerEntities: updatedEntities });
      }
    },
    
    markEntityReachedTarget: (entityId: string) => {
      const state = get();
      const updatedEntities = state.customerEntities.map(entity => {
        if (entity.id === entityId && !entity.hasReachedTarget) {
          return { ...entity, hasReachedTarget: true };
        }
        return entity;
      });
      
      set({ customerEntities: updatedEntities });
    },
    
    boardCustomers: (count) => {
      const state = get();
      const now = Date.now();
      
      useAudio.getState().playBoarding();
      
      const waitingEntities = state.customerEntities.filter(
        e => e.state === "waiting"
      ).slice(0, count);
      
      const updatedEntities = state.customerEntities.map((entity, idx) => {
        const waitingIndex = waitingEntities.findIndex(e => e.id === entity.id);
        if (waitingIndex >= 0) {
          const machineIndex = waitingIndex % state.timeMachineCount;
          return { 
            ...entity, 
            state: "boarding" as CustomerState, 
            stateChangedTime: now,
            assignedMachineIndex: machineIndex
          };
        }
        return entity;
      });
      
      set({ customerEntities: updatedEntities });
      
      setTimeout(() => {
        const currentState = get();
        const travelingEntities = currentState.customerEntities.map(entity => {
          if (waitingEntities.find(e => e.id === entity.id) && entity.state === "boarding") {
            return { ...entity, state: "traveling" as CustomerState, stateChangedTime: Date.now() };
          }
          return entity;
        });
        
        set({ customerEntities: travelingEntities });
      }, 500);
    },
    
    getRevenueMultiplier: (managerBonus = 0) => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      const destinationMod = destination?.revenueModifier || 1.0;
      
      const artifactsStore = useArtifacts.getState();
      const artifactBonus = artifactsStore.getDestinationRevenueBonus(state.currentDestination);
      
      const chronoBonus = useChronoMeter.getState().getBonus();
      let multiplier = (1 + (state.prestigePoints * 0.1) + managerBonus + artifactBonus + chronoBonus) * destinationMod;
      
      return multiplier;
    },
    
    getSpeedMultiplier: (managerBonus = 0) => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      const destinationMod = destination?.speedModifier || 1.0;
      
      let multiplier = (1 + managerBonus) * destinationMod;
      
      return multiplier;
    },
    
    getCurrentFare: () => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      if (!destination) return 10;
      
      return Math.floor(destination.baseFare * state.timeMachineLevel);
    },
    
    update: (deltaTime, managerBonuses, managerPerks) => {
      const state = get();
      const now = Date.now();
      
      const bonuses = managerBonuses || {customerRate: 0, speed: 0, revenue: 0};
      const perks = managerPerks || {hasVIP: false, hasSlipstream: false, hasTimeShare: false, hasTemporalBeacon: false};
      
      if (perks.hasTemporalBeacon && now - state.lastTemporalBeaconTime >= 60000) {
        set({ lastTemporalBeaconTime: now });
      }
      
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      const destinationCustomerMod = destination?.customerGenModifier || 1.0;
      
      let customerGenRate = state.customerGenerationRate * 0.5 * (1 + bonuses.customerRate) * destinationCustomerMod;
      
      if (perks.hasTemporalBeacon && now - state.lastTemporalBeaconTime < 1000) {
        customerGenRate *= 2;
      }
      
      const newCustomers = customerGenRate * (deltaTime / 1000);
      
      const travelTime = 3000 / (state.timeMachineSpeed * state.getSpeedMultiplier(bonuses.speed));
      const capacity = state.timeMachineCapacity * state.timeMachineCount;
      
      let waitingCustomers = state.waitingCustomers + newCustomers;
      
      const queueEntitiesCount = state.customerEntities.filter(
        e => e.state === "approaching" || e.state === "waiting"
      ).length;
      
      const targetEntityCount = Math.min(Math.floor(waitingCustomers), 25);
      const entitiesToSpawn = Math.max(0, targetEntityCount - queueEntitiesCount);
      
      if (entitiesToSpawn > 0 && state.customerEntities.length < 25) {
        const batchCount = Math.min(entitiesToSpawn, 25 - state.customerEntities.length);
        const newEntities: CustomerEntity[] = [];
        let nextId = state.nextCustomerId;
        for (let i = 0; i < batchCount; i++) {
          const id = `customer-${nextId}`;
          const colorIndex = nextId % 5;
          const isVIP = perks.hasVIP && Math.random() < 0.01;
          newEntities.push({
            id,
            state: "spawning",
            spawnTime: now,
            stateChangedTime: now,
            colorIndex,
            hasReachedTarget: false,
            isVIP
          });
          nextId++;
        }
        set((s) => ({
          customerEntities: [...s.customerEntities, ...newEntities],
          nextCustomerId: nextId,
        }));
      }
      
      state.updateCustomerStates();
      
      if (state.tripEndTime !== null && now >= state.tripEndTime) {
        const fare = state.getCurrentFare();
        const travelingCustomers = state.customerEntities.filter(e => e.state === "traveling");
        const vipCount = travelingCustomers.filter(c => c.isVIP).length;
        const normalCount = travelingCustomers.length - vipCount;
        
        let baseRevenue = fare * normalCount;
        const vipRevenue = fare * 100 * vipCount;
        baseRevenue += vipRevenue;
        
        const timeShareMultiplier = perks.hasTimeShare && Math.random() < 0.05 ? 3 : 1;
        const revenue = baseRevenue * timeShareMultiplier * state.getRevenueMultiplier(bonuses.revenue);
        
        state.addChronocoins(revenue);
        
        const coinsPerSec = revenue / (travelTime / 1000);
        set({ coinsPerSecond: coinsPerSec });
        
        const artifactsStore = useArtifacts.getState();
        const droppedArtifact = artifactsStore.checkForArtifactDrop(state.currentDestination);
        if (droppedArtifact) {
          const isFirstDiscovery = !artifactsStore.hasArtifact(droppedArtifact.id);
          artifactsStore.discoverArtifact(droppedArtifact.id);
          
          const rarityColors = {
            common: "[Common]",
            uncommon: "[Uncommon]",
            rare: "[Rare]",
            epic: "[Epic]",
            legendary: "[Legendary]"
          };
          
          const discoveryMessages: Record<string, string> = {
            trex_tooth: "A passenger accidentally kicked it loose from a fossil bed!",
            raptor_claw: "Found stuck in your time machine's seat cushion... somehow.",
            amber_fossil: "A tourist dropped it while frantically running from a T-Rex!",
            dino_egg_shell: "Your customer sat on it by mistake. Oops.",
            fern_print: "Peeled off the ground after a heavy landing!",
            
            golden_ankh: "A pharaoh tossed it as a tip for an excellent trip!",
            scarab_amulet: "Found wedged between pyramid stones during pickup.",
            papyrus_scroll: "Blown into the cabin by a desert sandstorm!",
            canopic_jar: "A mummy left this behind. No, really.",
            clay_tablet: "Accidentally swapped for a customer's luggage!",
            
            excalibur_shard: "Chipped off during a jousting tournament detour!",
            holy_grail_piece: "A monk dropped it while boarding in a hurry.",
            knights_signet: "Rolled under your seat during a bumpy castle landing!",
            chainmail_link: "Snagged on your time machine during a battlefield pickup.",
            wooden_shield: "Splintered off when a knight used your door as cover!",
            
            davinci_sketch: "Leonardo himself doodled it on your napkin!",
            galileo_lens: "He forgot it while star-gazing from your observation deck.",
            medici_coin: "Payment from a wealthy patron - overly generous!",
            artists_palette: "Michelangelo left it behind after getting paint everywhere.",
            printing_block: "Gutenberg traded it for a ride to the future!",
            
            steam_governor: "Fell off a train you were racing against!",
            edison_bulb: "Edison himself tested it in your cabin. It works!",
            factory_blueprint: "Blown out of an industrial magnate's briefcase.",
            brass_gear: "Popped loose from a malfunctioning machine nearby.",
            coal_sample: "A worker accidentally dropped his lunch pail!",
            
            quantum_core: "A tech entrepreneur left it as collateral for the fare!",
            neural_chip: "Downloaded from a passenger's failed brain backup.",
            fusion_cell: "Swapped for your outdated battery by a helpful engineer.",
            holo_projector: "A kid dropped it playing holographic games in transit.",
            smart_fabric: "Torn from a passenger's self-repairing jacket!"
          };
          
          const discoveryMsg = discoveryMessages[droppedArtifact.id] || "Your passenger accidentally left it behind!";
          
          if (isFirstDiscovery) {
            toast.success(`Artifact Discovered!`, {
              description: `${rarityColors[droppedArtifact.rarity]} ${droppedArtifact.name} - ${discoveryMsg}`,
              duration: 5000
            });
          }
        }
        
        const travelingEntities = state.customerEntities.filter(e => e.state !== "traveling");
        
        useAudio.getState().playTimeTravel();
        
        set({
          processingCustomers: 0,
          tripEndTime: null,
          totalCustomersServed: state.totalCustomersServed + state.processingCustomers,
          totalTripsCompleted: state.totalTripsCompleted + 1,
          customerEntities: travelingEntities
        });
      }
      
      if (state.processingCustomers === 0 && waitingCustomers >= 1) {
        const canProcess = Math.min(Math.floor(waitingCustomers), capacity);
        waitingCustomers -= canProcess;
        
        state.boardCustomers(canProcess);
        
        const slipstreamChance = perks.hasSlipstream && Math.random() < 0.5;
        const actualTravelTime = slipstreamChance ? 0 : travelTime;
        
        set({
          processingCustomers: canProcess,
          tripEndTime: now + actualTravelTime
        });
      }
      
      set({
        waitingCustomers: waitingCustomers,
        lastUpdateTime: now
      });
    }
  })),
  {
    name: "chronotransit-idle-game",
    // Only persist the fields that matter for offline recovery
    // customerEntities and runtime state are intentionally excluded to avoid stale data
    partialize: (state) => ({
      chronocoins: state.chronocoins,
      totalEarned: state.totalEarned,
      prestigeLevel: state.prestigeLevel,
      prestigePoints: state.prestigePoints,
      timeMachineLevel: state.timeMachineLevel,
      timeMachineCapacity: state.timeMachineCapacity,
      timeMachineSpeed: state.timeMachineSpeed,
      timeMachineCount: state.timeMachineCount,
      customerGenerationRate: state.customerGenerationRate,
      waitingCustomers: state.waitingCustomers,
      totalCustomersServed: state.totalCustomersServed,
      totalTripsCompleted: state.totalTripsCompleted,
      totalManagerUpgrades: state.totalManagerUpgrades,
      nextCustomerId: state.nextCustomerId,
      unlockedDestinations: state.unlockedDestinations,
      currentDestination: state.currentDestination,
      tutorialShown: state.tutorialShown,
      prestigeTutorialShown: state.prestigeTutorialShown,
      lastPlayTime: state.lastPlayTime,
      coinsPerSecond: state.coinsPerSecond,
    }),
  }
  )
);

if (typeof window !== 'undefined') {
  (window as any).__idleGameStore = useIdleGame;
}
