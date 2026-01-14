'use client'

import { useState, useEffect } from 'react'
import { Bell, Moon, Globe, Smartphone, HelpCircle, MessageCircle, Check } from 'lucide-react'
import { getUserSettings, saveUserSettings, type UserSettings } from '@/lib/inventory-store'

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    language: 'en',
  })
  const [saveMessage, setSaveMessage] = useState('')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = getUserSettings()
    setSettings(savedSettings)
  }, [])

  // Save settings whenever they change
  const updateSetting = (key: keyof UserSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveUserSettings(newSettings)
    setSaveMessage('Settings saved!')
    setTimeout(() => setSaveMessage(''), 2000)
  }

  const handleHelpSupport = () => {
    window.open('mailto:support@smartkitchen.app?subject=Help%20Request', '_blank')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Customize your app experience</p>
      </div>

      {/* Save Confirmation */}
      {saveMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <Check className="w-4 h-4" />
          {saveMessage}
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Get notified about expiring items</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.notifications ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Alerts</p>
                <p className="text-sm text-gray-500">Weekly summary of your kitchen</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('emailAlerts', !settings.emailAlerts)}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.emailAlerts ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Appearance</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch to dark theme</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.darkMode ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Language</p>
                <p className="text-sm text-gray-500">Choose your language</p>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="en">English</option>
              <option value="es">Espanol</option>
              <option value="fr">Francais</option>
            </select>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">About</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">App Version</p>
                <p className="text-sm text-gray-500">Smart Kitchen v1.0.0</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleHelpSupport}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Help & Support</p>
              <p className="text-sm text-gray-500">Get help with the app</p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 py-4">
        <p>Made with love for home cooks everywhere</p>
        <p className="mt-1">2024 Smart Kitchen</p>
      </div>
    </div>
  )
}
