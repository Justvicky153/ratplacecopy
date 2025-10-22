"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

type Program = {
  id: string
  title: string
  short_description: string
  long_description: string
  category: string
  price: number
  is_free: boolean
  image_url: string | null
  videos: string[]
  additional_images: string[]
  file_url: string | null
  created_by: string
  created_at: string
}

export function ProgramDetailClient({ id }: { id: string }) {
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const getUserIp = async () => {
    try {
      const res = await fetch("/api/get-ip")
      const data = await res.json()
      return data.ip
    } catch {
      return "user-" + Date.now()
    }
  }

  const trackVisit = async (programId: string) => {
    const ip = await getUserIp()
    await supabase.from("visits").insert({ program_id: programId, ip_address: ip })
  }

  const trackDownload = async (programId: string) => {
    const ip = await getUserIp()
    await supabase.from("downloads").insert({ program_id: programId, ip_address: ip })
  }

  useEffect(() => {
    const fetchProgram = async () => {
      const { data, error } = await supabase.from("programs").select("*").eq("id", id).single()

      if (!error && data) {
        setProgram(data)
        trackVisit(id)
      }
      setLoading(false)
    }

    fetchProgram()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading program...</p>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Program Not Found</CardTitle>
            <CardDescription>The program you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">{program.title}</h1>
                <p className="text-lg text-muted-foreground">{program.short_description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {program.is_free ? (
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Free
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-lg px-4 py-2">
                    ${program.price}
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {program.category}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Created by <strong>{program.created_by}</strong>
              </span>
              <span>•</span>
              <span>{new Date(program.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Main Image */}
          {program.image_url && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={program.image_url || "/placeholder.svg"}
                  alt={program.title}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=400&width=800"
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Download Button */}
          {program.file_url && (
            <Card>
              <CardContent className="p-6">
                <a href={program.file_url} target="_blank" rel="noopener noreferrer" onClick={() => trackDownload(program.id)}>
                  <Button size="lg" className="w-full gap-2">
                    <Download className="h-5 w-5" />
                    Download Program
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{program.long_description}</p>
            </CardContent>
          </Card>

          {/* Videos */}
          {program.videos && program.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.videos.map((video, index) => {
                  const embedUrl =
                    video.includes("youtube.com") || video.includes("youtu.be")
                      ? video.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
                      : video
                  return (
                    <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={`Video ${index + 1}`} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Additional Images */}
          {program.additional_images && program.additional_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {program.additional_images.map((image, index) => (
                    <div key={index} className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${program.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=300&width=400"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
