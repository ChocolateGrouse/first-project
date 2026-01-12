'use client'

import { useState } from 'react'
import { User, Mail, Lock, Shield, Trash2, LogOut, Camera } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: 'John Stanley',
    email: 'john@example.com',
    avatar: null,
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {user.name.charAt(0)}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">
            Save Changes
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Security</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your password regularly</p>
              </div>
            </div>
          </button>
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
              Off
            </span>
          </button>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Data & Privacy</h3>
        </div>
        <div className="p-6">
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Your data is secure</p>
                <p className="text-sm text-green-700 mt-1">
                  All your receipts and financial data are encrypted and stored securely.
                  Only you can access your information.
                </p>
              </div>
            </div>
          </div>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            Download my data
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h3 className="font-semibold text-red-900">Danger Zone</h3>
        </div>
        <div className="p-6 space-y-4">
          <button className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          <button className="w-full px-4 py-3 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
