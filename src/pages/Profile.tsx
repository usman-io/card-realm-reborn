
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profile_picture ? `http://localhost:8000${user.profile_picture}` : null
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Revoke the object URL when component unmounts or when a new file is selected
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);

      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast({
            title: "Error",
            description: "New passwords don't match",
            variant: "destructive"
          });
          return;
        }
        formData.append('password', profileData.newPassword);
      }

      // Add profile picture if selected
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      }

      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`
          // Don't set Content-Type header, let the browser set it with the correct boundary
        },
        body: formData
      });

      if (response.ok) {
        const userData = await response.json();
        // Update the preview URL if a new image was uploaded
        if (userData.profile_picture) {
          setPreviewUrl(`http://localhost:8000${userData.profile_picture}`);
        }
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        // Refresh user data to get the latest from the server
        await refreshUserData();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };
  
  // Refresh user data after update
  const refreshUserData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        // Update the user context with the new data
        // This assumes your AuthContext has a way to update the user
        // You might need to adjust this based on your actual AuthContext implementation
        if (userData.profile_picture) {
          setPreviewUrl(`http://localhost:8000${userData.profile_picture}`);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image"
              />
              <Label
                htmlFor="profile-image"
                className="cursor-pointer flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Camera className="h-4 w-4" />
                <span>Change Photo</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
