    import { Eye, CheckCircle, XCircle } from 'lucide-react';
    import { StatusBadge } from './StatusBadge';

    interface Payment {
    id: string;
    fullName: string;
    email: string;
    plan: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
    expiresAt?: any;
    }

    interface PaymentRowProps {
    payment: Payment;
    onViewDetails: (payment: Payment) => void;
    onApprove: (id: string, plan: string) => void;
    onReject: (id: string, plan: string) => void;
    formatDate: (timestamp: any) => string;
    getDaysUntilExpiry: (timestamp: any) => number | null;
    }

    export function PaymentRow({
    payment,
    onViewDetails,
    onApprove,
    onReject,
    formatDate,
    getDaysUntilExpiry
    }: PaymentRowProps) {
    const daysLeft = getDaysUntilExpiry(payment.expiresAt);

    return (
        <tr className="hover:bg-gray-800/50 transition">
        <td className="px-6 py-4">
            <div>
            <div className="text-white font-semibold">{payment.fullName}</div>
            <div className="text-gray-400 text-sm">{payment.email}</div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className="text-white">{payment.plan}</span>
        </td>
        <td className="px-6 py-4">
            <span className="text-white font-semibold">
            ₱{payment.amount.toLocaleString()}
            </span>
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={payment.status} />
        </td>
        <td className="px-6 py-4 text-gray-400 text-sm">
            {formatDate(payment.createdAt)}
        </td>
        <td className="px-6 py-4">
            {payment.expiresAt ? (
            <div>
                <div className="text-white text-sm">
                {formatDate(payment.expiresAt)}
                </div>
                {daysLeft !== null && (
                <div className={`text-xs ${
                    daysLeft < 0 ? 'text-red-400' : 
                    daysLeft <= 7 ? 'text-yellow-400' : 
                    'text-gray-400'
                }`}>
                    {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                </div>
                )}
            </div>
            ) : (
            <span className="text-gray-500 text-sm">N/A</span>
            )}
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
            <button
                onClick={() => onViewDetails(payment)}
                className="p-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition"
                title="View Details"
            >
                <Eye className="w-4 h-4" />
            </button>
            {payment.status === 'pending' && (
                <>
                <button
                    onClick={() => onApprove(payment.id, payment.plan)}
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    title="Approve"
                >
                    <CheckCircle className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onReject(payment.id, payment.plan)}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    title="Reject"
                >
                    <XCircle className="w-4 h-4" />
                </button>
                </>
            )}
            </div>
        </td>
        </tr>
    );
    }
