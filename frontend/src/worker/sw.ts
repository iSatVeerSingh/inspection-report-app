import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import {
  addInspectionItemsController,
  addInspectionNoteByJobController,
  deleteInspectionItemController,
  deleteInspectionNoteByJobController,
  generateReportController,
  getAllInspectionItemsByJobController,
  getInspectionNotesController,
  getJobCategoriesController,
  getJobsController,
  getLibraryItemCategoriesController,
  getLibraryItemIndexController,
  getReportDetailsController,
  initInspectionNotesController,
  initJobCategoriesController,
  initJobsController,
  initLibraryItemCategoriesController,
  initLibraryItemsController,
  initRecommendationsController,
  initTemplateController,
  initUserController,
  newJobController,
  startInspectionController,
} from "./controller";

declare let self: ServiceWorkerGlobalScope;

// // self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);
// clean old assets
cleanupOutdatedCaches();

// Install and setup the app and local database
// registerRoute(
//   ({ url }) => url.pathname === "/client/init-status",
//   initStatusController,
//   "GET"
// );

// Setup user in indexeddb
registerRoute(
  ({ url }) => url.pathname === "/client/init-user",
  initUserController,
  "POST"
);

// Init library item categories
registerRoute(
  ({ url }) => url.pathname === "/client/init-library-item-categories",
  initLibraryItemCategoriesController,
  "POST"
);

// Init library items
registerRoute(
  ({ url }) => url.pathname === "/client/init-library-items",
  initLibraryItemsController,
  "POST"
);

// Init inspection notes
registerRoute(
  ({ url }) => url.pathname === "/client/init-inspection-notes",
  initInspectionNotesController,
  "POST"
);

// Init Template
registerRoute(
  ({ url }) => url.pathname === "/client/init-template",
  initTemplateController,
  "POST"
);

// Init jobs
registerRoute(
  ({ url }) => url.pathname === "/client/init-jobs",
  initJobsController,
  "POST"
);

// Init job categories
registerRoute(
  ({ url }) => url.pathname === "/client/init-job-categories",
  initJobCategoriesController,
  "POST"
);

// Init Recommendations
registerRoute(
  ({ url }) => url.pathname === "/client/init-recommendations",
  initRecommendationsController,
  "POST"
);

// Get Job categories
registerRoute(
  ({ url }) => url.pathname === "/client/job-categories",
  getJobCategoriesController,
  "GET"
);

// Get jobs
registerRoute(
  ({ url }) => url.pathname === "/client/jobs",
  getJobsController,
  "GET"
);

// Start new inspection
registerRoute(
  ({ url }) => url.pathname === "/client/jobs",
  startInspectionController,
  "PUT"
);

// Get Inspection Notes
registerRoute(
  ({ url }) => url.pathname === "/client/inspection-notes",
  getInspectionNotesController,
  "GET"
);

// Add Inspection note by job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/note",
  addInspectionNoteByJobController,
  "POST"
);

// Delete inspection note by job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/note",
  deleteInspectionNoteByJobController,
  "PUT"
);

// Get library item and categories index
registerRoute(
  ({ url }) => url.pathname === "/client/library-index",
  getLibraryItemIndexController,
  "GET"
);

// Add inspection items
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/inspection-items",
  addInspectionItemsController,
  "POST"
);

// Get all inspection items by job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/inspection-items",
  getAllInspectionItemsByJobController,
  "GET"
);
// Delete Inspection item
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/inspection-items",
  deleteInspectionItemController,
  "DELETE"
);

// Get Report Details
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/report",
  getReportDetailsController,
  "GET"
);

// Get Report Details
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/generate-report",
  generateReportController,
  "POST"
);



// Get Library Item Category
registerRoute(
  ({ url }) => url.pathname === "/client/library-item-categories",
  getLibraryItemCategoriesController,
  "GET"
);

// Create new custom job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs",
  newJobController,
  "POST"
);

// // Get Library items
// registerRoute(
//   ({ url }) => url.pathname === "/client/library-items",
//   getLibraryItemsController,
//   "GET"
// );

// // Create library items
// registerRoute(
//   ({ url }) => url.pathname === "/client/library-items",
//   createLibraryItemsController,
//   "POST"
// );

// // Update Library Items
// registerRoute(
//   ({ url }) => url.pathname === "/client/library-items",
//   updateLibraryItemsController,
//   "PUT"
// );

// // Delete Library Items
// registerRoute(
//   ({ url }) => url.pathname === "/client/library-items",
//   deleteLibraryItemController,
//   "DELETE"
// );

// // Create inspection notes
// registerRoute(
//   ({ url }) => url.pathname === "/client/inspection-notes",
//   createInspectionNotesController,
//   "POST"
// );

// // Update inspection notes
// registerRoute(
//   ({ url }) => url.pathname === "/client/inspection-notes",
//   editInspectionNotesController,
//   "PUT"
// );

// // Delete inspection items
// registerRoute(
//   ({ url }) => url.pathname === "/client/inspection-notes",
//   deleteInspectionNotesController,
//   "DELETE"
// );

// // Create new job
// registerRoute(
//   ({ url }) => url.pathname === "/client/jobs/new",
//   createJobController,
//   "POST"
// );

// // Inspection route

// // Get Inspection details and job summary
// registerRoute(
//   ({ url }) => url.pathname === "/client/inspection",
//   getJobInspectionSummaryController,
//   "GET"
// );

// // Get LibIndex
// registerRoute(
//   ({ url }) => url.pathname === "/client/library-index",
//   getLibIndexController,
//   "GET"
// );
// registerRoute(
//   ({ url }) => url.pathname === "/client/inspections/notes",
//   addInspectionNotesController,
//   "PUT"
// );

// registerRoute(
//   ({ url }) => url.pathname === "/client/inspections/items",
//   addInspectionItemsController,
//   "POST"
// );
// registerRoute(
//   ({ url }) => url.pathname === "/client/inspections/items",
//   deleteInspectionItemsController,
//   "DELETE"
// );
// registerRoute(
//   ({ url }) => url.pathname === "/client/inspections/recommendation",
//   addRecommendationController,
//   "PUT"
// );

// registerRoute(
//   ({ url }) => url.pathname === "/client/inspections/generate-report",
//   generateReportController,
//   "POST"
// );

// registerRoute(
//   ({ url }) => url.pathname === "/client/library-notes",
//   getLibraryNotesController,
//   "GET"
// );

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];
// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

self.skipWaiting();
clientsClaim();
