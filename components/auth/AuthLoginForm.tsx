'use client'

import { useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useI18n } from '@/lib/i18n'
import LanguageSelector from '@/components/LanguageSelector'
import ThemeToggle from '@/components/ThemeToggle'
import LoginFields from '@/components/auth/LoginFields'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export type LoginSuccessData = {
  nickname: string
  socketToken: string
}

type AuthLoginFormProps = {
  onLoginSuccess: (data: LoginSuccessData) => void
  isTransitioning: boolean
}

export default function AuthLoginForm({ onLoginSuccess, isTransitioning }: AuthLoginFormProps) {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const loginBusyRef = useRef(false)
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loginBusyRef.current || loginLoading || isTransitioning) return
    setError('')

    if (!nickname.trim()) {
      setError(t('auth.nicknameRequired'))
      return
    }

    if (nickname.length < 3) {
      setError(t('auth.nicknameMinLength'))
      return
    }

    if (!password.trim()) {
      setError(t('auth.passwordRequired'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'))
      return
    }

    if (isNewUser) {
      if (!email.trim()) {
        setError(t('auth.emailRequired'))
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        setError(t('auth.emailInvalid'))
        return
      }

      if (!confirmPassword.trim()) {
        setError(t('auth.confirmPasswordRequired'))
        return
      }

      if (password !== confirmPassword) {
        setError(t('auth.passwordsDoNotMatch'))
        return
      }

      if (!acceptTerms) {
        setError(t('auth.mustAccept'))
        return
      }
    }

    loginBusyRef.current = true
    setLoginLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          email: isNewUser ? email.trim() : undefined,
          password,
          isNewUser,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || t('auth.error'))
        return
      }

      const data = await response.json()
      onLoginSuccess({ nickname: data.nickname, socketToken: data.socketToken })
    } catch {
      setError(t('auth.connectionError'))
    } finally {
      loginBusyRef.current = false
      setLoginLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl dark:shadow-gray-900 w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center flex-1 text-gray-800 dark:text-white">
            {t('auth.title')}
          </h1>
          <div className="flex-shrink-0">
            <LanguageSelector forceMobile={true} />
          </div>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
          {t('auth.subtitle')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <LoginFields
            nickname={nickname}
            setNickname={setNickname}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isNewUser={isNewUser}
            onIsNewUserChange={(checked) => {
              setIsNewUser(checked)
              if (!checked) {
                setAcceptTerms(false)
              }
            }}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
            error={error}
            onForgotPassword={() => setShowForgotPassword(true)}
          />
          <button
            type="submit"
            disabled={loginLoading || isTransitioning || (isNewUser && !acceptTerms)}
            className={`w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${
              loginLoading || isTransitioning || (isNewUser && !acceptTerms)
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {loginLoading ? t('common.loading') : isNewUser ? t('auth.register') : t('auth.enter')}
          </button>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('auth.or')}
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              signIn('google', { callbackUrl: '/app' })
            }}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {t('auth.continueWithGoogle')}
          </button>
        </form>
      </div>

      <ForgotPasswordForm
        open={showForgotPassword}
        error={error}
        setError={setError}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  )
}
