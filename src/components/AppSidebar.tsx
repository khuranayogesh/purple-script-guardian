import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StorageService } from '@/utils/storage';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  FolderPlus, 
  FileText, 
  List, 
  LogOut, 
  Plus,
  FolderOpen,
  Import,
  FlaskConical,
  Bug,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const projects = StorageService.getProjects();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const adminMenuItems = [
    { title: 'Add Folder', url: '/admin/folders', icon: FolderPlus },
    { title: 'Add Script', url: '/admin/scripts/new', icon: FileText },
    { title: 'Script Listing', url: '/admin/scripts', icon: List },
  ];

  const userMenuItems = [
    { title: 'Create Project', url: '/user/projects/new', icon: Plus },
  ];

  return (
    <Sidebar className={`${collapsed ? 'w-14' : 'w-64'} bg-sidebar border-r border-sidebar-border`}>
      <SidebarTrigger className="m-2 text-sidebar-foreground hover:bg-sidebar-accent" />
      
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground font-semibold">
            {user?.userType} Dashboard
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {user?.userType === 'Administrator' && adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center space-x-2 text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded ${
                          isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {user?.userType === 'User' && userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center space-x-2 text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded ${
                          isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.userType === 'User' && projects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground font-semibold">
              My Projects
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <div key={project.id}>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleProject(project.id)}
                        className="flex items-center justify-between text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded w-full"
                      >
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="h-4 w-4" />
                          {!collapsed && <span>{project.name}</span>}
                        </div>
                        {!collapsed && (
                          expandedProjects.includes(project.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {expandedProjects.includes(project.id) && !collapsed && (
                      <div className="ml-6 space-y-1">
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <NavLink 
                              to={`/user/projects/${project.id}/import`}
                              className={({ isActive }) => 
                                `flex items-center space-x-2 text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded text-sm ${
                                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                                }`
                              }
                            >
                              <Import className="h-3 w-3" />
                              <span>Import Scripts</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <NavLink 
                              to={`/user/projects/${project.id}/test-lab`}
                              className={({ isActive }) => 
                                `flex items-center space-x-2 text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded text-sm ${
                                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                                }`
                              }
                            >
                              <FlaskConical className="h-3 w-3" />
                              <span>Test Lab</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <NavLink 
                              to={`/user/projects/${project.id}/issues`}
                              className={({ isActive }) => 
                                `flex items-center space-x-2 text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded text-sm ${
                                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                                }`
                              }
                            >
                              <Bug className="h-3 w-3" />
                              <span>Issue Log</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </div>
                    )}
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground p-2 rounded"
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}