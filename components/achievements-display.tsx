"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Achievement {
  id: string
  achievement_type: string
  title: string
  description: string | null
  unlocked_at: string
}

interface AchievementsDisplayProps {
  achievements: Achievement[]
}

const ACHIEVEMENT_DEFINITIONS = {
  first_entry: {
    title: "First Step",
    description: "Logged your first mood entry",
    emoji: "🌱",
  },
  week_streak: {
    title: "Week Warrior",
    description: "Logged mood for 7 consecutive days",
    emoji: "🔥",
  },
  month_streak: {
    title: "Monthly Master",
    description: "Logged mood for 30 consecutive days",
    emoji: "👑",
  },
  fifty_entries: {
    title: "Fifty Strong",
    description: "Logged 50 mood entries",
    emoji: "💪",
  },
  hundred_entries: {
    title: "Century Club",
    description: "Logged 100 mood entries",
    emoji: "🏆",
  },
  positive_week: {
    title: "Sunshine Week",
    description: "Average mood above 4 for a week",
    emoji: "☀️",
  },
}

export function AchievementsDisplay({ achievements }: AchievementsDisplayProps) {
  const unlockedTypes = new Set(achievements.map((a) => a.achievement_type))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          {achievements.length} of {Object.keys(ACHIEVEMENT_DEFINITIONS).length} unlocked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(ACHIEVEMENT_DEFINITIONS).map(([key, achievement]) => {
            const isUnlocked = unlockedTypes.has(key)
            const unlockedAchievement = achievements.find((a) => a.achievement_type === key)

            return (
              <div
                key={key}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-all ${
                  isUnlocked ? "bg-yellow-50 border-2 border-yellow-300" : "bg-gray-100 opacity-50"
                }`}
              >
                <span className="text-3xl">{achievement.emoji}</span>
                <h3 className="font-semibold text-sm">{achievement.title}</h3>
                <p className="text-xs text-gray-600">{achievement.description}</p>
                {isUnlocked && unlockedAchievement && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(unlockedAchievement.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
