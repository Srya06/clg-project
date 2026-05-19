import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-cyan-500/30 hover:bg-white/10 ${className}`}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <h3 className="mb-4 text-lg font-semibold text-white/90">{title}</h3>
      <div className="relative z-10 text-white/70">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
