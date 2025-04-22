import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-end px-6"
      style={{
        backgroundImage: 'url(/music.png)', 
      }}
    >
      {/* <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl mr-14"> */}
        {/* Heading */}
        

        {/* Clerk Sign-up */}
        <SignUp
          path="/sign-up"
          routing="path"
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white font-medium",
            },
          }}
        />

    
      {/* </div> */}
    </div>
  );
};

export default SignUpPage;
