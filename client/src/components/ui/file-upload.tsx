import React, { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  id: string;
  accept?: string;
  maxSize?: number;
  onChange: (file: File | null) => void;
  value?: File | null;
  className?: string;
}

export function FileUpload({
  id,
  accept = '.pdf,.doc,.docx,.ppt,.pptx',
  maxSize = 10 * 1024 * 1024, // 10MB default
  onChange,
  value,
  className,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      return false;
    }

    // Check file type if accept is provided
    if (accept) {
      const acceptedTypes = accept.split(',');
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const isValidType = acceptedTypes.some(type => {
        // Handle MIME types or extensions
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        return file.type === type;
      });

      if (!isValidType) {
        setError(`Invalid file type. Accepted types: ${accept}`);
        return false;
      }
    }

    setError(null);
    return true;
  }, [accept, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onChange(file);
      }
    }
  }, [onChange, validateFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onChange(file);
      }
    }
  }, [onChange, validateFile]);

  const handleRemove = useCallback(() => {
    onChange(null);
    setError(null);
  }, [onChange]);

  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 block">File Upload</Label>
      
      {!value ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center',
            dragging ? 'border-primary bg-primary/5' : 'border-gray-300',
            'transition-colors duration-200'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIcon className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-2 text-center">
            Drag and drop a file here, or click to select a file
          </p>
          <p className="text-xs text-gray-500 mb-3 text-center">
            Supports: {accept || 'any file type'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(id)?.click()}
          >
            Select File
          </Button>
          <Input 
            type="file"
            id={id}
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center">
            <FileIcon className="h-6 w-6 text-blue-500 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {value.name}
              </p>
              <p className="text-xs text-gray-500">
                {(value.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleRemove}
              className="text-gray-500 hover:text-red-500"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
