"use client";

import React from "react";
import UploadImage from "./upload-image-input";

interface UploadMultipleImagesProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  required?: boolean;
  description?: string;
  aspectRatio?: number;
}

export default function UploadMultipleImages({
  value,
  onChange,
  label = "Images additionnelles",
  required = false,
  description = "Ajoutez des images additionnelles pour montrer plus de détails",
  aspectRatio = 1,
}: UploadMultipleImagesProps) {
  return (
    <UploadImage
      label={label}
      required={required}
      multiple
      value={value}
      onChange={(newValue) => {
        // Assurez-vous que la valeur est toujours un tableau
        if (Array.isArray(newValue)) {
          onChange(newValue);
        } else if (typeof newValue === "string") {
          onChange([newValue]);
        } else {
          onChange([]);
        }
      }}
      description={description}
      aspectRatio={aspectRatio}
    />
  );
}
