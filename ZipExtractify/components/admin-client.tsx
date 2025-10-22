"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  validateCredentials,
  saveAuthToStorage,
  getAuthFromStorage,
  clearAuthFromStorage,
  isSuperAdmin,
} from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { LogOut, Pencil, Trash2, UserPlus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"

const CATEGORIES = ["rats", "cracked", "free", "paid", "crypters", "malware", "binders"]

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
}

type Announcement = {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
}

// Added type for admin applications and admin management
type AdminApplication = {
  id: string
  discord_username: string
  email: string | null
  reason: string
  ip_address: string
  status: string
  created_at: string
}

type Admin = {
  id: string
  username: string
  is_super_admin: boolean
  created_at: string
}

export function AdminClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<
    | "programs"
    | "announcements"
    | "edit-programs"
    | "edit-announcements"
    | "settings"
    | "applications"
    | "manage-admins"
    | "analytics"
  >("programs")
  const router = useRouter()

  // Program form state
  const [programForm, setProgramForm] = useState({
    title: "",
    short_description: "",
    long_description: "",
    category: "rats",
    price: "",
    is_free: false,
    image_url: "",
    videos: "",
    additional_images: "",
    file_url: "",
  })

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  })

  const [programs, setPrograms] = useState<Program[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [discordLink, setDiscordLink] = useState("")

  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newAdminForm, setNewAdminForm] = useState({ username: "", password: "" })
  const [isSuper, setIsSuper] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applyForm, setApplyForm] = useState({ discord_username: "", email: "", reason: "" })
  const [hasApplied, setHasApplied] = useState(false)
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"day" | "week" | "month">("week")
  const [visits, setVisits] = useState<any[]>([])
  const [downloads, setDownloads] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    const user = getAuthFromStorage()
    if (user) {
      setIsAuthenticated(true)
      setCurrentUser(user)
      fetchPrograms()
      fetchAnnouncements()
      fetchDiscordLink()
      // Fetch applications and admins if authenticated
      fetchApplications()
      fetchAdmins()
      checkSuperAdmin(user)
    }
    // Check if the user has already applied
    checkIfApplied()
  }, [])

  // Function to check if the current user is a super admin
  const checkSuperAdmin = async (username: string) => {
    const superAdmin = await isSuperAdmin(username)
    setIsSuper(superAdmin)
  }

  // Function to check if the user has already applied from localStorage
  const checkIfApplied = () => {
    if (typeof window !== "undefined") {
      const applied = localStorage.getItem("ratplace_applied")
      setHasApplied(applied === "true")
    }
  }

  const fetchPrograms = async () => {
    const { data } = await supabase.from("programs").select("*").order("created_at", { ascending: false })
    if (data) setPrograms(data)
  }

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false })
    if (data) setAnnouncements(data)
  }

  const fetchDiscordLink = async () => {
    const { data } = await supabase.from("settings").select("value").eq("key", "discord_link").single()
    if (data) setDiscordLink(data.value)
  }

  // Fetch admin applications
  const fetchApplications = async () => {
    const { data } = await supabase.from("admin_applications").select("*").order("created_at", { ascending: false })
    if (data) setApplications(data)
  }

  // Fetch all admins
  const fetchAdmins = async () => {
    const { data } = await supabase
      .from("admins")
      .select("id, username, is_super_admin, created_at")
      .order("created_at", { ascending: false })
    if (data) setAdmins(data)
  }

  // Fetch analytics data
  const fetchAnalytics = async () => {
    const now = new Date()
    let startDate = new Date()

    if (analyticsTimeframe === "day") {
      startDate.setDate(now.getDate() - 1)
    } else if (analyticsTimeframe === "week") {
      startDate.setDate(now.getDate() - 7)
    } else {
      startDate.setMonth(now.getMonth() - 1)
    }

    const { data: visitsData } = await supabase
      .from("visits")
      .select("*, programs(title)")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    const { data: downloadsData } = await supabase
      .from("downloads")
      .select("*, programs(title)")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    if (visitsData) setVisits(visitsData)
    if (downloadsData) setDownloads(downloadsData)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate credentials using the imported function
    const isValid = await validateCredentials(username, password)
    if (isValid) {
      saveAuthToStorage(username)
      setIsAuthenticated(true)
      setCurrentUser(username)
      setError("")
      // Fetch data after successful login
      fetchPrograms()
      fetchAnnouncements()
      fetchDiscordLink()
      fetchApplications()
      fetchAdmins()
      checkSuperAdmin(username)
    } else {
      setError("Invalid credentials")
    }
  }

  const handleLogout = () => {
    clearAuthFromStorage()
    setIsAuthenticated(false)
    setCurrentUser(null)
    router.push("/")
  }

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return

    const { error } = await supabase.from("programs").delete().eq("id", id)
    if (!error) {
      alert("Program deleted successfully!")
      fetchPrograms()
    } else {
      alert("Error deleting program: " + error.message)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    const { error } = await supabase.from("announcements").delete().eq("id", id)
    if (!error) {
      alert("Announcement deleted successfully!")
      fetchAnnouncements()
    } else {
      alert("Error deleting announcement: " + error.message)
    }
  }

  // Handle updating an existing program
  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProgram) return

    const videos = programForm.videos ? programForm.videos.split(",").map((v) => v.trim()) : []
    const additional_images = programForm.additional_images
      ? programForm.additional_images.split(",").map((i) => i.trim())
      : []

    const { error } = await supabase
      .from("programs")
      .update({
        title: programForm.title,
        short_description: programForm.short_description,
        long_description: programForm.long_description,
        category: programForm.category,
        price: programForm.is_free ? 0 : Number.parseFloat(programForm.price),
        is_free: programForm.is_free,
        image_url: programForm.image_url || null,
        videos,
        additional_images,
        file_url: programForm.file_url || null,
      })
      .eq("id", editingProgram.id)

    if (!error) {
      alert("Program updated successfully!")
      setEditingProgram(null)
      // Reset form
      setProgramForm({
        title: "",
        short_description: "",
        long_description: "",
        category: "rats",
        price: "",
        is_free: false,
        image_url: "",
        videos: "",
        additional_images: "",
        file_url: "",
      })
      fetchPrograms() // Refresh the list
      setActiveTab("edit-programs") // Navigate back to edit programs tab
    } else {
      alert("Error updating program: " + error.message)
    }
  }

  // Handle updating an existing announcement
  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAnnouncement) return

    const { error } = await supabase
      .from("announcements")
      .update({
        title: announcementForm.title,
        content: announcementForm.content,
      })
      .eq("id", editingAnnouncement.id)

    if (!error) {
      alert("Announcement updated successfully!")
      setEditingAnnouncement(null)
      // Reset form
      setAnnouncementForm({ title: "", content: "" })
      fetchAnnouncements() // Refresh the list
      setActiveTab("edit-announcements") // Navigate back to edit announcements tab
    } else {
      alert("Error updating announcement: " + error.message)
    }
  }

  // Set the form and editing state for a program
  const startEditingProgram = (program: Program) => {
    setEditingProgram(program)
    setProgramForm({
      title: program.title,
      short_description: program.short_description,
      long_description: program.long_description,
      category: program.category,
      price: program.price.toString(),
      is_free: program.is_free,
      image_url: program.image_url || "",
      videos: program.videos?.join(", ") || "",
      additional_images: program.additional_images?.join(", ") || "",
      file_url: program.file_url || "",
    })
    setActiveTab("programs") // Switch to the program form tab
  }

  // Set the form and editing state for an announcement
  const startEditingAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
    })
    setActiveTab("announcements") // Switch to the announcement form tab
  }

  // Save the discord link setting
  const handleSaveDiscordLink = async () => {
    const { error } = await supabase.from("settings").upsert({
      key: "discord_link",
      value: discordLink,
      updated_at: new Date().toISOString(),
    })

    if (!error) {
      alert("Discord link updated successfully!")
    } else {
      alert("Error updating Discord link: " + error.message)
    }
  }

  // Handle creating a new program
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()

    const videos = programForm.videos ? programForm.videos.split(",").map((v) => v.trim()) : []
    const additional_images = programForm.additional_images
      ? programForm.additional_images.split(",").map((i) => i.trim())
      : []

    const { error } = await supabase.from("programs").insert({
      title: programForm.title,
      short_description: programForm.short_description,
      long_description: programForm.long_description,
      category: programForm.category,
      price: programForm.is_free ? 0 : Number.parseFloat(programForm.price),
      is_free: programForm.is_free,
      image_url: programForm.image_url || null,
      videos,
      additional_images,
      file_url: programForm.file_url || null,
      created_by: currentUser!, // Assuming currentUser is always available when logged in
    })

    if (!error) {
      alert("Program created successfully!")
      // Reset form
      setProgramForm({
        title: "",
        short_description: "",
        long_description: "",
        category: "rats",
        price: "",
        is_free: false,
        image_url: "",
        videos: "",
        additional_images: "",
        file_url: "",
      })
      fetchPrograms() // Refresh the list
    } else {
      alert("Error creating program: " + error.message)
    }
  }

  // Handle creating a new announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("announcements").insert({
      title: announcementForm.title,
      content: announcementForm.content,
      created_by: currentUser!, // Assuming currentUser is always available when logged in
    })

    if (!error) {
      alert("Announcement created successfully!")
      // Reset form
      setAnnouncementForm({ title: "", content: "" })
      fetchAnnouncements() // Refresh the list
    } else {
      alert("Error creating announcement: " + error.message)
    }
  }

  // Handle application submission
  const handleApplyForAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get IP address (simplified - in production use a proper IP detection service)
    const ipAddress = "user-ip-" + Date.now()

    const { error } = await supabase.from("admin_applications").insert({
      discord_username: applyForm.discord_username,
      email: applyForm.email || null, // email is optional
      reason: applyForm.reason,
      ip_address: ipAddress,
    })

    if (!error) {
      alert("Application submitted successfully! Admins will review it soon.")
      // Reset form and hide it
      setApplyForm({ discord_username: "", email: "", reason: "" })
      setShowApplyForm(false)
      // Mark as applied in localStorage to prevent repeated applications
      localStorage.setItem("ratplace_applied", "true")
      setHasApplied(true)
    } else {
      alert("Error submitting application: " + error.message)
    }
  }

  // Handle deleting an admin application
  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    const { error } = await supabase.from("admin_applications").delete().eq("id", id)
    if (!error) {
      alert("Application deleted successfully!")
      fetchApplications() // Refresh the list
    } else {
      alert("Error deleting application: " + error.message)
    }
  }

  // Handle adding a new admin (Super Admin only)
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("admins").insert({
      username: newAdminForm.username,
      password: newAdminForm.password, // Password should be hashed in a real application
      is_super_admin: false, // New admins are not super admins by default
      created_by: currentUser!, // Track who created the admin
    })

    if (!error) {
      alert("Admin added successfully!")
      // Reset form
      setNewAdminForm({ username: "", password: "" })
      fetchAdmins() // Refresh the admin list
    } else {
      alert("Error adding admin: " + error.message)
    }
  }

  // Handle deleting an admin (Super Admin only)
  const handleDeleteAdmin = async (username: string, isSuperAdmin: boolean) => {
    // Prevent deleting the super admin
    if (isSuperAdmin) {
      alert("Cannot delete the super admin!")
      return
    }

    if (!confirm(`Are you sure you want to remove admin: ${username}?`)) return

    const { error } = await supabase.from("admins").delete().eq("username", username)
    if (!error) {
      alert("Admin removed successfully!")
      fetchAdmins() // Refresh the admin list
    } else {
      alert("Error removing admin: " + error.message)
    }
  }

  // Render login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showApplyForm ? (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
                {/* Show apply button only if user hasn't applied and is not authenticated */}
                {!hasApplied && (
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowApplyForm(true)}>
                    Apply for Admin!
                  </Button>
                )}
              </>
            ) : (
              // Admin application form
              <form onSubmit={handleApplyForAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discord">Discord Username *</Label>
                  <Input
                    id="discord"
                    value={applyForm.discord_username}
                    onChange={(e) => setApplyForm({ ...applyForm, discord_username: e.target.value })}
                    placeholder="username#1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Why do you want to become an admin? *</Label>
                  <Textarea
                    id="reason"
                    value={applyForm.reason}
                    onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                    rows={4}
                    placeholder="Tell us why you'd be a great admin..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Send Application
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowApplyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render admin dashboard if authenticated
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              RatPlace Admin
            </h1>
            <nav className="hidden lg:flex gap-2">
              <Button
                variant={activeTab === "programs" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("programs")
                  setEditingProgram(null) // Reset editing state
                  // Reset program form
                  setProgramForm({
                    title: "",
                    short_description: "",
                    long_description: "",
                    category: "rats",
                    price: "",
                    is_free: false,
                    image_url: "",
                    videos: "",
                    additional_images: "",
                    file_url: "",
                  })
                }}
                className="rounded-full"
              >
                Create Program
              </Button>
              <Button
                variant={activeTab === "announcements" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("announcements")
                  setEditingAnnouncement(null) // Reset editing state
                  // Reset announcement form
                  setAnnouncementForm({ title: "", content: "" })
                }}
                className="rounded-full"
              >
                Create Announcement
              </Button>
              <Button
                variant={activeTab === "edit-programs" ? "default" : "ghost"}
                onClick={() => setActiveTab("edit-programs")}
                className="rounded-full"
              >
                Edit Programs
              </Button>
              <Button
                variant={activeTab === "edit-announcements" ? "default" : "ghost"}
                onClick={() => setActiveTab("edit-announcements")}
                className="rounded-full"
              >
                Edit Announcements
              </Button>
              {/* Applications Tab */}
              <Button
                variant={activeTab === "applications" ? "default" : "ghost"}
                onClick={() => setActiveTab("applications")}
                className="rounded-full"
              >
                Applications
              </Button>
              {/* Manage Admins Tab (only visible to Super Admins) */}
              {isSuper && (
                <Button
                  variant={activeTab === "manage-admins" ? "default" : "ghost"}
                  onClick={() => setActiveTab("manage-admins")}
                  className="rounded-full"
                >
                  Manage Admins
                </Button>
              )}
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("analytics")
                  fetchAnalytics()
                }}
                className="rounded-full"
              >
                Analytics
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                onClick={() => setActiveTab("settings")}
                className="rounded-full"
              >
                Settings
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              Logged in as <strong>{currentUser}</strong>
              {/* Display SUPER ADMIN badge if user is a super admin */}
              {isSuper && (
                <Badge className="ml-2" variant="destructive">
                  SUPER ADMIN
                </Badge>
              )}
            </span>
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-full bg-transparent">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6">
          <Select value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programs">Create Program</SelectItem>
              <SelectItem value="announcements">Create Announcement</SelectItem>
              <SelectItem value="edit-programs">Edit Programs</SelectItem>
              <SelectItem value="edit-announcements">Edit Announcements</SelectItem>
              <SelectItem value="applications">Applications</SelectItem>
              {isSuper && <SelectItem value="manage-admins">Manage Admins</SelectItem>}
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tab Content */}
        {/* Applications Tab */}
        {activeTab === "applications" ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Applications</CardTitle>
                <CardDescription>Review applications from users who want to become admins</CardDescription>
              </CardHeader>
            </Card>
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No applications yet</CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{app.discord_username}</CardTitle>
                            <Badge variant={app.status === "pending" ? "secondary" : "default"}>{app.status}</Badge>
                          </div>
                          {app.email && <p className="text-sm text-muted-foreground">{app.email}</p>}
                          <p className="text-sm text-muted-foreground">
                            Applied: {new Date(app.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteApplication(app.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Reason:</Label>
                        <p className="text-muted-foreground whitespace-pre-wrap">{app.reason}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : // Manage Admins Tab (only visible to Super Admins)
        activeTab === "manage-admins" && isSuper ? (
          <div className="space-y-6">
            {/* Add New Admin Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Admin</CardTitle>
                <CardDescription>Create a new admin account (Super Admin only)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_username">Username</Label>
                    <Input
                      id="new_username"
                      value={newAdminForm.username}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Current Admins List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Admins</CardTitle>
                <CardDescription>Manage existing admin accounts</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {admins.map((admin) => (
                <Card key={admin.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{admin.username}</CardTitle>
                        <CardDescription className="text-xs">
                          Added: {new Date(admin.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {admin.is_super_admin && <Badge variant="destructive">SUPER</Badge>}
                        {!admin.is_super_admin && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAdmin(admin.username, admin.is_super_admin)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : // Create Program Tab
        activeTab === "programs" ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingProgram ? "Edit Program" : "Create New Program"}</CardTitle>
              <CardDescription>
                {editingProgram ? "Update the program details" : "Add a new program to the marketplace"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={programForm.title}
                    onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={programForm.short_description}
                    onChange={(e) => setProgramForm({ ...programForm, short_description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_description">Long Description</Label>
                  <Textarea
                    id="long_description"
                    value={programForm.long_description}
                    onChange={(e) => setProgramForm({ ...programForm, long_description: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={programForm.category}
                    onValueChange={(value) => setProgramForm({ ...programForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_free"
                    checked={programForm.is_free}
                    onCheckedChange={(checked) => setProgramForm({ ...programForm, is_free: checked as boolean })}
                  />
                  <Label htmlFor="is_free" className="cursor-pointer">
                    Free Program
                  </Label>
                </div>

                {!programForm.is_free && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={programForm.price}
                      onChange={(e) => setProgramForm({ ...programForm, price: e.target.value })}
                      required={!programForm.is_free}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={programForm.image_url}
                    onChange={(e) => setProgramForm({ ...programForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videos">Video URLs (comma-separated)</Label>
                  <Input
                    id="videos"
                    value={programForm.videos}
                    onChange={(e) => setProgramForm({ ...programForm, videos: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..., https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_images">Additional Image URLs (comma-separated)</Label>
                  <Input
                    id="additional_images"
                    value={programForm.additional_images}
                    onChange={(e) => setProgramForm({ ...programForm, additional_images: e.target.value })}
                    placeholder="https://example.com/img1.jpg, https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_url">Download File URL</Label>
                  <Input
                    id="file_url"
                    type="url"
                    value={programForm.file_url}
                    onChange={(e) => setProgramForm({ ...programForm, file_url: e.target.value })}
                    placeholder="https://example.com/file.zip"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingProgram ? "Update Program" : "Create Program"}
                  </Button>
                  {editingProgram && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingProgram(null)
                        setProgramForm({
                          title: "",
                          short_description: "",
                          long_description: "",
                          category: "rats",
                          price: "",
                          is_free: false,
                          image_url: "",
                          videos: "",
                          additional_images: "",
                          file_url: "",
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : // Create Announcement Tab
        activeTab === "announcements" ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}</CardTitle>
              <CardDescription>
                {editingAnnouncement ? "Update the announcement" : "Post an announcement to all users"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="ann_title">Title</Label>
                  <Input
                    id="ann_title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
                  </Button>
                  {editingAnnouncement && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingAnnouncement(null)
                        setAnnouncementForm({ title: "", content: "" })
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : // Edit Programs Tab
        activeTab === "edit-programs" ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Programs</CardTitle>
                <CardDescription>Edit or delete existing programs</CardDescription>
              </CardHeader>
            </Card>
            {programs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No programs created yet</CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {programs.map((program) => (
                  <Card key={program.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{program.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{program.short_description}</CardDescription>
                        </div>
                        {program.is_free ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : (
                          <Badge variant="default">${program.price}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {program.category}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditingProgram(program)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProgram(program.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : // Edit Announcements Tab
        activeTab === "edit-announcements" ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Announcements</CardTitle>
                <CardDescription>Edit or delete existing announcements</CardDescription>
              </CardHeader>
            </Card>
            {announcements.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No announcements created yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{announcement.created_by}</Badge>
                            <span>•</span>
                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditingAnnouncement(announcement)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">{announcement.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "analytics" ? (
          // Analytics Tab
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Analytics Dashboard</CardTitle>
                    <CardDescription>Track visits and downloads by IP address</CardDescription>
                  </div>
                  <Select value={analyticsTimeframe} onValueChange={(value: any) => { setAnalyticsTimeframe(value); setTimeout(fetchAnalytics, 100); }}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Visits Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Visits</CardTitle>
                  <CardDescription>Program page visits by IP ({visits.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  {visits.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No visits recorded</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {visits.map((visit, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{visit.programs?.title || "Unknown Program"}</p>
                            <p className="text-xs text-muted-foreground">IP: {visit.ip_address}</p>
                            <p className="text-xs text-muted-foreground">{new Date(visit.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Downloads Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Downloads</CardTitle>
                  <CardDescription>Program downloads by IP ({downloads.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  {downloads.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No downloads recorded</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {downloads.map((download, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{download.programs?.title || "Unknown Program"}</p>
                            <p className="text-xs text-muted-foreground">IP: {download.ip_address}</p>
                            <p className="text-xs text-muted-foreground">{new Date(download.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unique IPs (Visits)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{new Set(visits.map(v => v.ip_address)).size}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unique IPs (Downloads)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{new Set(downloads.map(d => d.ip_address)).size}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{visits.length + downloads.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Settings Tab
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure site-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discord_link">Discord Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="discord_link"
                    type="url"
                    value={discordLink}
                    onChange={(e) => setDiscordLink(e.target.value)}
                    placeholder="https://discord.gg/yourserver"
                    className="flex-1"
                  />
                  <Button onClick={handleSaveDiscordLink}>Save</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This link will appear in the "Join our Discord!" button on the main page
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
