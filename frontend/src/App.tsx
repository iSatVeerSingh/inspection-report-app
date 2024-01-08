
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css"

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
