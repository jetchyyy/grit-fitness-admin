export interface Payment {
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