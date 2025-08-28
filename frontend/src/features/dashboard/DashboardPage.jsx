// src/features/dashboard/DashboardPage.jsx
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import DashboardLayout from "../../components/DashboardLayout";
import DashboardOverview from "../../components/DashboardOverview";

const DashboardPage = () => {
  return (
    <>
      <SignedIn>
        <DashboardLayout>
          <DashboardOverview />
        </DashboardLayout>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default DashboardPage;
