'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { MessageSquare, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReflectionPage() {
  const [reflection, setReflection] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reflective Practice Companion</h1>
          <p className="text-muted-foreground">
            Reflect on your learning and consolidate knowledge through structured reflection
          </p>
        </div>
        <Link href="/simulator">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Reflection Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                Session Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What went well in this session?
                </label>
                <Textarea
                  placeholder="Share your observations about what you did effectively..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  What could you improve?
                </label>
                <Textarea
                  placeholder="Identify areas for growth and specific techniques to practice..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  How will you apply these insights to future sessions?
                </label>
                <Textarea
                  placeholder="Create a specific action plan for your next session..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save size={16} className="mr-2" />
                  {saved ? 'Reflection Saved!' : 'Save Reflection'}
                </Button>
                <Link href="/simulator" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guidance Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reflection Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="font-medium text-foreground mb-1">Be Specific</p>
                <p className="text-muted-foreground">Reference specific moments and behaviors from your session.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Use ABA Language</p>
                <p className="text-muted-foreground">Apply proper terminology when describing behaviors and interventions.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Focus on Data</p>
                <p className="text-muted-foreground">When possible, reference observable behaviors and measurable outcomes.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Plan Ahead</p>
                <p className="text-muted-foreground">Connect your insights to specific goals for future sessions.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Reflections</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Badge variant="secondary">De-escalation techniques - 2 days ago</Badge>
              <Badge variant="secondary">Reinforcement timing - 5 days ago</Badge>
              <Badge variant="secondary">Data collection accuracy - 1 week ago</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
