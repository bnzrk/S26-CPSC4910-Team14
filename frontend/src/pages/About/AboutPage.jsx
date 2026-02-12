import { useQuery } from '@tanstack/react-query';
import { fetchAboutInfo } from '../../api/about';
import './AboutPage.scss';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AboutPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['about'],
    queryFn: fetchAboutInfo,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="about-loading">Loading...</div>;
  if (isError) return <div className="about-error">Error: {error.message}</div>;

  return (
    <div className="about">
      <section className="about-hero">
        <h1 className="about-hero__title">{data.productName}</h1>
        <p className="about-hero__subtitle">{data.productDescription}</p>
      </section>

      <section className="about-cards">
        <div className="about-card">
          <span className="about-card__label">Team</span>
          <span className="about-card__value">{data.team}</span>
        </div>
        <div className="about-card">
          <span className="about-card__label">Version</span>
          <span className="about-card__value">Sprint {data.version}</span>
        </div>
        <div className="about-card">
          <span className="about-card__label">Release Date</span>
          <span className="about-card__value">{formatDate(data.releaseDateUtc)}</span>
        </div>
      </section>

      <footer className="about-footer">
        <p>Team {data.team} &mdash; CPSC 4910/4911 Capstone</p>
      </footer>
    </div>
  );
}
