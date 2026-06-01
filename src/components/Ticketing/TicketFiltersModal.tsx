// ============================================================
// TicketFiltersModal — the centered "Filter by" popup that opens
// from the drawer's "See all filters" link. Lays out the full
// filter set (Location axis + Ticket information axis) in a
// 3-column grid with an Apply button in the footer.
// ============================================================
import React from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Button from '@birdeye/elemental/core/atoms/Button';
import { IconClose } from '../../shared/Icons/Icons';
import { LOCATION_FILTERS, TICKET_FILTERS } from './TicketFilters';
import type { FilterFieldDef, FilterValues } from './TicketFilters';
import styles from './TicketFiltersModal.module.scss';

interface Props {
  isOpen: boolean;
  values: FilterValues;
  onChange: (key: string, value: string) => void;
  onClose: () => void;
  onApply: () => void;
}

const renderFieldGrid = (
  fields: FilterFieldDef[],
  values: FilterValues,
  onChange: (key: string, value: string) => void,
) => (
  <div className={styles.grid}>
    {fields.map(field => (
      <div key={field.key} className={styles.field}>
        <SingleSelect
          name={`filter-modal-${field.key}`}
          displayLabel={field.label}
          options={field.options}
          selected={values[field.key] ?? ''}
          onChange={(option) => onChange(field.key, String(option.value))}
          showSearch={false}
          isAeroDesign
        />
      </div>
    ))}
  </div>
);

const TicketFiltersModal: React.FC<Props> = ({
  isOpen,
  values,
  onChange,
  onClose,
  onApply,
}) => {
  return (
    <Modal
      dialogOptions={{
        isOpen,
        title: '',
        showCloseIcon: false,
        onCloseModal: onClose,
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEsc: true,
      }}
      size="large"
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.titleLabel}>Filter by</span>
          <span className={styles.titleUnderline} aria-hidden />
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          aria-label="Close"
          onClick={onClose}
        >
          <IconClose size={16} color="#555" />
        </button>
      </div>

      <div className={styles.body}>
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Location</h3>
          {renderFieldGrid(LOCATION_FILTERS, values, onChange)}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Ticket information</h3>
          {renderFieldGrid(TICKET_FILTERS, values, onChange)}
        </section>
      </div>

      <div className={styles.footer}>
        <Button theme="primary" label="Apply" onClick={onApply} />
      </div>
    </Modal>
  );
};

export default TicketFiltersModal;
