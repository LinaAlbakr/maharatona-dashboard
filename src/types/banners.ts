export type Banner = {
  id: string;
  name: string;
  description: string;
  image_cover: null | string;
  created_at: string;
  duration: number;
  price: string;
  center_num: number;
  advertisementType: string;
};
export type IBanner = {
  id: string;
  name: string;
  description: string;
  image_cover: string;
  created_at: string;
  duration: number;
  price: string;
  center_num: number;
  advertisementType: string;
};

export type IBannerCenter = {
  id: string;
  path: string;
  mediaType: string;
  advertisementCenterType: string;
  expires_at: string;
  created_at: string | null;
  center: {
    id: string;
    name: string;
    website: string;
    phone: string
  };
  course: {
    id: string
    name: string
  } | null
};
