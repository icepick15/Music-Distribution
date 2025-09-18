const ErrorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="min-h-screen flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
};

export default ErrorLayout;
