export type StaticPage = {
  id: string;
  static_page_type: string;
  content_ar: string;
  content_en: string;
  image: string;
  created_at: string;
  updated_at: string;
};

export interface StaticPageReqBody {
  static_page_type: string;
  content_ar: string;
  content_en: string;
  image?: string | File;
}

export type ContractVersionStatus = 'LATEST' | 'ARCHIVED';

export type ContractVersion = {
  _id: string;
  version: number;
  label: string;
  status: ContractVersionStatus;
  content_ar: string;
  content_en: string;
  published_at: string;
  accepted_centers: number;
  total_centers: number;
};

export type ContractOverview = {
  static_page_type: string;
  total_centers: number;
  current: ContractVersion | null;
  history: ContractVersion[];
};

export type AcceptedCenter = {
  center_id: string;
  center_name: string;
  accepted_at: string;
};

export type AcceptedCentersResponse = {
  version: number;
  label: string;
  accepted_centers: number;
  total_centers: number;
  centers: AcceptedCenter[];
};
