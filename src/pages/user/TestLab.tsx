import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageService } from '@/utils/storage';
import { ImportedScript, Issue, Screenshot } from '@/types';
import { Play, Pause, Target, CheckCircle, AlertTriangle, Eye, Upload, X, ZoomIn } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TestLab = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [scripts, setScripts] = useState<ImportedScript[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [executingScript, setExecutingScript] = useState<ImportedScript | null>(null);
  const [viewingScript, setViewingScript] = useState<ImportedScript | null>(null);
  const [viewingImage, setViewingImage] = useState<Screenshot | null>(null);
  const [remarks, setRemarks] = useState('');
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueDescription, setNewIssueDescription] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [issueOption, setIssueOption] = useState('none');
  const [executionScreenshots, setExecutionScreenshots] = useState<Screenshot[]>([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = () => {
    const allImportedScripts = StorageService.getImportedScripts();
    const projectScripts = allImportedScripts.filter(s => s.projectId === projectId);
    const allIssues = StorageService.getIssues();
    const projectIssues = allIssues.filter(i => i.projectId === projectId);

    setScripts(projectScripts);
    setIssues(projectIssues);
  };

  const getScriptsByStatus = (status: string) => {
    switch (status) {
      case 'all':
        return scripts;
      case 'completed':
        return scripts.filter(s => s.status === 'completed');
      case 'pending':
        return scripts.filter(s => s.status === 'pending' || s.status === 'in-progress');
      case 'with-issues':
        return scripts.filter(s => s.issueIds.length > 0 && s.status !== 'completed');
      default:
        return scripts;
    }
  };

  const handleStartExecution = (script: ImportedScript) => {
    setExecutingScript(script);
    setRemarks(script.remarks || '');
    setExecutionScreenshots(script.executionScreenshots || []);
    setIssueOption('none');
    setSelectedIssue('');
    setNewIssueTitle('');
    setNewIssueDescription('');
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
          setExecutionScreenshots(prev => [...prev, newScreenshot]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleMarkComplete = () => {
    if (!executingScript) return;

    const updatedScript = {
      ...executingScript,
      status: 'completed' as const,
      remarks,
      executionScreenshots
    };

    StorageService.updateImportedScript(executingScript.id, updatedScript);
    loadData();
    setExecutingScript(null);

    toast({
      title: "Success",
      description: "Script marked as complete"
    });
  };

  const handleRaiseIssue = () => {
    if (!executingScript || issueOption === 'none') return;
    
    if (issueOption === 'existing' && !selectedIssue) return;
    if (issueOption === 'new' && !newIssueTitle) return;

    let issueId = selectedIssue;

    // Create new issue if needed
    if (issueOption === 'new' && newIssueTitle) {
      const newIssue: Issue = {
        id: Date.now().toString(),
        issueNumber: StorageService.getNextIssueNumber(projectId!),
        projectId: projectId!,
        scriptId: executingScript.id,
        title: newIssueTitle,
        description: newIssueDescription,
        status: 'open',
        screenshots: executionScreenshots,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      StorageService.addIssue(newIssue);
      issueId = newIssue.id;
    }

    // Update script with issue
    const updatedScript = {
      ...executingScript,
      status: 'with-issues' as const,
      remarks,
      executionScreenshots,
      issueIds: [...(executingScript.issueIds || []), issueId].filter((id, index, arr) => arr.indexOf(id) === index)
    };

    StorageService.updateImportedScript(executingScript.id, updatedScript);
    loadData();
    setExecutingScript(null);

    toast({
      title: "Success",
      description: "Issue raised successfully"
    });
  };

  const handleSave = () => {
    if (!executingScript) return;

    const updatedScript = {
      ...executingScript,
      status: 'in-progress' as const,
      remarks,
      executionScreenshots
    };

    StorageService.updateImportedScript(executingScript.id, updatedScript);
    loadData();
    setExecutingScript(null);

    toast({
      title: "Success",
      description: "Progress saved"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'with-issues':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'in-progress':
        return <Pause className="h-4 w-4 text-primary" />;
      default:
        return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionButton = (script: ImportedScript) => {
    switch (script.status) {
      case 'completed':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStartExecution(script)}
          >
            <Target className="h-4 w-4 mr-2" />
            Retarget
          </Button>
        );
      case 'in-progress':
      case 'with-issues':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStartExecution(script)}
          >
            <Pause className="h-4 w-4 mr-2" />
            Resume
          </Button>
        );
      default:
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStartExecution(script)}
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        );
    }
  };

  const ImageWithPreview = ({ screenshot, className }: { screenshot: Screenshot; className?: string }) => (
    <div className="relative group">
      <img
        src={screenshot.path}
        alt={screenshot.description || screenshot.filename}
        className={`${className} transition-opacity`}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <Button
          size="sm"
          variant="secondary"
          className="bg-background/90 hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            setViewingImage(screenshot);
          }}
        >
          <ZoomIn className="h-4 w-4 mr-1" />
          View
        </Button>
      </div>
    </div>
  );

  const ScriptCard = ({ script }: { script: ImportedScript }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              {getStatusIcon(script.status)}
              <h3 className="font-semibold">{script.scriptId}</h3>
              <Badge variant="secondary">{script.status}</Badge>
              {script.issueIds.length > 0 && (
                <Badge variant="destructive">
                  Issues: {script.issueIds.length}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{script.shortDescription}</p>
            {script.remarks && (
              <p className="text-xs text-muted-foreground">Remarks: {script.remarks}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingScript(script)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {getActionButton(script)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Test Lab
          </h1>
          <p className="text-muted-foreground">
            Execute and track your test scripts
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Scripts ({scripts.length})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({getScriptsByStatus('completed').length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({getScriptsByStatus('pending').length})
            </TabsTrigger>
            <TabsTrigger value="with-issues">
              With Issues ({getScriptsByStatus('with-issues').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'completed', 'pending', 'with-issues'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {getScriptsByStatus(status).map((script) => (
                <ScriptCard key={script.id} script={script} />
              ))}

              {getScriptsByStatus(status).length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      No scripts in this category
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Script Execution Dialog */}
        <Dialog open={!!executingScript} onOpenChange={() => setExecutingScript(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border border-border">
            <DialogHeader>
              <DialogTitle>Execute Script: {executingScript?.scriptId}</DialogTitle>
            </DialogHeader>

            {executingScript && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Test Environment:</strong> {executingScript.testEnvironment}
                  </div>
                  <div>
                    <strong>Test Type:</strong> {executingScript.testType}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Script Details</h4>
                  <div className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
                    {executingScript.scriptDetails}
                  </div>
                </div>

                {executingScript.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Reference Screenshots</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {executingScript.screenshots.map((screenshot) => (
                        <ImageWithPreview
                          key={screenshot.id}
                          screenshot={screenshot}
                          className="w-full h-24 object-cover rounded border cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add your execution remarks..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="screenshots">Add Screenshots</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="execution-screenshots"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('execution-screenshots')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Screenshots
                      </Button>
                    </div>

                    {executionScreenshots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {executionScreenshots.map((screenshot) => (
                          <ImageWithPreview
                            key={screenshot.id}
                            screenshot={screenshot}
                            className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Raise Issue (Optional)</Label>
                      <Select value={issueOption} onValueChange={setIssueOption}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border z-50">
                          <SelectItem value="none">No Issue</SelectItem>
                          <SelectItem value="existing">Link to Existing Issue</SelectItem>
                          <SelectItem value="new">Create New Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {issueOption === 'existing' && (
                      <div>
                        <Label>Select Existing Issue</Label>
                        <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select existing issue" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border z-50">
                            {issues.map((issue) => (
                              <SelectItem key={issue.id} value={issue.id}>
                                Issue #{issue.issueNumber}: {issue.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {issueOption === 'new' && (
                      <div className="space-y-2">
                        <Label>Create New Issue</Label>
                        <Input
                          value={newIssueTitle}
                          onChange={(e) => setNewIssueTitle(e.target.value)}
                          placeholder="Issue title"
                        />
                        <Textarea
                          value={newIssueDescription}
                          onChange={(e) => setNewIssueDescription(e.target.value)}
                          placeholder="Issue description"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setExecutingScript(null)}>
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={handleSave}>
                    Save
                  </Button>
                  {issueOption !== 'none' && (
                    (issueOption === 'existing' && selectedIssue) || 
                    (issueOption === 'new' && newIssueTitle)
                  ) && (
                    <Button variant="destructive" onClick={handleRaiseIssue}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Raise Issue
                    </Button>
                  )}
                  <Button onClick={handleMarkComplete} className="bg-success">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Script Dialog */}
        <Dialog open={!!viewingScript} onOpenChange={() => setViewingScript(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border border-border">
            <DialogHeader>
              <DialogTitle>View Script: {viewingScript?.scriptId}</DialogTitle>
            </DialogHeader>

            {viewingScript && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Status:</strong> {viewingScript.status}</div>
                  <div><strong>Test Type:</strong> {viewingScript.testType}</div>
                  <div><strong>Test Environment:</strong> {viewingScript.testEnvironment}</div>
                  <div><strong>Script ID:</strong> {viewingScript.scriptId}</div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm">{viewingScript.shortDescription}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Purpose</h4>
                  <p className="text-sm">{viewingScript.purpose}</p>
                </div>

                {viewingScript.assumptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Assumptions</h4>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {viewingScript.assumptions.map((assumption, index) => (
                        <li key={index}>{assumption}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Expected Results</h4>
                  <p className="text-sm">{viewingScript.expectedResults}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Script Details</h4>
                  <div className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
                    {viewingScript.scriptDetails}
                  </div>
                </div>

                {viewingScript.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Reference Screenshots</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {viewingScript.screenshots.map((screenshot) => (
                        <div key={screenshot.id} className="space-y-1">
                          <ImageWithPreview
                            screenshot={screenshot}
                            className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          />
                          <p className="text-xs text-muted-foreground">{screenshot.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingScript.executionScreenshots && viewingScript.executionScreenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Execution Screenshots</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {viewingScript.executionScreenshots.map((screenshot) => (
                        <div key={screenshot.id} className="space-y-1">
                          <ImageWithPreview
                            screenshot={screenshot}
                            className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          />
                          <p className="text-xs text-muted-foreground">{screenshot.filename}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingScript.remarks && (
                  <div>
                    <h4 className="font-semibold mb-2">Execution Remarks</h4>
                    <p className="text-sm">{viewingScript.remarks}</p>
                  </div>
                )}

                {viewingScript.issueIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Linked Issues</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingScript.issueIds.map((issueId) => {
                        const issue = issues.find(i => i.id === issueId);
                        return issue ? (
                          <Badge key={issueId} variant="destructive">
                            Issue #{issue.issueNumber}: {issue.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Preview Modal */}
        <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                {viewingImage?.description || viewingImage?.filename || 'Screenshot Preview'}
              </DialogTitle>
            </DialogHeader>
            
            {viewingImage && (
              <div className="p-6 pt-2">
                <div className="flex justify-center items-center bg-muted rounded-lg overflow-hidden">
                  <img
                    src={viewingImage.path}
                    alt={viewingImage.description || viewingImage.filename}
                    className="max-w-full max-h-[70vh] object-contain"
                    style={{ minHeight: '200px' }}
                  />
                </div>
                
                {viewingImage.description && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm text-muted-foreground">{viewingImage.description}</p>
                  </div>
                )}
                
                {viewingImage.filename && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-muted-foreground">Filename: {viewingImage.filename}</p>
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

export default TestLab;