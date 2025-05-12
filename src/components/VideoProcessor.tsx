
import { useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";

interface VideoProcessorProps {
  file: File;
  onReset: () => void;
}

const VideoProcessor = ({ file, onReset }: VideoProcessorProps) => {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);

  useEffect(() => {
    // Initialize FFmpeg
    const initFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on("progress", ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });

        // Load ffmpeg core
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });

        setFFmpeg(ffmpegInstance);
        setIsReady(true);
      } catch (error) {
        console.error("Error initializing FFmpeg:", error);
        toast.error("Erro ao inicializar o processador de vídeo");
      }
    };

    initFFmpeg();
  }, []);

  const processVideo = async () => {
    if (!ffmpeg || !isReady) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      
      // Read original file size
      setOriginalSize(file.size);

      // Write the file to memory
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));

      // Execute the ffmpeg command to reduce file size
      // Using a lower bitrate and resolution
      await ffmpeg.exec([
        "-i", "input.mp4", 
        "-c:v", "libx264",
        "-crf", "28", // Higher CRF means lower quality but smaller file size
        "-preset", "medium", // Balance between encoding speed and compression
        "-c:a", "aac",
        "-b:a", "128k", // Reduce audio bitrate
        "-movflags", "+faststart",
        "output.mp4"
      ]);

      // Read the result
      const outputData = await ffmpeg.readFile("output.mp4");
      
      // Create a URL for the output
      const blob = new Blob([outputData], { type: "video/mp4" });
      setNewSize(blob.size);
      
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      
      toast.success("Vídeo reduzido com sucesso!");
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Erro ao processar o vídeo");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Start processing automatically when ffmpeg is ready
    if (isReady && !isProcessing && !outputUrl) {
      processVideo();
    }
  }, [isReady]);

  // Format file size to human-readable
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Calculate size reduction in percentage
  const calculateReduction = (): string => {
    if (originalSize === 0 || newSize === 0) return "0%";
    const reduction = ((originalSize - newSize) / originalSize) * 100;
    return `${reduction.toFixed(1)}%`;
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    
    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `reduced_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{file.name}</h3>
        <p className="text-sm text-muted-foreground">
          Tamanho original: {formatFileSize(originalSize)}
        </p>
      </div>

      {isProcessing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin h-5 w-5" />
            <p>Processando vídeo...</p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm">{progress}%</p>
        </div>
      ) : outputUrl ? (
        <div className="space-y-6">
          <div className="rounded-lg overflow-hidden">
            <video 
              src={outputUrl} 
              controls 
              className="w-full max-h-[300px]"
            />
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tamanho Original</p>
                <p className="text-lg font-medium">{formatFileSize(originalSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Novo Tamanho</p>
                <p className="text-lg font-medium">{formatFileSize(newSize)}</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-muted-foreground">Redução</p>
              <p className="text-lg font-medium text-primary">{calculateReduction()}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleDownload} className="w-full max-w-xs">
              <Download className="mr-2 h-4 w-4" />
              Baixar Vídeo Reduzido
            </Button>
            <Button variant="outline" onClick={onReset}>
              Processar outro vídeo
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button onClick={processVideo} disabled={!isReady}>
            {isReady ? "Iniciar Processamento" : "Carregando..."}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoProcessor;
