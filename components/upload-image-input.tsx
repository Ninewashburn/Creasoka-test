"use client";

import React, { useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Crop } from "lucide-react";
import { useUploadImage } from "@/hooks/use-upload-image";
import Image from "next/image";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import getCroppedImg from "@/lib/cropImage";

interface UploadImageProps {
  label: string;
  required?: boolean;
  multiple?: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  description?: string;
  aspectRatio?: number;
}

export default function UploadImage({
  label,
  required = false,
  multiple = false,
  value,
  onChange,
  description = multiple
    ? "Ajoutez des images additionnelles"
    : "Choisissez une image",
  aspectRatio = 1,
}: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading, progress, error, reset } = useUploadImage();

  // État pour l'image unique
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    !multiple && typeof value === "string" && value !== "/placeholder.svg"
      ? value
      : null
  );

  // Pour gérer le recadrage
  const [imageToCrop, setImageToCrop] = useState<{
    url: string;
    index?: number;
  } | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);

  // Mettre à jour le preview quand la valeur change (mode unique)
  React.useEffect(() => {
    if (!multiple && typeof value === "string") {
      setPreviewUrl(value && value !== "/placeholder.svg" ? value : null);
    }
  }, [value, multiple]);

  // Fonction appelée quand le recadrage est complété
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Gérer la sélection de fichier(s)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    reset();

    if (multiple) {
      // Mode multiple
      const filesArray = Array.from(files);
      const currentValues = Array.isArray(value) ? [...value] : [];
      let updatedValues = [...currentValues];

      for (const file of filesArray) {
        const filePath = await uploadImage(file);
        if (filePath) {
          updatedValues.push(filePath);
        }
      }

      onChange(updatedValues);
    } else {
      // Mode simple
      const file = files[0];
      const filePath = await uploadImage(file);

      if (filePath) {
        onChange(filePath);
        setPreviewUrl(filePath);
      } else {
        if (typeof value === "string") {
          setPreviewUrl(value && value !== "/placeholder.svg" ? value : null);
        }
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Ouvrir le recadreur pour une image
  const handleOpenCropper = (index?: number) => {
    if (multiple && Array.isArray(value) && typeof index === "number") {
      // Mode multiple
      const url = value[index];
      if (url) {
        setImageToCrop({ url, index });
      }
    } else if (!multiple && typeof value === "string" && previewUrl) {
      // Mode simple
      setImageToCrop({ url: previewUrl });
    }

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  // Fermer le recadreur
  const handleCloseCropper = () => {
    setImageToCrop(null);
  };

  // Confirmer le recadrage
  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setIsProcessingCrop(true);
    try {
      const croppedImageBlob = await getCroppedImg(
        imageToCrop.url,
        croppedAreaPixels
      );
      if (!croppedImageBlob) {
        throw new Error("Could not crop image");
      }
      const croppedFile = new File([croppedImageBlob], "cropped_image.jpeg", {
        type: "image/jpeg",
      });

      const newFilePath = await uploadImage(croppedFile);

      if (newFilePath) {
        if (
          multiple &&
          Array.isArray(value) &&
          typeof imageToCrop.index === "number"
        ) {
          // Mode multiple
          const updatedValues = [...value];
          updatedValues[imageToCrop.index] = newFilePath;
          onChange(updatedValues);
        } else {
          // Mode simple
          onChange(newFilePath);
          setPreviewUrl(newFilePath);
        }
      }
    } catch (e) {
      console.error("Erreur lors du recadrage ou de l'upload de l'image:", e);
    } finally {
      setIsProcessingCrop(false);
      handleCloseCropper();
    }
  };

  // Supprimer une image
  const handleRemoveImage = (index?: number) => {
    if (multiple && Array.isArray(value) && typeof index === "number") {
      // Mode multiple
      const newValues = value.filter((_, i) => i !== index);
      onChange(newValues);
    } else {
      // Mode simple
      onChange("");
      setPreviewUrl(null);
    }
    reset();
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor={multiple ? "multi-image-upload" : "image-upload-trigger"}
        className="text-base font-medium flex items-center"
      >
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Zone de dépôt ou d'affichage */}
      {!multiple && !previewUrl ? (
        // Mode simple sans image sélectionnée
        <div
          className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-creasoka hover:bg-creasoka/5 transition-all duration-300 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            <Camera className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              PNG, JPG, WebP jusqu'à 5MB
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="transition-all duration-300 hover:bg-creasoka/10 hover:text-creasoka"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Parcourir
              </Button>
            </motion.div>
            {isUploading && (
              <div className="w-full mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Téléchargement en cours...
                </p>
              </div>
            )}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      ) : !multiple && previewUrl ? (
        // Mode simple avec image sélectionnée
        <div className="relative mt-2 border rounded-lg overflow-hidden group">
          <Image
            key={previewUrl}
            src={previewUrl}
            alt={label}
            width={400}
            height={400 / aspectRatio}
            className="w-full h-auto object-contain bg-white dark:bg-gray-800"
            style={{ aspectRatio: `${aspectRatio} / 1` }}
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white text-gray-800"
              onClick={() => handleOpenCropper()}
              title="Recadrer l'image"
            >
              <Crop className="h-4 w-4 mr-2" /> Recadrer
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="bg-red-500/80 hover:bg-red-600 text-white"
              onClick={() => handleRemoveImage()}
              title="Supprimer l'image"
            >
              <X className="h-4 w-4 mr-2" /> Supprimer
            </Button>
          </div>

          {isUploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-white text-center mt-1">
                {isProcessingCrop
                  ? "Upload recadrage..."
                  : "Téléchargement initial..."}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Mode multiple
        <div className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-creasoka hover:bg-creasoka/5 transition-all duration-300">
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              PNG, JPG, WebP jusqu'à 5MB
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="transition-all duration-300 hover:bg-creasoka/10 hover:text-creasoka"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Ajouter des images
              </Button>
            </motion.div>
            {isUploading && (
              <div className="w-full mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Téléchargement en cours...
                </p>
              </div>
            )}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          {Array.isArray(value) && value.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {value.map((img, index) => (
                <div
                  key={index}
                  className="relative group border rounded-md overflow-hidden"
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Image ${index + 1}`}
                    width={150}
                    height={150 / aspectRatio}
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: `${aspectRatio} / 1` }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200 p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 w-full h-auto py-1 px-2 text-xs mb-1"
                      onClick={() => handleOpenCropper(index)}
                      title="Recadrer l'image"
                    >
                      <Crop className="h-3 w-3 mr-1" />
                      Recadrer
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/20 w-full h-auto py-1 px-2 text-xs"
                      onClick={() => handleRemoveImage(index)}
                      title="Supprimer l'image"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        id={multiple ? "multi-image-upload" : "image-upload-trigger"}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
        multiple={multiple}
      />

      {/* Dialog de recadrage */}
      <Dialog
        open={!!imageToCrop}
        onOpenChange={(open) => !open && handleCloseCropper()}
      >
        <DialogContent className="max-w-3xl h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {multiple ? "Recadrer l'image additionnelle" : "Recadrer l'image"}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex-grow">
            {imageToCrop && (
              <Cropper
                image={imageToCrop.url}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="mt-4 px-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Zoom</span>
              <span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(values) => setZoom(values[0])}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={handleCloseCropper}
              disabled={isProcessingCrop}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCropConfirm}
              disabled={isProcessingCrop || !croppedAreaPixels}
            >
              {isProcessingCrop ? "Traitement..." : "Valider le recadrage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
