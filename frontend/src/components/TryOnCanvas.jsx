// src/components/TryOnCanvas.jsx
import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";

export default function TryOnCanvas() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  useEffect(() => {
    // init Fabric only once
    if (fabricRef.current) return;

    const canvas = new fabric.Canvas("tryon-canvas", {
      preserveObjectStacking: true,
      backgroundColor: "#fff",
    });
    fabricRef.current = canvas;

    // responsive sizing
    const resize = () => {
      const width = Math.min(window.innerWidth - 32, 900);
      canvas.setWidth(width);
      canvas.setHeight(Math.round(width * 1.1));
      canvas.renderAll();
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Load Person Image
  const handlePersonChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      fabric.Image.fromURL(ev.target.result, (img) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        // scale & position
        img.set({
          left: 0,
          top: 0,
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
        });
        img.scaleToWidth(canvas.getWidth());

        canvas.clear(); // remove old items
        canvas.add(img);
        canvas.sendToBack(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  // Load Garment Image
  const handleGarmentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      fabric.Image.fromURL(ev.target.result, (img) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        img.set({
          left: canvas.width / 2,
          top: canvas.height / 3,
          originX: "center",
          originY: "center",
          cornerStyle: "circle",
          borderColor: "#6b21a8",
          hasControls: true,
          lockUniScaling: false,
          selectable: true,
        });
        img.scaleToWidth(200);
        img.opacity = 0.95;

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  // Export Result
  const exportResult = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.renderAll();

    const data = canvas.toDataURL({ format: "png", quality: 0.9 });
    const a = document.createElement("a");
    a.href = data;
    a.download = "tryon-result.png";
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Virtual Try-On (Free)</h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-gray-700">Upload Your Photo</span>
          <input type="file" accept="image/*" onChange={handlePersonChange} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-700">
            Upload Garment Image (PNG with transparent background works best)
          </span>
          <input type="file" accept="image/*" onChange={handleGarmentChange} />
        </label>

        <button
          onClick={exportResult}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Download Result
        </button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <canvas
          id="tryon-canvas"
          ref={canvasRef}
          style={{ width: "100%" }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Tip: Use a full-body photo taken straight at the camera. Garments with
        transparent backgrounds (PNG) fit best.
      </p>
    </div>
  );
}
