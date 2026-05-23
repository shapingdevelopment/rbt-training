'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockScenarios, mockUserProgress } from '@/lib/mock-data'
import { GraduationCap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ScenarioCard } from '@/components/scenarios/scenario-card'

export default function RehearsalPage() {
  const rehearsalScenarios = mockScenarios.filter(s => s.module === 'rehearsal' || s.module === 'simulator').slice(0, 6)
  
  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Guided Rehearsal</h1>
        <p className="text-muted-foreground">
          Practice scenarios with scaffolded support and real-time feedback
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <GraduationCap className="text-primary" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">What is Guided Rehearsal?</h2>
              <p className="text-muted-foreground">
                Practice scenarios with scaffolded prompts that gradually fade as your 
                confidence grows. Perfect for building fluency before real sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Scenario Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Rehearsals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rehearsalScenarios.map(scenario => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              userLevel={mockUserProgress.level}
              isCompleted={false}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
