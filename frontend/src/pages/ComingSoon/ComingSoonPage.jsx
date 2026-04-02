import CardHost from '@/components/CardHost/CardHost';

export default function ComingSoonPage({ title }) {
  return (
    <CardHost title={title} subtitle="This feature is not yet available.">
      <p style={{ color: 'var(--color-text-muted)', padding: '1rem 0' }}>
        Functionality coming soon.
      </p>
    </CardHost>
  );
}
