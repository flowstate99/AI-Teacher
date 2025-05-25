// src/components/dashboard/views/ProfileView.jsx
import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  Globe, 
  Palette,
  Save,
  Edit,
  Mail,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  Target,
  Brain,
  Eye,
  EyeOff
} from 'lucide-react';
import apiService from '../../../services/api';

const ProfileView = ({ user, token, userData, refreshData }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    theme: 'dark',
    language: 'en',
    difficulty: 'intermediate',
    emailUpdates: true,
    pushNotifications: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const { userStats, assessmentStats } = userData;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // In a real app, you'd call the API to update profile
      console.log('Saving profile:', formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
    setSaving(false);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await apiService.updateUserPreferences(preferences, token);
      console.log('Preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setSaving(true);
    try {
      // API call to change password would go here
      console.log('Changing password');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
      });
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
    setSaving(false);
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 text-white/70">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-4">Edit Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Learning Profile */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4">Learning Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white/90 font-medium mb-3">Strengths</h4>
            <div className="space-y-2">
              {user.learningProfile?.strengths?.length > 0 ? (
                user.learningProfile.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm">
                    {strength}
                  </div>
                ))
              ) : (
                <p className="text-white/70 text-sm">Take assessments to identify your strengths</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white/90 font-medium mb-3">Areas to Improve</h4>
            <div className="space-y-2">
              {user.learningProfile?.weaknesses?.length > 0 ? (
                user.learningProfile.weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg text-sm">
                    {weakness}
                  </div>
                ))
              ) : (
                <p className="text-white/70 text-sm">Take assessments to identify areas for improvement</p>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-white/90 font-medium mb-2">Learning Style</h4>
            <div className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm inline-block">
              {user.learningProfile?.preferredStyle || 'Not determined'}
            </div>
          </div>
          <div>
            <h4 className="text-white/90 font-medium mb-2">Learning Pace</h4>
            <div className="bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg text-sm inline-block">
              {user.learningProfile?.pace || 'Not determined'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{userStats.totalCourses || 0}</div>
          <div className="text-white/70">Courses Enrolled</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{userStats.completedCourses || 0}</div>
          <div className="text-white/70">Courses Completed</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{assessmentStats.averageScore || 0}%</div>
          <div className="text-white/70">Average Score</div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Security</h3>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            Change Password
          </button>
        </div>
        
        {showPasswordChange && (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-white/70 text-sm font-medium mb-2">Current Password</label>
              <input
                type={passwordData.showCurrent ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setPasswordData({...passwordData, showCurrent: !passwordData.showCurrent})}
                className="absolute right-4 top-9 text-white/50 hover:text-white transition-colors"
              >
                {passwordData.showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="relative">
              <label className="block text-white/70 text-sm font-medium mb-2">New Password</label>
              <input
                type={passwordData.showNew ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setPasswordData({...passwordData, showNew: !passwordData.showNew})}
                className="absolute right-4 top-9 text-white/50 hover:text-white transition-colors"
              >
                {passwordData.showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="relative">
              <label className="block text-white/70 text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type={passwordData.showConfirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setPasswordData({...passwordData, showConfirm: !passwordData.showConfirm})}
                className="absolute right-4 top-9 text-white/50 hover:text-white transition-colors"
              >
                {passwordData.showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePasswordChange}
                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => setShowPasswordChange(false)}
                className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-blue-400" />
          <h3 className="text-white font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Email Notifications</h4>
              <p className="text-white/70 text-sm">Receive course updates and progress reports</p>
            </div>
            <button
              onClick={() => setPreferences({...preferences, emailUpdates: !preferences.emailUpdates})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailUpdates ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Push Notifications</h4>
              <p className="text-white/70 text-sm">Get notified about deadlines and achievements</p>
            </div>
            <button
              onClick={() => setPreferences({...preferences, pushNotifications: !preferences.pushNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.pushNotifications ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-semibold">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Theme</label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-green-400" />
          <h3 className="text-white font-semibold">Learning Preferences</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Default Difficulty</label>
            <select
              value={preferences.difficulty}
              onChange={(e) => setPreferences({...preferences, difficulty: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
        <p className="text-white/70">Manage your account and learning preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
        <div className="flex border-b border-white/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' ? <ProfileTab /> : <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;