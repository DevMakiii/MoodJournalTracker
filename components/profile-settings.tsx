"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash2 } from "lucide-react"

interface Profile {
  id: string
  first_name?: string
  last_name?: string
  display_name?: string
  avatar_url?: string
}

interface ProfileSettingsProps {
  profile: Profile | null
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    console.log('Starting image upload process')
    console.log('Supabase client created:', !!supabase)
    console.log('Profile ID:', profile?.id)

    const fileExt = file.name.split('.').pop()
    const fileName = `${profile?.id}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    console.log('Attempting to upload to bucket: avatars')
    console.log('File path:', filePath)
    console.log('File size:', file.size, 'bytes')
    console.log('File type:', file.type)

    // First, try to upload the file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      console.error('Error details:', {
        message: uploadError.message,
        details: uploadError
      })
      return null
    }

    console.log('Upload successful, getting public URL')
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    console.log('Public URL generated:', data.publicUrl)

    // Verify the URL is accessible
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' })
      if (!response.ok) {
        console.error('Uploaded image is not accessible:', response.status, response.statusText)
        return null
      }
    } catch (error) {
      console.error('Error verifying uploaded image:', error)
      return null
    }

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalAvatarUrl = avatarUrl

      if (selectedFile) {
        console.log('Uploading selected file...')
        const uploadedUrl = await uploadImage(selectedFile)
        if (uploadedUrl) {
          console.log('Image uploaded successfully:', uploadedUrl)
          finalAvatarUrl = uploadedUrl
        } else {
          console.error('Image upload failed')
          throw new Error('Failed to upload image. Please check the console for details.')
        }
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: profile?.id,
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    console.log('Starting account deletion from frontend')
    setIsDeleting(true)
    try {
      console.log('Sending DELETE request to /api/delete-account')
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
      })
      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API returned error:', errorData)
        throw new Error(errorData.error || 'Failed to delete account')
      }

      const successData = await response.json()
      console.log('API returned success:', successData)

      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted. You will now be logged out.",
      })

      // Sign out the user and redirect
      console.log('Signing out user')
      await supabase.auth.signOut()
      console.log('Redirecting to home page')
      window.location.href = '/'
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and profile details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <div className="flex justify-center">
              <label
                htmlFor="profilePicture"
                className="relative cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/25 hover:border-primary transition-colors overflow-hidden bg-muted/50 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
              </label>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
        <div className="mt-6 pt-6 border-t">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}