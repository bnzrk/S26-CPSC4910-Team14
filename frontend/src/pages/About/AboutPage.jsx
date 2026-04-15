import { useAboutData } from './hooks/useAboutData';
import HeroSection from './components/HeroSection';
import RolesSection from './components/RolesSection';
import FeatureCards from './components/FeatureCards';
import SponsorSection from './components/SponsorSection';
import DriverSection from './components/DriverSection';
import MetricsBar from './components/MetricsBar';
import Testimonials from './components/Testimonials';
import CtaSection from './components/CtaSection';
import AboutFooter from './components/AboutFooter';
import SkeletonLoader from './components/SkeletonLoader';
import styles from './AboutPage.module.scss';

export default function AboutPage() {
  const { data, isLoading, isError, refetch } = useAboutData();

  if (isLoading) return <SkeletonLoader />;

  if (isError) {
    return (
      <div className={styles.error}>
        <p className={styles.errorMessage}>
          Something went wrong loading the page.
        </p>
        <button className={styles.retryButton} onClick={() => refetch()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <HeroSection
        productDescription={data.productDescription}
        versionNumber={data.versionNumber}
      />
      <RolesSection />
      <FeatureCards features={data.features} />
      <SponsorSection />
      <DriverSection />
      <MetricsBar />
      <div style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9' }}>
        <h2 style={{ marginBottom: '1rem' }}>Team Info</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Team {data.teamNumber}</div>
            <div style={{ color: '#666' }}>Team</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.versionNumber}</div>
            <div style={{ color: '#666' }}>Current Sprint</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {new Date(data.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ color: '#666' }}>Release Date</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.teamMembers?.length ?? 0}</div>
            <div style={{ color: '#666' }}>Team Members</div>
          </div>
        </div>
      </div>

      {data.teamMembers && data.teamMembers.length > 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Meet the Team</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {data.teamMembers.map((member, i) => (
              <div key={i} style={{ 
                padding: '1.25rem 1.5rem', 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {member.firstName} {member.lastName}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Testimonials />
      <CtaSection />
      <AboutFooter />
    </main>
  );
}