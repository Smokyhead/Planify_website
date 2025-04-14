import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";

import Shop from "examples/Icons/Shop";
import Office from "examples/Icons/Office";
import CustomerSupport from "examples/Icons/CustomerSupport";
import Document from "examples/Icons/Document";

const routes = [
  {
    type: "collapse",
    name: "Tableau de bord",
    key: "tableau-de-bord",
    route: "/tableau-de-bord",
    icon: <Shop size="12px" />,
    component: <Dashboard />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    route: "/tables",
    icon: <Office size="12px" />,
    component: <Tables />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    route: "/profile",
    icon: <CustomerSupport size="12px" />,
    component: <Profile />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    icon: <Document size="12px" />,
    component: <SignIn />,
    noCollapse: true,
  },
];

export default routes;
