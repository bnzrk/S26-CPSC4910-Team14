import { useAboutData } from './hooks/useAboutData';
import HeroSection from './components/HeroSection';
import MetricsBar from './components/MetricsBar';
import FeatureCards from './components/FeatureCards';
import HowItWorks from './components/HowItWorks';
import TechStack from './components/TechStack';
import TeamSection from './components/TeamSection';
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
        productName={data.productName}
        productDescription={data.productDescription}
        versionNumber={data.versionNumber}
      />
      <MetricsBar
        teamNumber={data.teamNumber}
        versionNumber={data.versionNumber}
        releaseDate={data.releaseDate}
        memberCount={data.teamMembers.length}
      />
      <FeatureCards features={data.features} />
      <HowItWorks />
      <TechStack techStack={data.techStack} />
      <TeamSection teamMembers={data.teamMembers} />
      <AboutFooter />
    </main>
  );
}
