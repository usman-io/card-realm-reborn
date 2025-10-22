
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: PokemonCard;
}

const AddToCollectionDialog = ({ open, onOpenChange, card }: AddToCollectionDialogProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState('normal');
  const [language, setLanguage] = useState('en');
  const [condition, setCondition] = useState('unspecified');
  const [isGraded, setIsGraded] = useState(false);
  const [notes, setNotes] = useState('');
  const [addAnother, setAddAnother] = useState(false);

  const handleSubmit = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await backendApi.addToCollection(token, {
        card_id: card.id,
        quantity,
        condition,
        variant,
        language,
        is_graded: isGraded,
        notes,
      });

      toast({
        title: t('common.update'),
        description: t('collection.cardAdded'),
      });

      if (!addAnother) {
        onOpenChange(false);
        resetForm();
      } else {
        resetForm();
      }
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

  const resetForm = () => {
    setQuantity(1);
    setVariant('normal');
    setLanguage('en');
    setCondition('unspecified');
    setIsGraded(false);
    setNotes('');
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddAnotherChange = (checked: boolean | "indeterminate") => {
    setAddAnother(checked === true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('common.add')} {card.name} ({card.set.name} {card.number}/{card.set.total})</DialogTitle>
          <DialogDescription>
            {t('cards.addToCollection')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('collection.quantity')} *</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustQuantity(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Card variant */}
          <div className="space-y-2">
            <Label htmlFor="variant">{t('collection.variant') || 'Variant'} *</Label>
            <Select value={variant} onValueChange={setVariant}>
              <SelectTrigger>
                <SelectValue placeholder={t('collection.variant') || 'Select variant'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="reverse_holo">Reverse Holo</SelectItem>
                <SelectItem value="holo">Holo</SelectItem>
                <SelectItem value="first_edition">First Edition</SelectItem>
                <SelectItem value="shadowless">Shadowless</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card language */}
          <div className="space-y-2">
            <Label htmlFor="language">{t('collection.language') || 'Language'} *</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder={t('collection.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (EN)</SelectItem>
                <SelectItem value="ja">Japanese (JA)</SelectItem>
                <SelectItem value="de">German (DE)</SelectItem>
                <SelectItem value="fr">French (FR)</SelectItem>
                <SelectItem value="es">Spanish (ES)</SelectItem>
                <SelectItem value="it">Italian (IT)</SelectItem>
                <SelectItem value="pt">Portuguese (PT)</SelectItem>
                <SelectItem value="ko">Korean (KO)</SelectItem>
                <SelectItem value="zh">Chinese (ZH)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">{t('collection.condition')} *</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Switch
                id="graded"
                checked={isGraded}
                onCheckedChange={setIsGraded}
              />
              <Label htmlFor="graded">{t('collection.graded') || 'Graded'}</Label>
            </div>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder={t('collection.condition')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">Unspecified</SelectItem>
                <SelectItem value="mint">Mint</SelectItem>
                <SelectItem value="near_mint">Near Mint</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="light_played">Light Played</SelectItem>
                <SelectItem value="played">Played</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
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

          {/* Add another card */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="addAnother"
              checked={addAnother}
              onCheckedChange={handleAddAnotherChange}
            />
            <Label htmlFor="addAnother">{t('collection.addAnother') || 'Add another card after this'}</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('common.loading') : t('cards.addToCollection')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;
