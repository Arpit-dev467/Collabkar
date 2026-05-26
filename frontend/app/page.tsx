import { MarketingFooter } from './_components/MarketingFooter';
import { HomeLanding } from './_components/HomeLanding';
import { MarketingNav } from './_components/MarketingNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <HomeLanding />

      <MarketingFooter />
    </div>
  );
}
