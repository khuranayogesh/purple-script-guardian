import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StorageService } from '@/utils/storage';
import { Script, Folder, Screenshot } from '@/types';
import { Save, Plus, Trash2, Upload, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ScriptForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [formData, setFormData] = useState({
    scriptId: '',
    shortDescription: '',
    folderId: '',
    testEnvironment: 'Online' as 'Online' | 'Batch' | 'Online & Batch',
    testType: 'Positive' as 'Positive' | 'Negative',
    purpose: '',
    expectedResults: '',
    scriptDetails: ''
  });
  const [assumptions, setAssumptions] = useState<string[]>(['']);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

  useEffect(() => {
    setFolders(StorageService.getFolders());
    
    if (isEditing) {
      const scripts = StorageService.getScripts();
      const script = scripts.find(s => s.id === id);
      if (script) {
        setFormData({
          scriptId: script.scriptId,
          shortDescription: script.shortDescription,
          folderId: script.folderId,
          testEnvironment: script.testEnvironment,
          testType: script.testType,
          purpose: script.purpose,
          expectedResults: script.expectedResults,
          scriptDetails: script.scriptDetails
        });
        setAssumptions(script.assumptions.length > 0 ? script.assumptions : ['']);
        setScreenshots(script.screenshots);
      }
    }
  }, [id, isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssumptionChange = (index: number, value: string) => {
    const newAssumptions = [...assumptions];
    newAssumptions[index] = value;
    setAssumptions(newAssumptions);
  };

  const addAssumption = () => {
    setAssumptions([...assumptions, '']);
  };

  const removeAssumption = (index: number) => {
    setAssumptions(assumptions.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newScreenshot: Screenshot = {
            id: Date.now().toString() + Math.random(),
            filename: file.name,
            description: '',
            path: e.target?.result as string
          };
          setScreenshots(prev => [...prev, newScreenshot]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const updateScreenshotDescription = (id: string, description: string) => {
    setScreenshots(prev => 
      prev.map(s => s.id === id ? { ...s, description } : s)
    );
  };

  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.scriptId || !formData.shortDescription || !formData.folderId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const scriptData: Script = {
      id: isEditing ? id! : Date.now().toString(),
      ...formData,
      assumptions: assumptions.filter(a => a.trim() !== ''),
      screenshots,
      createdAt: isEditing ? 
        StorageService.getScripts().find(s => s.id === id)?.createdAt || new Date().toISOString() :
        new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      StorageService.updateScript(id!, scriptData);
      toast({
        title: "Success",
        description: "Script updated successfully"
      });
    } else {
      StorageService.addScript(scriptData);
      toast({
        title: "Success",
        description: "Script created successfully"
      });
    }

    navigate('/admin/scripts');
  };

  const getFolderPath = (folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return '';
    
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
            {isEditing ? 'Edit Script' : 'Create New Script'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modify the test script details' : 'Add a new test script to your collection'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Script Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scriptId">Script ID *</Label>
                  <Input
                    id="scriptId"
                    value={formData.scriptId}
                    onChange={(e) => handleInputChange('scriptId', e.target.value)}
                    placeholder="Enter script ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folderId">Folder/Sub-folder *</Label>
                  <Select value={formData.folderId} onValueChange={(value) => handleInputChange('folderId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {getFolderPath(folder.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief description of the test"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Environment</Label>
                  <Select value={formData.testEnvironment} onValueChange={(value) => handleInputChange('testEnvironment', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Batch">Batch</SelectItem>
                      <SelectItem value="Online & Batch">Online & Batch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select value={formData.testType} onValueChange={(value) => handleInputChange('testType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="Describe the purpose of this test"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Assumptions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAssumption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assumption
                  </Button>
                </div>
                {assumptions.map((assumption, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={assumption}
                      onChange={(e) => handleAssumptionChange(index, e.target.value)}
                      placeholder={`Assumption ${index + 1}`}
                    />
                    {assumptions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAssumption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedResults">Expected Results</Label>
                <Textarea
                  id="expectedResults"
                  value={formData.expectedResults}
                  onChange={(e) => handleInputChange('expectedResults', e.target.value)}
                  placeholder="Describe the expected results"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scriptDetails">Script Details</Label>
                <Textarea
                  id="scriptDetails"
                  value={formData.scriptDetails}
                  onChange={(e) => handleInputChange('scriptDetails', e.target.value)}
                  placeholder="Detailed test steps and instructions"
                  rows={6}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Screenshots</Label>
                  <div>
                    <input
                      type="file"
                      id="screenshots"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('screenshots')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Screenshots
                    </Button>
                  </div>
                </div>

                {screenshots.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {screenshots.map((screenshot) => (
                      <Card key={screenshot.id}>
                        <CardContent className="p-4">
                          <img
                            src={screenshot.path}
                            alt={screenshot.filename}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          <Input
                            value={screenshot.description}
                            onChange={(e) => updateScreenshotDescription(screenshot.id, e.target.value)}
                            placeholder="Screenshot description"
                            className="mb-2"
                          />
                          <div className="flex justify-between">
                            <Badge variant="secondary">{screenshot.filename}</Badge>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeScreenshot(screenshot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/scripts')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Script' : 'Create Script'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ScriptForm;