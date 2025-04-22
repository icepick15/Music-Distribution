import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-end px-6"
      style={{
        backgroundImage: 'url(/music.png)', // Replace with actual image path
      }}
    >
      {/* <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl mr-14"> */}
        {/* Heading */}
        {/* <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 text-sm mt-1">
            Sign in to manage your releases, royalties, and more.
          </p>
        </div> */}

        {/* Clerk Sign-in */}
        <SignIn
          path="/sign-in"
          routing="path"
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white font-medium",
            },
          }}
        />

        {/* Footer */}
        
      {/* </div> */}
    </div>
  );
};

export default SignInPage;
