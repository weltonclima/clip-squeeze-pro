
import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

const FileUploader = ({
  onFileSelect,
  accept = "video/mp4",
  maxSize = 500 * 1024 * 1024, // 500MB default
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.includes("video/mp4")) {
      setErrorMessage("Apenas arquivos MP4 são permitidos");
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      setErrorMessage(`O tamanho do arquivo deve ser menor que ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`file-drop-area p-10 flex flex-col items-center justify-center ${
          isDragging ? "active border-primary" : "border-muted-foreground"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept={accept}
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <UploadCloud className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">
              Arraste e solte seu arquivo MP4 aqui
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ou
            </p>
          </div>
          <Button onClick={triggerFileSelect} variant="outline">
            Selecionar arquivo
          </Button>
          <p className="text-xs text-muted-foreground">
            MP4 até 500MB
          </p>
        </div>
      </div>
      {errorMessage && (
        <div className="mt-2 text-destructive text-sm">{errorMessage}</div>
      )}
    </div>
  );
};

export default FileUploader;
