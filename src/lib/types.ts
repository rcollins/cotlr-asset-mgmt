export type UserRole = "cfo" | "team_manager" | "viewer";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
};

export type Site = {
  id: string;
  name: string;
  address?: string | null;
};

export type Location = {
  id: string;
  site_id: string;
  name: string;
  description?: string | null;
  site?: Site | null;
};

export type LocationFormData = {
  site_id: string;
  name: string;
  description?: string;
};

export type AssetCategory = {
  id: string;
  name: string;
  description?: string | null;
};

export type CategoryFormData = {
  name: string;
  description?: string;
};

export type SiteFormData = {
  name: string;
  address?: string;
};

export type UserFormData = {
  email: string;
  full_name?: string;
  role: UserRole;
};

export type UserUpdateData = {
  full_name?: string;
  role: UserRole;
};

export type LocationUpdateData = {
  site_id: string;
  name: string;
  description?: string;
};

export type AssetStatus = {
  id: string;
  name: string;
};

export type Asset = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  asset_category?: AssetCategory | null;
  serial_number: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  useful_life_date: string | null;
  disposal_date: string | null;
  book_value: number | null;
  book_value_override: boolean | null;
  depreciation_method: string | null;
  status: string;
  location_id: string | null;
  location?: Location | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetFormData = {
  name: string;
  description?: string;
  category: string;
  serial_number?: string;
  purchase_price?: number;
  purchase_date?: string;
  useful_life_date?: string;
  disposal_date?: string;
  book_value?: number;
  book_value_override?: boolean;
  depreciation_method?: string;
  status: string;
  location_id: string;
};

export type DashboardStats = {
  assets: number;
  pendingApprovals: number;
  requests: number;
};
