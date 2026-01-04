'use client'

import { useState } from 'react'
import { login, signup, loginWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [registerPassword, setRegisterPassword] = useState("")
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false)

  const handleGoogleLogin = async () => {
    // Server action will handle redirect
    await loginWithGoogle()
  }

  const handleAction = async (action: typeof login | typeof signup, formData: FormData) => {
    setIsLoading(true)
    const result = await action(formData)
    setIsLoading(false)

    if (result && 'error' in result && result.error) {
        toast.error(result.error)
    } else if (result && 'success' in result && result.success) {
        setIsRegisterSuccess(true)
        toast.success(result.message as string)
    }
  }

  const calculateStrength = (pwd: string) => {
    let score = 0
    if (!pwd) return 0
    if (pwd.length >= 8) score += 25
    if (/[a-z]/.test(pwd)) score += 25
    if (/[A-Z]/.test(pwd)) score += 25
    if (/[0-9]/.test(pwd)) score += 25
    return score
  }

  const strength = calculateStrength(registerPassword)
  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-primary"
    if (score <= 25) return "bg-red-500"
    if (score <= 50) return "bg-orange-500"
    if (score <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthLabel = (score: number) => {
    if (score === 0) return ""
    if (score <= 25) return "非常弱"
    if (score <= 50) return "弱"
    if (score <= 75) return "中等"
    return "強"
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <h1 className="text-3xl font-bold text-center mb-6">HenRs-旅遊計畫</h1>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登入</TabsTrigger>
            <TabsTrigger value="register">註冊</TabsTrigger>
          </TabsList>

          <div className="mt-6 mb-6">
            <form action={handleGoogleLogin}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2" type="submit">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    使用 Google 登入
                </Button>
            </form>
            <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-muted-foreground">
                        或使用 Email
                    </span>
                </div>
            </div>
          </div>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>歡迎回來</CardTitle>
                <CardDescription>
                  輸入您的 Email 與密碼登入
                </CardDescription>
              </CardHeader>
              <form action={(formData) => handleAction(login, formData)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">密碼</Label>
                    <Input id="login-password" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    登入
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>建立新帳號</CardTitle>
                <CardDescription>
                  註冊以開始規劃您的旅程
                </CardDescription>
              </CardHeader>
              {isRegisterSuccess ? (
                <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="rounded-full bg-green-100 p-3">
                        <Mail className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">驗證信已寄出</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            請檢查您的電子信箱，點擊驗證連結以啟用您的帳號。
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => setIsRegisterSuccess(false)}
                        className="mt-4"
                    >
                        返回
                    </Button>
                </CardContent>
              ) : (
              <form action={(formData) => handleAction(signup, formData)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" name="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">密碼</Label>
                    <Input 
                        id="register-password" 
                        name="password" 
                        type="password" 
                        required 
                        minLength={8}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>密碼強度</span>
                            <span>{getStrengthLabel(strength)}</span>
                        </div>
                        <Progress 
                            value={strength} 
                            className="h-2"
                            indicatorClassName={getStrengthColor(strength)}
                        />
                        <p className={`text-xs text-right pt-1 ${strength <= 50 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                           {strength <= 50 && registerPassword.length > 0 ? "密碼强度不足" : "建議使用 8 字元以上，包含大小寫與數字"}
                        </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading || strength <= 50}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    註冊
                  </Button>
                </CardFooter>
              </form>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
