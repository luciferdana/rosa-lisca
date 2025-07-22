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
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Project Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <i className="fas fa-building text-xl text-blue-200"></i>
              <h1 className="text-lg sm:text-xl font-bold">
                <span className="hidden sm:inline">PT Rosa Lisca</span>
                <span className="sm:hidden">Rosa Lisca</span>
              </h1>
            </div>
            
            {selectedProject && (
              <>
                <div className="hidden sm:block h-6 border-l border-blue-600"></div>
                <div className="flex items-center space-x-2 min-w-0">
                  <i className="fas fa-project-diagram text-blue-200 text-sm"></i>
                  <span className="text-blue-200 text-sm truncate max-w-32 sm:max-w-48 lg:max-w-64" title={selectedProject.name}>
                    {selectedProject.name}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Center Section - Page Title */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            {currentPage && currentPage !== 'Dashboard' && (
              <span className="text-blue-100 text-sm font-medium bg-blue-700 px-3 py-1 rounded-full">
                {currentPage}
              </span>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            {/* User Info */}
            <div className="hidden lg:flex items-center space-x-2 text-blue-200 mr-2">
              <i className="fas fa-user-circle text-lg"></i>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            
            {/* Back to Dashboard Button */}
            {(selectedProject || currentPage !== 'Dashboard') && onBackToDashboard && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBackToDashboard}
                icon={<i className="fas fa-arrow-left"></i>}
                className="bg-blue-600 hover:bg-blue-700 border-blue-500 px-3 py-2"
              >
                <span className="hidden sm:inline ml-1">Dashboard</span>
              </Button>
            )}
            
            {/* Logout Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={onLogout}
              icon={<i className="fas fa-sign-out-alt"></i>}
              className="bg-red-600 hover:bg-red-700 border-red-500 px-3 py-2"
            >
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;