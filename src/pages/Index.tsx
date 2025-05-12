
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import VideoProcessor from "@/components/VideoProcessor";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-white">MP4 Redutor</h1>
          <p className="text-xl text-white/80">
            Reduza o tamanho dos seus arquivos MP4 rapidamente e diretamente no navegador
          </p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 md:p-8">
          {!selectedFile ? (
            <FileUploader onFileSelect={handleFileSelect} />
          ) : (
            <VideoProcessor file={selectedFile} onReset={handleReset} />
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-white/70">
          <p>Este serviço processa seus vídeos diretamente no navegador, nenhum dado é enviado para servidores.</p>
          <p className="mt-2">Todos os direitos reservados &copy; MP4 Redutor 2025</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
