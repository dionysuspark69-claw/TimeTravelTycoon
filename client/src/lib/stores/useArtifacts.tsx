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
