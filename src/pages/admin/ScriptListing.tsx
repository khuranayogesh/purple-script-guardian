import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StorageService } from '@/utils/storage';
import { Script, Folder } from '@/types';
import { Eye, Edit, Trash2, FileText, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ScriptListing = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewingScript, setViewingScript] = useState<Script | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterScripts();
  }, [scripts, selectedFolder]);

  const loadData = () => {
    const allScripts = StorageService.getScripts();
    const allFolders = StorageService.getFolders();
    setScripts(allScripts);
    setFolders(allFolders);
  };

  const filterScripts = () => {
    if (selectedFolder === 'all') {
      setFilteredScripts(scripts);
    } else {
      setFilteredScripts(scripts.filter(script => script.folderId === selectedFolder));
    }
  };

  const handleDelete = (scriptId: string) => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      StorageService.deleteScript(scriptId);
      loadData();
      toast({
        title: "Success",
        description: "Script deleted successfully"
      });
    }
  };

  const getFolderName = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Unknown Folder';
  };

  const getFolderPath = (folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return 'Unknown Folder';
    
    if (folder.parentId) {
      const parent = folders.find(f => f.id === folder.parentId);
      return parent ? `${parent.name} > ${folder.name}` : folder.name;
    }
    return folder.name;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Script Listing
            </h1>
            <p className="text-muted-foreground">
              View, modify, and delete test scripts
            </p>
          </div>
          
          <Link to="/admin/scripts/new">
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Script
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filter by Folder</CardTitle>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {getFolderPath(folder.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {filteredScripts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No scripts found</p>
                  <p className="text-muted-foreground">
                    {selectedFolder === 'all' ? 
                      'Create your first script to get started' : 
                      'No scripts in the selected folder'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredScripts.map((script) => (
              <Card key={script.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{script.scriptId}</h3>
                        <Badge variant="secondary">{getFolderName(script.folderId)}</Badge>
                        <Badge variant={script.testType === 'Positive' ? 'default' : 'destructive'}>
                          {script.testType}
                        </Badge>
                        <Badge variant="outline">{script.testEnvironment}</Badge>
                      </div>
                      <p className="text-muted-foreground">{script.shortDescription}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>Purpose: {script.purpose || 'Not specified'}</p>
                        <p>Screenshots: {script.screenshots.length}</p>
                        <p>Created: {new Date(script.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingScript(script)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link to={`/admin/scripts/edit/${script.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(script.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={!!viewingScript} onOpenChange={() => setViewingScript(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border border-border">
            <DialogHeader>
              <DialogTitle>Script Details: {viewingScript?.scriptId}</DialogTitle>
            </DialogHeader>
            
            {viewingScript && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Folder</h4>
                    <p className="text-sm">{getFolderPath(viewingScript.folderId)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Test Environment</h4>
                    <Badge variant="outline">{viewingScript.testEnvironment}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Test Type</h4>
                    <Badge variant={viewingScript.testType === 'Positive' ? 'default' : 'destructive'}>
                      {viewingScript.testType}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Short Description</h4>
                  <p className="text-sm">{viewingScript.shortDescription}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Purpose</h4>
                  <p className="text-sm">{viewingScript.purpose || 'Not specified'}</p>
                </div>

                {viewingScript.assumptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Assumptions</h4>
                    <ul className="text-sm space-y-1">
                      {viewingScript.assumptions.map((assumption, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                          {assumption}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Expected Results</h4>
                  <p className="text-sm">{viewingScript.expectedResults || 'Not specified'}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Script Details</h4>
                  <div className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                    {viewingScript.scriptDetails || 'No details provided'}
                  </div>
                </div>

                {viewingScript.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Screenshots</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingScript.screenshots.map((screenshot) => (
                        <div key={screenshot.id} className="space-y-2">
                          <img
                            src={screenshot.path}
                            alt={screenshot.description}
                            className="w-full h-48 object-cover rounded border"
                          />
                          <p className="text-xs text-muted-foreground">
                            {screenshot.description || screenshot.filename}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ScriptListing;