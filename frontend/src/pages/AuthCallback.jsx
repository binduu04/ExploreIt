import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      console.log("AuthCallback: Starting OAuth handling");

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      console.log("OAuth params:", {
        code: code ? "present" : "missing",
        error,
      });

      // Handle OAuth errors
      if (error) {
        console.error("OAuth error:", error);
        if (window.opener) {
          window.opener.postMessage("oauth_error", window.location.origin);
          window.close();
        } else {
          navigate("/");
        }
        return;
      }

      if (!code) {
        console.error("No authorization code received");
        if (window.opener) {
          window.opener.postMessage("oauth_error", window.location.origin);
          window.close();
        } else {
          navigate("/");
        }
        return;
      }

      // Wait for user to be loaded if not already
      if (!user) {
        console.log("Waiting for user authentication...");
        // Add a timeout to prevent infinite waiting
        setTimeout(() => {
          if (!user) {
            console.error("User not authenticated after timeout");
            navigate("/");
          }
        }, 5000);
        return;
      }

      try {
        console.log("Getting Firebase ID token...");
        const token = await user.getIdToken();

        console.log("Sending authorization code to backend...");
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/calendar/callback`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          }
        );

        console.log("Backend response status:", response.status);
        const data = await response.json();
        console.log("Backend response data:", data);

        if (data.success) {
          console.log("OAuth success, notifying parent window");
          if (window.opener) {
            window.opener.postMessage("oauth_success", window.location.origin);
            window.close();
          } else {
            navigate("/");
          }
        } else {
          console.error("Backend reported failure:", data.error);
          if (window.opener) {
            window.opener.postMessage("oauth_error", window.location.origin);
            window.close();
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        if (window.opener) {
          window.opener.postMessage("oauth_error", window.location.origin);
          window.close();
        } else {
          navigate("/");
        }
      }
    };

    handleOAuth();
  }, [user, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div>Connecting to Google Calendar...</div>
      <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
        Please wait while we complete the authorization.
      </div>
    </div>
  );
}
