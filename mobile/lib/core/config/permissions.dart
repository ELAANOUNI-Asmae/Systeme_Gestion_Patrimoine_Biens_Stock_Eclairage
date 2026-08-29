class Permissions {
  Permissions._();

  static const createUser = 'CREATE_USER';
  static const updateUser = 'UPDATE_USER';
  static const deleteUser = 'DELETE_USER';
  static const getAllUsers = 'GET_ALL_USERS';
  static const getUserInfos = 'GET_USER_INFOS';

  static const createRole = 'CREATE_ROLE';
  static const updateRole = 'UPDATE_ROLE';
  static const deleteRole = 'DELETE_ROLE';
  static const getAllRoles = 'GET_ALL_ROLES';
  static const getRoleInfos = 'GET_ROLE_INFOS';

  static const createAsset = 'CREATE_ASSET';
  static const updateAsset = 'UPDATE_ASSET';
  static const deleteAsset = 'DELETE_ASSET';
  static const getAllAssets = 'GET_ALL_ASSETS';
  static const getAssetInfos = 'GET_ASSET_INFOS';
  static const assignAsset = 'ASSIGN_ASSET';

  static const createArticle = 'CREATE_ARTICLE';
  static const updateArticle = 'UPDATE_ARTICLE';
  static const deleteArticle = 'DELETE_ARTICLE';
  static const getAllArticles = 'GET_ALL_ARTICLES';
  static const createStockEntry = 'CREATE_STOCK_ENTRY';
  static const createStockExit = 'CREATE_STOCK_EXIT';
  static const createSupplyRequest = 'CREATE_SUPPLY_REQUEST';
  static const validateSupplyRequest = 'VALIDATE_SUPPLY_REQUEST';
  static const rejectSupplyRequest = 'REJECT_SUPPLY_REQUEST';
  static const getStockHistory = 'GET_STOCK_HISTORY';
  static const getStockAlerts = 'GET_STOCK_ALERTS';

  static const createLight = 'CREATE_LIGHT';
  static const updateLight = 'UPDATE_LIGHT';
  static const deleteLight = 'DELETE_LIGHT';
  static const getAllLights = 'GET_ALL_LIGHTS';
  static const reportFailure = 'REPORT_FAILURE';
  static const createIntervention = 'CREATE_INTERVENTION';
  static const updateIntervention = 'UPDATE_INTERVENTION';

  static const generateReport = 'GENERATE_REPORT';
  static const exportPdf = 'EXPORT_PDF';
  static const exportExcel = 'EXPORT_EXCEL';

  static const updateProfile = 'UPDATE_PROFILE';
  static const changePassword = 'CHANGE_PASSWORD';
  static const manageSettings = 'MANAGE_SETTINGS';

  static const all = <String>{
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserInfos,
    createRole,
    updateRole,
    deleteRole,
    getAllRoles,
    getRoleInfos,
    createAsset,
    updateAsset,
    deleteAsset,
    getAllAssets,
    getAssetInfos,
    assignAsset,
    createArticle,
    updateArticle,
    deleteArticle,
    getAllArticles,
    createStockEntry,
    createStockExit,
    createSupplyRequest,
    validateSupplyRequest,
    rejectSupplyRequest,
    getStockHistory,
    getStockAlerts,
    createLight,
    updateLight,
    deleteLight,
    getAllLights,
    reportFailure,
    createIntervention,
    updateIntervention,
    generateReport,
    exportPdf,
    exportExcel,
    updateProfile,
    changePassword,
    manageSettings,
  };
}
