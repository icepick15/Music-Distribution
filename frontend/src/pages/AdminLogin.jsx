// src/pages/AdminLogin.jsx
import { SignIn } from "@clerk/clerk-react";

export default function AdminLogin() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn routing="path" path="/admin-login" />
    </div>
  );
}
