import React, { useState, useEffect, useRef } from 'react';

const BarcodeLabelPrinter = () => {
  const [startNumber, setStartNumber] = useState(1);
  const [count, setCount] = useState(24);
  const [sheetCount, setSheetCount] = useState(1);
  const [locationId, setLocationId] = useState('');
  const [year] = useState(new Date().getFullYear().toString());
  const [barcodes, setBarcodes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const printRef = useRef(null);

  // Generate the barcode data for all sheets
  const generateBarcodes = () => {
    const newBarcodes = [];
    const start = parseInt(startNumber, 10);
    
    for (let sheetIndex = 0; sheetIndex < sheetCount; sheetIndex++) {
      const sheetBarcodes = [];
      const startForSheet = start + (sheetIndex * count);
      
      for (let i = 0; i < count; i++) {
        const uniqueId = (startForSheet + i).toString();
        const barcodeData = `${uniqueId}`;
        sheetBarcodes.push({
          id: `${sheetIndex}-${i}`,
          data: barcodeData,
          uniqueId: uniqueId
        });
      }
      
      newBarcodes.push(sheetBarcodes);
    }
    
    setBarcodes(newBarcodes);
    setShowInstructions(false);
  };

  // Handle PDF download (one sheet at a time to maintain format)
  const handleDownload = () => {
    // Créer une nouvelle fenêtre pour générer le PDF
    const printWindow = window.open('', '_blank');
    
    // Construire le contenu pour chaque feuille
    let sheetsHTML = '';
    barcodes.forEach((sheetBarcodes, index) => {
      const sheetContent = `
        <div class="print-sheet" id="sheet-${index}">
          ${sheetBarcodes.map(barcode => `
            <div class="barcode-cell">
              <svg class="barcode-placeholder" data-code="${barcode.data}"></svg>
              <div class="barcode-value">${barcode.uniqueId}</div>
            </div>
          `).join('')}
        </div>
      `;
      sheetsHTML += sheetContent;
    });
    
    // Injecter le HTML dans la nouvelle fenêtre
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
            .container {
              width: 100%;
            }
            .print-sheet {
              width: 210mm;
              height: 287mm; /* 297mm (A4) - 10mm (marges) */
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(8, calc(287mm / 8));
              gap: 0;
              margin: 5mm 0;
              padding: 0;
              page-break-after: always;
              box-sizing: border-box;
            }
            .print-sheet:last-child {
              page-break-after: auto;
            }
            .barcode-cell {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0;
              box-sizing: border-box;
              border: 1px dashed #eee;
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
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
        </head>
        <body>
          <div class="container">
            ${sheetsHTML}
          </div>
          <button id="download-button">Télécharger en PDF</button>
          
          <script>
            // Générer les codes-barres
            document.querySelectorAll('.barcode-placeholder').forEach((placeholder) => {
              try {
                JsBarcode(placeholder, placeholder.getAttribute('data-code'), {
                  format: "CODE128",
                  width: 2,
                  height: 40,
                  displayValue: false,
                  margin: 0
                });
              } catch (error) {
                console.error("Erreur barcode:", error);
              }
            });
            
            // Fonction pour générer le PDF multipage
            async function generateMultiPagePDF() {
              // Créer un nouveau document PDF
              const { jsPDF } = window.jspdf;
              const pdf = new jsPDF('portrait', 'mm', 'a4');
              
              // Obtenir toutes les feuilles
              const sheets = document.querySelectorAll('.print-sheet');
              const totalSheets = sheets.length;
              
              // Pour chaque feuille
              for (let i = 0; i < totalSheets; i++) {
                const sheet = sheets[i];
                
                // Convertir la feuille en canvas
                const canvas = await html2canvas(sheet, {
                  scale: 2,
                  useCORS: true,
                  letterRendering: true,
                  backgroundColor: 'white'
                });
                
                // Ajouter une nouvelle page sauf pour la première
                if (i > 0) {
                  pdf.addPage();
                }
                
                // Ajouter l'image de la feuille au PDF
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
              }
              
              // Sauvegarder le PDF
              pdf.save('barcode-etiquettes.pdf');
              
              // Réafficher le bouton
              document.getElementById('download-button').style.display = 'block';
            }
            
            // Attacher l'événement au bouton de téléchargement
            document.getElementById('download-button').addEventListener('click', function() {
              this.style.display = 'none';
              generateMultiPagePDF();
            });
            
            // Démarrer automatiquement le téléchargement après 1.5 secondes
            setTimeout(() => {
              document.getElementById('download-button').click();
            }, 1500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Générateur d'étiquettes à code-barres</h1>
      <p className="mb-4 text-gray-600">Pour étiquettes TopStick 8400 A4 (70 x 36 mm, 24 étiquettes par feuille)</p>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de départ</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={startNumber}
              onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Étiquettes par feuille</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 24)}
              min="1"
              max="24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de feuillets</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={sheetCount}
              onChange={(e) => setSheetCount(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
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
            <li>Définissez le numéro de départ (bénéficiaire)</li>
            <li>Choisissez le nombre d'étiquettes par feuille (max 24)</li>
            <li>Définissez le nombre de feuillets à générer</li>
            <li>Cliquez sur "Générer" pour créer les codes-barres</li>
            <li>Utilisez le bouton "Télécharger" pour obtenir votre PDF</li>
          </ol>
        </div>
      )}
      
      {barcodes.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Aperçu ({barcodes.length} feuillets)</h2>
          <div className="border rounded p-4 overflow-auto">
            <div ref={printRef} className="space-y-8">
              {barcodes.map((sheetBarcodes, sheetIndex) => (
                <div key={`sheet-${sheetIndex}`} className="relative">
                  <div className="absolute -top-6 left-0 text-sm font-semibold text-gray-500">
                    Feuillet {sheetIndex + 1} (codes {sheetBarcodes[0].uniqueId} à {sheetBarcodes[sheetBarcodes.length - 1].uniqueId})
                  </div>
                  <div className="print-sheet w-full aspect-[210/297] bg-white grid grid-cols-3 grid-rows-8 gap-0 border border-gray-300">
                    {sheetBarcodes.map((barcode) => (
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeLabelPrinter;