interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-yellow-600/20 text-yellow-400',
    approved: 'bg-green-600/20 text-green-400',
    rejected: 'bg-red-600/20 text-red-400'
  };

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  return (
    <span className={`px-3 py-1 ${styles[status]} rounded-full text-xs font-semibold`}>
      {labels[status]}
    </span>
  );
}
