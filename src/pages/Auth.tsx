import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Sign up state — commented out for now
  // const [signupName, setSignupName] = useState('')
  // const [signupEmail, setSignupEmail] = useState('')
  // const [signupPassword, setSignupPassword] = useState('')
  // const [signupConfirm, setSignupConfirm] = useState('')
  // const [signupLoading, setSignupLoading] = useState(false)
  // const [signupError, setSignupError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      await signIn(loginEmail, loginPassword)

      // After signIn succeeds, check role for redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, client_id')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'client' && profile?.client_id) {
          navigate(`/c/${profile.client_id}/classroom`)
        } else {
          navigate('/')
        }
      } else {
        navigate('/')
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoginLoading(false)
    }
  }

  // Sign up handler — commented out for now
  // const handleSignup = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setSignupError('')
  //   if (signupPassword !== signupConfirm) {
  //     setSignupError('Passwords do not match')
  //     return
  //   }
  //   setSignupLoading(true)
  //   try {
  //     await signUp(signupEmail, signupPassword, signupName)
  //     navigate('/')
  //   } catch (err) {
  //     setSignupError(err instanceof Error ? err.message : 'Failed to create account')
  //   } finally {
  //     setSignupLoading(false)
  //   }
  // }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <h1 className="text-gold-shine font-bold text-2xl">Disruptors Skool</h1>
          <p className="text-muted-foreground text-sm">Lead Automation System</p>
        </CardHeader>
        <CardContent>
          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up — commented out for now, may re-enable later
          <Tabs defaultValue="login">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                {signupError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signupError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          */}

        </CardContent>
      </Card>
    </div>
  )
}
