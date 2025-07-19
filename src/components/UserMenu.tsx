
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  // Get the full URL for the profile picture if it exists
  const getProfilePictureUrl = () => {
    if (!user?.profile_picture) return undefined;
    // Check if it's already a full URL
    if (user.profile_picture.startsWith('http')) {
      return user.profile_picture;
    }
    // Otherwise, prepend the base URL
    return `http://localhost:8000${user.profile_picture}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-brand-dark-blue hover:ring-offset-2 transition-all">
          <AvatarImage src={getProfilePictureUrl()} />
          <AvatarFallback className="text-sm font-medium bg-brand-dark-blue hover:bg-brand-dark-blue/80 text-white">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getProfilePictureUrl()} />
            <AvatarFallback className="text-sm bg-brand-dark-blue hover:bg-brand-dark-blue/80 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-brand-dark-blue">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="hover:!bg-brand-dark-blue focus:!bg-brand-dark-blue data-[highlighted]:!bg-brand-dark-blue">
          <Link to="/dashboard/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4 text-brand-white" />
            <span>Edit Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-600 hover:!bg-brand-dark-blue focus:!bg-brand-dark-blue data-[highlighted]:!bg-brand-dark-blue"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
