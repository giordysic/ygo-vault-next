import { formatPrice } from '@/core/utils/formatters';
import styles from './CardPricingBlock.module.css';

interface CardPricingBlockProps {
  marketPrice: number | null | undefined;
  purchasePrice: number | null | undefined;
  targetPrice: number | null | undefined;
}

export function CardPricingBlock({
  marketPrice,
  purchasePrice,
  targetPrice,
}: CardPricingBlockProps) {
  return (
    <div className={styles.block}>
      <h3 className={styles.blockTitle}>Pricing</h3>
      <div className={styles.tiles}>
        <PriceTile label="Market" value={marketPrice} highlight />
        <PriceTile label="Purchase" value={purchasePrice} />
        <PriceTile label="Target" value={targetPrice} />
      </div>
    </div>
  );
}

function PriceTile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | null | undefined;
  highlight?: boolean;
}) {
  const hasValue = value != null;
  const valueClasses = [
    styles.tileValue,
    highlight && hasValue ? styles.tileValueMarket : '',
    !hasValue ? styles.tileValueEmpty : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={valueClasses}>
        {hasValue ? formatPrice(value) : '--'}
      </span>
    </div>
  );
}
