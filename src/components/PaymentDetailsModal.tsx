import { X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Payment {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  referenceNumber: string;
  amount: number;
  paymentMethod: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  expiresAt?: any;
  emergencyContact?: {
    person: string;
    contactNumber: string;
    address: string;
  };
}

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  formatDate: (timestamp: any) => string;
}

export function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
  formatDate
}: PaymentDetailsModalProps) {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full border border-red-600/30 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-red-600/30">
          <h3 className="text-xl font-bold text-white">Payment Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-gray-400 text-sm mb-1">Full Name</div>
              <div className="text-white font-semibold">{payment.fullName}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Email</div>
              <div className="text-white">{payment.email}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Contact Number</div>
              <div className="text-white">{payment.contactNumber}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Payment Method</div>
              <div className="text-white uppercase">{payment.paymentMethod}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Reference Number</div>
              <div className="text-white font-mono">{payment.referenceNumber}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Amount</div>
              <div className="text-white font-bold">
                ₱{payment.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Plan</div>
              <div className="text-white">{payment.plan}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <StatusBadge status={payment.status} />
            </div>
          </div>

          {payment.emergencyContact && (
            <div className="border-t border-gray-800 pt-6">
              <h4 className="text-white font-semibold mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Contact Person</div>
                  <div className="text-white">{payment.emergencyContact.person}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Contact Number</div>
                  <div className="text-white">
                    {payment.emergencyContact.contactNumber}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-400 text-sm mb-1">Address</div>
                  <div className="text-white">{payment.emergencyContact.address}</div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-800 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Created At</div>
                <div className="text-white">{formatDate(payment.createdAt)}</div>
              </div>
              {payment.expiresAt && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Expires At</div>
                  <div className="text-white">{formatDate(payment.expiresAt)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}