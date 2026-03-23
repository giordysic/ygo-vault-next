import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

function DeckDetailPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        minHeight: '400px',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.5 }}
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M12 12h.01" />
      </svg>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Deck Detail
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 320 }}>
        Deck detail view is coming soon.
      </p>
      <Button variant="secondary" size="sm" onClick={() => navigate('/decks')}>
        Back to Decks
      </Button>
    </div>
  );
}

export default DeckDetailPage;
