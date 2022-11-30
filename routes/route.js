const express = require('express');
const router = express.Router();

const validator = require('../config/validate');
const uploadManager = require('../config/upload');

const parseUrl = express.urlencoded({ extended: false })
const parseJson = express.urlencoded({ extended: false })

const authController = require('../controller/authController');
const vendorAuthController = require('../controller/vendorAuthController');
const categoryController = require('../controller/categoryController');
const dashboardController = require('../controller/dashboardController');
const inquiryController = require('../controller/inquiryController');
const questionController = require('../controller/questionController');
const answerController = require('../controller/answerController');
const priceListController = require('../controller/priceListController');
const packageController = require('../controller/packageController');
const addressController = require('../controller/addressController');
const couponCodeController = require('../controller/couponCodeController');
const timelineController = require('../controller/timelineController');
const uploadController = require('../controller/uploadController');
const invoiceController = require('../controller/invoiceController');
const deliveryController = require('../controller/deliveryController');
const orderFilterByDateController = require('../controller/orderFilterByDateController');
const settingController = require('../controller/settingController');
const menuController = require('../controller/menuController');
const pageController = require('../controller/pageController');
const howWeWorkController = require('../controller/howWeWorkController');
const orderController = require('../controller/orderController');
const requestCategoryController = require('../controller/requestCategoryController');
const careemExpressController = require('../controller/careemExpressController');

const vendorRegisterController = require('../controller/vendorRegisterController');
const vendorQuestionController = require('../controller/vendorQuestionController');
const vendorAnswerController = require('../controller/vendorAnswerController');
const vendorPriceListController = require('../controller/vendorPriceListController');
const vendorController = require('../controller/vendorController');
const orderCounterConteroller = require('../controller/orderCounterConteroller');

const apiAuthController = require('../controller/api/authController');
const apiCategoryController = require('../controller/api/categoryController');
const apiQuestionController = require('../controller/api/questionController');
const apiPackageController = require('../controller/api/packageController');
const apiCouponCodeController = require('../controller/api/couponCodeController');
const apiOrderController = require('../controller/api/orderController');
const apiCartController = require('../controller/api/cartController');
const orderTimeLineController = require('../controller/api/orderTimeLineController');
const deliveryChargeController = require('../controller/api/deliveryChargeController');
const apiStripeController = require('../controller/api/stripeController');

const auth = require("../middleware/auth");
const nullAuth = require("../middleware/nullAuth");
const { Router } = require('express');

/* ADMIN LOGIN */
    router.post('/adminLogin', validator.validateAdminLogin, authController.adminLogin);
    router.post('/changePassword', validator.validatePassword, authController.changeAdminPassword);
/* END ADMIN LOGIN */

/* DASHBOARD */
    router.get('/dashboard', auth, dashboardController.index);
    router.get('/sidebar_counters', auth, dashboardController.sidebar_counters);
/* END DASHBOARD */

/* USER CRUD */
    router.post('/insertUser', auth, uploadManager.oneUploadTemp.single('profile_pic'), validator.validateInsertUser, authController.userCreate);
    router.put('/updateUser', auth, uploadManager.oneUploadTemp.single('profile_pic'), validator.validateUpdateUser, authController.userUpdate);
    router.delete('/deleteUser', auth, validator.validateUpdateUser, authController.userDelete);
    router.put('/removeUserFromDelete', auth, validator.validateDeleteUser, authController.userDeleteUndo);
    router.post('/userList/:page', auth, authController.userList);
    router.post('/deletedUserList/:page', auth, authController.deletedUserList);
    router.post('/blockedUserList/:page', auth, authController.blockedUserList);
    router.get('/userDetailById/:id', auth, authController.userDetailById);
/* END USER CRUD */

/* VENDOR CRUD */
    router.post('/insertVendor', uploadManager.oneUploadTemp.single('profile_pic'), validator.validateInsertVendor, vendorRegisterController.userCreate);
    router.put('/updateVendor', auth, uploadManager.oneUploadTemp.single('profile_pic'), validator.validateUpdateVendor, vendorRegisterController.userUpdate);
    router.delete('/deleteVendor', auth, validator.validateDeleteVendor, vendorRegisterController.userDelete);
    router.post('/vendorList/:page', auth, vendorRegisterController.userList);
    router.get('/vendorDetailById/:id', auth, vendorRegisterController.userDetailById);
    router.get('/vendorCredentialShareById/:id', auth, vendorRegisterController.userCredentialShare);
/* END VENDOR CRUD */

/* CATEGORY CRUD */
    router.post('/insertCategory', auth, uploadManager.multipleUpload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'category_image', maxCount: 10 }
    ]), validator.validateInsertCategory, categoryController.categoryCreate);//uploadManager.oneUploadTemp.single('icon')
    router.put('/updateCategory', auth, uploadManager.multipleUpload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'category_image', maxCount: 10 }
    ]), validator.validateUpdateCategory, categoryController.categoryUpdate);
    router.put('/updateCategoryStatus', auth, validator.validateUpdateCategory, categoryController.categoryStatus);
    router.put('/updateCategoryEnableStatus', auth, categoryController.categoryEnableStatus);
    router.delete('/deleteCategory', auth, validator.validateUpdateCategory, categoryController.categoryDelete);
    router.post('/categoryList/:page', categoryController.getCategories);
    router.get('/parentCategoryList', categoryController.getParentCategories);
    router.get('/childCategoryList/:id', categoryController.getChildCategories);
    router.get('/enableParentCategoryList', categoryController.getEnableParentCategories);
    router.get('/enableCategoryList', categoryController.getEnableCategories);
    router.get('/categoryById/:id', categoryController.getCategoryById);
    router.post('/subCategorySearch', categoryController.getSearchSubCategories);
    router.post('/addVendorQuestion', auth, categoryController.addVendorQuestion)
    router.post('/removeVendorQuestion', auth, categoryController.removeVendorQuestion)
/* END CATEGORY CRUD */

/* INQUIRY CRUD */
    router.post('/insertInquiry', validator.validateInsertInquiry, inquiryController.inquiryCreate);
    router.post('/insertSubscription', validator.validateInsertSubscription, inquiryController.inquiryCreate);
    router.delete('/deleteInquiry', auth, validator.validateDeleteInquiry, inquiryController.inquiryDelete);
    router.post('/inquiryList/:page', inquiryController.getIquiries);
    router.post('/inquiryById/:id', inquiryController.getIquiryById);
/* END INQUIRY CRUD */

/* SUBSCRIBER CRUD */
    router.post('/subscribeList/:page', inquiryController.getSubscribe);
/* END SUBSCRIBER CRUD */

/* NEED HELP CRUD */
    router.post('/needHelpList/:page', inquiryController.getOrderInquiry);
/* END NEED HELP CRUD */

/* REQUEST CATEGORY */
    router.post('/requestCategoryList/:page', requestCategoryController.categoryList);
/* REQUEST CATEGORY */

/* INVOICE */
    router.post('/createinvoicedesign', auth, uploadManager.oneUploadTemp.array('logo',10), invoiceController.createinvoicedesign)//done
    router.put('/updateinvoicedesign', auth, uploadManager.multipleUpload.fields([
        { name: 'invoice_logo', maxCount: 1 },
        { name: 'auth_logo', maxCount: 1 }
    ]), invoiceController.updateinvoicedesign)//done
    router.delete('/deleteinvoicedetails', auth, invoiceController.deleteinvoice)
    router.get('/getinvoice',auth, invoiceController.getinvoice)
    router.get('/getinvoicedesignbyid/:id',auth,invoiceController.getinvoicebyId)
    router.get('/getinvoicebyid/:id',auth,invoiceController.generateInvoice)
    router.put('/updateinvoicecategory', auth, invoiceController.updateinvoicecategory)
/* INVOICE END */

/* QUESTION CRUD */
    router.post('/insertQuestion', auth, validator.validateInsertQuestion, questionController.questionCreate);
    router.put('/updateQuestion', auth, validator.validateUpdateQuestion, questionController.questionUpdate);
    router.put('/questionStateUpdate', auth, validator.validateUpdateQuestion, questionController.questionStateUpdate);
    router.delete('/deleteQuestion', auth, validator.validateUpdateQuestion, questionController.questionDelete);
    router.put('/disableQuestion', auth, questionController.questionStatusDisable);
    router.put('/enableQuestion', auth, questionController.questionStatusEnable)
    router.post('/questionList/:page', questionController.getQuestions);
    router.post('/questionListAdmin/:page',auth, questionController.getQuestionsAdmin);
    router.post('/filter-question/:page', questionController.filterQuestions);
    router.get('/questionById/:id', questionController.getQuestionById);
    router.get('/questionByIdAdmin/:id', questionController.getQuestionByIdAdmin);
/* END QUESTION CRUD */

/* ANSWER CRUD */
    router.post('/insertAnswer', auth, uploadManager.oneUploadTemp.single('image'), validator.validateInsertAnswer, answerController.answerCreate);
    router.put('/updateAnswer', auth, uploadManager.oneUploadTemp.single('image'), validator.validateUpdateAnswer, answerController.answerUpdate);
    router.delete('/deleteAnswer', auth, validator.validateDeleteAnswer, answerController.answerDelete);
    router.get('/answersByQuestion/:id', answerController.getAnswerByQuestion);
    router.get('/answersById/:id', answerController.getAnswerById);
    router.post('/parentQuestionAnswer', answerController.getParentQuestionAnswer);
    router.post('/rootQuestionAnswer', answerController.getRootQuestionAnswer);
/* END ANSWER CRUD */

/* PRICE LIST CRUD */
    router.post('/insertPrice', priceListController.priceCreate);
    router.put('/updatePrice', auth, priceListController.priceUpdate);
    router.delete('/deletePrice', auth, priceListController.priceDelete);
    router.post('/priceListByAnswer', priceListController.getPriceList);
    router.post('/priceListByQuestion/:page', priceListController.getPriceListByQuestion);
    router.post('/priceById/:id', priceListController.getPriceById);
    router.put('/changePriceStatus', priceListController.priceStatusChange);
/* END PRICE LIST CRUD */

/* PACKAGE CRUD */
    router.post('/insertPackage', auth, uploadManager.oneUploadTemp.single('image'), validator.validateInsertPackage, packageController.packageCreate);
    router.put('/updatePackage', auth, uploadManager.oneUploadTemp.single('image'), validator.validateUpdatePackage, packageController.packageUpdate);
    router.delete('/deletePackage', auth, validator.validateUpdatePackage, packageController.packageDelete);
    router.post('/packageList/:page', packageController.getPackages);
    router.get('/enablePackageList', packageController.getEnablePackages);
    router.get('/packageByCategory/:id', packageController.getPackageByCategoryId);
    router.get('/packageById/:id', packageController.getPackageById);
/* END PACKAGE CRUD */

/* ADDRESS CRUD */
    router.post('/insertAddress', auth, validator.validateInsertAddress, addressController.addressCreate);
    router.put('/updateAddress', auth, validator.validateUpdateAddress, addressController.addressUpdate);
    router.put('/updateAddressStatus', auth, validator.validateUpdateAddress, addressController.addressStatusUpdate);
    router.delete('/deleteAddress', auth, validator.validateUpdateAddress, addressController.addressDelete);
    router.post('/addressList/:page', auth, addressController.getAddress);
    router.get('/addressList/:id', auth, addressController.getAddressWithOutPagination);
    router.get('/addressById/:id', auth, addressController.getAddressById);
/* END ADDRESS CRUD */

/* COUPON CODE CRUD */
    router.post('/insertCouponCode', auth, validator.validateInsertCouponCode, couponCodeController.insertCouponCode);
    router.put('/updateCouponCode', auth, validator.validateUpdateCouponCode, couponCodeController.editCouponCode);
    router.delete('/deleteCouponCode/:id', auth, couponCodeController.deleteCouponCode);
    router.post('/couponCodeList/:page', auth, couponCodeController.getCouponCode);
    router.get('/couponCodeById/:id', auth, couponCodeController.selectCouponCodeById);
    router.get('/couponCode', auth, couponCodeController.selectCouponCode);
/* END COUPON CODE CRUD */

/* TIMELINE LIST */
    router.post('/insertTimeLine', auth, timelineController.addTimeline);
    router.get('/timeLineById/:id', auth, timelineController.getTimelineById);
    router.post('/ticketAddTimeLines', auth, timelineController.ticketAddTimeLines);
    router.get('/ticketGetTimeLineById/:id', auth, timelineController.ticketGetTimeLineById);
    router.post('/ticketStatus', auth, timelineController.ticketStatusAdmin);

/* END TIMELINE LIST */

/* ORDER LIST */
    router.get('/recentOrderCounter', auth, apiOrderController.getRecentOrderCount);
    router.post('/orderList/:page', auth, apiOrderController.getAllUserOrderList);
    router.post('/orderStatusUpdate', auth, orderController.orderStatusAdmin);
    router.post('/orderDetailsStatusUpdate', auth, orderController.orderDetailsStatusAdmin);
    router.get('/orderList', auth, apiOrderController.getAllUserOrderListWithoutPagination);
/* END ORDER LIST */

/* DELIVERY CHARGE LIST */
    router.post('/insertDeliveryCharge', auth, deliveryController.deliveryCreate);
    router.get('/deliveryChargeList', auth, deliveryController.getDeliveryCharge);
    router.get('/deliveryChargeById/:id', auth, deliveryController.getDeliveryById);
    router.delete('/deleteDeliveryCharge', auth, deliveryController.deliveryDelete);
/* END DELIVERY CHARGE LIST */

/* REPORTS */
    router.post('/dateWiseReport', auth, orderFilterByDateController.generateDateWiseReport);
    router.post('/couponCodeWiseReport', auth, orderFilterByDateController.generateCouponCodeWiseReport);
    router.post('/subCategoryWiseReport', auth, orderFilterByDateController.generateSubCategoryWiseReport);
/* END REPORTS */

/* SETTING LIST */
    router.post('/insertSetting', auth, uploadManager.multipleUpload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'footer_logo', maxCount: 1 }
    ]), validator.validateInsertSetting, settingController.settingCreate);
    router.get('/getSetting', settingController.getSetting);
/* END SETTING LIST */

/* MENU CRUD */
    router.post('/insertMenu', auth, validator.validateInsertMenu, menuController.menuCreate);
    router.put('/updateMenu', auth, validator.validateInsertMenu, menuController.menuUpdate);
    router.delete('/deleteMenu', auth, menuController.menuDelete);
    router.post('/menuList/:page', auth, menuController.getMenu);
    router.get('/menuById/:id', auth, menuController.getMenuById);
    router.post('/enableMenuStatus', auth, menuController.menuStatusEnable);
    router.post('/disbleMenuStatus', auth, menuController.menuStatusDisable);
    router.get('/enabledMenu', menuController.getEnabledMenu);
    router.get('/menuList', menuController.getMenuWithoutPagination);
/* END MENU CRUD */

/* PAGE CRUD */
    router.post('/insertPage', auth, validator.validateInsertPage, pageController.pageCreate);
    router.put('/updatePage', auth, validator.validateUpdatePage, pageController.pageUpdate);
    router.delete('/deletePage', auth, pageController.pageDelete);
    router.post('/pageList/:page', auth, pageController.getPage);
    router.get('/pageById/:id', auth, pageController.getPageById);
    router.get('/pageBySlug/:slug', pageController.getPageBySlug);
/* END PAGE CRUD */

/* HOW WE WORK CRUD */
    router.post('/insertHowWeWork', auth, uploadManager.oneUploadTemp.single('image'), howWeWorkController.howWeWorkCreate);
    router.put('/updateHowWeWork', auth, uploadManager.oneUploadTemp.single('image'), howWeWorkController.howWeWorkUpdate);
    router.delete('/deleteHowWeWork', auth, howWeWorkController.howWeWorkDelete);
    router.post('/howWeWorkList/:page', auth, howWeWorkController.getHowWeWork);
    router.get('/howWeWorkById/:id', auth, howWeWorkController.getHowWeWorkById);
    router.get('/howWeWorkList', howWeWorkController.getHowWeWorkWithoutPagination);
/* END HOW WE WORK CRUD */

/* API LIST */
    router.post('/loginApi', apiAuthController.login);
    router.post('/registrationApi', validator.validateRegisterUser, apiAuthController.registration);
    router.put('/updateProfileApi', auth, validator.validateUpdateUserApi, apiAuthController.updateUser);
    router.post('/getOtpApi', apiAuthController.getOtp);
    router.post('/getVerifyApi', apiAuthController.getVerifyOtp);
    router.post('/changePasswordUser', apiAuthController.changePassword);
    router.get('/getCategoryListApi', apiCategoryController.getCategoryList);
    router.get('/getSubCategoryListApi/:id', apiCategoryController.getSubCategoryList);
    router.get('/getQuestionListApi/:id', apiQuestionController.getQuestionList);
    router.get('/getQuestionListByParentApi/:id', apiQuestionController.getQuestionListByParent);
    router.get('/getHomePagePackageList', apiPackageController.getHomePagePackageList);
    router.post('/getPackageList', apiPackageController.getPackageList);
    router.post('/appliedCouponCode', nullAuth, validator.validateAppliedCouponCode, apiCouponCodeController.applyCouponCode);
    router.post('/generateOrder', nullAuth, apiOrderController.placeOrder);
    router.post('/transactionOrder', nullAuth, apiOrderController.transactionOrder);
    router.post('/insertCart', nullAuth, apiCartController.insertCart);
    router.post('/cartList', nullAuth, apiCartController.getCart);
    router.post('/deleteCart', nullAuth, apiCartController.deleteCart);
    router.get('/orderGetById/:id', auth, apiOrderController.orderGetById);
    router.post('/orderGetByUser/:page', auth, apiOrderController.getUserOrderList);
    router.post('/changeUserPassword', auth, validator.validateUserPassword, authController.changeUserPassword);
    router.get('/deliveryChargeApi', deliveryChargeController.getChargeList);
    router.post('/stripeCharge', nullAuth, apiStripeController.stripeCharge);
/* END API LIST */

/* UPLOAD IMAGE */
    router.post('/uploadImage', uploadManager.uploadTemp.single('file'), uploadController.uploadCreate);
    router.post('/orderUploadImage', uploadManager.uploadTemp.single('file'), uploadController.orderUploadImage);
    router.delete('/deleteUploadImage', uploadController.uploadDelete);
/* END UPLOAD IMAGE */


/* VENDOR LOGIN */
    router.post('/vendorLogin', vendorAuthController.adminLogin);
    router.post('/vendorForgotPassword', vendorAuthController.vendorForgotPassword);
/* END VENDOR LOGIN */

/* QUESTION CRUD */
    router.post('/insertVendorQuestion', auth, validator.validateVendorInsertQuestion, vendorQuestionController.questionCreate);
    router.put('/updateVendorQuestion', auth, validator.validateVendorUpdateQuestion, vendorQuestionController.questionUpdate);
    router.put('/vendorQuestionStateUpdate', auth, validator.validateUpdateQuestion, vendorQuestionController.questionStateUpdate);
    router.delete('/deleteVendorQuestion', auth, validator.validateUpdateQuestion, vendorQuestionController.questionDelete);
    router.put('/disableVendorQuestion', auth, vendorQuestionController.questionStatusDisable);
    router.put('/enableVendorQuestion', auth, vendorQuestionController.questionStatusEnable)
    router.post('/vendorQuestionList/:page', auth, vendorQuestionController.getQuestions);
    router.post('/vendorQuestionListAdmin/:page', auth, vendorQuestionController.getQuestionsAdmin);
    router.get('/vendorQuestionById/:id', auth, vendorQuestionController.getQuestionById);
    router.get('/vendorQuestionByIdAdmin/:id', auth, vendorQuestionController.getQuestionByIdAdmin);
/* END QUESTION CRUD */

/* ANSWER CRUD */
    router.post('/insertVendorAnswer', auth, uploadManager.oneUploadTemp.single('image'), validator.validateVendorInsertAnswer, vendorAnswerController.answerCreate);
    router.put('/updateVendorAnswer', auth, uploadManager.oneUploadTemp.single('image'), validator.validateVendorUpdateAnswer, vendorAnswerController.answerUpdate);
    router.delete('/deleteVendorAnswer', auth, validator.validateDeleteAnswer, vendorAnswerController.answerDelete);
    router.get('/vendorAnswersByQuestion/:id', auth, vendorAnswerController.getAnswerByQuestion);
    router.get('/vendorAnswersById/:id', auth, vendorAnswerController.getAnswerById);
    router.post('/vendorParentQuestionAnswer', auth, vendorAnswerController.getParentQuestionAnswer);
/* END ANSWER CRUD */

/* PRICE LIST CRUD */
    router.post('/insertVendorPrice', auth, vendorPriceListController.priceCreate);
    router.put('/updateVendorPrice', auth, vendorPriceListController.priceUpdate);
    router.delete('/deleteVendorPrice', auth, vendorPriceListController.priceDelete);
    router.post('/vendorPriceListByAnswer', auth, vendorPriceListController.getPriceList);
    router.post('/vendorPriceListByQuestion/:page', auth, vendorPriceListController.getPriceListByQuestion);
    router.post('/vendorPriceById/:id', auth, vendorPriceListController.getPriceById);
    router.put('/vendorChangePriceStatus', auth, vendorPriceListController.priceStatusChange);
/* END PRICE LIST CRUD */

/* VENDOR BY CATEGORY */
    router.post('/vendorByCategory/:page', auth, vendorController.vendorByCategory);
    router.get('/assinedOrderByVendor/:id', auth, vendorController.assignedOrderListByVendor);
/* END VENDOR BY CATEGORY */

/* ASSIGN ORDER TO VENDOR */
    router.post('/assign_order', auth, vendorController.assignOrderToVendor);
/* END ASSIGN ORDER TO VENDOR */

/* ORDER COUNTERS FOR DASHBOARD */
    router.get('/vendorPendingOrder/:id', auth, orderCounterConteroller.vendorOrderPendingStatus);
    router.get('/vendorGetOrderCounts/:id', auth, orderCounterConteroller.vendorGetOrderCounts);
    router.get('/adminTotalOrder', auth, orderCounterConteroller.adminTotalOrder);
    router.get('/adminGetOrderCounts', auth, orderCounterConteroller.adminGetOrderCounts);
    router.get('/adminOrderPendingStatus', auth, orderCounterConteroller.adminOrderPendingStatus);
    router.get('/adminOrderApprovedStatus', auth, orderCounterConteroller.adminOrderApprovedStatus);

router.post('/createDelivery', careemExpressController.deliveryCreate);
router.post('/vendorOrderStatus', auth, vendorController.statusOrderToVendor);
router.post('/changeVendorPassword', auth, validator.validateUserPassword, authController.changeVendorPassword);
//router.post('/adminLogin', validator.validateAdminLogin, authController.adminLogin);

module.exports = router;
