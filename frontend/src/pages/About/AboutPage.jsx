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
      <Testimonials />
      <CtaSection />
      <AboutFooter />
    </main>
  );
}
