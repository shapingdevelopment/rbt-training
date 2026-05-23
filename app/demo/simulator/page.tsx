import { DashboardHeader } from '@/components/dashboard/header'
import { SimulatorHub } from '@/components/simulator/simulator-hub'
import { mockUserProgress, mockScenarios } from '@/lib/mock-data'

export default function SimulatorPage() {
  return (
    <>
      <DashboardHeader 
        title="AI Clinical Simulator" 
        subtitle="Practice with realistic AI clients"
        totalXp={mockUserProgress.total_xp}
      />
      <SimulatorHub 
        scenarios={mockScenarios.filter(s => s.module === 'simulator')}
        userLevel={mockUserProgress.level}
      />
    </>
  )
}
