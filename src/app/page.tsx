"use client";

import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  timestamp: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [validUrl, setValidUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = useCallback((type: "success" | "error" | "info", message: string) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [...prev, { timestamp, type, message }]);
  }, []);

  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl.trim()) {
      return false;
    }

    try {
      const urlObj = new URL(inputUrl);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleLoad = () => {
    if (url.trim() === "") {
      setValidUrl(null);
      setIframeError(false);
      setIsLoading(false);
      addLog("error", "Por favor, digite uma URL");
      return;
    }

    if (validateUrl(url)) {
      setValidUrl(url);
      setIframeError(false);
      setIsLoading(true);
      addLog("success", `URL válida carregada: ${url}`);
    } else {
      setValidUrl(null);
      setIframeError(false);
      setIsLoading(false);
      addLog("error", `URL inválida: ${url}`);
    }
  };

  useEffect(() => {
    addLog("info", "Aplicação inicializada");
  }, [addLog]);

  // Timeout para detectar erros de carregamento do iframe
  useEffect(() => {
    if (!validUrl || !isLoading) return;

    const timeoutId = setTimeout(() => {
      // Se ainda está carregando após 10 segundos, considera como erro
      if (isLoading) {
        setIsLoading(false);
        setIframeError(true);
        addLog("error", "Timeout ao carregar o iframe (10 segundos)");
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [validUrl, isLoading, addLog]);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#d9d9d9' }}>
      <main className="max-w-4xl mx-auto space-y-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <label
            htmlFor="url-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Digite a URL para embedar:
          </label>
          <div className="flex gap-3">
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLoad();
                }
              }}
              placeholder="https://exemplo.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-base"
            />
            <button
              onClick={handleLoad}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            >
              Carregar
            </button>
          </div>
        </div>

        {/* Iframe Preview Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Preview do Iframe
          </h2>
          {validUrl ? (
            iframeError ? (
              <div className="border border-red-300 rounded-lg h-[600px] flex flex-col items-center justify-center bg-red-50">
                <div className="text-center space-y-4 px-4">
                  <div className="text-6xl">⚠️</div>
                  <div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                      Erro ao carregar o iframe
                    </h3>
                    <p className="text-red-500 mb-4">
                      Não foi possível carregar o conteúdo da URL: {validUrl}
                    </p>
                    <p className="text-sm text-gray-600">
                      Possíveis causas:
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                      <li>A URL não permite ser embedada (X-Frame-Options)</li>
                      <li>Problemas de CORS ou segurança</li>
                      <li>A página não existe ou está inacessível</li>
                      <li>Timeout ao carregar o conteúdo</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg overflow-hidden relative shadow-inner">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">
                        Carregando...
                      </p>
                    </div>
                  </div>
                )}
                <iframe
                  src={validUrl}
                  className="w-full h-[600px] border-0"
                  title="Preview"
                  onLoad={() => {
                    setIsLoading(false);
                    setIframeError(false);
                    addLog("success", "Iframe carregado com sucesso");
                  }}
                  onError={() => {
                    setIsLoading(false);
                    setIframeError(true);
                    addLog("error", "Erro ao carregar o iframe");
                  }}
                />
              </div>
            )
          ) : (
            <div className="border border-gray-300 rounded-lg h-[600px] flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">
                Digite uma URL válida e clique em "Carregar" para ver o preview
              </p>
            </div>
          )}
        </div>

        {/* Logs Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Logs
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 h-[300px] overflow-y-auto font-mono text-sm shadow-inner">
            {logs.length === 0 ? (
              <p className="text-gray-400">
                Nenhum log ainda...
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      log.type === "error"
                        ? "text-red-400"
                        : log.type === "success"
                        ? "text-green-400"
                        : "text-blue-400"
                    }`}
                  >
                    <span className="text-gray-400 shrink-0">
                      [{log.timestamp}]
                    </span>
                    <span
                      className={`font-semibold shrink-0 ${
                        log.type === "error"
                          ? "text-red-500"
                          : log.type === "success"
                          ? "text-green-500"
                          : "text-blue-500"
                      }`}
                    >
                      [{log.type.toUpperCase()}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
