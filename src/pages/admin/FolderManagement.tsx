import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StorageService } from '@/utils/storage';
import { Folder } from '@/types';
import { FolderPlus, Edit, Trash2, Folder as FolderIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FolderManagement = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = () => {
    setFolders(StorageService.getFolders());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive"
      });
      return;
    }

    if (editingFolder) {
      StorageService.updateFolder(editingFolder.id, {
        name: name.trim(),
        parentId: parentId || undefined
      });
      toast({
        title: "Success",
        description: "Folder updated successfully"
      });
    } else {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: name.trim(),
        parentId: parentId || undefined,
        icon: 'folder'
      };
      StorageService.addFolder(newFolder);
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    }

    resetForm();
    loadFolders();
    setIsDialogOpen(false);
  };

  const handleEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setName(folder.name);
    setParentId(folder.parentId || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? This will also delete all sub-folders.')) {
      StorageService.deleteFolder(folderId);
      loadFolders();
      toast({
        title: "Success",
        description: "Folder deleted successfully"
      });
    }
  };

  const resetForm = () => {
    setName('');
    setParentId('');
    setEditingFolder(null);
  };

  const getRootFolders = () => folders.filter(f => !f.parentId);
  const getSubFolders = (parentId: string) => folders.filter(f => f.parentId === parentId);
  const getParentFolders = () => folders.filter(f => !f.parentId);

  const renderFolderTree = (folderList: Folder[], level = 0) => {
    return folderList.map(folder => (
      <div key={folder.id} className="space-y-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3" style={{ marginLeft: `${level * 20}px` }}>
              <FolderIcon className="h-5 w-5 text-primary" />
              <span className="font-medium">{folder.name}</span>
              {folder.parentId && <Badge variant="secondary">Sub-folder</Badge>}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(folder)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(folder.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {getSubFolders(folder.id).length > 0 && (
          <div className="space-y-2">
            {renderFolderTree(getSubFolders(folder.id), level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Folder Management
            </h1>
            <p className="text-muted-foreground">
              Create and organize folders for your test scripts
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={resetForm}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-border">
              <DialogHeader>
                <DialogTitle>{editingFolder ? 'Edit Folder' : 'Create New Folder'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Folder Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter folder name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Folder (Optional)</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent folder (or leave blank for root)" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="">None (Root folder)</SelectItem>
                      {getParentFolders().map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                    {editingFolder ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {folders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No folders yet</p>
                  <p className="text-muted-foreground">Create your first folder to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            renderFolderTree(getRootFolders())
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FolderManagement;