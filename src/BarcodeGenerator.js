import React, { useState, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeGenerator = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const generateBarcode = useCallback(() => {
    const barcodeData = `${uniqueId}|${locationId}|${year}`;
    
    try {
      JsBarcode("#barcode", barcodeData, {
        format: "CODE128",
        width: 4,
        height: 200,
        displayValue: true,
        font: "monospace",
        fontSize: 24,
        margin: 30,
        background: "#ffffff",
        textMargin: 10,
        lineColor: "#000000"
      });
    } catch (error) {
      console.error("Error generating barcode:", error);
    }
  }, [uniqueId, locationId, year]); // Include all dependencies used in the function

  useEffect(() => {
    if (uniqueId && locationId && year) {
      generateBarcode();
    }
  }, [uniqueId, locationId, year, generateBarcode]); // Include all dependencies

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Barcode Generator
          </h1>
          
          <div className="flex flex-col items-center space-y-8 mb-12">
            <div className="w-full max-w-md">
              <label className="block text-xl font-medium text-gray-700 text-center mb-3">
                Unique ID
              </label>
              <input
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="Enter Unique ID"
                className="w-full p-4 text-xl border rounded-lg text-center"
              />
            </div>
            
            <div className="w-full max-w-md">
              <label className="block text-xl font-medium text-gray-700 text-center mb-3">
                Location ID
              </label>
              <input
                type="text"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="Enter Location ID"
                className="w-full p-4 text-xl border rounded-lg text-center"
              />
            </div>
            
            <div className="w-full max-w-md">
              <label className="block text-xl font-medium text-gray-700 text-center mb-3">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Enter Year"
                min="1900"
                max="2100"
                className="w-full p-4 text-xl border rounded-lg text-center"
              />
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <button 
              onClick={generateBarcode}
              className="bg-blue-600 text-white text-xl py-4 px-12 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Generate Barcode
            </button>
          </div>

          <div className="flex justify-center">
            <div className="p-8 bg-white rounded-lg border">
              <svg id="barcode" className="max-w-full h-auto"></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGenerator;