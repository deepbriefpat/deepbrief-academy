import { useState, useEffect } from "react";
import { Star, Check } from "lucide-react";
import { CoachPreferences } from "@/data/coachNames";
import { getCoachAvatar } from "@/data/coachAvatars";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FAVORITES_KEY = "aiCoachFavorites";

interface FavoriteCoachesProps {
  currentCoach: CoachPreferences | null;
  onSelectCoach: (coach: CoachPreferences) => void;
}

export function FavoriteCoaches({ currentCoach, onSelectCoach }: FavoriteCoachesProps) {
  const [favorites, setFavorites] = useState<CoachPreferences[]>([]);
  
  useEffect(() => {
    // Load favorites from localStorage
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
    }
  }, []);
  
  const saveFavorite = (coach: CoachPreferences) => {
    // Check if already favorited
    const exists = favorites.some(fav => 
      fav.gender === coach.gender && fav.name === coach.name
    );
    
    if (exists) {
      return; // Already favorited
    }
    
    const newFavorites = [...favorites, coach];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };
  
  const removeFavorite = (coach: CoachPreferences) => {
    const newFavorites = favorites.filter(fav => 
      !(fav.gender === coach.gender && fav.name === coach.name)
    );
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };
  
  const isFavorite = (coach: CoachPreferences | null) => {
    if (!coach) return false;
    return favorites.some(fav => 
      fav.gender === coach.gender && fav.name === coach.name
    );
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Save/Remove Favorite Button */}
      {currentCoach && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isFavorite(currentCoach)) {
              removeFavorite(currentCoach);
            } else {
              saveFavorite(currentCoach);
            }
          }}
          className={`${
            isFavorite(currentCoach)
              ? "text-gold border-gold"
              : "text-gray-400 border-gray-600"
          }`}
          title={isFavorite(currentCoach) ? "Remove from favorites" : "Save as favorite"}
        >
          <Star 
            className={`w-4 h-4 ${isFavorite(currentCoach) ? "fill-gold" : ""}`}
          />
        </Button>
      )}
      
      {/* Favorites Dropdown */}
      {favorites.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-gold border-gold-dim">
              My Coaches ({favorites.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-navy-mid border-gold-dim">
            <DropdownMenuLabel className="text-gold">Favorite Coaches</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gold-dim" />
            {favorites.map((coach, index) => {
              const isActive = currentCoach?.name === coach.name && currentCoach?.gender === coach.gender;
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSelectCoach(coach)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-navy-light focus:bg-navy-light"
                >
                  <img 
                    src={getCoachAvatar(coach.name, coach.gender)} 
                    alt={coach.name}
                    className="w-8 h-8 rounded-full border border-gold-dim"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{coach.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{coach.gender}</div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-gold" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
