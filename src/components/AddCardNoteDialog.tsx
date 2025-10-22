
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
import { useTranslation } from 'react-i18next';

interface AddCardNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: PokemonCard;
}

const AddCardNoteDialog = ({ open, onOpenChange, card }: AddCardNoteDialogProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t('common.update'),
        description: t('collection.addNote'),
      });

      onOpenChange(false);
      setNote('');
    } catch (error) {
      toast({
        title: t('errors.somethingWentWrong'),
        description: t('errors.somethingWentWrong'),
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
          <DialogTitle>{t('collection.addNote')} {card.name}</DialogTitle>
          <DialogDescription>
            {t('collection.notes')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">{t('collection.notes')}</Label>
            <Textarea
              id="note"
              placeholder={t('collection.notes')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !note.trim()}>
            {loading ? t('common.loading') : t('collection.addNote')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardNoteDialog;
