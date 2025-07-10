
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { backendApi } from '@/services/api';
import { PokemonCard } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AddToWishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: PokemonCard;
}

const AddToWishlistDialog = ({ open, onOpenChange, card }: AddToWishlistDialogProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await backendApi.addToWishlist(token, {
        card_id: card.id,
        priority,
        notes,
      });

      toast({
        title: 'Success',
        description: 'Card added to wishlist successfully!',
      });

      onOpenChange(false);
      setPriority('medium');
      setNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add card to wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add {card.name} to Wishlist</DialogTitle>
          <DialogDescription>
            Add this card to your wishlist with priority and notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this card..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add to wishlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWishlistDialog;
