'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const themeList = [
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'Dark', value: 'dark', icon: Moon },
  { name: 'System', value: 'system', icon: Monitor },
]

export function SwitchTheme() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-3">
      <Label htmlFor="theme-selector">Theme</Label>
      <Tabs
        id="theme-selector"
        defaultValue={theme ?? 'system'}
        onValueChange={setTheme}
        className="w-fit"
      >
        <TabsList>
          {themeList.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="gap-2">
              <item.icon className="h-4 w-4" />
              {item.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
