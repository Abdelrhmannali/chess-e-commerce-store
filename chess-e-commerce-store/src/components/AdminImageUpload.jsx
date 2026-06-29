import React, { useRef, useState, useEffect, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
export const ACCEPT_IMAGE_ATTR = "image/jpeg,image/jpg,image/png,image/webp";

export function validateImageFile(file) {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "يُسمح فقط بصور JPG و JPEG و PNG و WEBP.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "يجب ألا يتجاوز حجم الصورة 2 ميجابايت.";
  }
  return null;
}

export default function AdminImageUpload({
  label = "رفع صورة",
  required = false,
  existingImage = "",
  file,
  onFileChange,
  onError,
  disabled = false,
  uploadProgress = null
}) {
  const inputRef = useRef(null);
  const blobUrlRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState("");

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (file) {
      revokeBlob();
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setPreview(url);
    } else {
      revokeBlob();
      setPreview(existingImage || "");
    }
    return revokeBlob;
  }, [file, existingImage, revokeBlob]);

  const applyFile = (selected) => {
    if (!selected) return;
    const error = validateImageFile(selected);
    if (error) {
      onError?.(error);
      return;
    }
    onFileChange(selected);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) applyFile(selected);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const selected = e.dataTransfer.files?.[0];
    if (selected) applyFile(selected);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    revokeBlob();
    onFileChange(null);
    setPreview(existingImage || "");
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasPreview = Boolean(preview);
  const showExistingBadge = !file && existingImage && preview === existingImage;

  return (
    <div className="beidaq-admin-upload">
      <label className="beidaq-admin-upload__label">
        {label}{required ? " *" : ""}
      </label>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={`beidaq-admin-upload__zone ${isDragging ? "beidaq-admin-upload__zone--active" : ""} ${hasPreview ? "beidaq-admin-upload__zone--has-preview" : ""} ${disabled ? "beidaq-admin-upload__zone--disabled" : ""}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_IMAGE_ATTR}
          className="beidaq-admin-upload__input"
          onChange={handleInputChange}
          disabled={disabled}
          tabIndex={-1}
        />

        {hasPreview ? (
          <div className="beidaq-admin-upload__preview-wrap">
            <img src={preview} alt="Preview" className="beidaq-admin-upload__preview-img" />
            {showExistingBadge && (
              <span className="beidaq-admin-upload__badge">الصورة الحالية</span>
            )}
            {file && (
              <button
                type="button"
                className="beidaq-admin-upload__remove"
                onClick={handleClear}
                aria-label="إزالة الصورة المحددة"
              >
                <X size={14} />
              </button>
            )}
            {!disabled && (
              <div className="beidaq-admin-upload__overlay">
                <Upload size={18} />
                <span>{file ? "استبدال الصورة" : "انقر أو اسحب لاستبدال الصورة"}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="beidaq-admin-upload__placeholder">
            <div className="beidaq-admin-upload__icon">
              <ImageIcon size={28} strokeWidth={1.5} />
            </div>
            <p className="beidaq-admin-upload__title">انقر للرفع أو اسحب وأفلت</p>
            <p className="beidaq-admin-upload__hint">JPG أو JPEG أو PNG أو WEBP · الحد الأقصى 2 ميجابايت</p>
          </div>
        )}
      </div>

      {file && (
        <p className="beidaq-admin-upload__filename">{file.name}</p>
      )}

      {uploadProgress !== null && (
        <div className="beidaq-admin-upload__progress">
          <div className="beidaq-admin-upload__progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span className="beidaq-admin-upload__progress-text">{uploadProgress}%</span>
        </div>
      )}
    </div>
  );
}
