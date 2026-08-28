// Reusable "Files" custom-field control for Ticketing forms (Create ticket
// modal + activity drawer). Tile grid of square previews — image files
// render an inline thumbnail, other types show a document icon plus
// filename — followed by a dashed "add" tile, matching the Figma spec
// (Brand identity in Settings V2, node 5595-49742). This mock app has no
// upload backend, so files are held as local object URLs for the lifetime
// of the page, same as every other piece of Ticketing state.
import React, { useRef, useState } from 'react';
import { IconPlus, IconClose, IconFile } from '../../shared/Icons/Icons';
import { FILES_FIELD_ACCEPT } from './CustomFieldsContext';
import type { CustomFieldFileValue } from './CustomFieldsContext';
import styles from './TicketFileField.module.scss';

interface Props {
  name: string;
  value: CustomFieldFileValue[];
  onChange: (value: CustomFieldFileValue[]) => void;
  disabled?: boolean;
}

const isImageFile = (file: CustomFieldFileValue): boolean => file.type.startsWith('image/');

// "Birdeye_Ratings_Report.pdf" -> "Birdeye_R... .PDF", matching the Figma tile label.
const truncatedTileName = (fileName: string): string => {
  const dotIdx = fileName.lastIndexOf('.');
  const base = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName;
  const ext = dotIdx > 0 ? fileName.slice(dotIdx + 1).toUpperCase() : '';
  const shortBase = base.length > 9 ? `${base.slice(0, 9)}...` : base;
  return ext ? `${shortBase} .${ext}` : shortBase;
};

const TicketFileField: React.FC<Props> = ({ name, value, onChange, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const additions: CustomFieldFileValue[] = Array.from(fileList).map(file => ({
      id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    onChange([...value, ...additions]);
  };

  const removeFile = (id: string) => {
    const removed = value.find(f => f.id === id);
    if (removed) URL.revokeObjectURL(removed.url);
    onChange(value.filter(f => f.id !== id));
  };

  return (
    <div
      className={`${styles.tileGrid} ${isDragOver ? styles.tileGridDragOver : ''}`}
      onDragOver={e => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setIsDragOver(false);
        if (!disabled) addFiles(e.dataTransfer.files);
      }}
    >
      {value.map(file => (
        <div key={file.id} className={styles.tile}>
          {isImageFile(file) ? (
            <img src={file.url} alt={file.name} className={styles.tileImage} />
          ) : (
            <div className={styles.tileDoc}>
              <IconFile size={28} color="#616161" />
              <span className={styles.tileDocName} title={file.name}>{truncatedTileName(file.name)}</span>
            </div>
          )}
          <button
            type="button"
            className={styles.tileRemove}
            aria-label={`Remove ${file.name}`}
            onClick={() => removeFile(file.id)}
          >
            <IconClose size={10} color="#fff" />
          </button>
        </div>
      ))}

      <button
        type="button"
        className={styles.tileAdd}
        title={`Add file (${FILES_FIELD_ACCEPT})`}
        aria-label="Add file"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <span className={styles.tileAddCircle}>
          <IconPlus size={16} color="#9e9e9e" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        name={name}
        multiple
        accept={FILES_FIELD_ACCEPT}
        disabled={disabled}
        className={styles.hiddenInput}
        onChange={e => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default TicketFileField;
