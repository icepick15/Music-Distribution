// src/features/dashboard/DashboardPage.jsx
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import PlanCard from "../components/PlanCard";
import RecentReleases from "../components/RecentReleases";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  return (
    <>
      <SignedIn>
        <section className="min-h-screen bg-gray-100 px-6 md:px-12 py-10">
          {/* Support notice */}
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm text-center text-sm mb-6">
            For help, please open a{" "}
            <Link
              to="/dashboard/tickets"
              className="text-blue-600 font-medium hover:underline"
            >
              support ticket
            </Link>.
          </div>

          {/* Top section: text + plan card */}
          <div className="grid md:grid-cols-2 gap-10 items-start mb-12">
            {/* Left text content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                Manage Your <span className="text-blue-600">Subscription</span>
              </h1>
              <p className="text-gray-700 leading-relaxed">
                From your dashboard, manage releases, account settings, update your{" "}
                <a className="text-blue-600 underline" href="#">
                  password
                </a>
                , track{" "}
                <a className="text-blue-600 underline" href="#">
                  royalties
                </a>
                , and request{" "}
                <a className="text-blue-600 underline" href="#">
                  payouts
                </a>.
              </p>
            </div>

            {/* Plan card */}
            <PlanCard />
          </div>

          {/* Full-width section below */}
          <div className="w-full">
            <RecentReleases />
          </div>
        </section>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default DashboardPage;
