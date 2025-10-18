import { useState, useEffect } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Users, Clock, CheckCircle, XCircle, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { RevenueCard } from '../components/RevenueCard';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function AnalyticsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);
      setPayments(snapshot.docs.map(doc => doc.data()));
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = payments.filter(p => p.status === 'approved').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const approvedPayments = payments.filter(p => p.status === 'approved').length;
  const rejectedPayments = payments.filter(p => p.status === 'rejected').length;
  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingRevenue = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Status distribution data for pie chart
  const statusData = [
    { name: 'Approved', value: approvedPayments, fill: '#16a34a' },
    { name: 'Pending', value: pendingPayments, fill: '#eab308' },
    { name: 'Rejected', value: rejectedPayments, fill: '#dc2626' }
  ];

  // Plan distribution data for bar chart
  const planDistribution = payments.reduce((acc: any, payment) => {
    const existing = acc.find((p: any) => p.name === payment.plan);
    if (existing) {
      existing.count += 1;
      existing.revenue += payment.amount || 0;
    } else {
      acc.push({
        name: payment.plan || 'Unknown',
        count: 1,
        revenue: payment.amount || 0
      });
    }
    return acc;
  }, []);

  // Revenue trend data by status
  const revenueByStatus = [
    { name: 'Approved', value: totalRevenue, fill: '#16a34a' },
    { name: 'Pending', value: pendingRevenue, fill: '#eab308' }
  ];

  // Timeline data - group payments by date
  const timelineData = payments.reduce((acc: any, payment) => {
    let date: Date;
    if (payment.createdAt instanceof Timestamp) {
      date = payment.createdAt.toDate();
    } else if (payment.createdAt?.seconds) {
      date = new Date(payment.createdAt.seconds * 1000);
    } else {
      date = new Date(payment.createdAt);
    }

    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const existing = acc.find((d: any) => d.date === dateStr);
    if (existing) {
      existing.payments += 1;
      if (payment.status === 'approved') existing.approved += 1;
    } else {
      acc.push({
        date: dateStr,
        payments: 1,
        approved: payment.status === 'approved' ? 1 : 0
      });
    }
    return acc;
  }, []);

  if (loading) {
    return <div className="text-white p-8">Loading analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-white mb-8">Analytics Overview</h2>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          icon={Users}
          value={totalMembers}
          label="Active Members"
          iconColor="text-red-600"
          borderColor="border-red-600/30"
        />
        <AnalyticsCard
          icon={Clock}
          value={pendingPayments}
          label="Pending Payments"
          iconColor="text-yellow-600"
          borderColor="border-yellow-600/30"
        />
        <AnalyticsCard
          icon={CheckCircle}
          value={approvedPayments}
          label="Approved"
          iconColor="text-green-600"
          borderColor="border-green-600/30"
        />
        <AnalyticsCard
          icon={XCircle}
          value={rejectedPayments}
          label="Rejected"
          iconColor="text-red-600"
          borderColor="border-red-600/30"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <RevenueCard
          icon={DollarSign}
          title="Total Revenue"
          amount={totalRevenue}
          subtitle="From approved payments"
          subtitleIcon={TrendingUp}
        />
        <RevenueCard
          icon={Calendar}
          title="Pending Revenue"
          amount={pendingRevenue}
          subtitle="Awaiting approval"
          subtitleIcon={Clock}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-gray-900 rounded-lg border border-red-600/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Payment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Status Bar Chart */}
        <div className="bg-gray-900 rounded-lg border border-red-600/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Revenue by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
                formatter={(value) => `₱${Number(value).toLocaleString()}`}
              />
              <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution Chart */}
      <div className="bg-gray-900 rounded-lg border border-red-600/30 p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Members by Plan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={planDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
              formatter={(value) => Number(value).toLocaleString()}
            />
            <Legend />
            <Bar dataKey="count" fill="#dc2626" name="Members" radius={[8, 8, 0, 0]} />
            <Bar dataKey="revenue" fill="#f59e0b" name="Revenue (₱)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Timeline Chart */}
      {timelineData.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-red-600/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Payment Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="payments"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Payments"
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: '#16a34a', r: 4 }}
                activeDot={{ r: 6 }}
                name="Approved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}