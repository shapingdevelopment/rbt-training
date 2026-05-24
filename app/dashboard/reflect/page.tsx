'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Save } from 'lucide-react'

export default function ReflectPage() {
  const [fields, setFields] = useState({ went_well: '', improve: '', apply: '' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (e) {
      console.error('Save failed:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reflective Practice</h1>
        <p className="text-muted-foreground">
          Reflect on your learning and consolidate knowledge through structured reflection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                Session Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'went_well', label: 'What went well in this session?', placeholder: 'Share your observations about what you did effectively...' },
                { key: 'improve',   label: 'What could you improve?',          placeholder: 'Identify areas for growth and specific techniques to practise...' },
                { key: 'apply',     label: 'How will you apply these insights to future sessions?', placeholder: 'Create a specific action plan for your next session...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium mb-2 block">{label}</label>
                  <Textarea
                    placeholder={placeholder}
                    value={fields[key as keyof typeof fields]}
                    onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save size={16} className="mr-2" />
                  {saved ? 'Reflection Saved!' : saving ? 'Saving...' : 'Save Reflection'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setFields({ went_well: '', improve: '', apply: '' })}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reflection Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {[
                ['Be Specific', 'Reference specific moments and behaviors from your session.'],
                ['Use ABA Language', 'Apply proper terminology when describing behaviors and interventions.'],
                ['Focus on Data', 'Reference observable behaviors and measurable outcomes where possible.'],
                ['Plan Ahead', 'Connect your insights to specific goals for future sessions.'],
              ].map(([title, desc]) => (
                <div key={title}>
                  <p className="font-medium text-foreground mb-1">{title}</p>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
