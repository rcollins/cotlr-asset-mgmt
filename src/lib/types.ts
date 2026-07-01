export type UserRole = "admin" | "cfo" | "manager" | "viewer";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
};

export type Asset = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  serial_number: string | null;
  purchase_value: number | null;
  status: string;
  location: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetFormData = {
  name: string;
  description?: string;
  category?: string;
  serial_number?: string;
  purchase_value?: number;
  status: string;
  location?: string;
};

export type DashboardStats = {
  assets: number;
  pendingApprovals: number;
  requests: number;
};
