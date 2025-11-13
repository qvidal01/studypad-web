'use client';

import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUploadDocument } from '@/hooks/use-documents';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';

interface UploadItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  docId?: string;
}

export default function UploadPage() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadDocument();

  const validateFiles = useCallback((files: File[]): { valid: File[]; invalid: File[] } => {
    const valid: File[] = [];
    const invalid: File[] = [];

    files.forEach((file) => {
      // Check file type
      if (!config.upload.allowedTypes.includes(file.type)) {
        invalid.push(file);
        toast.error(`${file.name} is not a PDF file`);
        return;
      }

      // Check file size
      if (file.size > config.upload.maxSize) {
        invalid.push(file);
        toast.error(
          `${file.name} exceeds maximum size of ${config.upload.maxFileSizeMB}MB`
        );
        return;
      }

      valid.push(file);
    });

    return { valid, invalid };
  }, []);

  const uploadFile = useCallback(
    async (upload: UploadItem) => {
      setUploads((prev) =>
        prev.map((u) => (u.file === upload.file ? { ...u, status: 'uploading' } : u))
      );

      try {
        const data = await uploadMutation.mutateAsync({
          file: upload.file,
          onProgress: (progress) => {
            setUploads((prev) =>
              prev.map((u) => (u.file === upload.file ? { ...u, progress } : u))
            );
          },
        });

        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file
              ? { ...u, status: 'complete', progress: 100, docId: data.doc_id }
              : u
          )
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file ? { ...u, status: 'error', error: errorMessage } : u
          )
        );
      }
    },
    [uploadMutation]
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const { valid: validFiles } = validateFiles(files);

      if (validFiles.length === 0) {
        toast.error('No valid files to upload');
        return;
      }

      const newUploads: UploadItem[] = validFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending',
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Upload files one by one
      for (const upload of newUploads) {
        await uploadFile(upload);
      }
    },
    [validateFiles, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status !== 'complete'));
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Upload Documents</h1>
          <p className="text-muted-foreground">
            Upload PDF files to add them to your knowledge base
          </p>
        </div>

        {/* Upload Area */}
        <Card
          className={`mb-6 p-8 border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF files up to {config.upload.maxFileSizeMB}MB
            </p>
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
                  onChange={handleFileInput}
                />
              </label>
            </Button>
          </div>
        </Card>

        {/* Upload List */}
        {uploads.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Uploads ({uploads.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                disabled={!uploads.some((u) => u.status === 'complete')}
              >
                Clear Completed
              </Button>
            </div>

            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium truncate">{upload.file.name}</p>
                        {upload.status === 'complete' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                        {upload.status === 'error' && (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        {(upload.status === 'uploading' ||
                          upload.status === 'processing') && (
                          <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {upload.status}
                        </Badge>
                      </div>

                      {(upload.status === 'uploading' ||
                        upload.status === 'processing') && (
                        <Progress value={upload.progress} className="h-2" />
                      )}

                      {upload.status === 'error' && (
                        <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                      )}

                      {upload.status === 'complete' && upload.docId && (
                        <p className="text-xs text-green-600 mt-1">
                          Successfully uploaded (ID: {upload.docId})
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
