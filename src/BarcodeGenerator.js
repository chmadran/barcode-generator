import React, { useState, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import './BarcodeGenerator.css';

const BarcodeGenerator = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [year] = useState(new Date().getFullYear().toString());

  const generateBarcode = useCallback(() => {
    const barcodeData = `${uniqueId}`;
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
  }, [uniqueId]);

  useEffect(() => {
    if (uniqueId) {
      generateBarcode();
    }
  }, [uniqueId, generateBarcode]);

  return (
    <div className="container">
      <div className="barcode-generator">
        <h1 className="title">Barcode Generator</h1>
        
        <div className="form-container">
          <div className="input-group">
            <label className="label">Numéro Bénéficiaire</label>
            <input
              type="text"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              placeholder="Enter Unique ID"
              className="input"
            />
          </div>

          {/* <div className="input-group">
            <label className="label">Identifiant Antenne</label>
            <input
              type="text"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="Enter Location ID"
              className="input"
            />
          </div>

          <div className="input-group">
            <label className="label">Année</label>
            <input
              type="text"
              value={year}
              readOnly
              className="input readonly"
            />
          </div> */}
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