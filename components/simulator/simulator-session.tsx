'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Scenario, ChatMessage } from '@/lib/types'
import { getStreakMultiplier } from '@/lib/types'
import { 
  ArrowLeft, 
  Send, 
  Star, 
  Clock, 
  Lightbulb,
  User,
  Bot,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SimulatorSessionProps {
  scenario: Scenario
  userLevel: number
  currentStreak: number
}

export function SimulatorSession({ scenario, userLevel, currentStreak }: SimulatorSessionProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStartTime] = useState(Date.now())
  const [coachingTip, setCoachingTip] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const streakMultiplier = getStreakMultiplier(currentStreak)
  const potentialXp = Math.round(scenario.xp_reward * streakMultiplier)
  
  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < scenario.difficulty)
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Initialize with scenario context
  useEffect(() => {
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: getInitialClientMessage(scenario),
      timestamp: new Date().toISOString()
    }
    setMessages([initialMessage])
  }, [scenario])
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }
    
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setCoachingTip(null)
    
    try {
      // Call the streaming chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: scenario.id,
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })
      
      if (!response.ok) throw new Error('Chat API failed')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break
              
              try {
                const json = JSON.parse(data)
                if (json.text) {
                  assistantContent += json.text
                  // Update message in real-time
                  setMessages(prev => {
                    const newMessages = [...prev]
                    const lastMsg = newMessages[newMessages.length - 1]
                    if (lastMsg?.role === 'assistant') {
                      lastMsg.content = assistantContent
                    } else {
                      newMessages.push({
                        role: 'assistant',
                        content: assistantContent,
                        timestamp: new Date().toISOString()
                      })
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                // Skip non-JSON lines
              }
            }
          }
        }
      }
      
      // Add coaching feedback after response
      const coachingFeedback = generateCoachingFeedback(scenario, updatedMessages.length)
      setCoachingTip(coachingFeedback)
      
      // Check if session should end
      if (updatedMessages.length >= 10) {
        setTimeout(() => setIsComplete(true), 1000)
      }
    } catch (error) {
      console.error('[v0] Chat error:', error)
      // Fallback to mock response
      const response = generateMockResponse(scenario, messages.length)
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        coaching: response.coaching
      }
      setMessages(prev => [...prev, assistantMessage])
      setCoachingTip(response.coaching || null)
    }
    
    setIsLoading(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const sessionDuration = Math.round((Date.now() - sessionStartTime) / 60000)
  
  if (isComplete) {
    return (
      <SessionSummary
        scenario={scenario}
        messages={messages}
        duration={sessionDuration}
        xpEarned={potentialXp}
        onContinue={() => router.push('/demo/simulator')}
      />
    )
  }
  
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/demo/simulator">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{scenario.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {difficultyStars.map((filled, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      className={filled ? 'text-warning fill-warning' : 'text-muted-foreground/30'} 
                    />
                  ))}
                </div>
                <span>|</span>
                <span className="text-primary font-medium">+{potentialXp} XP</span>
                {streakMultiplier > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {streakMultiplier.toFixed(1)}x streak bonus
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>{sessionDuration}m</span>
            </div>
            <Button variant="destructive" size="sm" onClick={() => router.push('/demo/simulator')}>
              End Session
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Client is responding...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your response to the client..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading}
                className="self-end"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Coaching sidebar */}
        <div className="w-80 border-l border-border bg-card/50 p-4 overflow-y-auto hidden lg:block">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="text-warning" size={16} />
                  Coaching Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coachingTip ? (
                  <p className="text-sm text-muted-foreground">{coachingTip}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Coaching feedback will appear here based on your responses.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Scenario Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Skills Practiced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {scenario.skill_ids.map((skillId) => (
                    <Badge key={skillId} variant="secondary" className="text-xs">
                      {skillId.replace('skill-', 'Skill ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-primary' : 'bg-secondary'
      )}>
        {isUser ? (
          <User size={16} className="text-primary-foreground" />
        ) : (
          <Bot size={16} className="text-secondary-foreground" />
        )}
      </div>
      
      <div className={cn(
        'max-w-[70%] rounded-2xl px-4 py-2',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

function SessionSummary({ 
  scenario, 
  messages, 
  duration, 
  xpEarned,
  onContinue 
}: { 
  scenario: Scenario
  messages: ChatMessage[]
  duration: number
  xpEarned: number
  onContinue: () => void
}) {
  const masteryScore = 0.78 // Would be calculated from AI analysis
  
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="text-success" size={32} />
          </div>
          <CardTitle className="text-2xl">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Great work on &quot;{scenario.title}&quot;
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">+{xpEarned}</div>
              <div className="text-xs text-muted-foreground">XP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(masteryScore * 100)}%</div>
              <div className="text-xs text-muted-foreground">Mastery Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{duration}m</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">AI Feedback</h4>
            <p className="text-sm text-muted-foreground">
              Good use of redirection techniques. Consider allowing more wait time 
              before providing prompts to give the client a chance to respond independently.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onContinue}>
              Back to Scenarios
            </Button>
            <Button className="flex-1" onClick={onContinue}>
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Coaching feedback function
function generateCoachingFeedback(scenario: Scenario, turnCount: number): string {
  const feedbackOptions = [
    "Good redirection. Consider acknowledging the client's feelings before presenting alternatives.",
    "Excellent use of contingent reinforcement. Stay consistent with delivery.",
    "Consider using a prompting hierarchy to provide appropriate support without over-helping.",
    "Great progress! This is a good moment for specific, immediate praise.",
    "Nice observation of the client's state. Adjust your approach accordingly.",
    "Remember to allow adequate wait time for the client to respond independently.",
    "Strong de-escalation technique. Continue with this approach.",
    "Consider what reinforcement might be most effective for this client.",
  ]
  
  return feedbackOptions[turnCount % feedbackOptions.length]
}

// Mock functions for demo - in production these would call Claude API
function getInitialClientMessage(scenario: Scenario): string {
  const messages: Record<string, string> = {
    'scenario-1': "*You enter the room and see Jamie sitting at the table. You ask Jamie to start working on their worksheet, but Jamie pushes the paper away and says:*\n\n\"No! I don't want to do this. It's boring and I hate it!\"",
    'scenario-2': "*Sam is sitting at the small table, looking around the room curiously. You have a set of colored cards ready for the session.*\n\n*Sam looks at you expectantly, fidgeting slightly with their hands.*",
    'scenario-3': "*Riley is deeply engaged playing with their tablet, giggling at a video. You know it's time to transition to homework, which Riley typically resists.*\n\n*Riley hasn't noticed you approaching yet.*",
    'scenario-4': "*Jordan is becoming increasingly agitated after being told they can't go to recess yet. Their face is red and fists are clenched.*\n\n\"This isn't fair! You can't make me stay here!\" *Jordan shouts, taking a step toward you.*",
    'scenario-5': "*Jamie's mother approaches you after the session, looking concerned.*\n\n\"Hi, I wanted to ask about Jamie's progress. It feels like we've been doing this for months and I'm not sure if things are really getting better. Can you explain what's happening?\"",
  }
  
  return messages[scenario.id] || "*The session begins. The client is waiting for your interaction.*"
}

function generateMockResponse(scenario: Scenario, turnCount: number): { content: string; coaching?: string } {
  const responses = [
    {
      content: "*Jamie crosses their arms and looks away, but doesn't push the paper again.*\n\n\"Why do I have to do this anyway? It's not like it matters.\"",
      coaching: "Good redirection. Consider acknowledging Jamie's feelings before presenting the task again."
    },
    {
      content: "*Jamie sighs heavily but glances at the worksheet.*\n\n\"Fine. But only if I can have a break after.\"",
      coaching: "This is a good opportunity to use contingent reinforcement. Be specific about the break conditions."
    },
    {
      content: "*Jamie picks up the pencil reluctantly and looks at the first question.*\n\n\"This is too hard. I don't know how to do it.\"",
      coaching: "Jamie is engaging with the task. Consider using a prompting hierarchy to provide appropriate support."
    },
    {
      content: "*Jamie completes the first problem with some help and looks slightly less resistant.*\n\n\"Okay, that wasn't so bad I guess.\"",
      coaching: "Great progress! This is a good moment for specific praise to reinforce task engagement."
    }
  ]
  
  const index = Math.min(turnCount, responses.length - 1)
  return responses[index]
}
