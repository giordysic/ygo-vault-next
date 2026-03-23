import styles from './CardInfoSection.module.css';

export interface InfoPair {
  label: string;
  value: string | number | null | undefined;
}

interface CardInfoSectionProps {
  title: string;
  pairs: InfoPair[];
}

export function CardInfoSection({ title, pairs }: CardInfoSectionProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.pairs}>
        {pairs.map((pair) => (
          <div key={pair.label} className={styles.pair}>
            <span className={styles.label}>{pair.label}</span>
            <span
              className={[
                styles.value,
                pair.value == null || pair.value === '' ? styles.valueEmpty : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {pair.value != null && pair.value !== '' ? pair.value : '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
