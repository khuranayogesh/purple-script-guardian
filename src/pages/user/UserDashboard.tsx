import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '@/utils/storage';

const UserDashboard = () => {
  const projects = StorageService.getProjects();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your regression testing projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/user/projects/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Plus className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">Create Project</CardTitle>
                </div>
                <CardDescription>Start a new regression testing project</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to create a new project
                </p>
              </CardContent>
            </Card>
          </Link>

          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <CardDescription>
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    to={`/user/projects/${project.id}/import`}
                    className="block text-sm text-primary hover:underline"
                  >
                    Import Scripts
                  </Link>
                  <Link 
                    to={`/user/projects/${project.id}/test-lab`}
                    className="block text-sm text-primary hover:underline"
                  >
                    Test Lab
                  </Link>
                  <Link 
                    to={`/user/projects/${project.id}/issues`}
                    className="block text-sm text-primary hover:underline"
                  >
                    Issue Log
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;