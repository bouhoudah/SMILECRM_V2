export interface Agency {
  id: string;
  name: string;
  address: string;
  siren: string;
  logo: string;
  squareLogo?: string;
  createdAt: string;
  createdBy: string;
  status: 'active' | 'inactive';
}

export interface UserForm {
  id?: string;
  email: string;
  name: string;
  role: 'superadmin' | 'manager' | 'employee';
  agencyId?: string;
  password?: string;
  avatar?: string;
}

export interface AgencyData {
  contacts: any[];
  partners: any[];
  contracts: any[];
  users: any[];
  settings: Agency;
}