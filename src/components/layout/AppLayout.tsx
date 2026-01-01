import { Outlet } from 'react-router-dom';
import RadialNav from './RadialNav';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Radial Navigation */}
      <RadialNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
