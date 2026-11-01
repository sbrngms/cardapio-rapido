import { useRef, useState } from "react";
import { Upload, ImagePlus, FileImage, X, Sparkles } from "lucide-react";

interface UploadZoneProps {
  onProcess: (file: File) => void;
  disabled: boolean;
}

export function UploadZone({ onProcess, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearPreview() {
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <div className="mb-8 text-center animate-fade-in">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-warm-100 px-3 py-1 text-xs font-medium text-warm-700">
          <Sparkles className="h-3.5 w-3.5" />
          Inteligência artificial gastronômica
        </div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-charcoal-800 sm:text-4xl">
          Transforme a foto do seu cardápio
          <br />
          <span className="text-warm-600">em um delivery digital</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-charcoal-700/70">
          Envie uma foto do cardápio de papel ou quadro. A IA lê os pratos e
          preços, cria descrições vendedoras, tags e sugere combos — tudo
          editável e pronto para exportar.
        </p>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`group cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
            isDragging
              ? "border-warm-500 bg-warm-50 scale-[1.01]"
              : "border-charcoal-800/15 bg-white/50 hover:border-warm-400 hover:bg-white/70"
          }`}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-100 transition-transform duration-300 group-hover:scale-110">
            <ImagePlus className="h-8 w-8 text-warm-600" strokeWidth={1.8} />
          </div>
          <p className="font-medium text-charcoal-800">
            Arraste a foto aqui ou clique para enviar
          </p>
          <p className="mt-1 text-xs text-charcoal-700/50">
            JPG, PNG ou WEBP — cardápio de papel, quadro ou impresso
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <div className="animate-slide-up rounded-3xl border border-charcoal-800/5 bg-white/80 p-4 shadow-card sm:p-6">
          <div className="relative">
            <img
              src={preview}
              alt="Pré-visualização do cardápio"
              className="mx-auto max-h-64 w-auto rounded-2xl object-contain"
            />
            <button
              onClick={clearPreview}
              disabled={disabled}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-900/60 text-white backdrop-blur-sm transition-colors hover:bg-charcoal-900 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm text-charcoal-700/70">
              <FileImage className="h-4 w-4 shrink-0 text-warm-500" />
              <span className="truncate">{fileName}</span>
            </div>
            <button
              onClick={() => preview && onProcess(dataUrlToFile(preview, fileName))}
              disabled={disabled}
              className="btn-primary shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              Analisar cardápio
            </button>
          </div>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={disabled}
          className="btn-ghost"
        >
          <Upload className="h-4 w-4" />
          Tirar foto agora
        </button>
      </div>
    </div>
  );
}

function dataUrlToFile(dataUrl: string, name: string): File {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], name || "cardapio.jpg", { type: mime });
}
