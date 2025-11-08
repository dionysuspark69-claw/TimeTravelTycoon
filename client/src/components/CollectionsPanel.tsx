import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Lock } from "lucide-react";
import { useArtifacts, ARTIFACT_COLLECTIONS, type ArtifactRarity } from "@/lib/stores/useArtifacts";
import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";

const RARITY_COLORS: Record<ArtifactRarity, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-orange-500"
};

const RARITY_TEXT_COLORS: Record<ArtifactRarity, string> = {
  common: "text-gray-600",
  uncommon: "text-green-600",
  rare: "text-blue-600",
  epic: "text-purple-600",
  legendary: "text-orange-600"
};

export function CollectionsPanel() {
  const { hasArtifact, getCollectionProgress, isCollectionComplete, getTotalRevenueBonus } = useArtifacts();
  const unlockedDestinations = useIdleGame(state => state.unlockedDestinations);
  
  const totalBonus = getTotalRevenueBonus();
  
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Total Artifact Bonus</h3>
            <p className="text-sm text-gray-300">Artifacts boost revenue for their destinations</p>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            +{(totalBonus * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      {ARTIFACT_COLLECTIONS.map(collection => {
        const destination = TIME_PERIODS.find(d => d.id === collection.destinationId);
        const isUnlocked = unlockedDestinations.includes(collection.destinationId);
        const progress = getCollectionProgress(collection.destinationId);
        const isComplete = isCollectionComplete(collection.destinationId);
        
        if (!destination) return null;
        
        return (
          <Card key={collection.destinationId} className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white flex items-center gap-2">
                    {collection.name}
                    {isComplete && (
                      <Badge className="bg-green-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                    {!isUnlocked && (
                      <Badge variant="outline" className="text-gray-400 border-gray-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {destination.name} - {destination.era}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {collection.artifacts.filter(a => hasArtifact(a.id)).length}/{collection.artifacts.length}
                  </div>
                </div>
              </div>
              <Progress value={progress * 100} className="mt-2" />
            </CardHeader>
            
            <CardContent className="space-y-3">
              {collection.artifacts.map(artifact => {
                const discovered = hasArtifact(artifact.id);
                
                return (
                  <div
                    key={artifact.id}
                    className={`p-3 rounded-lg border ${
                      discovered
                        ? 'bg-gray-800/50 border-gray-600'
                        : 'bg-gray-900/30 border-gray-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {discovered ? (
                            <Sparkles className={`w-4 h-4 ${RARITY_TEXT_COLORS[artifact.rarity]}`} />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                          <h4 className={`font-semibold ${discovered ? 'text-white' : 'text-gray-500'}`}>
                            {discovered ? artifact.name : '???'}
                          </h4>
                        </div>
                        <p className={`text-sm ${discovered ? 'text-gray-400' : 'text-gray-600'}`}>
                          {discovered ? artifact.description : 'Complete trips to discover'}
                        </p>
                        {discovered && (
                          <div className="mt-2 text-xs text-green-400">
                            +{(artifact.revenueBonus * 100).toFixed(1)}% revenue
                          </div>
                        )}
                      </div>
                      <Badge className={`${RARITY_COLORS[artifact.rarity]} text-white capitalize`}>
                        {artifact.rarity}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {isComplete && (
                <div className="mt-4 p-3 bg-green-600/20 border border-green-600/50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Collection Bonus Unlocked!</div>
                      <div className="text-sm">{collection.setBonusDescription}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
