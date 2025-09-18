const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <main className="min-h-screen flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
