import { useState, useEffect } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Mail, Phone, Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Payment } from '../types/Payment';

const ITEMS_PER_PAGE = 10;

export function MembersPage() {
  const [members, setMembers] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);
      
      const membersData = snapshot.docs
        .map(doc => {
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
            durationDays: data.durationDays || 30,
            emergencyContact: data.emergencyContact
          } as Payment;
        })
        .filter(payment => payment.status === 'approved');

      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
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
      day: 'numeric'
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

  const getExpiryStatus = (days: number | null) => {
    if (days === null) return { color: 'text-gray-400', bg: 'bg-gray-900', label: 'N/A' };
    if (days < 0) return { color: 'text-red-400', bg: 'bg-red-900/20', label: 'Expired' };
    if (days <= 7) return { color: 'text-red-400', bg: 'bg-red-900/20', label: 'Expiring Soon' };
    if (days <= 30) return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', label: 'Renewal Soon' };
    return { color: 'text-green-400', bg: 'bg-green-900/20', label: 'Active' };
  };

  const filteredMembers = members.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.contactNumber.includes(searchTerm)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Handle page changes
  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Members Management</h2>
        <p className="text-gray-400">
          Total Active Members: <span className="text-red-600 font-bold">{filteredMembers.length}</span>
          {searchTerm && ` (${currentMembers.length} shown)`}
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full bg-gray-900 text-white px-4 py-3 rounded border border-red-600/30 focus:outline-none focus:border-red-600"
        />
      </div>

      {currentMembers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentMembers.map(member => {
              const daysLeft = getDaysUntilExpiry(member.expiresAt);
              const expiryStatus = getExpiryStatus(daysLeft);

              return (
                <div
                  key={member.id}
                  className="bg-gray-900 rounded-lg border border-red-600/30 p-5 hover:border-red-600/60 hover:shadow-lg hover:shadow-red-600/20 transition flex flex-col"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white truncate">{member.fullName}</h3>
                    <p className="text-gray-400 text-xs mt-1">{member.referenceNumber}</p>
                  </div>

                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-gray-400 text-xs">Email</p>
                        <p className="text-white text-sm truncate">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-xs">Phone</p>
                        <p className="text-white text-sm">{member.contactNumber}</p>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-400 text-xs">Plan</p>
                          <p className="text-white font-semibold text-sm">{member.plan}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Amount</p>
                          <p className="text-red-600 font-bold text-sm">₱{member.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-400">Since {formatDate(member.createdAt)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-4 space-y-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Expires</p>
                      <p className="text-white text-sm font-medium">{formatDate(member.expiresAt)}</p>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full ${expiryStatus.bg} w-full justify-center`}>
                      {daysLeft !== null && daysLeft <= 7 && (
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className={`font-semibold text-xs ${expiryStatus.color}`}>
                        {daysLeft !== null && daysLeft >= 0
                          ? `${daysLeft} days left`
                          : expiryStatus.label}
                      </span>
                    </div>

                    {member.emergencyContact && (
                      <div className="bg-gray-800/30 rounded p-2.5 text-xs">
                        <p className="text-gray-400 font-semibold mb-1">Emergency: {member.emergencyContact.person}</p>
                        <p className="text-white">{member.emergencyContact.contactNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-gray-900 rounded-lg border border-red-600/30 p-4">
              <div className="text-gray-400 text-sm">
                Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
                {' '}• Showing <span className="font-bold text-white">{currentMembers.length}</span> of <span className="font-bold text-white">{filteredMembers.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded border border-red-600/30 text-gray-400 hover:text-white hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded border transition ${
                        page === currentPage
                          ? 'bg-red-600 border-red-600 text-white font-bold'
                          : 'border-red-600/30 text-gray-400 hover:text-white hover:border-red-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border border-red-600/30 text-gray-400 hover:text-white hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-900 rounded-lg p-12 border border-red-600/30 text-center text-gray-400">
          <p className="text-lg">No members found</p>
          <p className="text-sm mt-2">
            {searchTerm ? 'Try adjusting your search' : 'Active members will appear here'}
          </p>
        </div>
      )}
    </div>
  );
}