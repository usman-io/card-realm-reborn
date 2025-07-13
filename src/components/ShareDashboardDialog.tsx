
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareDashboardDialogProps {
  children: React.ReactNode;
}

export const ShareDashboardDialog: React.FC<ShareDashboardDialogProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/dashboard/shared/${user?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Dashboard link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Dashboard
          </DialogTitle>
          <DialogDescription className="text-left">
            Share your collection with anyone through a link. Others cannot make changes to your collection, only view it.
            <br /><br />
            All of the currently active options and filters are included in the link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="link"
              value={shareUrl}
              readOnly
              className="h-9"
            />
          </div>
          <Button 
            type="button" 
            size="sm" 
            className="px-3"
            onClick={handleCopyLink}
          >
            <span className="sr-only">Copy</span>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
