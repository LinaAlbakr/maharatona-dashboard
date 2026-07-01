export type Banner = {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  description: string;
  image_cover: null | string;
  created_at: string;
  duration: number;
  price: number;
  center_num: number;
  advertisementType: string;
  advertisement_status: string;
  order: number;
};
export type IBanner = {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  image_cover: string;
  created_at: string;
  duration: number;
  price: string;
  center_num: number;
  advertisementType: string;
};

export type IBannerCenter = {
  subscription_date: Date;
  created_by: any;
  id: string;
  is_active: boolean;
  path_ar: string;
  path_en: string;
  /** @deprecated Use path_ar / path_en */
  path: string;
  mediaTypeAr: string;
  mediaTypeEn: string;
  /** @deprecated Use mediaTypeAr / mediaTypeEn */
  mediaType: string;
  advertisementCenterType: string;
  expires_at: string;
  created_at: string | null;
  center: {
    id: string;
    name: string;
    website: string;
    phone: string;
  };
  course: {
    id: string;
    name: string;
  } | null;
};

export type Field = {
  name_ar: string;
  id: string;
  name: string;
  name_en?: string;
  avatar: string;
  color: string;
};
