import { SimulatorSession } from '@/components/simulator/simulator-session'
import { mockScenarios, mockUserProgress } from '@/lib/mock-data'
import { notFound } from 'next/navigation'

interface SimulatorSessionPageProps {
  params: Promise<{ scenarioId: string }>
}

export default async function SimulatorSessionPage({ params }: SimulatorSessionPageProps) {
  const { scenarioId } = await params
  const scenario = mockScenarios.find(s => s.id === scenarioId)
  
  if (!scenario) {
    notFound()
  }
  
  return (
    <SimulatorSession 
      scenario={scenario}
      userLevel={mockUserProgress.level}
      currentStreak={mockUserProgress.current_streak}
    />
  )
}
