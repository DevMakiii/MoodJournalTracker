"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { ProfileSettings } from "@/components/profile-settings"
import { RemindersSettings } from "@/components/reminders-settings"
import { NotificationReminder } from "@/components/notification-reminder"

interface SettingsTabsProps {
  profile: any
  reminders: any[]
}

export function SettingsTabs({ profile, reminders }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const isMobile = useIsMobile()

  const tabs = [
    { value: "profile", label: "Profile" },
    { value: "reminders", label: "Daily Reminders" },
    { value: "notifications", label: "Browser Notifications" },
  ]

  const currentTab = tabs.find(t => t.value === activeTab)?.label || "Profile"

  if (isMobile) {
    return (
      <div className="w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {currentTab}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {tabs.map(tab => (
              <DropdownMenuItem key={tab.value} onClick={() => setActiveTab(tab.value)}>
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="mt-4">
          {activeTab === "profile" && <ProfileSettings profile={profile} />}
          {activeTab === "reminders" && <RemindersSettings reminders={reminders} />}
          {activeTab === "notifications" && <NotificationReminder reminders={reminders} />}
        </div>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="reminders">Daily Reminders</TabsTrigger>
        <TabsTrigger value="notifications">Browser Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
        <ProfileSettings profile={profile} />
      </TabsContent>
      <TabsContent value="reminders" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
        <RemindersSettings reminders={reminders} />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
        <NotificationReminder reminders={reminders} />
      </TabsContent>
    </Tabs>
  )
}