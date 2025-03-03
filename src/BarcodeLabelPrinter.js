import React, { useState, useEffect, useRef } from 'react';

const BarcodeLabelPrinter = () => {
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
      // Utiliser toString() sans padStart pour éviter les zéros en préfixe
      const uniqueId = (start + i).toString();
      const barcodeData = `${uniqueId}`;
      newBarcodes.push({
        id: i,
        data: barcodeData,
        uniqueId: uniqueId
      });
    }
    
    setBarcodes(newBarcodes);
    setShowInstructions(false);
  };

  // Handle PDF download
  const handleDownload = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcodes PDF</title>
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
              /* Réduire la hauteur totale pour accommoder les marges */
              height: 287mm; /* 297mm (A4) - 10mm (marges) */
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              /* Ajuster la hauteur des rangées pour les 8 étiquettes */
              grid-template-rows: repeat(8, calc(287mm / 8));
              gap: 0;
              /* Marges en haut et en bas */
              margin: 5mm 0;
              padding: 0;
            }
            .barcode-cell {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0;
              box-sizing: border-box;
              border: 1px dashed #eee;
              /* Hauteur calculée automatiquement */
              height: 100%;
              overflow: hidden;
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
            #download-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              z-index: 999;
            }
            @media print {
              #download-button {
                display: none;
              }
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        </head>
        <body>
          ${printContent.outerHTML}
          <button id="download-button">Télécharger en PDF</button>
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
            
            // Configuration du PDF
            const element = document.querySelector('.print-sheet');
            const opt = {
              margin: 0, // pas de marges dans le PDF lui-même
              filename: 'barcode-etiquettes.pdf',
              image: { type: 'svg', quality: 1 },
              html2canvas: { 
                scale: 2, 
                useCORS: true,
                letterRendering: true,
                width: element.offsetWidth,
                height: element.offsetHeight
              },
              jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                pagesplit: false
              },
              pagebreak: { mode: 'avoid-all' }
            };
            
            // Fonction de téléchargement PDF
            document.getElementById('download-button').addEventListener('click', function() {
              this.style.display = 'none'; // Cacher le bouton pendant la génération
              
              // Préparer l'élément en supprimant tout ce qui n'est pas nécessaire
              const clonedElement = element.cloneNode(true);
              
              // Générer le PDF avec des dimensions exactes de A4
              html2pdf()
                .set(opt)
                .from(clonedElement)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                  // Vérifier et ajuster les dimensions
                  const totalPages = pdf.internal.getNumberOfPages();
                  if (totalPages > 1) {
                    // Supprimer les pages supplémentaires
                    while (pdf.internal.getNumberOfPages() > 1) {
                      pdf.deletePage(pdf.internal.getNumberOfPages());
                    }
                  }
                  pdf.save('barcode-etiquettes.pdf');
                  this.style.display = 'block'; // Réafficher le bouton
                });
            });
            
            // Démarrer automatiquement le téléchargement après le rendu
            setTimeout(() => {
              document.getElementById('download-button').click();
            }, 1000);
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
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={generateBarcodes}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Générer
          </button>
          
          {barcodes.length > 0 && (
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Télécharger
            </button>
          )}
        </div>
      </div>
      
      {showInstructions && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Définissez le numéro de départ (beneficiaire)</li>
            <li>Choisissez le nombre d'étiquettes à générer (max 24 par page)</li>
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
                  <div className="barcode-value text-xs mt-1">{barcode.uniqueId}</div>
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