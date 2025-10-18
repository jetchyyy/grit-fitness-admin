

interface RevenueCardProps {
  icon: any;
  title: string;
  amount: number;
  subtitle: string;
  subtitleIcon: any;
}

export function RevenueCard({
  icon: Icon,
  title,
  amount,
  subtitle,
  subtitleIcon: SubIcon
}: RevenueCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-red-600/30">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-8 h-8 text-red-600" />
        <div>
          <div className="text-gray-400 text-sm">{title}</div>
          <div className="text-3xl font-bold text-white">
            ₱{amount.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <SubIcon className="w-4 h-4" />
        {subtitle}
      </div>
    </div>
  );
}
