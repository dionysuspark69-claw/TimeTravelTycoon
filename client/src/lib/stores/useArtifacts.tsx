import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ArtifactRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Artifact {
  id: string;
  name: string;
  destinationId: string;
  rarity: ArtifactRarity;
  description: string;
  dropRate: number;
  revenueBonus: number;
}

export interface ArtifactCollection {
  destinationId: string;
  name: string;
  artifacts: Artifact[];
  setBonusDescription: string;
  setBonusMultiplier: number;
}

export const ARTIFACT_COLLECTIONS: ArtifactCollection[] = [
  {
    destinationId: "dinosaur",
    name: "Dinosaur Era Collection",
    artifacts: [
      {
        id: "trex_tooth",
        name: "T-Rex Tooth",
        destinationId: "dinosaur",
        rarity: "legendary",
        description: "A massive fossilized tooth from the apex predator",
        dropRate: 0.0002,
        revenueBonus: 0.005
      },
      {
        id: "raptor_claw",
        name: "Raptor Claw",
        destinationId: "dinosaur",
        rarity: "epic",
        description: "A razor-sharp claw from a clever hunter",
        dropRate: 0.0005,
        revenueBonus: 0.005
      },
      {
        id: "amber_fossil",
        name: "Amber Fossil",
        destinationId: "dinosaur",
        rarity: "rare",
        description: "Ancient tree sap with preserved prehistoric insect",
        dropRate: 0.001,
        revenueBonus: 0.005
      },
      {
        id: "dino_egg_shell",
        name: "Dinosaur Egg Shell",
        destinationId: "dinosaur",
        rarity: "uncommon",
        description: "Fragment from a massive prehistoric egg",
        dropRate: 0.002,
        revenueBonus: 0.005
      },
      {
        id: "fern_print",
        name: "Fern Print",
        destinationId: "dinosaur",
        rarity: "common",
        description: "Perfectly preserved ancient plant impression",
        dropRate: 0.005,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Dinosaur Era",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "egypt",
    name: "Ancient Egypt Collection",
    artifacts: [
      {
        id: "golden_ankh",
        name: "Golden Ankh",
        destinationId: "egypt",
        rarity: "legendary",
        description: "Symbol of eternal life crafted in pure gold",
        dropRate: 0.0002,
        revenueBonus: 0.005
      },
      {
        id: "scarab_amulet",
        name: "Scarab Amulet",
        destinationId: "egypt",
        rarity: "epic",
        description: "Sacred beetle carved from lapis lazuli",
        dropRate: 0.0005,
        revenueBonus: 0.005
      },
      {
        id: "papyrus_scroll",
        name: "Papyrus Scroll",
        destinationId: "egypt",
        rarity: "rare",
        description: "Ancient hieroglyphic writings on preserved papyrus",
        dropRate: 0.001,
        revenueBonus: 0.005
      },
      {
        id: "canopic_jar",
        name: "Canopic Jar",
        destinationId: "egypt",
        rarity: "uncommon",
        description: "Ornate jar used in mummification rituals",
        dropRate: 0.002,
        revenueBonus: 0.005
      },
      {
        id: "clay_tablet",
        name: "Clay Tablet",
        destinationId: "egypt",
        rarity: "common",
        description: "Simple tablet with early written records",
        dropRate: 0.005,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Ancient Egypt",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "medieval",
    name: "Medieval Times Collection",
    artifacts: [
      {
        id: "excalibur_shard",
        name: "Excalibur Shard",
        destinationId: "medieval",
        rarity: "legendary",
        description: "Fragment of the legendary sword of kings",
        dropRate: 0.0002,
        revenueBonus: 0.005
      },
      {
        id: "holy_grail_piece",
        name: "Holy Grail Fragment",
        destinationId: "medieval",
        rarity: "epic",
        description: "Piece of the sacred chalice",
        dropRate: 0.0005,
        revenueBonus: 0.005
      },
      {
        id: "knights_signet",
        name: "Knight's Signet Ring",
        destinationId: "medieval",
        rarity: "rare",
        description: "Royal seal ring of a noble knight",
        dropRate: 0.001,
        revenueBonus: 0.005
      },
      {
        id: "chainmail_link",
        name: "Chainmail Link",
        destinationId: "medieval",
        rarity: "uncommon",
        description: "Forged iron link from battle armor",
        dropRate: 0.002,
        revenueBonus: 0.005
      },
      {
        id: "wooden_shield",
        name: "Wooden Shield Piece",
        destinationId: "medieval",
        rarity: "common",
        description: "Worn fragment of a soldier's shield",
        dropRate: 0.005,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Medieval Times",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "renaissance",
    name: "Renaissance Collection",
    artifacts: [
      {
        id: "davinci_sketch",
        name: "Da Vinci Sketch",
        destinationId: "renaissance",
        rarity: "legendary",
        description: "Original drawing by the master himself",
        dropRate: 0.0002,
        revenueBonus: 0.005
      },
      {
        id: "galileo_lens",
        name: "Galileo's Lens",
        destinationId: "renaissance",
        rarity: "epic",
        description: "Glass lens from the astronomer's telescope",
        dropRate: 0.0005,
        revenueBonus: 0.005
      },
      {
        id: "medici_coin",
        name: "Medici Gold Coin",
        destinationId: "renaissance",
        rarity: "rare",
        description: "Currency from the banking dynasty",
        dropRate: 0.001,
        revenueBonus: 0.005
      },
      {
        id: "artists_palette",
        name: "Artist's Palette",
        destinationId: "renaissance",
        rarity: "uncommon",
        description: "Well-used painting palette with original pigments",
        dropRate: 0.002,
        revenueBonus: 0.005
      },
      {
        id: "printing_block",
        name: "Printing Block",
        destinationId: "renaissance",
        rarity: "common",
        description: "Wooden block from early printing press",
        dropRate: 0.005,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Renaissance",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "industrial",
    name: "Industrial Revolution Collection",
    artifacts: [
      {
        id: "steam_governor",
        name: "Steam Governor",
        destinationId: "industrial",
        rarity: "legendary",
        description: "Original Watt governor from a steam engine",
        dropRate: 0.0002,
        revenueBonus: 0.005
      },
      {
        id: "edison_bulb",
        name: "Edison's Light Bulb",
        destinationId: "industrial",
        rarity: "epic",
        description: "First successful incandescent prototype",
        dropRate: 0.0005,
        revenueBonus: 0.005
      },
      {
        id: "factory_blueprint",
        name: "Factory Blueprint",
        destinationId: "industrial",
        rarity: "rare",
        description: "Original plans for revolutionary machinery",
        dropRate: 0.001,
        revenueBonus: 0.005
      },
      {
        id: "brass_gear",
        name: "Brass Gear",
        destinationId: "industrial",
        rarity: "uncommon",
        description: "Precision gear from early machines",
        dropRate: 0.002,
        revenueBonus: 0.005
      },
      {
        id: "coal_sample",
        name: "Coal Sample",
        destinationId: "industrial",
        rarity: "common",
        description: "Fuel that powered the revolution",
        dropRate: 0.005,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Industrial Revolution",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "future",
    name: "Near Future Collection",
    artifacts: [
      {
        id: "quantum_core",
        name: "Quantum Core",
        destinationId: "future",
        rarity: "legendary",
        description: "Stabilized quantum computing processor",
        dropRate: 0.0002,
        revenueBonus: 0.005
      },
      {
        id: "neural_chip",
        name: "Neural Interface Chip",
        destinationId: "future",
        rarity: "epic",
        description: "Direct brain-computer interface prototype",
        dropRate: 0.0005,
        revenueBonus: 0.005
      },
      {
        id: "fusion_cell",
        name: "Fusion Power Cell",
        destinationId: "future",
        rarity: "rare",
        description: "Miniature fusion reactor",
        dropRate: 0.001,
        revenueBonus: 0.005
      },
      {
        id: "holo_projector",
        name: "Holographic Projector",
        destinationId: "future",
        rarity: "uncommon",
        description: "3D hologram emitter device",
        dropRate: 0.002,
        revenueBonus: 0.005
      },
      {
        id: "smart_fabric",
        name: "Smart Fabric Sample",
        destinationId: "future",
        rarity: "common",
        description: "Self-cleaning programmable textile",
        dropRate: 0.005,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Near Future",
    setBonusMultiplier: 0.10
  }
];

export interface DiscoveredArtifact {
  artifactId: string;
  discoveredAt: number;
  count: number;
}

interface ArtifactsState {
  discoveries: DiscoveredArtifact[];
  totalDrops: number;
  
  hasArtifact: (artifactId: string) => boolean;
  getArtifactCount: (artifactId: string) => number;
  discoverArtifact: (artifactId: string) => void;
  getCollectionProgress: (destinationId: string) => number;
  isCollectionComplete: (destinationId: string) => boolean;
  getTotalRevenueBonus: () => number;
  getDestinationRevenueBonus: (destinationId: string) => number;
  checkForArtifactDrop: (destinationId: string) => Artifact | null;
}

export const useArtifacts = create<ArtifactsState>()(
  persist(
    (set, get) => ({
      discoveries: [],
      totalDrops: 0,
      
      hasArtifact: (artifactId) => {
        return get().discoveries.some(d => d.artifactId === artifactId);
      },
      
      getArtifactCount: (artifactId) => {
        const discovery = get().discoveries.find(d => d.artifactId === artifactId);
        return discovery?.count || 0;
      },
      
      discoverArtifact: (artifactId) => {
        const state = get();
        const existing = state.discoveries.find(d => d.artifactId === artifactId);
        
        if (existing) {
          set({
            discoveries: state.discoveries.map(d =>
              d.artifactId === artifactId
                ? { ...d, count: d.count + 1 }
                : d
            ),
            totalDrops: state.totalDrops + 1
          });
        } else {
          set({
            discoveries: [
              ...state.discoveries,
              {
                artifactId,
                discoveredAt: Date.now(),
                count: 1
              }
            ],
            totalDrops: state.totalDrops + 1
          });
        }
      },
      
      getCollectionProgress: (destinationId) => {
        const collection = ARTIFACT_COLLECTIONS.find(c => c.destinationId === destinationId);
        if (!collection) return 0;
        
        const discovered = collection.artifacts.filter(artifact =>
          get().hasArtifact(artifact.id)
        ).length;
        
        return discovered / collection.artifacts.length;
      },
      
      isCollectionComplete: (destinationId) => {
        return get().getCollectionProgress(destinationId) === 1;
      },
      
      getTotalRevenueBonus: () => {
        const state = get();
        let bonus = 0;
        
        state.discoveries.forEach(discovery => {
          const artifact = ARTIFACT_COLLECTIONS
            .flatMap(c => c.artifacts)
            .find(a => a.id === discovery.artifactId);
          
          if (artifact) {
            bonus += artifact.revenueBonus;
          }
        });
        
        ARTIFACT_COLLECTIONS.forEach(collection => {
          if (state.isCollectionComplete(collection.destinationId)) {
            bonus += collection.setBonusMultiplier;
          }
        });
        
        return bonus;
      },
      
      getDestinationRevenueBonus: (destinationId) => {
        const state = get();
        const collection = ARTIFACT_COLLECTIONS.find(c => c.destinationId === destinationId);
        if (!collection) return 0;
        
        let bonus = 0;
        
        collection.artifacts.forEach(artifact => {
          if (state.hasArtifact(artifact.id)) {
            bonus += artifact.revenueBonus;
          }
        });
        
        if (state.isCollectionComplete(destinationId)) {
          bonus += collection.setBonusMultiplier;
        }
        
        return bonus;
      },
      
      checkForArtifactDrop: (destinationId) => {
        const collection = ARTIFACT_COLLECTIONS.find(c => c.destinationId === destinationId);
        if (!collection) return null;
        
        for (const artifact of collection.artifacts) {
          if (Math.random() < artifact.dropRate) {
            return artifact;
          }
        }
        
        return null;
      }
    }),
    {
      name: "chronotransit-artifacts"
    }
  )
);
