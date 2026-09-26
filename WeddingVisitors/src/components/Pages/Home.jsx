import Hero from '../Hero';
import CountdownTimer from '../CountdownTimer';
import WeddingDetails from '../WeddingDetails';

export default function Home() {
  return (
    <div>
      <Hero />
      <CountdownTimer targetDate="2026-10-31T10:00:00" />
      <WeddingDetails />
    </div>
  );
}