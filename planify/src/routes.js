import SignIn from "layouts/authentication/sign-in";
import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";

const routes = [
  {
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    name: "Tableau de bord",
    key: "tableau-de-bord",
    route: "/tableau-de-bord",
    component: <Dashboard />,
  },
  {
    name: "Profile",
    key: "profile",
    route: "/profile",
    component: <Profile />,
  },
];

export default routes;
