import { useState, useCallback } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Chip } from '@/shared/components/ui/Chip';
import { Button } from '@/shared/components/ui/Button';
import type { UseCardFormReturn } from '@/features/card-editor/hooks/useCardForm';
import styles from './CardForm.module.css';

const RARITY_OPTIONS = [
  { value: '', label: 'Select Rarity' },
  { value: 'Common', label: 'Common' },
  { value: 'Rare', label: 'Rare' },
  { value: 'Super Rare', label: 'Super Rare' },
  { value: 'Ultra Rare', label: 'Ultra Rare' },
  { value: 'Secret Rare', label: 'Secret Rare' },
  { value: 'Ultimate Rare', label: 'Ultimate Rare' },
  { value: 'Ghost Rare', label: 'Ghost Rare' },
  { value: 'Starlight Rare', label: 'Starlight Rare' },
  { value: 'Prismatic Secret Rare', label: 'Prismatic Secret Rare' },
  { value: 'Quarter Century Secret Rare', label: 'Quarter Century Secret Rare' },
];

const CONDITION_OPTIONS = [
  { value: '', label: 'Select Condition' },
  { value: 'mint', label: 'Mint' },
  { value: 'near-mint', label: 'Near Mint' },
  { value: 'lightly-played', label: 'Lightly Played' },
  { value: 'moderately-played', label: 'Moderately Played' },
  { value: 'heavily-played', label: 'Heavily Played' },
  { value: 'damaged', label: 'Damaged' },
];

const EDITION_OPTIONS = [
  { value: '', label: 'Select Edition' },
  { value: '1st', label: '1st Edition' },
  { value: 'unlimited', label: 'Unlimited' },
  { value: 'limited', label: 'Limited' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'es', label: 'Spanish' },
  { value: 'ko', label: 'Korean' },
];

const FRAME_OPTIONS = [
  { value: '', label: 'Select Frame' },
  { value: 'normal', label: 'Normal' },
  { value: 'effect', label: 'Effect' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'fusion', label: 'Fusion' },
  { value: 'synchro', label: 'Synchro' },
  { value: 'xyz', label: 'Xyz' },
  { value: 'link', label: 'Link' },
  { value: 'spell', label: 'Spell' },
  { value: 'trap', label: 'Trap' },
];

export interface CardFormProps {
  form: UseCardFormReturn;
}

export function CardForm({ form }: CardFormProps) {
  const { values, errors, setField } = form;
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !values.tags.includes(tag) && values.tags.length < 50) {
      setField('tags', [...values.tags, tag]);
      setTagInput('');
    }
  }, [tagInput, values.tags, setField]);

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setField('tags', values.tags.filter((t) => t !== tag));
    },
    [values.tags, setField],
  );

  const handleNumericField = useCallback(
    (key: 'qty' | 'levelRankLink' | 'atk' | 'def', raw: string) => {
      if (raw === '') {
        if (key === 'qty') {
          setField(key, 0);
        } else {
          setField(key, null);
        }
        return;
      }
      const num = parseInt(raw, 10);
      if (!isNaN(num)) {
        setField(key, num);
      }
    },
    [setField],
  );

  const handlePriceField = useCallback(
    (key: 'marketPrice' | 'purchasePrice' | 'targetPrice', raw: string) => {
      if (raw === '') {
        setField(key, null);
        return;
      }
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        setField(key, num);
      }
    },
    [setField],
  );

  return (
    <div className={styles.form}>
      {/* Basic Info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic Info</h3>
        <Input
          label="Card Name"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors['name']}
          fullWidth
          required
        />
        <div className={styles.row}>
          <Input
            label="Locale Name"
            value={values.localeName}
            onChange={(e) => setField('localeName', e.target.value)}
            fullWidth
          />
          <Input
            label="Passcode"
            value={values.passcode}
            onChange={(e) => setField('passcode', e.target.value)}
            fullWidth
          />
        </div>
        <div className={styles.row}>
          <Input
            label="Quantity"
            type="number"
            min={0}
            value={values.qty.toString()}
            onChange={(e) => handleNumericField('qty', e.target.value)}
            error={errors['qty']}
            fullWidth
          />
          <Select
            label="Language"
            options={LANGUAGE_OPTIONS}
            value={values.language}
            onChange={(e) => setField('language', e.target.value)}
            fullWidth
          />
        </div>
        <div className={styles.row}>
          <Input
            label="Archetype"
            value={values.archetype}
            onChange={(e) => setField('archetype', e.target.value)}
            fullWidth
          />
          <Input
            label="Type Line"
            value={values.typeLine}
            onChange={(e) => setField('typeLine', e.target.value)}
            fullWidth
          />
        </div>
        <div className={styles.row}>
          <Select
            label="Frame Type"
            options={FRAME_OPTIONS}
            value={values.frameType}
            onChange={(e) => setField('frameType', e.target.value)}
            fullWidth
          />
          <Input
            label="Attribute"
            value={values.attribute}
            onChange={(e) => setField('attribute', e.target.value)}
            fullWidth
          />
        </div>
        <div className={styles.row3}>
          <Input
            label="Level / Rank / Link"
            type="number"
            value={values.levelRankLink?.toString() ?? ''}
            onChange={(e) => handleNumericField('levelRankLink', e.target.value)}
            fullWidth
          />
          <Input
            label="ATK"
            type="number"
            value={values.atk?.toString() ?? ''}
            onChange={(e) => handleNumericField('atk', e.target.value)}
            fullWidth
          />
          <Input
            label="DEF"
            type="number"
            value={values.def?.toString() ?? ''}
            onChange={(e) => handleNumericField('def', e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Set / Version */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Set / Version</h3>
        <div className={styles.row}>
          <Input
            label="Set Code"
            value={values.setCode}
            onChange={(e) => setField('setCode', e.target.value)}
            fullWidth
          />
          <Input
            label="Set Name"
            value={values.setName}
            onChange={(e) => setField('setName', e.target.value)}
            fullWidth
          />
        </div>
        <div className={styles.row3}>
          <Select
            label="Rarity"
            options={RARITY_OPTIONS}
            value={values.rarity}
            onChange={(e) => setField('rarity', e.target.value)}
            fullWidth
          />
          <Select
            label="Condition"
            options={CONDITION_OPTIONS}
            value={values.condition}
            onChange={(e) => setField('condition', e.target.value)}
            fullWidth
          />
          <Select
            label="Edition"
            options={EDITION_OPTIONS}
            value={values.edition}
            onChange={(e) => setField('edition', e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Value */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Value</h3>
        <div className={styles.row3}>
          <Input
            label="Market Price"
            type="number"
            step="0.01"
            min={0}
            value={values.marketPrice?.toString() ?? ''}
            onChange={(e) => handlePriceField('marketPrice', e.target.value)}
            fullWidth
          />
          <Input
            label="Purchase Price"
            type="number"
            step="0.01"
            min={0}
            value={values.purchasePrice?.toString() ?? ''}
            onChange={(e) => handlePriceField('purchasePrice', e.target.value)}
            fullWidth
          />
          <Input
            label="Target Price"
            type="number"
            step="0.01"
            min={0}
            value={values.targetPrice?.toString() ?? ''}
            onChange={(e) => handlePriceField('targetPrice', e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Notes & Tags */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Notes & Tags</h3>
        <Textarea
          label="Notes"
          value={values.notes}
          onChange={(e) => setField('notes', e.target.value)}
          rows={4}
          hint={`${values.notes.length}/2000`}
        />
        <div className={styles.tagsArea}>
          <span className={styles.tagsLabel}>Tags</span>
          {values.tags.length > 0 && (
            <div className={styles.tagsList}>
              {values.tags.map((tag) => (
                <Chip key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
              ))}
            </div>
          )}
          <div className={styles.addTagRow}>
            <Input
              className={styles.addTagInput}
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              fullWidth
            />
            <Button variant="secondary" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
