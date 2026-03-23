import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, format?: string) => void;
}

const FORMAT_OPTIONS = [
  { value: '', label: 'No Format' },
  { value: 'TCG', label: 'TCG' },
  { value: 'OCG', label: 'OCG' },
  { value: 'Master Duel', label: 'Master Duel' },
  { value: 'Speed Duel', label: 'Speed Duel' },
  { value: 'Edison', label: 'Edison' },
  { value: 'GOAT', label: 'GOAT' },
  { value: 'Other', label: 'Other' },
];

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Deck name is required');
      return;
    }
    if (trimmed.length > 200) {
      setError('Deck name must be under 200 characters');
      return;
    }
    onCreate(trimmed, description.trim() || undefined, format || undefined);
    setName('');
    setDescription('');
    setFormat('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setFormat('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Deck"
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create</Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Deck Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Blue-Eyes Turbo"
          error={error}
          fullWidth
          autoFocus
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Strategy notes, combos, etc."
          rows={3}
        />
        <Select
          label="Format"
          options={FORMAT_OPTIONS}
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        />
      </div>
    </Modal>
  );
};
