import { useState, useEffect, useRef } from 'react'
import { Loader2, Upload, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AccountSettings() {
  const { user } = useAuth()

  // Profile
  const [fullName, setFullName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Danger
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      setLoadingProfile(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, logo_url')
        .eq('id', user.id)
        .single()
      if (!error && data) {
        setFullName(data.full_name ?? '')
        setLogoUrl(data.logo_url ?? '')
      }
      setLoadingProfile(false)
    }
    fetchProfile()
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id)
      if (error) throw error
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (!user) return
    setUploadingLogo(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `profiles/${user.id}/logo-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ logo_url: publicUrl })
        .eq('id', user.id)
      if (updateError) throw updateError

      setLogoUrl(publicUrl)
      toast.success('Profile logo uploaded successfully')
    } catch {
      toast.error('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      toast.error('Please enter a new password')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated successfully')
    } catch (err) {
      toast.error(
        `Failed to update password: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setSavingPassword(false)
    }
  }

  const handleSignOutAll = async () => {
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error
      toast.success('Signed out from all devices')
    } catch {
      toast.error('Failed to sign out from all devices')
    } finally {
      setSigningOut(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, password, and account preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>
            Your personal account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              value={user?.email ?? ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed from this page
            </p>
          </div>
          <div className="space-y-2">
            <Label>Profile Logo</Label>
            {logoUrl && (
              <div className="relative w-20 h-20 rounded-full border overflow-hidden">
                <img
                  src={logoUrl}
                  alt="Profile logo"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleLogoUpload(file)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password</CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handleUpdatePassword} disabled={savingPassword}>
            {savingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Sign Out from All Devices</p>
              <p className="text-xs text-muted-foreground">
                This will sign you out from every device and session
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOutAll}
              disabled={signingOut}
            >
              {signingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                'Sign Out All'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
