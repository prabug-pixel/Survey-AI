// ============================================================
// TicketFilesField — control for the "Files" custom field type.
// Renders a wrapping grid of square tiles (image thumbnail, or a
// generic file icon + name for everything else) plus a trailing
// dashed "add" tile, matching the Figma file-picker reference.
//
// No backend exists in this app to upload to, so each file is
// kept as an in-memory object URL — it lives for the browser tab's
// session, same as every other value on a newly-created ticket.
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
import { IconClose, IconDownload, IconFileGeneric, IconPlusCircleOutline } from '../../shared/Icons/Icons';
import styles from './TicketFilesField.module.scss';

export interface TicketFileValue {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
}

// Supported formats: images, PDF, Excel, CSV, Word, PowerPoint, plain text.
const ALLOWED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg',
  '.pdf',
  '.xls', '.xlsx',
  '.csv',
  '.doc', '.docx',
  '.ppt', '.pptx',
  '.txt',
];

export const FILES_FIELD_ACCEPT = ALLOWED_EXTENSIONS.join(',');

const extensionOf = (fileName: string): string => {
  const idx = fileName.lastIndexOf('.');
  return idx === -1 ? '' : fileName.slice(idx).toLowerCase();
};

const isAllowedFile = (file: File): boolean =>
  ALLOWED_EXTENSIONS.includes(extensionOf(file.name));

interface Props {
  name: string;
  value: TicketFileValue[] | undefined;
  onChange: (v: TicketFileValue[]) => void;
}

const TicketFilesField: React.FC<Props> = ({ name, value, onChange }) => {
  const files = value ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<TicketFileValue | null>(null);

  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [preview]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const picked = Array.from(fileList);
    const accepted = picked.filter(isAllowedFile);
    const rejected = picked.length - accepted.length;
    setError(
      rejected > 0
        ? 'Unsupported file type. Supported formats: PNG, JPG, PDF, XLS, XLSX, CSV, DOC, DOCX, PPT, PPTX, TXT.'
        : '',
    );
    if (accepted.length === 0) return;
    const next: TicketFileValue[] = accepted.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file),
    }));
    onChange([...files, ...next]);
  };

  const removeFile = (id: string) => {
    onChange(files.filter(f => f.id !== id));
  };

  const openFile = (f: TicketFileValue) => {
    if (f.mimeType.startsWith('image/')) {
      setPreview(f);
    } else {
      window.open(f.url, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadFile = (f: TicketFileValue) => {
    const a = document.createElement('a');
    a.href = f.url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {files.map(f => {
          const isImage = f.mimeType.startsWith('image/');
          return (
            <div key={f.id} className={styles.tile} title={f.name}>
              <button
                type="button"
                className={styles.tileButton}
                onClick={() => openFile(f)}
                aria-label={`Open ${f.name}`}
              >
                {isImage ? (
                  <img className={styles.thumb} src={f.url} alt={f.name} />
                ) : (
                  <div className={styles.fileTile}>
                    <IconFileGeneric size={22} color="#616161" />
                    <span className={styles.fileName}>{f.name}</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                className={styles.removeBtn}
                aria-label={`Remove ${f.name}`}
                onClick={e => {
                  e.stopPropagation();
                  removeFile(f.id);
                }}
              >
                <IconClose size={12} color="#fff" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          className={styles.addTile}
          aria-label="Add files"
          onClick={() => inputRef.current?.click()}
        >
          <IconPlusCircleOutline size={24} color="currentColor" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        multiple
        accept={FILES_FIELD_ACCEPT}
        className={styles.hiddenInput}
        onChange={e => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {error && <p className={styles.error}>{error}</p>}

      {preview && (
        <div
          className={styles.lightboxOverlay}
          role="presentation"
          onClick={() => setPreview(null)}
        >
          <div className={styles.lightboxActions}>
            <button
              type="button"
              className={styles.lightboxIconBtn}
              aria-label={`Download ${preview.name}`}
              onClick={e => {
                e.stopPropagation();
                downloadFile(preview);
              }}
            >
              <IconDownload size={18} color="#fff" />
            </button>
            <button
              type="button"
              className={styles.lightboxIconBtn}
              aria-label="Close preview"
              onClick={() => setPreview(null)}
            >
              <IconClose size={18} color="#fff" />
            </button>
          </div>
          <img
            className={styles.lightboxImage}
            src={preview.url}
            alt={preview.name}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default TicketFilesField;
