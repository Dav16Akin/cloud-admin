export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: 'ADMIN' | 'USER';
  companyName?: string;
  houseNumber?: string;
  state?: string;
  address?: string;
  country?: string;
  city?: string;
  postcode?: string;
  verified?: boolean;
  whmcsClientId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  planId: string | null;
  amount: number;
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED' | 'PAID';
  whmcsInvoiceId?: number | null;
  paystackRef?: string;
  paystackData?: unknown;
  createdAt: string;
  updatedAt: string;
  user?: User;
  plan?: Plan;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Domain {
  id: string;
  name: string;
  userId: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hosting {
  id: string;
  userId: string;
  planId: string;
  domain?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface WhmcsSyncGaps {
  users: User[];
  orders: Order[];
}

export type OrderStatus = Order['status'];

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
}

export interface UserActivityDetail {
  user: User & {
    orders: Array<{
      id: string;
      amount: number;
      status: string;
      createdAt: string;
      items: Array<{ type: string; domainName: string | null; price: number }>;
    }>;
    domains: Array<{
      id: string;
      name: string;
      status: string;
      expiresAt: string | null;
      nameservers: string[];
    }>;
    hostingAccounts: Array<{
      id: string;
      domain: string;
      status: string;
      expiresAt: string;
      plan: { name: string };
    }>;
  };
  activity: {
    logs: AuditLog[];
    total: number;
    page: number;
    pages: number;
  };
}

