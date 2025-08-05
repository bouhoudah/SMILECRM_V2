export interface Document {
  id: string;
  type: 'identity' | 'driving_license' | 'kbis' | 'experience' | 'commercial_stamp' | 'claims_history' | 'quote' | 'contract' | 'other';
  name: string;
  url: string;
  dateUpload: string;
  status: 'pending' | 'validated' | 'rejected';
  metadata?: {
    side?: 'front' | 'back';
    expirationDate?: string;
    documentNumber?: string;
    [key: string]: any;
  };
}