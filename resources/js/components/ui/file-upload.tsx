// derived from: github.com/kwesinavilot/shadcn-file-upload
import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadIcon, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { z } from 'zod';

export interface FileWithPreview extends File {
  preview: string;
}

interface FileUploadProps {
  layout?: 'vertical' | 'horizontal';
  uploadMode?: 'single' | 'multi';
  defaultText?: string;
  otherText?: string;
  maxSize?: number;
  acceptedFileTypes?: Record<string, string[]>;
  onFilesUploaded: (files: FileWithPreview | FileWithPreview[] | null) => void;
  zodSchema?: z.ZodSchema;
  errors?: string | string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  layout = 'vertical',
  uploadMode = 'single',
  defaultText = 'Select or drag and drop your files here',
  otherText = '(up to 10MB)',
  maxSize = 10 * 1024 * 1024,
  acceptedFileTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
    'text/markdown': ['.md'],
    
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'video/mp4': ['.mp4'],
    
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
    'application/x-tar': ['.tar'],
  },
  onFilesUploaded,
  zodSchema,
  errors: externalErrors
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [internalErrors, setInternalErrors] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file) {
      return "No file selected";
    }

    if (zodSchema) {
      try {
        zodSchema.parse({ file });
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || "Invalid file";
        }
        return "Invalid file";
      }
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (acceptedFiles.length === 0) {
      setInternalErrors("No valid files were dropped");
      return;
    }

    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      }) as FileWithPreview
    );

    if (uploadMode === 'single') {
      const validationError = validateFile(newFiles[0]);

      if (!validationError) {
        setFiles([newFiles[0]]);
        onFilesUploaded(newFiles[0]);
        setInternalErrors(null);
      } else {
        setInternalErrors(validationError);
      }
    } else {
      const errors = newFiles.map(validateFile).filter(Boolean);

      if (errors.length === 0) {
        setFiles(prev => [...prev, ...newFiles]);
        onFilesUploaded(newFiles);
        setInternalErrors(null);
      } else {
        setInternalErrors(errors[0]);
      }
    }
  }, [uploadMode, onFilesUploaded, zodSchema]);

  const removeFile = (fileToRemove: FileWithPreview) => {
    const newFiles = files.filter(f => f !== fileToRemove);
    setFiles(newFiles);
    onFilesUploaded(uploadMode === 'single' ? null : newFiles);
    setInternalErrors(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    multiple: uploadMode === 'multi'
  });

  const dropzoneClasses = cn(
    "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
    isDragActive ? "border-blue-500 bg-blue-50" : (internalErrors || externalErrors) ? "border-red-500" : "border-gray-300 hover:border-gray-400",
    layout === 'horizontal' ? "flex items-center justify-center space-x-4" : "flex flex-col justify-center items-center space-y-2"
  );

  const renderDropzone = () => (
    <>
      <div {...getRootProps({ className: dropzoneClasses })}>
        <input {...getInputProps()} />
        <UploadIcon className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-gray-600">{defaultText}</p>
        <p className="text-xs text-gray-500">{otherText}</p>
      </div>

      {(internalErrors || externalErrors) && (
        <p className="text-xs font-medium text-red-500 mt-2">
          {internalErrors || (Array.isArray(externalErrors) ? externalErrors.join(', ') : externalErrors)}
        </p>
      )}
    </>
  );

  const renderFileList = () => (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div key={index} className="max-w-[250px] flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 shadow">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center p-5">
              <span className="text-xs font-medium">{file.name.split('.').pop()?.toUpperCase()}</span>
            </div>

            <div className='flex flex-col space-y-1'>
              <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => removeFile(file)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className='p-2'>
      {(uploadMode === 'multi' || files.length === 0) && renderDropzone()}
      {renderFileList()}
    </div>
  );
};

export { FileUpload };