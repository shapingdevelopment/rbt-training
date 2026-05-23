'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScenarioCard } from '@/components/scenarios/scenario-card'
import type { Scenario } from '@/lib/types'
import { Search, Filter, Brain } from 'lucide-react'
import Link from 'next/link'

interface SimulatorHubProps {
  scenarios: Scenario[]
  userLevel: number
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'behavior_management', label: 'Behavior Management' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'transitions', label: 'Transitions' },
  { value: 'crisis', label: 'Crisis' },
  { value: 'communication', label: 'Communication' },
]

export function SimulatorHub({ scenarios, userLevel }: SimulatorHubProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(search.toLowerCase()) ||
      scenario.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || scenario.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const unlockedCount = scenarios.filter(s => userLevel >= s.unlock_level).length
  const lockedCount = scenarios.length - unlockedCount
  
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Brain className="text-primary" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">AI Clinical Simulator</h2>
              <p className="text-muted-foreground mb-4">
                Practice your clinical skills with AI-powered client simulations. 
                Each scenario presents realistic challenges and provides real-time coaching feedback.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-primary font-medium">{unlockedCount} scenarios unlocked</span>
                {lockedCount > 0 && (
                  <span className="text-muted-foreground">{lockedCount} locked</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search scenarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground" size={18} />
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map(scenario => (
          <Link key={scenario.id} href={`/demo/simulator/${scenario.id}`}>
            <ScenarioCard
              scenario={scenario}
              userLevel={userLevel}
              isCompleted={false}
            />
          </Link>
        ))}
      </div>
      
      {filteredScenarios.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No scenarios match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
