
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AddCardNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: PokemonCard;
}

const AddCardNoteDialog = ({ open, onOpenChange, card }: AddCardNoteDialogProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!token || !note.trim()) return;

    setLoading(true);
    try {
      await backendApi.addCardNote(token, {
        card_id: card.id,
        note: note.trim(),
      });

      toast({
        title: 'Success',
        description: 'Note added successfully!',
      });

      onOpenChange(false);
      setNote('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note for {card.name}</DialogTitle>
          <DialogDescription>
            Add a personal note for this card that only you can see.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Your Note</Label>
            <Textarea
              id="note"
              placeholder="Add your thoughts, observations, or reminders about this card..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !note.trim()}>
            {loading ? 'Adding...' : 'Add Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardNoteDialog;
