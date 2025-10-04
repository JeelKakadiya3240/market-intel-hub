export interface CompaniesApiCompany {
  id: string;
  name: string;
  industries: string[];
  totalEmployees: number | null;
  revenue: string | null;
  businessType: string | null;
  monthlyVisitors: number | null;
  country: string | null;
  city: string | null;
  yearFounded: number | null;
  socialNetwork: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  technologies: string[];
  application: string | null;
  dataScore: number | null;
  lastSync: string | null;
  logo?: string;
  description?: string;
  website?: string;
  status?: string;
  verified?: boolean;
}

export interface CompaniesApiResponse {
  companies: CompaniesApiCompany[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  message?: string;
  success: boolean;
}

export interface CompaniesApiSearchRequest {
  prompt: string;
  page?: number;
  pageSize?: number;
  filters?: {
    country?: string;
    industry?: string;
    minEmployees?: number;
    maxEmployees?: number;
    minRevenue?: number;
    maxRevenue?: number;
    foundedAfter?: number;
    foundedBefore?: number;
  };
}