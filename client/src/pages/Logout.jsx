import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      try {
        if (auth && auth.signOut) {
          await auth.signOut();
        }
      } catch (_) {}
      try {
        localStorage.removeItem("mm_user");
      } catch (_) {}
      navigate("/login", { replace: true });
    })();
  }, [navigate]);

  return null;
}