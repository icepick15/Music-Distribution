import Navbar from './Navbar';
import ModernFooter from './ModernFooter';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <ModernFooter />
    </div>
  );
};

export default PublicLayout;
