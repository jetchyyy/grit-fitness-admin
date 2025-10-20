import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SearchFilters } from '../components/SearchFilters';

import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { ExpiryManagementModal } from '../components/ExpiryManagementModal';
import type { Payment } from '../types/Payment';

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expiryModalData, setExpiryModalData] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);
      
      const paymentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.fullName || '',
          email: data.email || '',
          contactNumber: data.contactNumber || '',
          referenceNumber: data.referenceNumber || '',
          amount: data.amount || 0,
          paymentMethod: data.paymentMethod || '',
          plan: data.plan || '',
          status: data.status || 'pending',
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          emergencyContact: data.emergencyContact
        } as Payment;
      });

      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiry = (timestamp: any) => {
    if (!timestamp) return null;
    
    let expiry: Date;
    if (timestamp instanceof Timestamp) {
      expiry = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      expiry = timestamp;
    } else if (timestamp.seconds) {
      expiry = new Date(timestamp.seconds * 1000);
    } else {
      expiry = new Date(timestamp);
    }
    
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleApprove = async (id: string) => {
    try {
      const paymentRef = doc(db, 'payments', id);
      await updateDoc(paymentRef, { status: 'approved' });
      setPayments(payments.map(p => 
        p.id === id ? { ...p, status: 'approved' as const } : p
      ));
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const paymentRef = doc(db, 'payments', id);
      await updateDoc(paymentRef, { status: 'rejected' });
      setPayments(payments.map(p => 
        p.id === id ? { ...p, status: 'rejected' as const } : p
      ));
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment.');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Full Name', 'Email', 'Contact', 'Reference', 'Amount', 'Plan', 'Status', 'Created At', 'Expires At'],
      ...filteredPayments.map(p => [
        p.fullName,
        p.email,
        p.contactNumber,
        p.referenceNumber,
        p.amount,
        p.plan,
        p.status,
        formatDate(p.createdAt),
        formatDate(p.expiresAt)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onExport={handleExport}
      />

      <div className="bg-gray-900 rounded-lg border border-red-600/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-red-600/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Expires</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPayments.length > 0 ? (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{payment.fullName}</div>
                      <div className="text-xs text-gray-400">{payment.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{payment.plan}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">₱{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'approved'
                          ? 'bg-green-600/10 text-green-400 border border-green-600/30'
                          : payment.status === 'pending'
                          ? 'bg-yellow-600/10 text-yellow-400 border border-yellow-600/30'
                          : 'bg-red-600/10 text-red-400 border border-red-600/30'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(payment.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      {getDaysUntilExpiry(payment.expiresAt) !== null ? (
                        <div>
                          <div className="text-white font-semibold">{formatDate(payment.expiresAt)}</div>
                          <div className={`text-xs ${
                            getDaysUntilExpiry(payment.expiresAt)! > 30
                              ? 'text-green-400'
                              : getDaysUntilExpiry(payment.expiresAt)! > 7
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}>
                            {getDaysUntilExpiry(payment.expiresAt)! > 0 
                              ? `${getDaysUntilExpiry(payment.expiresAt)} days left` 
                              : 'Expired'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-400 font-semibold"
                      >
                        View
                      </button>
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment.id)}
                            className="text-green-600 hover:text-green-400 font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            className="text-red-600 hover:text-red-400 font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {payment.status === 'approved' && (
                        <button
                          onClick={() => {
                            let expiryDate = null;
                            if (payment.expiresAt) {
                              if (payment.expiresAt instanceof Timestamp) {
                                expiryDate = payment.expiresAt.toDate();
                              } else if (payment.expiresAt instanceof Date) {
                                expiryDate = payment.expiresAt;
                              } else if (payment.expiresAt.seconds) {
                                expiryDate = new Date(payment.expiresAt.seconds * 1000);
                              }
                            }
                            setExpiryModalData({
                              paymentId: payment.id,
                              currentExpiryDate: expiryDate,
                              memberName: payment.fullName
                            });
                          }}
                          className="text-purple-600 hover:text-purple-400 font-semibold"
                        >
                          Edit Expiry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formatDate={formatDate}
      />

      <ExpiryManagementModal
        isOpen={!!expiryModalData}
        onClose={() => setExpiryModalData(null)}
        paymentId={expiryModalData?.paymentId || ''}
        currentExpiryDate={expiryModalData?.currentExpiryDate || null}
        memberName={expiryModalData?.memberName || ''}
        onSuccess={fetchPayments}
      />
    </div>
  );
}