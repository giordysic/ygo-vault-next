import React from 'react';
import type { Deck } from '@/core/schemas/deck.schemas';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { timeAgo } from '@/core/utils/dates';
import styles from './DeckCard.module.css';

interface DeckCardProps {
  deck: Deck;
  onClick: () => void;
  onFavorite?: () => void;
}

function getDeckStats(deck: Deck) {
  const main = deck.cards.filter((c) => c.zone === 'main').reduce((sum, c) => sum + c.qty, 0);
  const extra = deck.cards.filter((c) => c.zone === 'extra').reduce((sum, c) => sum + c.qty, 0);
  const side = deck.cards.filter((c) => c.zone === 'side').reduce((sum, c) => sum + c.qty, 0);
  return { main, extra, side, total: main + extra + side };
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onClick, onFavorite }) => {
  const stats = getDeckStats(deck);

  return (
    <Card variant="interactive" onClick={onClick} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{deck.name}</h3>
        {onFavorite && (
          <button
            type="button"
            className={[styles.favButton, deck.isFavorite ? styles.favorited : ''].filter(Boolean).join(' ')}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            aria-label={deck.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg viewBox="0 0 24 24" fill={deck.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}
      </div>
      {deck.description && (
        <p className={styles.description}>{deck.description}</p>
      )}
      <div className={styles.stats}>
        <Badge variant="default" size="sm">Main: {stats.main}</Badge>
        <Badge variant="info" size="sm">Extra: {stats.extra}</Badge>
        <Badge variant="accent" size="sm">Side: {stats.side}</Badge>
      </div>
      <div className={styles.footer}>
        {deck.format && <Badge variant="success" size="sm">{deck.format}</Badge>}
        <span className={styles.date}>{timeAgo(deck.updatedAt)}</span>
      </div>
    </Card>
  );
};
