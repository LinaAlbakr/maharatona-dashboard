import Cookie from 'js-cookie';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

import { ACCESS_TOKEN } from '../auth/constants';

export interface Params {
  page: number;
  limit: number;
  status?: string;
  filters?: string;
  created_at?: string;
  headers?: { access_token: string };
}
const axiosInstance: AxiosInstance = axios.create({
  baseURL: HOST_API,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': Cookie.get('Language') ? Cookie.get('Language') : 'en',
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    Authorization: `Bearer ${Cookie.get(ACCESS_TOKEN)}`,
  },
});
axios.interceptors.request.use(
  (config) => {
    config.headers['Accept-Language'] = Cookie.get('Language');
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

export const baseUrl = HOST_API;

export const fetcher = async ({ url, config }: { url: string; config?: AxiosRequestConfig }) => {
  // Use axiosInstance directly instead of creating a new instance
  const response = await axiosInstance.get(url, {
    ...config,
    headers: {
      Authorization: `Bearer ${Cookie.get(ACCESS_TOKEN)}`,
      'Accept-Language': Cookie.get('Language') || 'en',
    },
  });

  return response.data;
};
export const getErrorMessage = (error: unknown): string => {
  let message: string;
  if (error instanceof Error) {
    // eslint-disable-next-line prefer-destructuring
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }
  return message;
};

export const endpoints = {
  chat: '/chat',
  kanban: '/kanban',
  calendar: '/calendar',
  auth: {
    me: '/auth/me',
    login: '/auth/signin',
    register: '/auth/register',
  },
  sections: {
    fetch: '/section',
    edit: '/section',
    categories: '/categories',
    import: '/section/import',
    export: '/section/export',
    linkCategories: '/section/add-category',
    deleteCategory: '/section/section-category',
    EditlinkedCategories: '/section/section-category',
    section_category: '/section/section-category',
  },
  categories: {
    fetch: '/category',
    subcategories: '/subcategories',
    linkSubCategories: '/category/add-subcategory',
    EditlinkedSubcategories: '/section/section-category',
    category_subcategory: '/category/category-subcategory',
  },
  subCategories: {
    fetch: '/subcategory',
    deleteSubCategory: '/subcategory',
    linkProducts: `/product-category-price/create-link-product-subcategory/{product_id}/{categorySubCategory_id}`,
    unlinkProducts: `/product-category-price/delete-link-product-subcategory`,
    editLinkedProducts: `/product-category-price/update-link-product-subcategory`,
    addProductprice: `/product-category-price/unit-prices-product`,
    addProductService: `/product-category-price/product-additional-service`,
    removeProductService: `/product-category-price/product-additional-service`,
  },
  brands: {
    list: '/product/get-brands',
    new: '/product/insert-brands',
    edit: '/product/update-brands',
    delete: '/product/delete-brands',
    linkProducts: '/product/link-brand-proudct',
  },
  mail: {
    list: '/mail/list',
    details: '/mail/details',
    labels: '/mail/labels',
  },
  post: {
    list: '/post/list',
    details: '/post/details',
    latest: '/post/latest',
    search: '/post/search',
  },
  product: {
    fetch: '/product/all-products-for-dashboard',
    fetchMostSelling: '/product/most-selling',
    fetchSingle: '/product/single-product-dashboard',
    details: '/product/details',
    search: '/product/search',
    delete: '/product/delete-Product',
    add: '/product/create-product',
    editDetails: '/product/update-product',
    editMeasurement: '/product/update-product-measurement',
    addMeasurement: '/product/add-measurement-to-product',
    deleteMeasurement: '/product/delete-product-measurement',
    addImage: '/product/add-image-to-product',
    deleteImage: '/product/delete-product-image',
    editLogoImage: '/product/update-product-image',
    export: {
      all: '/product/export',
      attched: 'product/attached/export',
      unattched: 'product/unattched/export',
      total_sales: 'product/selling-report',
    },
    attachedExport: '/product/attached/export',
  },
  additionalServices: {
    fetch: '/additional-service/all-additionalServices-units',
    add_service: '/additional-service/create-additional-service-unit',
    base_service: '/additional-service',
    update_service: 'update-additional-service-unit',
    delete_service: 'delete-additional-service-unit',
  },
  countries: {
    fetch: '/country/all-countries-dashboard',
    add_country: '/country/create-country',
    base_country: '/country',
    update_country: 'update-country',
    delete_country: 'delete-country',
    single_country: 'single-country-dashboard',
  },
  units: {
    fetch: '/measurement-unit/all-measurement-units',
    add_unit: '/measurement-unit/create-measurement-unit',
    base_unit: '/measurement-unit',
    update_unit: 'update-measurement-unit',
    delete_unit: 'delete-measurement-unit',
  },
  city: {
    base_city: '/city',
    fetch: 'all-cities-dashboard',
    add: 'create-city',
    edit: 'update-city',
    delete: 'delete-city',
  },
  region: {
    base_region: '/region',
    fetch: 'all-regions-dashboard',
    add: 'create-region',
    edit: 'update-region',
    delete: 'delete-region',
  },
  storage: {
    base_storage: '/storage',
  },
  warehouse: {
    fetch: '/warehouse',
    products: '/warehouse/products',
    new: '/warehouse',
    edit: '/warehouse',
    delete: '/warehouse',
    operation: '/warehouse/operation',
    attach: '/warehouse/attach-driver',
    exportProducts: '/product/warehouse/export',
  },
  workingArea: {
    get: '/working-area',
    post: '/working-area',
    delete: '/working-area',
    put: '/working-area',
  },
  offers: {
    fetch: '/product/all-products-offers-for-dashboard',
    fetchSingle: '/product/single-product-offer-dashboard',
    delete: '/product/delete-product-offer',
    edit: '/product/update-product-offer',
    add: '/product/create-product-offer',
  },
  orders: {
    fetch: '/order/dashboard-orders',
    details: '/order/dashboard-orders-total',
    fetchSingleOrder: '/order/single-order-dashboard',
    cancelOrder: '/shipment/cancel-shipment',
    broadcastOrder: '/order/broadcast-order-drivers',
    returnOrders: '/order/return-orders',
    acceptReturnOrder: 'order/update-return-order-status',
    getInvoice: 'order/invoice',
  },
  shipment: {
    process: '/shipment/admin/process',
    ready: '/shipment/admin/ready-for-pickup',
    delivered: '/shipment/admin/deliver',
    cancel: '/shipment/cancel-shipment',
    checkProduct: '/shipment/product-checked',
  },
  clients: {
    fetch: '/users/all-clients-dashboard',
    fetchSingle: '/users/single-client-dashboard',
    details: '/users/total-clients-dashboard',
    updateClientStatus: '/users/update-client-status',
    delete: '/users/delete-client',
  },

  drivers: {
    fetch: '/driver/all-drivers',
    assignDriver: `/shipment/assign-driver`,
    replaceAssigndDriver: `/shipment/replace-assignd-driver`,
  },
  driversDashboard: {
    getAll: '/driver/all-drivers-dashboard',
    getSingle: '/driver/single-driver-dashboard',
    getTotal: '/driver/total-driver-dashboard',
    getDriverOrders: '/order/dashboard-shipments',
    manipulateDriverStatus: '/auth/update-driver-status',
    delete: '/driver/delete-driver',
    updateProfile: '/driver/update-profile-driver',
  },
  paymentMethods: {
    fetch: '/payment-method/admin',
    edit: '/payment-method',
  },
  employees: {
    get: '/employee/all',
    getSingleEmployee: '/employee/single',
    post: '/employee/create',
    delete: '/employee/delete',
    patch: '/employee/update',
    fetchModules: '/employee/list-modules',
    assignModules: '/employee/assign-module',
  },
  reason: {
    fetch: '/reason/all',
    single: '/reason/signle-reason',
    delete: '/reason/delete',
    create: '/reason/create',
    update: '/reason/update',
    fetchByName: '/reason/get-reasons-by-name',
  },
  banars: '/banar',
  staticPage: { edit: '/static-page', fetch: '/static-page' },
  transactions: {
    getAll: '/transaction',
    getWallet: '/transaction/wallet',
  },
  notifications: {
    specificUsers: '/notification/send-to-users',
    pustToAll: '/notification/send-to-all',
  },
  promocodes: {
    main: '/promo-code',
    addPaymentMethod: `/promo-code/payment-method`,
  },
  support: {
    get: '/support-ticket',
    comments: '/support-ticket/comments',
    comment: '/support-ticket/comment',
    status: '/support-ticket/ticket-status',
    reActivateCounter: '/support-ticket/re-active-counter',
  },
  otp: '/auth/get-otps',
};
