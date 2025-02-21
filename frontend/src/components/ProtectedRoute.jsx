import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router-dom";
import FancyButton from "./Button";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;
  return user ? children : <Link to="/signup"> <FancyButton text={"Sign Up"} /> </Link>;
};

export default ProtectedRoute;
