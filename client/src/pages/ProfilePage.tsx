import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Bell, Settings, ArrowLeft, Film, Heart, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import FooterNavigation from "@/components/FooterNavigation";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Navigation onAddMovie={() => {}} />
      
      <div className="pt-20 max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User size={20} />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings size={20} />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Email Reminders</p>
                      <p className="text-gray-400 text-sm">Get notified when it's time to watch</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-gray-400 text-sm">Browser notifications for reminders</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film size={16} className="text-blue-400" />
                    <span className="text-gray-300">Movies in Watchlist</span>
                  </div>
                  <span className="text-white font-semibold">0</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-green-400" />
                    <span className="text-gray-300">Posts Created</span>
                  </div>
                  <span className="text-white font-semibold">0</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-red-400" />
                    <span className="text-gray-300">Likes Given</span>
                  </div>
                  <span className="text-white font-semibold">0</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Film size={16} className="mr-2" />
                    Browse Movies
                  </Button>
                </Link>
                
                <Link href="/feed">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <MessageCircle size={16} className="mr-2" />
                    Create Post
                  </Button>
                </Link>
                
                <Link href="/watchlist">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Heart size={16} className="mr-2" />
                    View Watchlist
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <FooterNavigation />
    </div>
  );
}