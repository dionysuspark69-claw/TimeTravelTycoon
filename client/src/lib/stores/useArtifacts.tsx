import { create } from "zustand";
import { persist } from "zustand/middleware";
import { usePrestigePerks } from "./usePrestigePerks";

const ARTIFACT_RICH_DESTINATIONS = new Set(["egypt", "medieval", "mayan", "prehistoric"]);

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
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "raptor_claw",
        name: "Raptor Claw",
        destinationId: "dinosaur",
        rarity: "epic",
        description: "A razor-sharp claw from a clever hunter",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "amber_fossil",
        name: "Amber Fossil",
        destinationId: "dinosaur",
        rarity: "rare",
        description: "Ancient tree sap with preserved prehistoric insect",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "dino_egg_shell",
        name: "Dinosaur Egg Shell",
        destinationId: "dinosaur",
        rarity: "uncommon",
        description: "Fragment from a massive prehistoric egg",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "fern_print",
        name: "Fern Print",
        destinationId: "dinosaur",
        rarity: "common",
        description: "Perfectly preserved ancient plant impression",
        dropRate: 0.002,
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
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "scarab_amulet",
        name: "Scarab Amulet",
        destinationId: "egypt",
        rarity: "epic",
        description: "Sacred beetle carved from lapis lazuli",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "papyrus_scroll",
        name: "Papyrus Scroll",
        destinationId: "egypt",
        rarity: "rare",
        description: "Ancient hieroglyphic writings on preserved papyrus",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "canopic_jar",
        name: "Canopic Jar",
        destinationId: "egypt",
        rarity: "uncommon",
        description: "Ornate jar used in mummification rituals",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "clay_tablet",
        name: "Clay Tablet",
        destinationId: "egypt",
        rarity: "common",
        description: "Simple tablet with early written records",
        dropRate: 0.002,
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
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "holy_grail_piece",
        name: "Holy Grail Fragment",
        destinationId: "medieval",
        rarity: "epic",
        description: "Piece of the sacred chalice",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "knights_signet",
        name: "Knight's Signet Ring",
        destinationId: "medieval",
        rarity: "rare",
        description: "Royal seal ring of a noble knight",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "chainmail_link",
        name: "Chainmail Link",
        destinationId: "medieval",
        rarity: "uncommon",
        description: "Forged iron link from battle armor",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "wooden_shield",
        name: "Wooden Shield Piece",
        destinationId: "medieval",
        rarity: "common",
        description: "Worn fragment of a soldier's shield",
        dropRate: 0.002,
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
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "galileo_lens",
        name: "Galileo's Lens",
        destinationId: "renaissance",
        rarity: "epic",
        description: "Glass lens from the astronomer's telescope",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "medici_coin",
        name: "Medici Gold Coin",
        destinationId: "renaissance",
        rarity: "rare",
        description: "Currency from the banking dynasty",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "artists_palette",
        name: "Artist's Palette",
        destinationId: "renaissance",
        rarity: "uncommon",
        description: "Well-used painting palette with original pigments",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "printing_block",
        name: "Printing Block",
        destinationId: "renaissance",
        rarity: "common",
        description: "Wooden block from early printing press",
        dropRate: 0.002,
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
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "edison_bulb",
        name: "Edison's Light Bulb",
        destinationId: "industrial",
        rarity: "epic",
        description: "First successful incandescent prototype",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "factory_blueprint",
        name: "Factory Blueprint",
        destinationId: "industrial",
        rarity: "rare",
        description: "Original plans for revolutionary machinery",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "brass_gear",
        name: "Brass Gear",
        destinationId: "industrial",
        rarity: "uncommon",
        description: "Precision gear from early machines",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "coal_sample",
        name: "Coal Sample",
        destinationId: "industrial",
        rarity: "common",
        description: "Fuel that powered the revolution",
        dropRate: 0.002,
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
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "neural_chip",
        name: "Neural Interface Chip",
        destinationId: "future",
        rarity: "epic",
        description: "Direct brain-computer interface prototype",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "fusion_cell",
        name: "Fusion Power Cell",
        destinationId: "future",
        rarity: "rare",
        description: "Miniature fusion reactor",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "holo_projector",
        name: "Holographic Projector",
        destinationId: "future",
        rarity: "uncommon",
        description: "3D hologram emitter device",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "smart_fabric",
        name: "Smart Fabric Sample",
        destinationId: "future",
        rarity: "common",
        description: "Self-cleaning programmable textile",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Near Future",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "rome",
    name: "Ancient Rome Collection",
    artifacts: [
      {
        id: "caesar_laurel",
        name: "Caesar's Laurel Crown",
        destinationId: "rome",
        rarity: "legendary",
        description: "Golden laurel crown worn by the great emperor",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "gladiator_trident",
        name: "Gladiator's Trident",
        destinationId: "rome",
        rarity: "epic",
        description: "Battle-worn trident from the Colosseum arena",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "roman_eagle",
        name: "Roman Eagle Standard",
        destinationId: "rome",
        rarity: "rare",
        description: "Bronze eagle from a legion's battle standard",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "denarius_coin",
        name: "Denarius Coin",
        destinationId: "rome",
        rarity: "uncommon",
        description: "Silver coin bearing the emperor's profile",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "clay_oil_lamp",
        name: "Clay Oil Lamp",
        destinationId: "rome",
        rarity: "common",
        description: "Simple terracotta lamp used in Roman homes",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Ancient Rome",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "viking",
    name: "Viking Age Collection",
    artifacts: [
      {
        id: "odin_rune",
        name: "Odin's Rune Stone",
        destinationId: "viking",
        rarity: "legendary",
        description: "Sacred stone inscribed with the Allfather's runes",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "berserker_axe",
        name: "Berserker's Axe",
        destinationId: "viking",
        rarity: "epic",
        description: "Fearsome double-bladed axe of a legendary warrior",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "dragon_figurehead",
        name: "Dragon Ship Figurehead",
        destinationId: "viking",
        rarity: "rare",
        description: "Carved wooden dragon from a longship's prow",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "thor_pendant",
        name: "Thor's Hammer Pendant",
        destinationId: "viking",
        rarity: "uncommon",
        description: "Mjolnir amulet worn for protection and strength",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "drinking_horn",
        name: "Viking Drinking Horn",
        destinationId: "viking",
        rarity: "common",
        description: "Carved horn used in feasts and celebrations",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Viking Age",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "wildwest",
    name: "Wild West Collection",
    artifacts: [
      {
        id: "golden_badge",
        name: "Sheriff's Golden Badge",
        destinationId: "wildwest",
        rarity: "legendary",
        description: "Legendary lawman's badge from the frontier",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "outlaw_revolver",
        name: "Outlaw's Revolver",
        destinationId: "wildwest",
        rarity: "epic",
        description: "Six-shooter from a notorious gunslinger",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "gold_nugget",
        name: "Prospector's Gold Nugget",
        destinationId: "wildwest",
        rarity: "rare",
        description: "Large gold nugget from the California rush",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "wanted_poster",
        name: "Wanted Poster",
        destinationId: "wildwest",
        rarity: "uncommon",
        description: "Weathered bounty notice from the frontier",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "horseshoe",
        name: "Horseshoe",
        destinationId: "wildwest",
        rarity: "common",
        description: "Iron horseshoe from the dusty trails",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Wild West",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "roaring20s",
    name: "Roaring Twenties Collection",
    artifacts: [
      {
        id: "art_deco_tiara",
        name: "Art Deco Diamond Tiara",
        destinationId: "roaring20s",
        rarity: "legendary",
        description: "Exquisite headpiece from the Jazz Age elite",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "gatsby_coupe",
        name: "Gatsby's Champagne Coupe",
        destinationId: "roaring20s",
        rarity: "epic",
        description: "Crystal glass from legendary parties",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "jazz_trumpet",
        name: "Jazz Trumpet",
        destinationId: "roaring20s",
        rarity: "rare",
        description: "Brass instrument that defined an era",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "pearl_necklace",
        name: "Flapper's Pearl Necklace",
        destinationId: "roaring20s",
        rarity: "uncommon",
        description: "Long strand of pearls worn in speakeasies",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "prohibition_flask",
        name: "Prohibition Flask",
        destinationId: "roaring20s",
        rarity: "common",
        description: "Hidden flask from the dry years",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Roaring Twenties",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "spaceage",
    name: "Space Age Collection",
    artifacts: [
      {
        id: "moon_rock",
        name: "Moon Rock Fragment",
        destinationId: "spaceage",
        rarity: "legendary",
        description: "Genuine lunar sample from the Apollo missions",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "apollo_panel",
        name: "Apollo Command Module Panel",
        destinationId: "spaceage",
        rarity: "epic",
        description: "Control panel from the historic spacecraft",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "astronaut_patch",
        name: "Astronaut's Patch",
        destinationId: "spaceage",
        rarity: "rare",
        description: "Mission patch worn on historic spaceflights",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "space_food",
        name: "Space Food Packet",
        destinationId: "spaceage",
        rarity: "uncommon",
        description: "Freeze-dried meal from orbit",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "mission_toggle",
        name: "Mission Control Toggle",
        destinationId: "spaceage",
        rarity: "common",
        description: "Switch from the control room console",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Space Age",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "cyberpunk",
    name: "Cyberpunk Collection",
    artifacts: [
      {
        id: "neural_cortex",
        name: "Neural Cortex Implant",
        destinationId: "cyberpunk",
        rarity: "legendary",
        description: "Military-grade brain augmentation device",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "neon_blade",
        name: "Neon Samurai Blade",
        destinationId: "cyberpunk",
        rarity: "epic",
        description: "Plasma-edged katana from the neon streets",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "black_market_chip",
        name: "Black Market Data Chip",
        destinationId: "cyberpunk",
        rarity: "rare",
        description: "Encrypted storage containing corporate secrets",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "cybernetic_eye",
        name: "Cybernetic Eye",
        destinationId: "cyberpunk",
        rarity: "uncommon",
        description: "Enhanced vision implant with night vision",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "street_circuit",
        name: "Street Tech Circuit Board",
        destinationId: "cyberpunk",
        rarity: "common",
        description: "Salvaged tech from the urban sprawl",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Cyberpunk",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "triassic",
    name: "Triassic Period Collection",
    artifacts: [
      {
        id: "ichthyosaur_skull",
        name: "Ichthyosaur Skull",
        destinationId: "triassic",
        rarity: "legendary",
        description: "Complete skull of an ancient marine reptile",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "coelophysis_skeleton",
        name: "Coelophysis Skeleton",
        destinationId: "triassic",
        rarity: "epic",
        description: "Articulated bones of an early dinosaur",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "petrified_conifer",
        name: "Petrified Conifer",
        destinationId: "triassic",
        rarity: "rare",
        description: "Ancient tree turned to stone over millennia",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "trilobite_fossil",
        name: "Trilobite Fossil",
        destinationId: "triassic",
        rarity: "uncommon",
        description: "Preserved ancient arthropod",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "mudstone_fragment",
        name: "Mudstone Fragment",
        destinationId: "triassic",
        rarity: "common",
        description: "Sedimentary rock from the ancient seabed",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Triassic Period",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "greece",
    name: "Ancient Greece Collection",
    artifacts: [
      {
        id: "zeus_lightning",
        name: "Zeus's Lightning Bolt Fragment",
        destinationId: "greece",
        rarity: "legendary",
        description: "Mythical weapon of the king of gods",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "spartan_helmet",
        name: "Spartan's Bronze Helmet",
        destinationId: "greece",
        rarity: "epic",
        description: "Battle-worn helm of a legendary warrior",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "oracle_bowl",
        name: "Oracle's Sacred Bowl",
        destinationId: "greece",
        rarity: "rare",
        description: "Ceremonial vessel from Delphi",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "olive_wreath",
        name: "Olive Wreath Crown",
        destinationId: "greece",
        rarity: "uncommon",
        description: "Victory crown from the ancient Olympics",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "amphora_shard",
        name: "Amphora Shard",
        destinationId: "greece",
        rarity: "common",
        description: "Fragment of a painted storage vessel",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Ancient Greece",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "china",
    name: "Ancient China Collection",
    artifacts: [
      {
        id: "jade_seal",
        name: "Emperor's Jade Seal",
        destinationId: "china",
        rarity: "legendary",
        description: "Imperial seal carved from precious jade",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "terracotta_sword",
        name: "Terracotta Warrior's Sword",
        destinationId: "china",
        rarity: "epic",
        description: "Bronze blade from the emperor's eternal army",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "silk_compass",
        name: "Silk Road Compass",
        destinationId: "china",
        rarity: "rare",
        description: "Ancient navigation device from the trade routes",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "dragon_vase",
        name: "Dragon Porcelain Vase",
        destinationId: "china",
        rarity: "uncommon",
        description: "Delicate vase with imperial dragon motif",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "bamboo_scroll",
        name: "Bamboo Scroll",
        destinationId: "china",
        rarity: "common",
        description: "Ancient writing strips bound together",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Ancient China",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "feudaljapan",
    name: "Feudal Japan Collection",
    artifacts: [
      {
        id: "masamune_katana",
        name: "Masamune Katana",
        destinationId: "feudaljapan",
        rarity: "legendary",
        description: "Legendary sword by the greatest swordsmith",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "shogun_fan",
        name: "Shogun's War Fan",
        destinationId: "feudaljapan",
        rarity: "epic",
        description: "Iron fan used to command armies",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "kabuto_helmet",
        name: "Samurai's Kabuto Helmet",
        destinationId: "feudaljapan",
        rarity: "rare",
        description: "Ornate helmet with crescent moon crest",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "cherry_tea_set",
        name: "Cherry Blossom Tea Set",
        destinationId: "feudaljapan",
        rarity: "uncommon",
        description: "Delicate porcelain set for tea ceremony",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "rice_paper",
        name: "Rice Paper Letter",
        destinationId: "feudaljapan",
        rarity: "common",
        description: "Hand-written correspondence in elegant script",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Feudal Japan",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "moonlanding",
    name: "Moon Landing Collection",
    artifacts: [
      {
        id: "first_footprint",
        name: "First Footprint Cast",
        destinationId: "moonlanding",
        rarity: "legendary",
        description: "Mold of humanity's first step on another world",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "lunar_module",
        name: "Lunar Module Fragment",
        destinationId: "moonlanding",
        rarity: "epic",
        description: "Piece of the Eagle that landed on the moon",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "mission_patches",
        name: "Mission Patch Collection",
        destinationId: "moonlanding",
        rarity: "rare",
        description: "Complete set of Apollo mission insignias",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "moon_dust",
        name: "Moon Dust Sample",
        destinationId: "moonlanding",
        rarity: "uncommon",
        description: "Sealed container of lunar regolith",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "comm_antenna",
        name: "Communications Antenna",
        destinationId: "moonlanding",
        rarity: "common",
        description: "Antenna from lunar surface equipment",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Moon Landing",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "atlantis",
    name: "Atlantis Collection",
    artifacts: [
      {
        id: "poseidon_trident",
        name: "Poseidon's Trident Tip",
        destinationId: "atlantis",
        rarity: "legendary",
        description: "Legendary weapon of the sea god",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "crystal_core",
        name: "Crystal Power Core",
        destinationId: "atlantis",
        rarity: "epic",
        description: "Glowing energy source of the lost civilization",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "orichalcum_coin",
        name: "Atlantean Orichalcum Coin",
        destinationId: "atlantis",
        rarity: "rare",
        description: "Mysterious metal unique to Atlantis",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "coral_throne",
        name: "Coral Throne Fragment",
        destinationId: "atlantis",
        rarity: "uncommon",
        description: "Piece from the royal seat of power",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "pearl_shell",
        name: "Pearl Shell Ornament",
        destinationId: "atlantis",
        rarity: "common",
        description: "Decorative shell from underwater palaces",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Atlantis",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "steampunk",
    name: "Steampunk Collection",
    artifacts: [
      {
        id: "clockwork_heart",
        name: "Clockwork Heart",
        destinationId: "steampunk",
        rarity: "legendary",
        description: "Intricate mechanical heart powered by steam",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "aether_engine",
        name: "Aether Engine Prototype",
        destinationId: "steampunk",
        rarity: "epic",
        description: "Revolutionary power source harnessing the aether",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "brass_monocle",
        name: "Brass Monocle Telescope",
        destinationId: "steampunk",
        rarity: "rare",
        description: "Multi-lens viewing device with gears",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "pressure_gauge",
        name: "Copper Pressure Gauge",
        destinationId: "steampunk",
        rarity: "uncommon",
        description: "Ornate gauge from a steam-powered machine",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "steam_valve",
        name: "Steam Valve",
        destinationId: "steampunk",
        rarity: "common",
        description: "Brass valve from pneumatic systems",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Steampunk",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "mars",
    name: "Mars Colony Collection",
    artifacts: [
      {
        id: "settlement_cornerstone",
        name: "First Settlement Cornerstone",
        destinationId: "mars",
        rarity: "legendary",
        description: "Foundation stone of humanity's first Martian city",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "terraforming_core",
        name: "Terraforming Generator Core",
        destinationId: "mars",
        rarity: "epic",
        description: "Core component from atmosphere processors",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "mars_mineral",
        name: "Red Planet Mineral Sample",
        destinationId: "mars",
        rarity: "rare",
        description: "Rare crystalline formation unique to Mars",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "dome_tool",
        name: "Dome Construction Tool",
        destinationId: "mars",
        rarity: "uncommon",
        description: "Specialized wrench for habitat assembly",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "martian_soil",
        name: "Martian Soil Container",
        destinationId: "mars",
        rarity: "common",
        description: "Sealed jar of red Martian regolith",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Mars Colony",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "cambrian",
    name: "Cambrian Period Collection",
    artifacts: [
      {
        id: "anomalocaris_fossil",
        name: "Anomalocaris Fossil",
        destinationId: "cambrian",
        rarity: "legendary",
        description: "Complete fossil of the Cambrian apex predator",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "opabinia_eye",
        name: "Opabinia Eye Stalk",
        destinationId: "cambrian",
        rarity: "epic",
        description: "Fossilized compound eye from a five-eyed creature",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "burgess_shale",
        name: "Burgess Shale Fragment",
        destinationId: "cambrian",
        rarity: "rare",
        description: "Exceptional preservation from the famous fossil bed",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "trilobite_shell",
        name: "Trilobite Shell",
        destinationId: "cambrian",
        rarity: "uncommon",
        description: "Segmented exoskeleton from early arthropod",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "cambrian_algae",
        name: "Cambrian Algae Print",
        destinationId: "cambrian",
        rarity: "common",
        description: "Impression of primitive marine plant life",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Cambrian Period",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "iceage",
    name: "Ice Age Collection",
    artifacts: [
      {
        id: "mammoth_tusk",
        name: "Woolly Mammoth Tusk",
        destinationId: "iceage",
        rarity: "legendary",
        description: "Massive ivory tusk from the ice age giant",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "sabertooth_fang",
        name: "Saber-Toothed Tiger Fang",
        destinationId: "iceage",
        rarity: "epic",
        description: "Enormous canine tooth from a fearsome predator",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "cave_bear_skull",
        name: "Cave Bear Skull",
        destinationId: "iceage",
        rarity: "rare",
        description: "Well-preserved cranium from a massive bear",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "giant_sloth_claw",
        name: "Giant Ground Sloth Claw",
        destinationId: "iceage",
        rarity: "uncommon",
        description: "Large curved claw from an ancient herbivore",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "glacial_stone",
        name: "Glacial Stone",
        destinationId: "iceage",
        rarity: "common",
        description: "Rock smoothed by ancient glacier movement",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Ice Age",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "stoneage",
    name: "Stone Age Collection",
    artifacts: [
      {
        id: "hand_axe",
        name: "Paleolithic Hand Axe",
        destinationId: "stoneage",
        rarity: "legendary",
        description: "Perfectly crafted stone tool used for millennia",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "cave_painting",
        name: "Cave Painting Fragment",
        destinationId: "stoneage",
        rarity: "epic",
        description: "Rock surface with ancient animal depictions",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "flint_spearhead",
        name: "Flint Spearhead",
        destinationId: "stoneage",
        rarity: "rare",
        description: "Knapped stone weapon point for hunting",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "bone_needle",
        name: "Bone Sewing Needle",
        destinationId: "stoneage",
        rarity: "uncommon",
        description: "Finely carved tool for making clothing",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "stone_scraper",
        name: "Stone Scraper",
        destinationId: "stoneage",
        rarity: "common",
        description: "Basic tool for processing hides and wood",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Stone Age",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "bronzeage",
    name: "Bronze Age Collection",
    artifacts: [
      {
        id: "bronze_sword",
        name: "Bronze Ceremonial Sword",
        destinationId: "bronzeage",
        rarity: "legendary",
        description: "Ornate blade symbolizing the age of metal",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "sun_chariot",
        name: "Sun Chariot Model",
        destinationId: "bronzeage",
        rarity: "epic",
        description: "Intricate bronze sculpture of celestial worship",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "bronze_axehead",
        name: "Bronze Axe Head",
        destinationId: "bronzeage",
        rarity: "rare",
        description: "Functional weapon or tool from early metalworking",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "copper_ingot",
        name: "Copper Trade Ingot",
        destinationId: "bronzeage",
        rarity: "uncommon",
        description: "Standardized metal bar for commerce",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "pottery_shard",
        name: "Decorated Pottery Shard",
        destinationId: "bronzeage",
        rarity: "common",
        description: "Fragment of ceramic vessel with geometric patterns",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Bronze Age",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "mesopotamia",
    name: "Mesopotamia Collection",
    artifacts: [
      {
        id: "code_hammurabi",
        name: "Code of Hammurabi Tablet",
        destinationId: "mesopotamia",
        rarity: "legendary",
        description: "Ancient law code carved in cuneiform script",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "ishtar_gate",
        name: "Ishtar Gate Brick",
        destinationId: "mesopotamia",
        rarity: "epic",
        description: "Glazed blue brick from the magnificent gate",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "ziggurat_stone",
        name: "Ziggurat Foundation Stone",
        destinationId: "mesopotamia",
        rarity: "rare",
        description: "Inscribed block from a temple tower",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "cylinder_seal",
        name: "Cylinder Seal",
        destinationId: "mesopotamia",
        rarity: "uncommon",
        description: "Carved stone roller for marking documents",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "cuneiform_tablet",
        name: "Cuneiform Clay Tablet",
        destinationId: "mesopotamia",
        rarity: "common",
        description: "Administrative record in wedge-shaped writing",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Mesopotamia",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "mayan",
    name: "Mayan Civilization Collection",
    artifacts: [
      {
        id: "jade_death_mask",
        name: "Jade Death Mask",
        destinationId: "mayan",
        rarity: "legendary",
        description: "Intricate funerary mask of a great ruler",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "mayan_codex",
        name: "Mayan Codex Page",
        destinationId: "mayan",
        rarity: "epic",
        description: "Rare surviving page of hieroglyphic writing",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "calendar_stone",
        name: "Calendar Stone Fragment",
        destinationId: "mayan",
        rarity: "rare",
        description: "Piece of the astronomical calendar system",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "obsidian_blade",
        name: "Obsidian Ceremonial Blade",
        destinationId: "mayan",
        rarity: "uncommon",
        description: "Razor-sharp volcanic glass weapon",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "pottery_vessel",
        name: "Decorated Pottery Vessel",
        destinationId: "mayan",
        rarity: "common",
        description: "Clay pot with intricate painted designs",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Mayan Civilization",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "aztec",
    name: "Aztec Empire Collection",
    artifacts: [
      {
        id: "sun_stone",
        name: "Aztec Sun Stone Replica",
        destinationId: "aztec",
        rarity: "legendary",
        description: "Miniature of the massive calendar stone",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "feathered_headdress",
        name: "Quetzal Feathered Headdress",
        destinationId: "aztec",
        rarity: "epic",
        description: "Ceremonial crown of brilliant green plumes",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "macuahuitl",
        name: "Macuahuitl Fragment",
        destinationId: "aztec",
        rarity: "rare",
        description: "Wooden sword with obsidian blade inserts",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "cacao_vessel",
        name: "Cacao Drinking Vessel",
        destinationId: "aztec",
        rarity: "uncommon",
        description: "Ceremonial cup for chocolate beverages",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "turquoise_mosaic",
        name: "Turquoise Mosaic Tile",
        destinationId: "aztec",
        rarity: "common",
        description: "Small decorative piece from a larger artwork",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Aztec Empire",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "inca",
    name: "Inca Empire Collection",
    artifacts: [
      {
        id: "golden_llama",
        name: "Golden Llama Figurine",
        destinationId: "inca",
        rarity: "legendary",
        description: "Precious offering statue in solid gold",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "quipu_record",
        name: "Quipu Record Keeper",
        destinationId: "inca",
        rarity: "epic",
        description: "Knotted string system for storing information",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "stone_carving",
        name: "Precision Stone Carving",
        destinationId: "inca",
        rarity: "rare",
        description: "Perfectly fitted masonry block from Machu Picchu",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "silver_tupu",
        name: "Silver Tupu Pin",
        destinationId: "inca",
        rarity: "uncommon",
        description: "Decorative fastener for traditional clothing",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "ceramic_vessel",
        name: "Inca Ceramic Vessel",
        destinationId: "inca",
        rarity: "common",
        description: "Simple pottery for storing chicha or grain",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Inca Empire",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "mongol",
    name: "Mongol Empire Collection",
    artifacts: [
      {
        id: "khan_seal",
        name: "Great Khan's Seal",
        destinationId: "mongol",
        rarity: "legendary",
        description: "Imperial seal of the Mongol emperor",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "composite_bow",
        name: "Mongol Composite Bow",
        destinationId: "mongol",
        rarity: "epic",
        description: "Legendary weapon that conquered continents",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "silk_paiza",
        name: "Silk Road Paiza",
        destinationId: "mongol",
        rarity: "rare",
        description: "Golden passport for safe passage across the empire",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "horse_armor",
        name: "Lamellar Horse Armor",
        destinationId: "mongol",
        rarity: "uncommon",
        description: "Protective scales for cavalry mounts",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "felt_ornament",
        name: "Felt Ger Ornament",
        destinationId: "mongol",
        rarity: "common",
        description: "Decorative piece from a nomadic tent",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Mongol Empire",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "discovery",
    name: "Age of Discovery Collection",
    artifacts: [
      {
        id: "navigation_astrolabe",
        name: "Navigator's Astrolabe",
        destinationId: "discovery",
        rarity: "legendary",
        description: "Precious instrument for celestial navigation",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "first_map",
        name: "First World Map",
        destinationId: "discovery",
        rarity: "epic",
        description: "Early cartographic representation of new worlds",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "spice_container",
        name: "Spice Trade Container",
        destinationId: "discovery",
        rarity: "rare",
        description: "Sealed vessel that held precious spices",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "ship_compass",
        name: "Ship's Compass",
        destinationId: "discovery",
        rarity: "uncommon",
        description: "Magnetic navigation tool from an explorer's vessel",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "sailing_rope",
        name: "Ship's Rigging Rope",
        destinationId: "discovery",
        rarity: "common",
        description: "Weathered rope from a voyage of discovery",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Age of Discovery",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "frenchrev",
    name: "French Revolution Collection",
    artifacts: [
      {
        id: "liberty_cap",
        name: "Liberty Cap of Marianne",
        destinationId: "frenchrev",
        rarity: "legendary",
        description: "Phrygian cap symbolizing freedom and revolution",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "guillotine_blade",
        name: "Guillotine Blade Fragment",
        destinationId: "frenchrev",
        rarity: "epic",
        description: "Piece of the infamous revolutionary instrument",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "declaration_rights",
        name: "Declaration of Rights Print",
        destinationId: "frenchrev",
        rarity: "rare",
        description: "Original pamphlet of human rights declaration",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "tricolor_cockade",
        name: "Tricolor Cockade",
        destinationId: "frenchrev",
        rarity: "uncommon",
        description: "Revolutionary ribbon badge in red, white, and blue",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "assignat_note",
        name: "Assignat Currency Note",
        destinationId: "frenchrev",
        rarity: "common",
        description: "Revolutionary paper money from the new republic",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for French Revolution",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "americanrev",
    name: "American Revolution Collection",
    artifacts: [
      {
        id: "liberty_bell",
        name: "Liberty Bell Fragment",
        destinationId: "americanrev",
        rarity: "legendary",
        description: "Piece of the iconic symbol of American freedom",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "washington_musket",
        name: "Washington's Musket",
        destinationId: "americanrev",
        rarity: "epic",
        description: "Flintlock rifle from the Continental Army",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "declaration_copy",
        name: "Declaration of Independence Copy",
        destinationId: "americanrev",
        rarity: "rare",
        description: "Early printed version of the founding document",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "continental_coin",
        name: "Continental Currency Coin",
        destinationId: "americanrev",
        rarity: "uncommon",
        description: "Colonial money from the revolutionary period",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "minuteman_button",
        name: "Minuteman Uniform Button",
        destinationId: "americanrev",
        rarity: "common",
        description: "Brass button from a militia coat",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for American Revolution",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "victorian",
    name: "Victorian Era Collection",
    artifacts: [
      {
        id: "crown_jewels",
        name: "Victorian Crown Jewel Replica",
        destinationId: "victorian",
        rarity: "legendary",
        description: "Exquisite copy of Queen Victoria's regalia",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "phonograph",
        name: "Edison Phonograph",
        destinationId: "victorian",
        rarity: "epic",
        description: "Early sound recording and playback device",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "pocket_watch",
        name: "Gold Pocket Watch",
        destinationId: "victorian",
        rarity: "rare",
        description: "Ornate timepiece with chain and fob",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "calling_card",
        name: "Calling Card Case",
        destinationId: "victorian",
        rarity: "uncommon",
        description: "Silver case for social visiting cards",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "tea_set",
        name: "Porcelain Tea Cup",
        destinationId: "victorian",
        rarity: "common",
        description: "Fine china from an afternoon tea service",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Victorian Era",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "ww1",
    name: "World War I Collection",
    artifacts: [
      {
        id: "red_baron_goggles",
        name: "Red Baron's Flight Goggles",
        destinationId: "ww1",
        rarity: "legendary",
        description: "Aviator goggles from the legendary ace pilot",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "trench_periscope",
        name: "Trench Periscope",
        destinationId: "ww1",
        rarity: "epic",
        description: "Optical device for observing over the trenches",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "gas_mask",
        name: "Gas Mask",
        destinationId: "ww1",
        rarity: "rare",
        description: "Protective equipment from chemical warfare",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "victory_medal",
        name: "Victory Medal",
        destinationId: "ww1",
        rarity: "uncommon",
        description: "Campaign medal awarded to veterans",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "mess_kit",
        name: "Soldier's Mess Kit",
        destinationId: "ww1",
        rarity: "common",
        description: "Metal eating utensils from the trenches",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for World War I",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "ww2",
    name: "World War II Collection",
    artifacts: [
      {
        id: "enigma_machine",
        name: "Enigma Cipher Machine",
        destinationId: "ww2",
        rarity: "legendary",
        description: "German encryption device that changed the war",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "spitfire_propeller",
        name: "Spitfire Propeller Blade",
        destinationId: "ww2",
        rarity: "epic",
        description: "Blade from the iconic British fighter aircraft",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "paratrooper_badge",
        name: "Paratrooper's Wings Badge",
        destinationId: "ww2",
        rarity: "rare",
        description: "Airborne division insignia from D-Day",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "ration_tin",
        name: "K-Ration Tin",
        destinationId: "ww2",
        rarity: "uncommon",
        description: "Military field ration container",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "dog_tags",
        name: "Soldier's Dog Tags",
        destinationId: "ww2",
        rarity: "common",
        description: "Identification tags worn by servicemen",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for World War II",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "digital",
    name: "Digital Age Collection",
    artifacts: [
      {
        id: "first_iphone",
        name: "First Generation iPhone",
        destinationId: "digital",
        rarity: "legendary",
        description: "Revolutionary device that changed communication",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "bitcoin_wallet",
        name: "Genesis Block Bitcoin Wallet",
        destinationId: "digital",
        rarity: "epic",
        description: "Digital wallet from cryptocurrency's beginning",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "google_server",
        name: "Original Google Server Board",
        destinationId: "digital",
        rarity: "rare",
        description: "Circuit board from the first search engine servers",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "floppy_disk",
        name: "3.5-inch Floppy Disk",
        destinationId: "digital",
        rarity: "uncommon",
        description: "Obsolete storage medium from computing history",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "dialup_modem",
        name: "Dial-Up Modem",
        destinationId: "digital",
        rarity: "common",
        description: "Early internet connection device",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Digital Age",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "camelot",
    name: "Camelot Collection",
    artifacts: [
      {
        id: "round_table_wood",
        name: "Round Table Fragment",
        destinationId: "camelot",
        rarity: "legendary",
        description: "Wood from the legendary table of equality",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "merlin_staff",
        name: "Merlin's Crystal Staff",
        destinationId: "camelot",
        rarity: "epic",
        description: "Magical focus of the great wizard",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "lady_lake_scabbard",
        name: "Lady of the Lake's Scabbard",
        destinationId: "camelot",
        rarity: "rare",
        description: "Enchanted sheath that protects its bearer",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "knight_token",
        name: "Knight's Quest Token",
        destinationId: "camelot",
        rarity: "uncommon",
        description: "Symbol carried on a noble quest",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "castle_stone",
        name: "Camelot Castle Stone",
        destinationId: "camelot",
        rarity: "common",
        description: "Ordinary brick from the legendary fortress",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Camelot",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "olympus",
    name: "Mount Olympus Collection",
    artifacts: [
      {
        id: "zeus_thunderbolt",
        name: "Zeus's Thunderbolt Shard",
        destinationId: "olympus",
        rarity: "legendary",
        description: "Fragment of the king of gods' divine weapon",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "athena_aegis",
        name: "Athena's Aegis Shield",
        destinationId: "olympus",
        rarity: "epic",
        description: "Protective shield bearing Medusa's head",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "apollo_lyre",
        name: "Apollo's Golden Lyre",
        destinationId: "olympus",
        rarity: "rare",
        description: "Divine musical instrument of the sun god",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "ambrosia_cup",
        name: "Ambrosia Chalice",
        destinationId: "olympus",
        rarity: "uncommon",
        description: "Cup that held the nectar of immortality",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "olive_branch",
        name: "Sacred Olive Branch",
        destinationId: "olympus",
        rarity: "common",
        description: "Branch from Athena's blessed tree",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Mount Olympus",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "dieselpunk",
    name: "Dieselpunk Era Collection",
    artifacts: [
      {
        id: "zeppelin_propeller",
        name: "Zeppelin Propeller Blade",
        destinationId: "dieselpunk",
        rarity: "legendary",
        description: "Massive blade from a luxury airship",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "diesel_raygun",
        name: "Diesel-Powered Ray Gun",
        destinationId: "dieselpunk",
        rarity: "epic",
        description: "Retro-futuristic energy weapon prototype",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "pneumatic_gauntlet",
        name: "Pneumatic Power Gauntlet",
        destinationId: "dieselpunk",
        rarity: "rare",
        description: "Air-powered mechanical strength enhancer",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "propaganda_poster",
        name: "Art Deco Propaganda Poster",
        destinationId: "dieselpunk",
        rarity: "uncommon",
        description: "Stylized industrial age recruitment art",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "oil_can",
        name: "Industrial Oil Can",
        destinationId: "dieselpunk",
        rarity: "common",
        description: "Utilitarian container for machine lubrication",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Dieselpunk Era",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "postapoc",
    name: "Post-Apocalypse Collection",
    artifacts: [
      {
        id: "fusion_core",
        name: "Intact Fusion Core",
        destinationId: "postapoc",
        rarity: "legendary",
        description: "Rare working power source from the old world",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "hazmat_suit",
        name: "Pre-War Hazmat Suit",
        destinationId: "postapoc",
        rarity: "epic",
        description: "Sealed radiation protection from before the fall",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "water_purifier",
        name: "Portable Water Purifier",
        destinationId: "postapoc",
        rarity: "rare",
        description: "Life-saving device for clean drinking water",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "canned_food",
        name: "Preserved Pre-War Food",
        destinationId: "postapoc",
        rarity: "uncommon",
        description: "Miraculously edible sealed rations",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "scrap_metal",
        name: "Salvaged Scrap Metal",
        destinationId: "postapoc",
        rarity: "common",
        description: "Useful materials from ruined buildings",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Post-Apocalypse",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "asteroid",
    name: "Asteroid Belt Mining Collection",
    artifacts: [
      {
        id: "platinum_asteroid",
        name: "Platinum-Rich Asteroid Core",
        destinationId: "asteroid",
        rarity: "legendary",
        description: "Massive chunk of precious metal from space",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "mining_laser",
        name: "Industrial Mining Laser",
        destinationId: "asteroid",
        rarity: "epic",
        description: "High-powered tool for cutting through rock",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "space_ore",
        name: "Rare Element Ore Sample",
        destinationId: "asteroid",
        rarity: "rare",
        description: "Valuable mineral found only in asteroids",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "zero_g_wrench",
        name: "Zero-G Adjustable Wrench",
        destinationId: "asteroid",
        rarity: "uncommon",
        description: "Magnetized tool for weightless repairs",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "asteroid_dust",
        name: "Asteroid Dust Sample",
        destinationId: "asteroid",
        rarity: "common",
        description: "Fine regolith from mining operations",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Asteroid Belt Mining",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "jupiter",
    name: "Jupiter Station Collection",
    artifacts: [
      {
        id: "antimatter_containment",
        name: "Antimatter Containment Pod",
        destinationId: "jupiter",
        rarity: "legendary",
        description: "Magnetic bottle holding universe's most powerful fuel",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "storm_data",
        name: "Great Red Spot Data Core",
        destinationId: "jupiter",
        rarity: "epic",
        description: "Scientific readings from inside the giant storm",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "europa_ice",
        name: "Europa Ice Sample",
        destinationId: "jupiter",
        rarity: "rare",
        description: "Water ice from the potentially life-bearing moon",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "radiation_badge",
        name: "Radiation Exposure Badge",
        destinationId: "jupiter",
        rarity: "uncommon",
        description: "Monitoring device from the intense radiation zone",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "station_ration",
        name: "Station Food Ration",
        destinationId: "jupiter",
        rarity: "common",
        description: "Standard meal pack for orbital workers",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Jupiter Station",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "interstellar",
    name: "Interstellar Age Collection",
    artifacts: [
      {
        id: "ftl_drive",
        name: "First FTL Drive Core",
        destinationId: "interstellar",
        rarity: "legendary",
        description: "Prototype faster-than-light propulsion system",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "alien_artifact",
        name: "First Contact Artifact",
        destinationId: "interstellar",
        rarity: "epic",
        description: "Object from humanity's first alien encounter",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "star_map",
        name: "Interstellar Navigation Chart",
        destinationId: "interstellar",
        rarity: "rare",
        description: "Map of traversable wormholes and jump points",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "colony_seed",
        name: "Colony Ship Seed Vault",
        destinationId: "interstellar",
        rarity: "uncommon",
        description: "Genetic material for terraforming new worlds",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "space_lichen",
        name: "Void-Adapted Lichen",
        destinationId: "interstellar",
        rarity: "common",
        description: "Hardy organism surviving in deep space",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Interstellar Age",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "galactic",
    name: "Galactic Empire Collection",
    artifacts: [
      {
        id: "emperor_crown",
        name: "Galactic Emperor's Crown",
        destinationId: "galactic",
        rarity: "legendary",
        description: "Ceremonial headpiece of the supreme ruler",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "senate_sigil",
        name: "Galactic Senate Sigil",
        destinationId: "galactic",
        rarity: "epic",
        description: "Seal of authority from the governing body",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "dreadnought_plaque",
        name: "Imperial Dreadnought Plaque",
        destinationId: "galactic",
        rarity: "rare",
        description: "Commemorative plate from a capital ship",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "citizenship_chip",
        name: "Galactic Citizenship Chip",
        destinationId: "galactic",
        rarity: "uncommon",
        description: "Digital ID granting rights across all systems",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "credit_chit",
        name: "Standard Credit Chit",
        destinationId: "galactic",
        rarity: "common",
        description: "Universal currency token of the empire",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Galactic Empire",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "singularity",
    name: "Singularity Collection",
    artifacts: [
      {
        id: "ai_consciousness",
        name: "First AI Consciousness Core",
        destinationId: "singularity",
        rarity: "legendary",
        description: "The moment artificial intelligence became self-aware",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "mind_upload",
        name: "Human Mind Upload Module",
        destinationId: "singularity",
        rarity: "epic",
        description: "Device containing a digitized human consciousness",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "nano_swarm",
        name: "Programmable Nano-Swarm",
        destinationId: "singularity",
        rarity: "rare",
        description: "Self-replicating molecular machines",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "augment_chip",
        name: "Universal Augmentation Chip",
        destinationId: "singularity",
        rarity: "uncommon",
        description: "Upgrade module for post-human enhancement",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "data_crystal",
        name: "Quantum Data Crystal",
        destinationId: "singularity",
        rarity: "common",
        description: "Storage medium with near-infinite capacity",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Singularity",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "postscarcity",
    name: "Post-Scarcity Society Collection",
    artifacts: [
      {
        id: "matter_compiler",
        name: "Universal Matter Compiler",
        destinationId: "postscarcity",
        rarity: "legendary",
        description: "Device that creates anything from raw atoms",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "energy_tap",
        name: "Zero-Point Energy Tap",
        destinationId: "postscarcity",
        rarity: "epic",
        description: "Unlimited power from vacuum fluctuations",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "immortality_serum",
        name: "Biological Immortality Serum",
        destinationId: "postscarcity",
        rarity: "rare",
        description: "Treatment that halts aging permanently",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "desire_fulfiller",
        name: "Personal Desire Fulfillment Unit",
        destinationId: "postscarcity",
        rarity: "uncommon",
        description: "AI companion that grants all reasonable wishes",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "recycler_node",
        name: "Atomic Recycler Node",
        destinationId: "postscarcity",
        rarity: "common",
        description: "Breaks down waste into base elements",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Post-Scarcity Society",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "timeloop",
    name: "Time Loop Nexus Collection",
    artifacts: [
      {
        id: "loop_anchor",
        name: "Temporal Loop Anchor",
        destinationId: "timeloop",
        rarity: "legendary",
        description: "Device that created the eternal recursion",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "memory_preserver",
        name: "Cross-Loop Memory Preserver",
        destinationId: "timeloop",
        rarity: "epic",
        description: "Allows retention of memories across resets",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "causality_map",
        name: "Causality Deviation Map",
        destinationId: "timeloop",
        rarity: "rare",
        description: "Chart of all possible timeline variations",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "iteration_counter",
        name: "Loop Iteration Counter",
        destinationId: "timeloop",
        rarity: "uncommon",
        description: "Device tracking number of time cycles",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "paradox_token",
        name: "Temporal Paradox Token",
        destinationId: "timeloop",
        rarity: "common",
        description: "Object that shouldn't exist in this timeline",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Time Loop Nexus",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "multiversal",
    name: "Multiversal Hub Collection",
    artifacts: [
      {
        id: "dimension_key",
        name: "Master Dimension Key",
        destinationId: "multiversal",
        rarity: "legendary",
        description: "Opens portals to any parallel universe",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "alternate_self",
        name: "Alternate Self Recorder",
        destinationId: "multiversal",
        rarity: "epic",
        description: "Logs encounters with versions of yourself",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "reality_anchor",
        name: "Personal Reality Anchor",
        destinationId: "multiversal",
        rarity: "rare",
        description: "Prevents dissolution when crossing dimensions",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "universe_compass",
        name: "Universe Navigation Compass",
        destinationId: "multiversal",
        rarity: "uncommon",
        description: "Points toward desired parallel worlds",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "dimensional_dust",
        name: "Dimensional Boundary Dust",
        destinationId: "multiversal",
        rarity: "common",
        description: "Residue from traveling between realities",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Multiversal Hub",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "temporal",
    name: "Temporal Singularity Collection",
    artifacts: [
      {
        id: "time_throne",
        name: "Throne of Eternity",
        destinationId: "temporal",
        rarity: "legendary",
        description: "Seat of power at the end of time itself",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "chrono_scepter",
        name: "Chronomancer's Scepter",
        destinationId: "temporal",
        rarity: "epic",
        description: "Staff that commands the flow of time",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "entropy_reverser",
        name: "Entropy Reversal Engine",
        destinationId: "temporal",
        rarity: "rare",
        description: "Device that can reverse the arrow of time",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "temporal_compass",
        name: "Temporal Navigation Compass",
        destinationId: "temporal",
        rarity: "uncommon",
        description: "Points to any moment in history or future",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "time_dust",
        name: "Crystallized Time Dust",
        destinationId: "temporal",
        rarity: "common",
        description: "Frozen moments collected as particles",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Temporal Singularity",
    setBonusMultiplier: 0.10
  },
  {
    destinationId: "farfuture",
    name: "Far Future Collection",
    artifacts: [
      {
        id: "heat_death_recorder",
        name: "Heat Death Observation Device",
        destinationId: "farfuture",
        rarity: "legendary",
        description: "Witnessed the universe's final moments",
        dropRate: 0.00005,
        revenueBonus: 0.005
      },
      {
        id: "star_forge",
        name: "Stellar Forge Remnant",
        destinationId: "farfuture",
        rarity: "epic",
        description: "Fragment of machine that created artificial stars",
        dropRate: 0.0001,
        revenueBonus: 0.005
      },
      {
        id: "dyson_sphere",
        name: "Dyson Sphere Blueprint",
        destinationId: "farfuture",
        rarity: "rare",
        description: "Plans for enclosing an entire star",
        dropRate: 0.0003,
        revenueBonus: 0.005
      },
      {
        id: "proton_decay",
        name: "Proton Decay Detector",
        destinationId: "farfuture",
        rarity: "uncommon",
        description: "Instrument measuring matter's ultimate fate",
        dropRate: 0.0008,
        revenueBonus: 0.005
      },
      {
        id: "void_crystal",
        name: "Void Between Stars Crystal",
        destinationId: "farfuture",
        rarity: "common",
        description: "Frozen darkness from the empty universe",
        dropRate: 0.002,
        revenueBonus: 0.005
      }
    ],
    setBonusDescription: "Complete set grants +10% revenue for Far Future",
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
        
        const artifactRichMultiplier = ARTIFACT_RICH_DESTINATIONS.has(destinationId) ? 2.0 : 1.0;
        const perkMultiplier = usePrestigePerks.getState().getPerkValue("artifact_luck");
        const totalMultiplier = artifactRichMultiplier * perkMultiplier;
        
        for (const artifact of collection.artifacts) {
          if (Math.random() < artifact.dropRate * totalMultiplier) {
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
