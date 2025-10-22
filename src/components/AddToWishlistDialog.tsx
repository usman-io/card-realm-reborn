
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
import { useTranslation } from 'react-i18next';

interface AddToWishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: PokemonCard;
}

const AddToWishlistDialog = ({ open, onOpenChange, card }: AddToWishlistDialogProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t('common.update'),
        description: t('wishlist.addToWishlist'),
      });

      onOpenChange(false);
      setPriority('medium');
      setNotes('');
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('common.add')} {card.name} {t('wishlist.addToWishlist')}</DialogTitle>
          <DialogDescription>
            {t('wishlist.addToWishlist')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">{t('wishlist.priority')} *</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder={t('wishlist.priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('wishlist.low')}</SelectItem>
                <SelectItem value="medium">{t('wishlist.medium')}</SelectItem>
                <SelectItem value="high">{t('wishlist.high')}</SelectItem>
                <SelectItem value="urgent">{t('wishlist.high')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('collection.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('collection.notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('common.loading') : t('wishlist.addToWishlist')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWishlistDialog;
