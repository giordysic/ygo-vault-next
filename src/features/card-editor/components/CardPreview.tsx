import type { CardFormValues } from '@/features/card-editor/hooks/useCardForm';
import { formatPrice, formatQty } from '@/core/utils/formatters';
import { Badge } from '@/shared/components/ui/Badge';
import styles from './CardPreview.module.css';

interface CardPreviewProps {
  values: CardFormValues;
}

export function CardPreview({ values }: CardPreviewProps) {
  const hasSetInfo = values.setCode || values.setName;
  const hasStats = values.atk != null || values.def != null || values.levelRankLink != null;
  const hasPrice = values.marketPrice != null || values.purchasePrice != null;

  return (
    <div className={styles.preview}>
      <span className={styles.previewTitle}>Preview</span>

      <div className={styles.imageArea}>
        <span className={styles.imagePlaceholder}>
          {values.name || 'Card Name'}
        </span>
      </div>

      <div
        className={[
          styles.cardTitle,
          !values.name ? styles.cardTitleEmpty : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {values.name || 'Untitled Card'}
      </div>

      {hasSetInfo && (
        <div className={styles.setInfo}>
          {values.setCode}{values.setCode && values.setName ? ' - ' : ''}{values.setName}
        </div>
      )}

      <div className={styles.meta}>
        {values.rarity && (
          <span className={styles.rarityBadge}>{values.rarity}</span>
        )}
        <Badge size="sm">{formatQty(values.qty)}</Badge>
        {values.condition && (
          <Badge variant="info" size="sm">{values.condition}</Badge>
        )}
        {values.edition && (
          <Badge variant="accent" size="sm">{values.edition}</Badge>
        )}
      </div>

      {hasStats && (
        <div className={styles.statRow}>
          {values.levelRankLink != null && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>LV </span>
              <span className={styles.statValue}>{values.levelRankLink}</span>
            </span>
          )}
          {values.atk != null && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>ATK </span>
              <span className={styles.statValue}>{values.atk}</span>
            </span>
          )}
          {values.def != null && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>DEF </span>
              <span className={styles.statValue}>{values.def}</span>
            </span>
          )}
        </div>
      )}

      {hasPrice && (
        <div className={styles.priceRow}>
          {values.marketPrice != null && (
            <span className={styles.price}>
              {formatPrice(values.marketPrice)}
            </span>
          )}
          {values.purchasePrice != null && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>Paid: </span>
              <span className={styles.statValue}>{formatPrice(values.purchasePrice)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
