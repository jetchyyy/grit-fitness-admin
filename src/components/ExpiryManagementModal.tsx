import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ExpiryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  currentExpiryDate: Date | null;
  memberName: string;
  onSuccess?: () => void;
}

export function ExpiryManagementModal({
  isOpen,
  onClose,
  paymentId,
  currentExpiryDate,
  memberName,
  onSuccess
}: ExpiryManagementModalProps) {
  const [expiryDate, setExpiryDate] = useState<string>(
    currentExpiryDate ? currentExpiryDate.toISOString().split('T')[0] : ''
  );
  const [durationDays, setDurationDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'date' | 'duration'>('date');

  const handleSetByDate = async () => {
    if (!expiryDate) {
      setError('Please select an expiry date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedDate = new Date(expiryDate);
      
      // Validate date is in the future
      if (selectedDate < new Date()) {
        setError('Expiry date must be in the future');
        setLoading(false);
        return;
      }

      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        expiresAt: Timestamp.fromDate(selectedDate)
      });

      setError('');
      onSuccess?.();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError('Failed to update expiry date. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetByDuration = async () => {
    if (!durationDays || durationDays <= 0) {
      setError('Duration must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        expiresAt: Timestamp.fromDate(futureDate),
        durationDays
      });

      setError('');
      onSuccess?.();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError('Failed to update expiry date. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDays = (days: number) => {
    setDurationDays(durationDays + days);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full border border-red-600/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-red-600/30">
          <div>
            <h2 className="text-xl font-bold text-white">Set Expiry Date</h2>
            <p className="text-gray-400 text-sm mt-1">{memberName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('date')}
            className={`flex-1 py-3 px-4 font-semibold transition ${
              activeTab === 'date'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Set Specific Date
          </button>
          <button
            onClick={() => setActiveTab('duration')}
            className={`flex-1 py-3 px-4 font-semibold transition ${
              activeTab === 'duration'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Set Duration
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'date' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:outline-none focus:border-red-600 transition"
                />
              </div>

              {expiryDate && (
                <div className="bg-gray-800 p-3 rounded text-sm">
                  <p className="text-gray-400">Expiry:</p>
                  <p className="text-white font-semibold">
                    {new Date(expiryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-600/10 border border-red-600/50 p-3 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSetByDate}
                disabled={loading || !expiryDate}
                className={`w-full py-3 rounded font-bold transition ${
                  loading || !expiryDate
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading ? 'Updating...' : 'Update Expiry Date'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Duration (Days): <span className="text-red-600">{durationDays}</span>
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:outline-none focus:border-red-600 transition"
                />
              </div>

              {/* Quick Add Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[7, 30, 90].map(days => (
                  <button
                    key={days}
                    onClick={() => handleAddDays(days)}
                    className="bg-gray-800 hover:bg-gray-700 text-white rounded py-2 px-3 text-sm font-semibold transition border border-gray-700"
                  >
                    +{days}d
                  </button>
                ))}
              </div>

              {/* Quick Set Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDurationDays(30)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded py-2 px-3 text-xs font-semibold transition border border-gray-700"
                >
                  1 Month
                </button>
                <button
                  onClick={() => setDurationDays(90)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded py-2 px-3 text-xs font-semibold transition border border-gray-700"
                >
                  3 Months
                </button>
                <button
                  onClick={() => setDurationDays(180)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded py-2 px-3 text-xs font-semibold transition border border-gray-700"
                >
                  6 Months
                </button>
                <button
                  onClick={() => setDurationDays(365)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded py-2 px-3 text-xs font-semibold transition border border-gray-700"
                >
                  1 Year
                </button>
              </div>

              {durationDays > 0 && (
                <div className="bg-gray-800 p-3 rounded text-sm">
                  <p className="text-gray-400">Will expire on:</p>
                  <p className="text-white font-semibold">
                    {new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-600/10 border border-red-600/50 p-3 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSetByDuration}
                disabled={loading || durationDays <= 0}
                className={`w-full py-3 rounded font-bold transition ${
                  loading || durationDays <= 0
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading ? 'Updating...' : 'Update Expiry Date'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}