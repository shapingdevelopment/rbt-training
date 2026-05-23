'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockUserProgress, mockUserSkills } from '@/lib/mock-data'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts'
import { AlertCircle, Users, TrendingUp, Clock, Target, Activity } from 'lucide-react'

export default function SupervisorPage() {
  // Mock trainee data
  const trainees = [
    { id: '1', name: 'Alex Johnson', level: 8, hours: 32, completionRate: 78, atRisk: false, weakAreas: 1 },
    { id: '2', name: 'Jamie Lee', level: 5, hours: 18, completionRate: 55, atRisk: true, weakAreas: 3 },
    { id: '3', name: 'Casey Martinez', level: 10, hours: 40, completionRate: 95, atRisk: false, weakAreas: 0 },
    { id: '4', name: 'Taylor Kim', level: 6, hours: 24, completionRate: 62, atRisk: true, weakAreas: 2 },
  ]

  // Analytics data
  const engagementData = [
    { day: 'Mon', sessions: 8, completions: 6 },
    { day: 'Tue', sessions: 12, completions: 10 },
    { day: 'Wed', sessions: 10, completions: 8 },
    { day: 'Thu', sessions: 15, completions: 13 },
    { day: 'Fri', sessions: 14, completions: 12 },
  ]

  const skillGapsData = [
    { name: 'De-escalation', total: 8, competent: 5 },
    { name: 'Data Collection', total: 8, competent: 6 },
    { name: 'Reinforcement', total: 8, competent: 4 },
    { name: 'Communication', total: 8, competent: 7 },
  ]

  const atRiskTrainees = trainees.filter(t => t.atRisk)

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Supervisor Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor trainee progress, track certifications, and identify at-risk learners
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trainees</p>
                <p className="text-3xl font-bold">{trainees.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="text-primary" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certified</p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Target className="text-success" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-3xl font-bold text-destructive">{atRiskTrainees.length}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="text-destructive" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Hours</p>
                <p className="text-3xl font-bold">{Math.round(trainees.reduce((a, t) => a + t.hours, 0) / trainees.length)}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Clock className="text-accent" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="trainees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trainees">Trainees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Trainees Tab */}
        <TabsContent value="trainees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trainee Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainees.map((trainee) => (
                  <div key={trainee.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          {trainee.name}
                          {trainee.atRisk && (
                            <Badge variant="destructive" className="text-xs">At Risk</Badge>
                          )}
                          {trainee.hours >= 40 && (
                            <Badge variant="secondary" className="text-xs">Certified</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Level {trainee.level}</p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Training Hours</p>
                        <div className="flex items-center gap-2">
                          <Progress value={(trainee.hours / 40) * 100} className="flex-1 h-2" />
                          <span className="text-xs font-medium">{trainee.hours}/40</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={trainee.completionRate} className="flex-1 h-2" />
                          <span className="text-xs font-medium">{trainee.completionRate}%</span>
                        </div>
                      </div>
                    </div>

                    {trainee.weakAreas > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {trainee.weakAreas} weak competency area{trainee.weakAreas !== 1 ? 's' : ''} - Consider remediation
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Engagement & Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill="#3b82f6" name="Sessions Started" />
                  <Line type="monotone" dataKey="completions" stroke="#10b981" name="Sessions Completed" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Gaps Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Skill Competency Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillGapsData.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {skill.competent}/{skill.total} competent
                      </span>
                    </div>
                    <Progress value={(skill.competent / skill.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-destructive" size={20} />
                At-Risk Trainees
              </CardTitle>
            </CardHeader>
            <CardContent>
              {atRiskTrainees.length > 0 ? (
                <div className="space-y-3">
                  {atRiskTrainees.map((trainee) => (
                    <div key={trainee.id} className="border border-destructive/20 bg-destructive/5 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{trainee.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Low completion rate: {trainee.completionRate}% | {trainee.weakAreas} weak areas
                          </p>
                        </div>
                        <Button size="sm">Intervene</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Consider scheduling a check-in to discuss progress and identify barriers to completion.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">All trainees are on track!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remediation Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">Jamie Lee - Data Collection</p>
                    <Badge variant="outline" className="text-xs">Assigned 2 days ago</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">3 scenarios assigned | 1 completed</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">Taylor Kim - De-escalation</p>
                    <Badge variant="outline" className="text-xs">Assigned 5 days ago</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">2 scenarios assigned | 2 completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
