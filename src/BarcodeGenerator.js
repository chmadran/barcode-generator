import React, { useState, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import './BarcodeGenerator.css';

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
  }, [uniqueId, locationId, year]);

  useEffect(() => {
    if (uniqueId && locationId && year) {
      generateBarcode();
    }
  }, [uniqueId, locationId, year, generateBarcode]);

  return (
    <div className="container">
      <div className="barcode-generator">
        <h1 className="title">Barcode Generator</h1>
        
        <div className="form-container">
          <div className="input-group">
            <label className="label">Unique ID</label>
            <input
              type="text"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              placeholder="Enter Unique ID"
              className="input"
            />
          </div>

          <div className="input-group">
            <label className="label">Location ID</label>
            <input
              type="text"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="Enter Location ID"
              className="input"
            />
          </div>

          <div className="input-group">
            <label className="label">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Enter Year"
              min="1900"
              max="2100"
              className="input"
            />
          </div>
        </div>

        <div className="barcode-container">
          <div className="barcode-wrapper">
            <svg id="barcode" className="barcode"></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGenerator;