'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDocuments } from '@/hooks/use-documents';
import { useStudioStore } from '@/stores/studio-store';
import { api } from '@/lib/api/client';
import {
  Sparkles,
  Video,
  Music,
  FileText,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type StudioAction = 'generate_audio' | 'generate_video' | 'generate_briefing' | 'generate_study_guide';

const studioActions = [
  {
    id: 'generate_audio' as StudioAction,
    title: 'Generate Audio',
    description: 'Create an audio summary or podcast from your document',
    icon: Music,
  },
  {
    id: 'generate_video' as StudioAction,
    title: 'Generate Video',
    description: 'Create a video presentation from your document',
    icon: Video,
  },
  {
    id: 'generate_briefing' as StudioAction,
    title: 'Generate Briefing',
    description: 'Create a concise briefing document',
    icon: FileText,
  },
  {
    id: 'generate_study_guide' as StudioAction,
    title: 'Generate Study Guide',
    description: 'Create a comprehensive study guide',
    icon: BookOpen,
  },
];

export default function StudioPage() {
  const { data: documentsData, isLoading: docsLoading } = useDocuments();
  const { jobs, addJob, updateJob } = useStudioStore();
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [processingAction, setProcessingAction] = useState<StudioAction | null>(null);

  const handleGenerate = async (action: StudioAction) => {
    if (!selectedDocId) {
      toast.error('Please select a document first');
      return;
    }

    setProcessingAction(action);

    addJob({
      type: action.replace('generate_', '') as 'audio' | 'video' | 'briefing' | 'study_guide',
      status: 'processing',
      doc_id: selectedDocId,
    });

    // Get the ID of the job we just added
    const jobId = useStudioStore.getState().jobs[
      useStudioStore.getState().jobs.length - 1
    ].id;

    try {
      const response = await api.studio({
        action,
        doc_id: selectedDocId,
      });

      if (response.status === 'success') {
        updateJob(jobId, {
          status: 'complete',
          completed_at: new Date(),
          result: response.result,
        });
        toast.success('Generation completed!');
      } else if (response.status === 'error') {
        updateJob(jobId, {
          status: 'error',
          error: response.message || 'Generation failed',
        });
        toast.error(response.message || 'Generation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      updateJob(jobId, {
        status: 'error',
        error: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Studio</h1>
          </div>
          <p className="text-muted-foreground">
            Create videos, audio, briefings, and study guides from your documents
          </p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList>
            <TabsTrigger value="generate">Generate Content</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Document Selection */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select Document</h2>
              {docsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading documents...</span>
                </div>
              ) : documentsData?.documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No documents available</p>
                  <Button asChild>
                    <a href="/upload">Upload Document</a>
                  </Button>
                </div>
              ) : (
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a document..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentsData?.documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.filename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Card>

            {/* Generation Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              {studioActions.map((action) => {
                const Icon = action.icon;
                const isProcessing = processingAction === action.id;

                return (
                  <Card key={action.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {action.description}
                        </p>
                        <Button
                          onClick={() => handleGenerate(action.id)}
                          disabled={!selectedDocId || processingAction !== null}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {jobs.length === 0 ? (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No generation history</h2>
                  <p className="text-muted-foreground">
                    Your generated content will appear here
                  </p>
                </div>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {job.type === 'audio' && <Music className="h-5 w-5" />}
                      {job.type === 'video' && <Video className="h-5 w-5" />}
                      {job.type === 'briefing' && <FileText className="h-5 w-5" />}
                      {job.type === 'study_guide' && <BookOpen className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold capitalize">
                          {job.type.replace('_', ' ')}
                        </h3>
                        {job.status === 'complete' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {job.status === 'error' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {job.status === 'processing' && (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{format(job.created_at, 'PPp')}</span>
                        <span>•</span>
                        <Badge variant="outline">{job.status}</Badge>
                      </div>
                      {job.error && (
                        <p className="text-sm text-red-500 mb-2">{job.error}</p>
                      )}
                      {job.result?.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={job.result.url} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      )}
                      {job.result?.content && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm whitespace-pre-wrap line-clamp-3">
                            {job.result.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
