import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Init from "../pages/Init";
import Dashboard, { dashboardLoader } from "../layouts/Dashboard";
import * as paths from "./paths";
import Jobs from "../pages/Jobs/Jobs";
import JobDetails from "../pages/Jobs/JobDetails";
import AddInspectionNotes from "../pages/Jobs/AddInspectionNotes";
import ViewAddedNotes from "../pages/Jobs/ViewAddedNotes";
import AddInspectionItems from "../pages/Jobs/AddInspectionItems";
import ViewAddedItems from "../pages/Jobs/ViewAddedItems";
import ItemPreview from "../pages/Jobs/ItemPreview";
import ReportPreview from "../pages/Jobs/ReportPreview";

export default createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: dashboardLoader,
    children: [
      {
        path: paths.JOBS,
        element: <Jobs />,
      },
      {
        path: paths.JOB_DETAILS,
        element: <JobDetails />,
      },
      {
        path: paths.ADD_NOTES,
        element: <AddInspectionNotes />,
      },
      {
        path: paths.VIEW_EDIT_NOTES,
        element: <ViewAddedNotes />,
      },
      {
        path: paths.ADD_ITEMS,
        element: <AddInspectionItems />,
      },
      {
        path: paths.VIEW_EDIT_ITEMS,
        element: <ViewAddedItems />,
      },
      {
        path: paths.INSPECTION_ITEM_PREVIEW,
        element: <ItemPreview />,
      },
      {
        path: paths.REPORT_PREVIEW,
        element: <ReportPreview />
      }
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/init",
    element: <Init />,
  },
]);
