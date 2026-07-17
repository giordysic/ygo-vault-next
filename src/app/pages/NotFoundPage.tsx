import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
        style={{ width: 48, height: 48, opacity: 0.4, marginBottom: '1rem', color: 'var(--text-muted)' }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
        Page not found
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate('/collection')}
        style={{
          padding: '0.5rem 1.25rem',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--accent-primary, #3b82f6)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Go to Collection
      </button>
    </div>
  );
}
