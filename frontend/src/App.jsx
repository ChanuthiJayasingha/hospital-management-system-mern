
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] =
    useState("Checking backend connection...");

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();

        if (data.success) {
          setBackendStatus(data.message);
        } else {
          setBackendStatus("Backend reported an error");
        }
      } catch (error) {
        console.error(error);
        setBackendStatus("Cannot connect to backend");
      }
    }

    checkBackend();
  }, []);

  return (
    <div className="app-container">
      <h1>Hospital Management System</h1>

      <p>
        Welcome to our MERN Stack Hospital
        Management System.
      </p>

      <button>Get Started</button>

      <p>
        <strong>Backend Status:</strong>
        {" "}{backendStatus}
      </p>
    </div>
  );
}

export default App;
