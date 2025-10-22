"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Search, ChevronDown, ChevronUp, Heart } from "lucide-react"
import Link from "next/link"
import { ThemeToggle, useRainbowEasterEgg } from "@/components/theme-toggle"

type Program = {
  id: string
  title: string
  short_description: string
  category: string
  price: number
  is_free: boolean
  image_url: string | null
  created_by: string
}

type Announcement = {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
}

const CATEGORIES = ["rats", "cracked", "free", "paid", "crypters", "malware", "binders"]

export function MarketplaceClient() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "announcements">("marketplace")
  const [programs, setPrograms] = useState<Program[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [discordLink, setDiscordLink] = useState<string>("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES)
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [userIp, setUserIp] = useState<string>("")

  const supabase = createClient()

  const fetchPrograms = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("programs").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setPrograms(data)
    }
    setLoading(false)
  }

  const fetchAnnouncements = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setAnnouncements(data)
    }
    setLoading(false)
  }

  const fetchDiscordLink = async () => {
    const { data } = await supabase.from("settings").select("value").eq("key", "discord_link").single()
    if (data) {
      setDiscordLink(data.value)
    }
  }

  const getUserIp = async () => {
    try {
      const res = await fetch("/api/get-ip")
      const data = await res.json()
      setUserIp(data.ip)
      return data.ip
    } catch {
      const fallbackIp = "user-" + Date.now()
      setUserIp(fallbackIp)
      return fallbackIp
    }
  }

  const fetchLikes = async () => {
    const { count } = await supabase.from("website_likes").select("*", { count: "exact", head: true })
    setLikesCount(count || 0)
  }

  const checkUserLiked = async (ip: string) => {
    const { data } = await supabase.from("website_likes").select("*").eq("ip_address", ip).single()
    setIsLiked(!!data)
  }

  const handleLike = async () => {
    if (isLiked) return

    const ip = userIp || (await getUserIp())
    const { error } = await supabase.from("website_likes").insert({ ip_address: ip })

    if (!error) {
      setIsLiked(true)
      setLikesCount((prev) => prev + 1)
    }
  }

  useEffect(() => {
    fetchPrograms()
    fetchAnnouncements()
    fetchDiscordLink()
    fetchLikes()

    getUserIp().then((ip) => {
      checkUserLiked(ip)
    })
  }, [])

  const handleRefresh = () => {
    if (activeTab === "marketplace") {
      fetchPrograms()
    } else {
      fetchAnnouncements()
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.short_description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(program.category)
    return matchesSearch && matchesCategory
  })

  const programsByCategory = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = filteredPrograms.filter((p) => p.category === category)
      return acc
    },
    {} as Record<string, Program[]>,
  )

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const { handleRefreshClick } = useRainbowEasterEgg()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              RatPlace
            </h1>
            <nav className="flex gap-2">
              <Button
                variant={activeTab === "marketplace" ? "default" : "ghost"}
                onClick={() => setActiveTab("marketplace")}
                className="rounded-full"
              >
                Marketplace
              </Button>
              <Button
                variant={activeTab === "announcements" ? "default" : "ghost"}
                onClick={() => setActiveTab("announcements")}
                className="rounded-full"
              >
                Announcements
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {discordLink && (
              <Button variant="default" className="rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white" asChild>
                <a href={discordLink} target="_blank" rel="noopener noreferrer">
                  Join our Discord!
                </a>
              </Button>
            )}
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              disabled={isLiked}
              className={`rounded-full gap-2 ${isLiked ? "bg-red-500 hover:bg-red-600" : "bg-transparent"}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleRefreshClick(handleRefresh)}
              className="rounded-full bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="rounded-full bg-transparent">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "marketplace" ? (
          <div className="space-y-8">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading programs...</div>
            ) : (
              <div className="space-y-8">
                {CATEGORIES.map((category) => {
                  const categoryPrograms = programsByCategory[category]
                  if (categoryPrograms.length === 0) return null

                  const isExpanded = expandedCategories.includes(category)
                  const displayPrograms = isExpanded ? categoryPrograms : categoryPrograms.slice(0, 4)

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold capitalize">{category}</h2>
                        {categoryPrograms.length > 4 && (
                          <Button variant="ghost" onClick={() => toggleCategoryExpansion(category)} className="gap-2">
                            {isExpanded ? (
                              <>
                                Show Less <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Show All ({categoryPrograms.length}) <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayPrograms.map((program) => (
                          <Link key={program.id} href={`/program/${program.id}`}>
                            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
                              {program.image_url && (
                                <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
                                  <img
                                    src={program.image_url || "/placeholder.svg"}
                                    alt={program.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                                    }}
                                  />
                                </div>
                              )}
                              <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-lg line-clamp-1">{program.title}</CardTitle>
                                  {program.is_free ? (
                                    <Badge variant="secondary" className="shrink-0">
                                      Free
                                    </Badge>
                                  ) : (
                                    <Badge variant="default" className="shrink-0">
                                      ${program.price}
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="line-clamp-2">{program.short_description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <span className="text-muted-foreground text-xs">by {program.created_by}</span>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {filteredPrograms.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No programs match your search" : "No programs available yet"}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No announcements yet</div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-xl">{announcement.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{announcement.created_by}</Badge>
                            <span>•</span>
                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
