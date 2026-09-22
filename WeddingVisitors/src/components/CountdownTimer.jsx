import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate = '2025-03-15T10:00:00' }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section className="bg-gradient-to-r from-[#4A151D] via-[#5C2C16] to-[#4A151D] py-12 px-4 text-white shadow-inner">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#F3E5AB] mb-4">
          Counting Down To Forever
        </p>

        <div className="grid grid-cols-4 gap-2 sm:gap-6 max-w-xl mx-auto">
          {timeBlocks.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-[#D4AF37]/30 shadow-lg flex flex-col items-center"
            >
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-[#F3E5AB]">
                {String(item.value || 0).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/80 mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}