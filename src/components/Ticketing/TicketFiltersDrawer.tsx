// ============================================================
// TicketFiltersDrawer — inline filter panel that pushes the
// ticket list to the left when opened. Rendered as a flex sibling
// of the main column inside TicketingLanding, so no overlay or
// scrim is involved.
//
// Panel exposes only the location-axis filters; the "See all
// filters" link opens the centered modal where ticket-axis
// filters also appear (per the Figma).
// ============================================================
import React from 'react';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import { LOCATION_FILTERS } from './TicketFilters';
import type { FilterValues } from './TicketFilters';
import styles from './TicketFiltersDrawer.module.scss';

interface Props {
  isOpen: boolean;
  values: FilterValues;
  onChange: (key: string, value: string) => void;
  onSeeAllFilters: () => void;
}

const TicketFiltersDrawer: React.FC<Props> = ({
  isOpen,
  values,
  onChange,
  onSeeAllFilters,
}) => {
  if (!isOpen) return null;

  return (
    <aside className={styles.panel} aria-label="Filter by">
      <div className={styles.header}>
        <h2 className={styles.title}>Filter by</h2>
      </div>

      <div className={styles.body}>
        {LOCATION_FILTERS.map(field => (
          <div key={field.key} className={styles.field}>
            <SingleSelect
              name={`filter-drawer-${field.key}`}
              displayLabel={field.label}
              options={field.options}
              selected={values[field.key] ?? ''}
              onChange={(option) => onChange(field.key, String(option.value))}
              showSearch={false}
              isAeroDesign
            />
          </div>
        ))}

        <button
          type="button"
          className={styles.seeAllBtn}
          onClick={onSeeAllFilters}
        >
          See all filters
        </button>
      </div>
    </aside>
  );
};

export default TicketFiltersDrawer;
