import Button from '../common/Button';

const Navigation = ({ 
  user, 
  onLogout, 
  selectedProject, 
  onBackToDashboard,
  currentPage = ''
}) => {
  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-building text-xl text-blue-200"></i>
              <h1 className="text-xl font-bold">PT Rosa Lisca</h1>
            </div>
            
            {selectedProject && (
              <>
                <div className="h-6 border-l border-blue-600"></div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-project-diagram text-blue-200"></i>
                  <span className="text-blue-200 text-sm">
                    {selectedProject.name}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Page Title */}
          {currentPage && (
            <div className="hidden md:block">
              <span className="text-blue-100 text-sm font-medium">
                {currentPage}
              </span>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {selectedProject && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBackToDashboard}
                icon={<i className="fas fa-arrow-left"></i>}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            )}
            
            {/* User Info */}
            <div className="flex items-center space-x-2 text-blue-200">
              <i className="fas fa-user-circle"></i>
              <span className="hidden sm:inline text-sm">{user?.email}</span>
            </div>
            
            {/* Logout */}
            <Button
              variant="danger"
              size="sm"
              onClick={onLogout}
              icon={<i className="fas fa-sign-out-alt"></i>}
              className="bg-red-600 hover:bg-red-700"
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