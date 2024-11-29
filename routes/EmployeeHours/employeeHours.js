const express = require("express");
const getSAPRef = require("../../middleware/EmployeeHours/getSAPRef");
const getJobsFromSP = require("../../middleware/EmployeeHours/getJobsFromSP");

const {
  getAllPeople,
} = require("../../controllers/EmployeeHours/resources/people");

const {
  getAllJobs,
} = require("../../controllers/EmployeeHours/resources/jobs");

const {
  getAllCategories,
} = require("../../controllers/EmployeeHours/resources/categories");

const upload = require("../../middleware/fileUpload");

const {
  importInternalJobList,
} = require("../../controllers/EmployeeHours/imports/importData");

const {
  submitShopHours,
  getUnlockedEntries,
  getEmployeeHourSubmissions,
  updateSubmissions,
  deleteEntry,
} = require("../../controllers/EmployeeHours/shopHours/shopHours");

const {
  saveWorkingData,
  getWorkingData,
} = require("../../controllers/EmployeeHours/shopHours/workingData");

const {
  exportWorkingDataToExcel,
} = require("../../controllers/EmployeeHours/exportExcel/exportExcel");

const {
  userLogin,
  userRegister,
  fieldUserRegister,
  verifyEmail,
  changePassword,
} = require("../../controllers/EmployeeHours/auth/auth");

const router = express.Router();

router.route("/auth/login").post(userLogin);

router.route("/auth/register/field").post(fieldUserRegister);

router.route("/auth/register").post(userRegister);

router.route("/auth/changepassword/:userid").post(changePassword);

router.route("/people").get(getSAPRef, getAllPeople);

router
  .route("/auth/register/field/verify-email/:verificationtoken")
  .get(verifyEmail);

// router
//     .route('/people')
//     .get(getAllPeople)

router.route("/jobs").get(getJobsFromSP, getAllJobs);

router.route("/categories").get(getAllCategories);

router.route("/shop/entries").get(getUnlockedEntries);

router.route("/shop/submit").post(submitShopHours);

router.route("/shop/submissions").post(updateSubmissions);

router.route("/shop/submissions/delete/:srdid").delete(deleteEntry);

router.route("/shop/working-data").post(saveWorkingData).get(getWorkingData);

router
  .route("/manager-verification/export-excel")
  .post(exportWorkingDataToExcel);

router.route("/shop/submissions/:peopleid").get(getEmployeeHourSubmissions);

router
  .route("/import/internaljobs")
  .post(upload.single("file"), importInternalJobList);

module.exports = router;
