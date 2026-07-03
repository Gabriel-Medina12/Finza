import React, { useState } from 'react';

export default function Scanner({ onScanSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStartOCR = () => {
    if (!selectedFile) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const mimeType = selectedFile.type;
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Analiza esta imagen de factura o ticket de compra. Extrae los siguientes datos en formato JSON:\n{\n  \"amount\": total a pagar como número decimal (ej. 15.50),\n  \"currency\": moneda detectada (una de: 'USD', 'VES', 'EUR', 'USDT'),\n  \"description\": nombre del comercio y breve detalle (ej. 'Farmatodo Las Mercedes'),\n  \"categoryId\": categoría sugerida (una de: 'food' para comida/restaurantes, 'moto' para repuestos/taller/gasolina/transporte, 'health' para farmacias/médicos/salud, 'barber' para peluquerías/estética, 'gym' para gimnasio/deportes, 'rent' para alquileres)\n}\nResponde ÚNICAMENTE con el objeto JSON válido, sin bloques de código ``` ni texto adicional."
                    },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                      }
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        // Limpiar bloques de código markdown
        const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanedJson);

        setLoading(false);
        onScanSuccess({
          amount: Number(result.amount) || 0,
          currency: result.currency || 'USD',
          description: result.description || 'Factura Escaneada',
          categoryId: result.categoryId || 'food',
          date: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error en escáner OCR:", error);
        alert("Error al procesar la factura con la IA de Gemini. Por favor inténtalo de nuevo.");
        setLoading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="max-w-md mx-auto py-md flex flex-col gap-sm pb-12 select-none">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-headline-sm text-lg text-on-surface font-semibold">Escáner de Facturas (IA)</h3>
        <button onClick={onCancel} className="text-sm text-primary flex items-center gap-1 active-shrink">
          Cancelar
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center border border-dashed border-white/20 min-h-[300px] relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center z-10">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <div>
              <p className="text-sm font-semibold text-white">Subiendo y Procesando Ticket...</p>
              <p className="text-[11px] text-on-surface-variant mt-1 max-w-[240px]">
                Gemini Flash Lite está analizando el RIF, IVA, razón social y monto de la factura.
              </p>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="w-full flex flex-col items-center gap-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-[220px] rounded-xl object-contain border border-white/10"
            />
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="flex-1 py-3 bg-surface-container-high text-white font-semibold rounded-xl text-xs active-shrink"
              >
                Volver a Tomar
              </button>
              <button
                onClick={handleStartOCR}
                className="flex-1 py-3 bg-primary-container text-white font-bold rounded-xl text-xs active-shrink hover:bg-primary-container/95"
              >
                Escanear con IA
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center cursor-pointer group">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
              photo_camera
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Capturar Factura o Subir Ticket</p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Toma una foto nítida de la factura del comercio
              </p>
            </div>
            <label className="mt-2 px-4 py-2 bg-surface-container-high rounded-xl text-xs font-semibold text-white border border-white/5 active-shrink cursor-pointer hover:border-primary/30">
              Seleccionar Archivo
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
