import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Link,useLocation } from "react-router-dom";
import FancyButton from "../components/Button";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;
  if (loading)
    return (
      <p className="text-xl font-bold text-primary-600 dark:text-white">
        Loading...
      </p>
    );
  return user ? (
    children
  ) : (
    <div className="flex flex-col items-center justify-center space-x-4">
       <p className="text-xl font-bold text-primary-600 dark:text-white mb-5">
        Authenticate to get started
      </p>
      <Link to={`/signup?redirect=${currentPath}`}>
        {" "}
        <FancyButton text={"Sign Up"} />{" "}
      </Link>
    </div>
  );
};

export default ProtectedRoute;
