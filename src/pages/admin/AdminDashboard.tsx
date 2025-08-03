import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderPlus, FileText, List } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const dashboardItems = [
    {
      title: 'Add Folder',
      description: 'Create and manage folders and sub-folders',
      icon: FolderPlus,
      href: '/admin/folders'
    },
    {
      title: 'Add Script',
      description: 'Create new test scripts',
      icon: FileText,
      href: '/admin/scripts/new'
    },
    {
      title: 'Script Listing',
      description: 'View, modify, and delete scripts',
      icon: List,
      href: '/admin/scripts'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Administrator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage folders, scripts, and test cases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardItems.map((item) => (
            <Link key={item.title} to={item.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to access this feature
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;