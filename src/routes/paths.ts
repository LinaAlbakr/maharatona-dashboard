// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    sections: `${ROOTS.DASHBOARD}/sections`,
    categories: `${ROOTS.DASHBOARD}/categories`,
    subCategories: `${ROOTS.DASHBOARD}/sub-categories`,
    brands: `${ROOTS.DASHBOARD}/brands`,
    productsGroup: {
      root: `${ROOTS.DASHBOARD}/products`,
      availableProducts: `${ROOTS.DASHBOARD}/products/availabe-products`,
      almostRanOut: `${ROOTS.DASHBOARD}/products/almost-ran-out`,
      unavailableProducts: `${ROOTS.DASHBOARD}/products/unavailable-products`,
      total: `${ROOTS.DASHBOARD}/products/total`,
      mostSelling: `${ROOTS.DASHBOARD}/products/most-selling`,
      financialReports: `${ROOTS.DASHBOARD}/products/financial-reports`,
    },
    reasons: `${ROOTS.DASHBOARD}/reasons`,
    dataManagementsGroup: {
      root: `${ROOTS.DASHBOARD}/dataManagements`,
      units: `${ROOTS.DASHBOARD}/dataManagements/units`,
      additionalServices: `${ROOTS.DASHBOARD}/dataManagements/additional-services`,
      countries: `${ROOTS.DASHBOARD}/dataManagements/countries`,
      currencies: `${ROOTS.DASHBOARD}/dataManagements/currencies`,
      countryId: (countryId: string) => `${ROOTS.DASHBOARD}/dataManagements/countries/${countryId}`,
    },
    ordersGroup: {
      root: `${ROOTS.DASHBOARD}/orders`,
      total: `${ROOTS.DASHBOARD}/orders/view`,
      newOrders: `${ROOTS.DASHBOARD}/orders/view?index=PENDING`,
      driverAcceptedOrders: `${ROOTS.DASHBOARD}/orders/view?index=CONFIRMED`,
      processingOrders: `${ROOTS.DASHBOARD}/orders/view?index=PROCESSING`,
      readyForPickUpOrders: `${ROOTS.DASHBOARD}/orders/view?index=READY_FOR_PICKUP`,
      pickedUpOrders: `${ROOTS.DASHBOARD}/orders/view?index=PICKED_UP`,
      deliveredOrders: `${ROOTS.DASHBOARD}/orders/view?index=DELIVERED`,
      completeOrders: `${ROOTS.DASHBOARD}/orders/view?index=COMPLETED`,
      cancelledOrders: `${ROOTS.DASHBOARD}/orders/view?index=CANCELED`,
    },
    offers: `${ROOTS.DASHBOARD}/offers`,
    couponsAndDiscounts: `${ROOTS.DASHBOARD}/coupons-and-discounts`,
    employees: `${ROOTS.DASHBOARD}/employees`,
    drivers: `${ROOTS.DASHBOARD}/drivers`,
    driversWallet: `${ROOTS.DASHBOARD}/drivers-wallet`,
    warehousesAndDeliveryLocations: `${ROOTS.DASHBOARD}/warehouses-and-delivery-locations`,
    paymentMethods: `${ROOTS.DASHBOARD}/payment-methods`,
    transactions: `${ROOTS.DASHBOARD}/transactions`,
    returnRequests: `${ROOTS.DASHBOARD}/returned-orders`,
    notifications: `${ROOTS.DASHBOARD}/notifications`,
    advertisements: `${ROOTS.DASHBOARD}/advertisements`,
    appPages: `${ROOTS.DASHBOARD}/app-pages`,
    reports: `${ROOTS.DASHBOARD}/reports`,
    loyaltySystem: `${ROOTS.DASHBOARD}/loyalty-system`,
    settings: `${ROOTS.DASHBOARD}/settings`,
    sliders: `${ROOTS.DASHBOARD}/sliders`,
    workingArea: `${ROOTS.DASHBOARD}/working-area`,
    clients: `${ROOTS.DASHBOARD}/clients`,
    otp: `${ROOTS.DASHBOARD}/otp`,
    banars: `${ROOTS.DASHBOARD}/banars`,
    posters: `${ROOTS.DASHBOARD}/posters`,
    terms: `${ROOTS.DASHBOARD}/terms-and-conditions`,
    privacy: `${ROOTS.DASHBOARD}/privacy-policy`,
    return: `${ROOTS.DASHBOARD}/return-policy`,
    about: `${ROOTS.DASHBOARD}/about-us`,
    promocodes: `${ROOTS.DASHBOARD}/promocodes`,
    support: `${ROOTS.DASHBOARD}/support`,
  },
};
