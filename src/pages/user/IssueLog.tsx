import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StorageService } from '@/utils/storage';
import { Issue, ImportedScript } from '@/types';
import { Eye, Bug, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const IssueLog = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [scripts, setScripts] = useState<ImportedScript[]>([]);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = () => {
    const allIssues = StorageService.getIssues();
    const projectIssues = allIssues.filter(i => i.projectId === projectId);
    const allImportedScripts = StorageService.getImportedScripts();
    const projectScripts = allImportedScripts.filter(s => s.projectId === projectId);
    
    setIssues(projectIssues);
    setScripts(projectScripts);
  };

  const getScriptById = (scriptId: string) => {
    return scripts.find(s => s.id === scriptId);
  };

  const handleMarkFixed = (issueId: string) => {
    StorageService.updateIssue(issueId, {
      status: 'fixed',
      updatedAt: new Date().toISOString()
    });
    loadData();
    setViewingIssue(null);
    
    toast({
      title: "Success",
      description: "Issue marked as fixed"
    });
  };

  const handleReopen = (issueId: string) => {
    StorageService.updateIssue(issueId, {
      status: 'reopened',
      updatedAt: new Date().toISOString()
    });
    loadData();
    setViewingIssue(null);
    
    toast({
      title: "Success", 
      description: "Issue reopened"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fixed':
        return 'default';
      case 'reopened':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed':
        return <CheckCircle className="h-4 w-4" />;
      case 'reopened':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Issue Log
          </h1>
          <p className="text-muted-foreground">
            Track and manage test execution issues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bug className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{issues.filter(i => i.status === 'open').length}</p>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{issues.filter(i => i.status === 'fixed').length}</p>
                  <p className="text-sm text-muted-foreground">Fixed Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{issues.filter(i => i.status === 'reopened').length}</p>
                  <p className="text-sm text-muted-foreground">Reopened Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {issues.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No issues logged</p>
                  <p className="text-muted-foreground">
                    Issues will appear here when raised during test execution
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            issues
              .sort((a, b) => b.issueNumber - a.issueNumber)
              .map((issue) => {
                const script = getScriptById(issue.scriptId);
                return (
                  <Card key={issue.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(issue.status)}
                            <h3 className="text-lg font-semibold">
                              Issue #{issue.issueNumber}: {issue.title}
                            </h3>
                            <Badge variant={getStatusColor(issue.status)}>
                              {issue.status}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground">{issue.description}</p>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <strong>Script:</strong> {script?.scriptId || 'Unknown Script'}
                            </p>
                            <p>
                              <strong>Created:</strong> {new Date(issue.createdAt).toLocaleString()}
                            </p>
                            {issue.updatedAt !== issue.createdAt && (
                              <p>
                                <strong>Updated:</strong> {new Date(issue.updatedAt).toLocaleString()}
                              </p>
                            )}
                            {issue.screenshots.length > 0 && (
                              <p>
                                <strong>Screenshots:</strong> {issue.screenshots.length}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingIssue(issue)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </div>

        {/* View Issue Dialog */}
        <Dialog open={!!viewingIssue} onOpenChange={() => setViewingIssue(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border border-border">
            <DialogHeader>
              <DialogTitle>
                Issue #{viewingIssue?.issueNumber}: {viewingIssue?.title}
              </DialogTitle>
            </DialogHeader>
            
            {viewingIssue && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(viewingIssue.status)}
                  <Badge variant={getStatusColor(viewingIssue.status)}>
                    {viewingIssue.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm">{viewingIssue.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Related Script</h4>
                  <p className="text-sm">
                    {getScriptById(viewingIssue.scriptId)?.scriptId || 'Unknown Script'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Created:</strong> {new Date(viewingIssue.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Last Updated:</strong> {new Date(viewingIssue.updatedAt).toLocaleString()}
                  </div>
                </div>

                {viewingIssue.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Screenshots</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingIssue.screenshots.map((screenshot) => (
                        <div key={screenshot.id} className="space-y-2">
                          <img
                            src={screenshot.path}
                            alt={screenshot.description}
                            className="w-full h-48 object-cover rounded border cursor-pointer"
                            onClick={() => window.open(screenshot.path, '_blank')}
                          />
                          <p className="text-xs text-muted-foreground">
                            {screenshot.description || screenshot.filename}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setViewingIssue(null)}
                  >
                    Close
                  </Button>
                  
                  {viewingIssue.status === 'open' || viewingIssue.status === 'reopened' ? (
                    <Button 
                      onClick={() => handleMarkFixed(viewingIssue.id)}
                      className="bg-success"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Fixed
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive"
                      onClick={() => handleReopen(viewingIssue.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default IssueLog;