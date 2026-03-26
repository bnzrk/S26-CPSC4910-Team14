import { Outlet } from 'react-router-dom';
import SponsorLayout from '@/components/SponsorLayout/SponsorLayout';

export default function SponsorOrgLayout() {
  return (
    <SponsorLayout>
      <Outlet />
    </SponsorLayout>
  );
}
