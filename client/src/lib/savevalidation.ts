export interface GameStateSchema {
  chronocoins: number;
  totalEarned: number;
  totalTripsCompleted: number;
  totalManagerUpgrades: number;
  totalCustomersServed: number;
  timeMachineLevel: number;
  timeMachineCapacity: number;
  timeMachineSpeed: number;
  timeMachineCount: number;
  customerGenerationRate: number;
  queueSize: number;
  boardingSpeed: number;
  vipChance: number;
  turnaroundTime: number;
  artifactScanner: number;
  offlineInfra: number;
  autoDispatch: number;
  eraExpertise: number;
  nextCustomerId: number;
  unlockedDestinations: string[];
  currentDestination: string | null;
  prestigeLevel: number;
  prestigePoints: number;
  tutorialShown: boolean;
  lastPlayTime: number;
  coinsPerSecond: number;
  // Note: waitingCustomers, processingCustomers, customerEntities, tripEndTime are runtime-only; do not restore
}

const DEFAULT_GAME_STATE: GameStateSchema = {
  chronocoins: 0,
  totalEarned: 0,
  totalTripsCompleted: 0,
  totalManagerUpgrades: 0,
  totalCustomersServed: 0,
  timeMachineLevel: 1,
  timeMachineCapacity: 1,
  timeMachineSpeed: 1,
  timeMachineCount: 1,
  customerGenerationRate: 1,
  queueSize: 1,
  boardingSpeed: 1,
  vipChance: 0.05,
  turnaroundTime: 10,
  artifactScanner: 0,
  offlineInfra: 1,
  autoDispatch: 0,
  eraExpertise: 1,
  nextCustomerId: 0,
  unlockedDestinations: [],
  currentDestination: null,
  prestigeLevel: 0,
  prestigePoints: 0,
  tutorialShown: false,
  lastPlayTime: Date.now(),
  coinsPerSecond: 0,
};

function isNumber(value: any, positive = false): boolean {
  return typeof value === "number" && (!positive || value >= 0);
}

function isString(value: any): boolean {
  return typeof value === "string";
}

function isBoolean(value: any): boolean {
  return typeof value === "boolean";
}

function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * Validates the loaded gameState object. Returns a clean state:
 * - If valid, returns the state with missing fields defaulted.
 * - If corrupt beyond repair, returns DEFAULT_GAME_STATE and logs issues.
 */
export function validateAndSanitizeGameState(raw: any): GameStateSchema {
  const issues: string[] = [];
  const sanitized: any = { ...DEFAULT_GAME_STATE };

  if (!raw || typeof raw !== "object") {
    issues.push("Save file root is not an object; using default state");
    return { ...DEFAULT_GAME_STATE, _validationIssues: issues } as any;
  }

  // Helper to assign with type/range check
  const assign = (key: keyof GameStateSchema, validator: (v: any) => boolean, fallback: any) => {
    if (raw.hasOwnProperty(key) && validator(raw[key])) {
      sanitized[key] = raw[key];
    } else if (raw.hasOwnProperty(key)) {
      issues.push(`Field '${key}' has invalid type or value; using default`);
      sanitized[key] = fallback;
    } else {
      sanitized[key] = fallback;
    }
  };

  assign("chronocoins", isNumber, DEFAULT_GAME_STATE.chronocoins);
  assign("totalEarned", isNumber, DEFAULT_GAME_STATE.totalEarned);
  assign("totalTripsCompleted", isNumber, DEFAULT_GAME_STATE.totalTripsCompleted);
  assign("totalManagerUpgrades", isNumber, DEFAULT_GAME_STATE.totalManagerUpgrades);
  assign("totalCustomersServed", isNumber, DEFAULT_GAME_STATE.totalCustomersServed);
  assign("timeMachineLevel", (v) => isNumber(v) && v >= 1 && v <= 1000, DEFAULT_GAME_STATE.timeMachineLevel);
  assign("timeMachineCapacity", isNumber, DEFAULT_GAME_STATE.timeMachineCapacity);
  assign("timeMachineSpeed", isNumber, DEFAULT_GAME_STATE.timeMachineSpeed);
  assign("timeMachineCount", isNumber, DEFAULT_GAME_STATE.timeMachineCount);
  assign("customerGenerationRate", isNumber, DEFAULT_GAME_STATE.customerGenerationRate);
  assign("queueSize", isNumber, DEFAULT_GAME_STATE.queueSize);
  assign("boardingSpeed", isNumber, DEFAULT_GAME_STATE.boardingSpeed);
  assign("vipChance", (v) => isNumber(v) && v >= 0 && v <= 1, DEFAULT_GAME_STATE.vipChance);
  assign("turnaroundTime", isNumber, DEFAULT_GAME_STATE.turnaroundTime);
  assign("artifactScanner", isNumber, DEFAULT_GAME_STATE.artifactScanner);
  assign("offlineInfra", isNumber, DEFAULT_GAME_STATE.offlineInfra);
  assign("autoDispatch", isNumber, DEFAULT_GAME_STATE.autoDispatch);
  assign("eraExpertise", isNumber, DEFAULT_GAME_STATE.eraExpertise);
  assign("nextCustomerId", isNumber, DEFAULT_GAME_STATE.nextCustomerId);
  assign("prestigeLevel", isNumber, DEFAULT_GAME_STATE.prestigeLevel);
  assign("prestigePoints", isNumber, DEFAULT_GAME_STATE.prestigePoints);
  assign("tutorialShown", isBoolean, DEFAULT_GAME_STATE.tutorialShown);
  assign("lastPlayTime", isNumber, DEFAULT_GAME_STATE.lastPlayTime);
  assign("coinsPerSecond", isNumber, DEFAULT_GAME_STATE.coinsPerSecond);

  // Arrays
  if (raw.hasOwnProperty("unlockedDestinations") && isArray(raw.unlockedDestinations)) {
    sanitized.unlockedDestinations = raw.unlockedDestinations.filter(isString);
  } else {
    sanitized.unlockedDestinations = DEFAULT_GAME_STATE.unlockedDestinations;
    if (raw.hasOwnProperty("unlockedDestinations")) issues.push("unlockedDestinations not an array; resetting");
  }

  // currentDestination can be string or null
  if (raw.hasOwnProperty("currentDestination")) {
    if (raw.currentDestination === null || isString(raw.currentDestination)) {
      sanitized.currentDestination = raw.currentDestination;
    } else {
      issues.push("currentDestination invalid type; using null");
      sanitized.currentDestination = null;
    }
  }

  if (issues.length > 0) {
    sanitized._validationIssues = issues;
    console.warn("Save validation issues:", issues);
  }

  return sanitized;
}

export function profileStateDefaults() {
  return {
    managers: {},
    compoundInterestBonus: 0,
    unlockedAchievements: [],
    claimedAchievements: [],
    artifactDiscoveries: [],
    artifactTotalDrops: 0,
    missions: [],
    completedMissionIds: [],
    nextMissionId: 0,
    missionStreak: 0,
    lastMissionCompletedAt: 0,
    rerollsAvailable: 1,
    prestigePerkChoices: {},
    managerPerkChoices: {},
  };
}

export function validateAndSanitizeProfileState(raw: any): any {
  const defaults = profileStateDefaults();
  const issues: string[] = [];
  const sanitized: any = { ...defaults };

  if (!raw || typeof raw !== "object") {
    issues.push("Profile state invalid; using defaults");
    sanitized._validationIssues = issues;
    return sanitized;
  }

  // managers: object with numeric keys, values any (but we just pass through)
  if (raw.managers && typeof raw.managers === "object" && !Array.isArray(raw.managers)) {
    sanitized.managers = raw.managers;
  } else if (raw.managers) {
    issues.push("managers invalid; using {}");
    sanitized.managers = {};
  }

  if (isNumber(raw.compoundInterestBonus)) {
    sanitized.compoundInterestBonus = raw.compoundInterestBonus;
  }

  if (isArray(raw.unlockedAchievements)) {
    sanitized.unlockedAchievements = raw.unlockedAchievements.filter(isString);
  }
  if (isArray(raw.claimedAchievements)) {
    sanitized.claimedAchievements = raw.claimedAchievements.filter(isString);
  }

  if (isArray(raw.artifactDiscoveries)) {
    sanitized.artifactDiscoveries = raw.artifactDiscoveries.filter(
      (d: any) => d && typeof d === "object" && typeof d.artifactId === "string"
    );
  }
  if (isNumber(raw.artifactTotalDrops)) {
    sanitized.artifactTotalDrops = raw.artifactTotalDrops;
  }

  if (isArray(raw.missions)) {
    sanitized.missions = raw.missions;
  }
  if (isArray(raw.completedMissionIds)) {
    // Trim to last 200 — older IDs are never needed (active missions always have fresh IDs).
    // This shrinks bloated saves from veteran players on the next save cycle.
    sanitized.completedMissionIds = raw.completedMissionIds
      .filter((id: any) => typeof id === "number" || typeof id === "string")
      .slice(-200);
  }
  if (isNumber(raw.nextMissionId)) {
    sanitized.nextMissionId = raw.nextMissionId;
  }
  if (isNumber(raw.missionStreak)) {
    sanitized.missionStreak = Math.max(0, raw.missionStreak);
  }
  if (isNumber(raw.lastMissionCompletedAt)) {
    sanitized.lastMissionCompletedAt = raw.lastMissionCompletedAt;
  }
  if (raw.rerollsAvailable !== undefined) {
    sanitized.rerollsAvailable = Number(raw.rerollsAvailable) || 1;
  }

  if (raw.prestigePerkChoices && typeof raw.prestigePerkChoices === "object" && !Array.isArray(raw.prestigePerkChoices)) {
    sanitized.prestigePerkChoices = raw.prestigePerkChoices;
  }
  if (raw.managerPerkChoices && typeof raw.managerPerkChoices === "object" && !Array.isArray(raw.managerPerkChoices)) {
    sanitized.managerPerkChoices = raw.managerPerkChoices;
  }

  if (issues.length > 0) {
    sanitized._validationIssues = issues;
    console.warn("Profile validation issues:", issues);
  }

  return sanitized;
}
