import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GoogleRedirect = () => {
  const location = useLocation();

  useEffect(() => {
    // Extract OAuth response parameters from the URL
    console.log("In google redirect")
  }, [location.search]);

  return <div>Redirecting...</div>;
};

export default GoogleRedirect;
