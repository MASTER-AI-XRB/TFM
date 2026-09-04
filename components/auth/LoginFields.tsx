'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

type LoginFieldsProps = {
  nickname: string
  setNickname: (value: string) => void
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  confirmPassword: string
  setConfirmPassword: (value: string) => void
  isNewUser: boolean
  onIsNewUserChange: (checked: boolean) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (value: boolean) => void
  acceptTerms: boolean
  setAcceptTerms: (value: boolean) => void
  error: string
  onForgotPassword: () => void
}

function PasswordToggleButton({
  visible,
  onToggle,
  labelShow,
  labelHide,
}: {
  visible: boolean
  onToggle: () => void
  labelShow: string
  labelHide: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
      aria-label={visible ? labelHide : labelShow}
    >
      {visible ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
        </svg>
      )}
    </button>
  )
}

export default function LoginFields({
  nickname,
  setNickname,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isNewUser,
  onIsNewUserChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  acceptTerms,
  setAcceptTerms,
  error,
  onForgotPassword,
}: LoginFieldsProps) {
  const { t } = useI18n()

  return (
    <>
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('auth.nickname')}
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('auth.nicknamePlaceholder')}
        />
      </div>
      {isNewUser && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('auth.email')}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('auth.emailPlaceholder')}
          />
        </div>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('auth.password')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('auth.passwordPlaceholder')}
          />
          <PasswordToggleButton
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            labelShow={t('auth.showPassword')}
            labelHide={t('auth.hidePassword')}
          />
        </div>
      </div>
      {!isNewUser && (
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('auth.forgotPassword')}
          </button>
        </div>
      )}
      {isNewUser && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('auth.confirmPassword')}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('auth.confirmPasswordPlaceholder')}
            />
            <PasswordToggleButton
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              labelShow={t('auth.showPassword')}
              labelHide={t('auth.hidePassword')}
            />
          </div>
        </div>
      )}
      {error && (
        <div
          data-testid="auth-error"
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded"
        >
          {error}
        </div>
      )}
      {isNewUser && (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300">
            {t('auth.acceptTerms')}{' '}
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
              {t('auth.privacyPolicy')}
            </Link>
            {' '}{t('auth.and')}{' '}
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
              {t('auth.termsConditions')}
            </Link>
          </label>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isNewUser"
          checked={isNewUser}
          onChange={(e) => onIsNewUserChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isNewUser" className="text-sm text-gray-700 dark:text-gray-300">
          {t('auth.newUser')}
        </label>
      </div>
    </>
  )
}
