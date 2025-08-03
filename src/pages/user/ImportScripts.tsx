import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StorageService } from '@/utils/storage';
import { Script, Folder, ImportedScript } from '@/types';
import { Import, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ImportScripts = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [importedScripts, setImportedScripts] = useState<ImportedScript[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    filterScripts();
  }, [scripts, selectedFolder]);

  const loadData = () => {
    const allScripts = StorageService.getScripts();
    const allFolders = StorageService.getFolders();
    const allImportedScripts = StorageService.getImportedScripts();
    const projectImportedScripts = allImportedScripts.filter(s => s.projectId === projectId);
    
    setScripts(allScripts);
    setFolders(allFolders);
    setImportedScripts(projectImportedScripts);
  };

  const filterScripts = () => {
    if (selectedFolder === 'all') {
      setFilteredScripts(scripts);
    } else {
      setFilteredScripts(scripts.filter(script => script.folderId === selectedFolder));
    }
  };

  const isScriptImported = (scriptId: string) => {
    return importedScripts.some(imported => imported.id === scriptId);
  };

  const handleImport = (script: Script) => {
    const importedScript: ImportedScript = {
      ...script,
      projectId: projectId!,
      status: 'pending',
      executionScreenshots: [],
      issueIds: []
    };

    StorageService.addImportedScript(importedScript);
    loadData();
    
    toast({
      title: "Success",
      description: `Script "${script.scriptId}" imported successfully`
    });
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
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Import Test Scripts
          </h1>
          <p className="text-muted-foreground">
            Import scripts from the master library to your project
          </p>
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
                  <Import className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No scripts available</p>
                  <p className="text-muted-foreground">
                    {selectedFolder === 'all' ? 
                      'No scripts have been created yet' : 
                      'No scripts in the selected folder'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredScripts.map((script) => {
              const imported = isScriptImported(script.id);
              return (
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
                          {imported && (
                            <Badge variant="default" className="bg-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Imported
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{script.shortDescription}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>Purpose: {script.purpose || 'Not specified'}</p>
                          <p>Screenshots: {script.screenshots.length}</p>
                          {script.assumptions.length > 0 && (
                            <p>Assumptions: {script.assumptions.length}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {imported ? (
                          <Button variant="default" size="sm" disabled className="bg-success">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Already Imported
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImport(script)}
                            className="hover:bg-primary hover:text-primary-foreground"
                          >
                            <Import className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {importedScripts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {importedScripts.length} script(s) imported to this project
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ImportScripts;