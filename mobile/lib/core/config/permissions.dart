class Permissions {
  Permissions._();

  // ==========================================
  // USERS
  // ==========================================

  static const createUser =
      'CREATE_USER';

  static const updateUser =
      'UPDATE_USER';

  static const deleteUser =
      'DELETE_USER';

  static const getProfil =
      'GET_PROFIL';

  static const getAllProfils =
      'GET_ALL_PROFILS';

  static const searchUser =
      'SEARCH_USER';

  static const filterUsersByRole =
      'FILTER_USERS_BY_ROLE';

  static const activateAccount =
      'ACTIVATE_ACCOUNT';

  static const deactivateAccount =
      'DEACTIVATE_ACCOUNT';

  // Aliases anciens conservés
  // pour éviter de casser le code existant.

  static const getAllUsers =
      getAllProfils;

  static const getUserInfos =
      getProfil;

  // ==========================================
  // ROLES
  // ==========================================

  static const createRole =
      'CREATE_ROLE';

  static const updateRole =
      'UPDATE_ROLE';

  static const deleteRole =
      'DELETE_ROLE';

  static const getAllRoles =
      'GET_ALL_ROLES';

  static const getRolePermissions =
      'GET_ROLE_PERMISSIONS';

  static const getRoleNames =
      'GET_ROLE_NAMES';

  static const getRoleInfos =
      getRolePermissions;

  // ==========================================
  // ASSETS / BIENS
  // ==========================================

  static const createAsset =
      'CREATE_ASSET';

  static const updateAsset =
      'UPDATE_ASSET';

  static const deleteAsset =
      'DELETE_ASSET';

  static const getAsset =
      'GET_ASSET';

  static const getAllAssets =
      'GET_ALL_ASSETS';

  static const getAssetInfos =
      'GET_ASSET_INFOS';

  static const getAssetsByStatus =
      'GET_ASSETS_BY_STATUS';

  static const getAssetsByType =
      'GET_ASSETS_BY_TYPE';

  static const searchAsset =
      'SEARCH_ASSET';

  static const getArchivedAssets =
      'GET_ARCHIVED_ASSETS';

  static const searchArchivedAssets =
      'SEARCH_ARCHIVED_ASSETS';

  static const disposeAsset =
      'DISPOSE_ASSET';

  static const rentAsset =
      'RENT_ASSET';

  // Ancien nom Front/Mobile.
  // Le Backend n'a pas ASSIGN_ASSET.

  static const assignAsset =
      updateAsset;

  // ==========================================
  // STOCK / ITEMS
  // ==========================================

  static const createItem =
      'CREATE_ITEM';

  static const updateItem =
      'UPDATE_ITEM';

  static const deleteItem =
      'DELETE_ITEM';

  static const getItem =
      'GET_ITEM';

  static const getAllItems =
      'GET_ALL_ITEMS';

  static const searchItem =
      'SEARCH_ITEM';

  static const getItemStat =
      'GET_ITEM_STAT';

  static const createInStock =
      'CREATE_IN_STOCK';

  static const updateItemQuantity =
      'UPDATE_ITEM_QUANTITY';

  static const createItemRequest =
      'CREATE_ITEM_REQUEST';

  static const getItemRequest =
      'GET_ITEM_REQUEST';

  static const getAllItemRequests =
      'GET_ALL_ITEM_REQUESTS';

  // Faute présente dans le Backend :
  // on garde exactement ce code.

  static const approveItemRequest =
      'APROUVE_ITEM_REQUEST';

  static const rejectItemRequest =
      'REJECT_ITEM_REQUEST';

  static const cancelItemRequest =
      'CANCEL_ITEM_REQUEST';

  static const confirmItemRequestDelivery =
      'CONFIRM_ITEM_REQUEST_DELIVERY';

  static const filterItemRequestsByUser =
      'FILTER_ITEM_REQUESTS_BY_USER';

  static const getItemsWithLowStock =
      'GET_ITEMS_WITH_LOW_STOCK';

  static const getStockMovementPerItem =
      'GET_STOCK_MOVEMENT_PER_ITEM';

  static const getLowStockAlertsByPeriod =
      'GET_LOW_STOCK_ALERTS_BY_PERIOD';

  static const readStockAlerts =
      'READ_STOCK_ALERTS';

  // Anciens noms Mobile.
  // Ils pointent maintenant vers les
  // vraies permissions Backend.

  static const createArticle =
      createItem;

  static const updateArticle =
      updateItem;

  static const deleteArticle =
      deleteItem;

  static const getAllArticles =
      getAllItems;

  static const createStockEntry =
      createInStock;

  static const createStockExit =
      updateItemQuantity;

  static const createSupplyRequest =
      createItemRequest;

  static const validateSupplyRequest =
      approveItemRequest;

  static const rejectSupplyRequest =
      rejectItemRequest;

  static const getStockHistory =
      getStockMovementPerItem;

  static const getStockAlerts =
      getItemsWithLowStock;

  // ==========================================
  // ECLAIRAGE PUBLIC
  // ==========================================

  static const createLightPoint =
      'CREATE_LIGHT_POINT';

  static const updateLightPoint =
      'UPDATE_LIGHT_POINT';

  static const updateLightPointStatus =
      'UPDATE_LIGHT_POINT_STATUS';

  static const deleteLightPoint =
      'DELETE_LIGHT_POINT';

  static const getLightPoint =
      'GET_LIGHT_POINT';

  static const getAllLightPoint =
      'GET_ALL_LIGHT_POINT';

  static const searchLightPoints =
      'SEARCH_LIGHT_POINTS';

  static const filterLightPointsByStatus =
      'FILTER_LIGHT_POINTS_BY_STATUS';

  static const reportFailure =
      'REPORT_FAILURE';

  static const getFailure =
      'GET_FAILURE';

  static const getAllFailure =
      'GET_ALL_FAILURE';

  static const scheduleIntervention =
      'SCHEDULE_INTERVENTION';

  static const getIntervention =
      'GET_INTERVENTION';

  static const searchInterventions =
      'SEARCH_INTERVENTIONS';

  static const startIntervention =
      'START_INTERVENTION';

  static const completeIntervention =
      'COMPLETE_INTERVENTION';

  // Aliases anciens.

  static const createLight =
      createLightPoint;

  static const updateLight =
      updateLightPoint;

  static const deleteLight =
      deleteLightPoint;

  static const getAllLights =
      getAllLightPoint;

  static const createIntervention =
      scheduleIntervention;

  static const updateIntervention =
      startIntervention;

  // ==========================================
  // MAINTENANCE
  // ==========================================

  static const getMaintenance =
      'GET_MAINTENANCE';

  static const getAllMaintenance =
      'GET_ALL_MAINTENANCE';

  static const scheduleMaintenance =
      'SCHEDULE_MAINTENANCE';

  static const startMaintenance =
      'START_MAINTENANCE';

  static const completeMaintenance =
      'COMPLETE_MAINTENANCE';

  static const cancelMaintenance =
      'CANCEL_MAINTENANCE';

  static const updateMaintenance =
      'UPDATE_MAINTENANCE';

  static const updateMaintenanceStatus =
      'UPDATE_MAINTENANCE_STATUS';

  static const deleteMaintenance =
      'DELETE_MAINTENANCE';

  // ==========================================
  // RENTALS
  // ==========================================

  static const getRental =
      'GET_RENTAL';

  static const getAllRentals =
      'GET_ALL_RENTALS';

  static const updateRental =
      'UPDATE_RENTAL';

  static const cancelRental =
      'CANCEL_RENTAL';

  // ==========================================
  // ACCIDENTS
  // ==========================================

  static const getAccident =
      'GET_ACCIDENT';

  static const getAllAccident =
      'GET_ALL_ACCIDENT';

  static const registerAccident =
      'REGISTER_ACCIDENT';

  // ==========================================
  // DISPOSALS
  // ==========================================

  static const getDisposal =
      'GET_DISPOSAL';

  static const getAllDisposals =
      'GET_ALL_DISPOSALS';

  // ==========================================
  // FUEL
  // ==========================================

  static const getFuelTank =
      'GET_FUEL_TANK';

  static const getAllFuelTanks =
      'GET_ALL_FUEL_TANKS';

  // Faute présente dans le Backend.

  static const refulVehicle =
      'REFUL_VEHICLE';

  // ==========================================
  // DASHBOARD / COUNTERS
  // ==========================================

  static const getConnectedUsername =
      'GET_CONNECTED_USERNAME';

  static const getRoleName =
      'GET_ROLE_NAME';

  static const countUsers =
      'COUNT_USERS';

  static const countAsset =
      'COUNT_ASSET';

  static const countAssets =
      'COUNT_ASSETS';

  static const countAssetsByStatus =
      'COUNT_ASSETS_BY_STATUS';

  static const countItems =
      'COUNT_ITEMS';

  static const countLightPoints =
      'COUNT_LIGHT_POINTS';

  static const countLightPointsByStatus =
      'COUNT_LIGHT_POINTS_BY_STATUS';

  static const countFailures =
      'COUNT_FAILURES';

  static const countInterventionsByStatus =
      'COUNT_INTERVENTIONS_BY_STATUS';

  static const countInStockByItem =
      'COUNT_IN_STOCK_BY_ITEM';

  static const countInStockByPeriod =
      'COUNT_IN_STOCK_BY_PERIOD';

  static const countItemRequestsByStatus =
      'COUNT_ITEM_REQUESTS_BY_STATUS';

  static const countLowStockAlerts =
      'COUNT_LOW_STOCK_ALERTS';

  static const countStockMovementByPeriod =
      'COUNT_STOCK_MOVEMENT_BY_PERIOD';

  static const countTotalInStock =
      'COUNT_TOTAL_IN_STOCK';

  static const countTotalQuantities =
      'COUNT_TOTAL_QUANTITIES';

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  static const countNotif =
      'COUNT_NOTIF';

  static const filterNotifByStatus =
      'FILTER_NOTIF_BY_STATUS';

  static const markNotifAsRead =
      'MARK_NOTIF_AS_READ';

  static const markAllNotifAsRead =
      'MARK_ALL_NOTIF_AS_READ';

  static const getAccidentNotification =
      'GET_ACCIDENT_NOTIFICATION';

  static const getDisposalNotification =
      'GET_DISPOSAL_NOTIFICATION';

  static const getFuelTankNotification =
      'GET_FUEL_TANK_NOTIFICATION';

  static const getMaintenanceNotification =
      'GET_MAINTENANCE_NOTIFICATION';

  static const getRentalNotification =
      'GET_RENTAL_NOTIFICATION';

  static const getFailureNotification =
      'GET_FAILURE_NOTIFICATION';

  static const getInterventionNotification =
      'GET_INTERVENTION_NOTIFICATION';

  static const getAlertStockMovementOfficialDocs =
      'GET_ALERT_STOCK_MVMT_OFF_DOCS';

  static const getItemRequestNotification =
      'GET_ITEM_REQUEST_NOTIFICATION';

  // Une permission parmi celles-ci
  // suffit pour afficher le module
  // Notifications.

  static const notificationAccess =
      <String>{
    countNotif,
    filterNotifByStatus,
    markNotifAsRead,
    markAllNotifAsRead,
    getAccidentNotification,
    getDisposalNotification,
    getFuelTankNotification,
    getMaintenanceNotification,
    getRentalNotification,
    getFailureNotification,
    getInterventionNotification,
    getAlertStockMovementOfficialDocs,
    getItemRequestNotification,
    readStockAlerts,
  };

  // Une permission métier de lecture suffit pour accéder aux rapports.
  static const reportAccess = <String>{
    getAllProfils,
    getAllAssets,
    getAllItems,
    getAllLightPoint,
  };

  // ==========================================
  // FRONT/MOBILE ONLY
  // ==========================================
  //
  // Ces permissions n'existent pas
  // actuellement dans le Backend.
  // On garde les constantes uniquement
  // pour éviter de casser les anciens
  // écrans.
  //
  // Aucun rôle Backend ne les possède,
  // donc elles ne donnent aucun accès.

  static const generateReport =
      '__FRONT_GENERATE_REPORT__';

  static const exportPdf =
      '__FRONT_EXPORT_PDF__';

  static const exportExcel =
      '__FRONT_EXPORT_EXCEL__';

  static const updateProfile =
      '__FRONT_UPDATE_PROFILE__';

  static const changePassword =
      '__FRONT_CHANGE_PASSWORD__';

  static const manageSettings =
      '__FRONT_MANAGE_SETTINGS__';

  // ==========================================
  // TOUTES LES VRAIES PERMISSIONS BACKEND
  // ==========================================

  static const all = <String>{
    // Users
    createUser,
    updateUser,
    deleteUser,
    getProfil,
    getAllProfils,
    searchUser,
    filterUsersByRole,
    activateAccount,
    deactivateAccount,

    // Roles
    createRole,
    updateRole,
    deleteRole,
    getAllRoles,
    getRolePermissions,
    getRoleNames,

    // Assets
    createAsset,
    updateAsset,
    deleteAsset,
    getAsset,
    getAllAssets,
    getAssetInfos,
    getAssetsByStatus,
    getAssetsByType,
    searchAsset,
    getArchivedAssets,
    searchArchivedAssets,
    disposeAsset,
    rentAsset,

    // Stock
    createItem,
    updateItem,
    deleteItem,
    getItem,
    getAllItems,
    searchItem,
    getItemStat,
    createInStock,
    updateItemQuantity,
    createItemRequest,
    getItemRequest,
    getAllItemRequests,
    approveItemRequest,
    rejectItemRequest,
    cancelItemRequest,
    confirmItemRequestDelivery,
    filterItemRequestsByUser,
    getItemsWithLowStock,
    getStockMovementPerItem,
    getLowStockAlertsByPeriod,
    readStockAlerts,

    // Lighting
    createLightPoint,
    updateLightPoint,
    updateLightPointStatus,
    deleteLightPoint,
    getLightPoint,
    getAllLightPoint,
    searchLightPoints,
    filterLightPointsByStatus,
    reportFailure,
    getFailure,
    getAllFailure,
    scheduleIntervention,
    getIntervention,
    searchInterventions,
    startIntervention,
    completeIntervention,

    // Maintenance
    getMaintenance,
    getAllMaintenance,
    scheduleMaintenance,
    startMaintenance,
    completeMaintenance,
    cancelMaintenance,
    updateMaintenance,
    updateMaintenanceStatus,
    deleteMaintenance,

    // Rentals
    getRental,
    getAllRentals,
    updateRental,
    cancelRental,

    // Accidents
    getAccident,
    getAllAccident,
    registerAccident,

    // Disposals
    getDisposal,
    getAllDisposals,

    // Fuel
    getFuelTank,
    getAllFuelTanks,
    refulVehicle,

    // Dashboard
    getConnectedUsername,
    getRoleName,
    countUsers,
    countAsset,
    countAssets,
    countAssetsByStatus,
    countItems,
    countLightPoints,
    countLightPointsByStatus,
    countFailures,
    countInterventionsByStatus,
    countInStockByItem,
    countInStockByPeriod,
    countItemRequestsByStatus,
    countLowStockAlerts,
    countStockMovementByPeriod,
    countTotalInStock,
    countTotalQuantities,

    // Notifications
    countNotif,
    filterNotifByStatus,
    markNotifAsRead,
    markAllNotifAsRead,
    getAccidentNotification,
    getDisposalNotification,
    getFuelTankNotification,
    getMaintenanceNotification,
    getRentalNotification,
    getFailureNotification,
    getInterventionNotification,
    getAlertStockMovementOfficialDocs,
    getItemRequestNotification,
  };
}