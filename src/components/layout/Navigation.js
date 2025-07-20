import Button from '../common/Button';

const Navigation = ({ 
  user, 
  onLogout, 
  selectedProject, 
  onBackToDashboard,
  currentPage = ''
}) => {  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Project Info */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <i className="fas fa-building text-lg sm:text-xl text-blue-200"></i>
              <h1 className="text-lg sm:text-xl font-bold truncate">
                <span className="hidden sm:inline">PT Rosa Lisca</span>
                <span className="sm:hidden">Rosa Lisca</span>
              </h1>
            </div>
            
            {selectedProject && (
              <>
                <div className="hidden sm:block h-6 border-l border-blue-600"></div>
                <div className="flex items-center space-x-2 min-w-0">
                  <i className="fas fa-project-diagram text-blue-200 hidden sm:inline"></i>
                  <span className="text-blue-200 text-xs sm:text-sm truncate max-w-32 sm:max-w-none">
                    {selectedProject.name}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Page Title */}
          {currentPage && (
            <div className="hidden lg:block">
              <span className="text-blue-100 text-sm font-medium">
                {currentPage}
              </span>
            </div>
          )}          
          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {selectedProject && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBackToDashboard}
                icon={<i className="fas fa-arrow-left"></i>}
                className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            )}
            
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2 text-blue-200">
              <i className="fas fa-user-circle"></i>
              <span className="text-sm">{user?.email}</span>
            </div>
            
            {/* Logout */}
            <Button
              variant="danger"
              size="sm"
              onClick={onLogout}
              icon={<i className="fas fa-sign-out-alt"></i>}
              className="bg-red-600 hover:bg-red-700 px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;