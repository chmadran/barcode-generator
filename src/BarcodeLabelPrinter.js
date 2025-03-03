import React, { useState, useEffect, useRef } from 'react';

const BarcodeLabelPrinter = () => {
  const [prefix, setPrefix] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const [count, setCount] = useState(24);
  const [locationId, setLocationId] = useState('');
  const [year] = useState(new Date().getFullYear().toString());
  const [barcodes, setBarcodes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const printRef = useRef(null);

  // Generate the barcode data
  const generateBarcodes = () => {
    const newBarcodes = [];
    const start = parseInt(startNumber, 10);
    
    for (let i = 0; i < count; i++) {
      const uniqueId = prefix + (start + i).toString().padStart(4, '0');
      const barcodeData = `${uniqueId}|${locationId}|${year}`;
      newBarcodes.push({
        id: i,
        data: barcodeData,
        uniqueId: uniqueId
      });
    }
    
    setBarcodes(newBarcodes);
    setShowInstructions(false);
  };

  // Handle printing
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .print-sheet {
              width: 210mm;
              height: 297mm;
              display: grid;
              grid-template-columns: repeat(3, 70mm);
              grid-template-rows: repeat(8, 36mm);
              gap: 0;
            }
            .barcode-cell {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2mm;
              box-sizing: border-box;
              border: 1px dashed #eee;
            }
            .barcode-value {
              font-size: 10px;
              margin-top: 2mm;
            }
            svg {
              max-width: 66mm;
              max-height: 20mm;
            }
            @media print {
              .barcode-cell {
                border: none;
              }
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>
            document.querySelectorAll('.barcode-placeholder').forEach((placeholder) => {
              const data = placeholder.getAttribute('data-code');
              JsBarcode(placeholder, data, {
                format: "CODE128",
                width: 2,
                height: 40,
                displayValue: false,
                margin: 0
              });
            });
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Barcode Label Sheet Generator</h1>
      <p className="mb-4 text-gray-600">For TopStick 8400 A4 labels (70 x 36 mm, 24 labels per sheet)</p>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Préfixe Bénéficiaire</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="ex: B"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de départ</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre d'étiquettes</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              min="1"
              max="24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Identifiant Antenne</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="ex: PAR01"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={generateBarcodes}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={!locationId}
          >
            Générer
          </button>
          
          {barcodes.length > 0 && (
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Imprimer
            </button>
          )}
        </div>
      </div>
      
      {showInstructions && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Entrez un préfixe (optionnel) pour vos codes-barres</li>
            <li>Définissez le numéro de départ</li>
            <li>Choisissez le nombre d'étiquettes à générer (max 24 par page)</li>
            <li>Entrez l'identifiant de votre antenne</li>
            <li>Cliquez sur "Générer" pour créer les codes-barres</li>
            <li>Utilisez le bouton "Imprimer" pour ouvrir la boîte de dialogue d'impression</li>
            <li>Dans les options d'impression, assurez-vous que la mise à l'échelle est désactivée (100%)</li>
          </ol>
        </div>
      )}
      
      {barcodes.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Aperçu</h2>
          <div className="border rounded p-4 overflow-auto">
            <div 
              ref={printRef}
              className="print-sheet w-full aspect-[210/297] bg-white grid grid-cols-3 grid-rows-8 gap-0"
            >
              {barcodes.map((barcode) => (
                <div key={barcode.id} className="barcode-cell border border-gray-200 flex flex-col items-center justify-center p-2">
                  <svg 
                    className="barcode-placeholder w-full h-10" 
                    data-code={barcode.data}
                  ></svg>
                  <div className="barcode-value text-xs mt-1">{barcode.uniqueId} | {locationId} | {year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeLabelPrinter;