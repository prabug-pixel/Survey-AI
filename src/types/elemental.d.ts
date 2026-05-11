// Type declarations for @birdeye/elemental design system components

declare module '@birdeye/elemental/core/atoms/Button' {
  import React from 'react';
  interface ButtonProps {
    label?: string;
    children?: React.ReactNode;
    theme?: 'primary' | 'secondary' | 'link' | 'super' | 'danger' | 'danger-primary' | 'noBorder' | 'errorlink' | 'secondary-link';
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
    type?: string;
    icon?: string;
    customIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    expanded?: boolean;
    width?: number;
    size?: string;
    className?: string;
    tooltip?: string | { text?: string; position?: string; linkText?: string };
    showCount?: number;
    noHover?: boolean;
    id?: string;
    isAeroDesign?: boolean;
    'data-testid'?: string;
  }
  const Button: React.FC<ButtonProps>;
  export default Button;
}

declare module '@birdeye/elemental/core/atoms/Toggle' {
  import React from 'react';
  interface ToggleProps {
    checked?: boolean;
    onChange: (component: unknown, event: { target: { checked: boolean; value: boolean; name: string } }) => void;
    name?: string;
    value?: string;
    disabled?: boolean;
    className?: string;
    roundedToggle?: boolean;
    graphToggle?: boolean;
    offLabel?: string;
    onLabel?: string;
  }
  export default class Toggle extends React.Component<ToggleProps> {}
}

declare module '@birdeye/elemental/core/atoms/SingleSelect' {
  import React from 'react';
  interface SingleSelectOption {
    value: string | number;
    label: string;
    [key: string]: unknown;
  }
  interface SingleSelectProps {
    options: SingleSelectOption[] | Record<string, SingleSelectOption[]>;
    selected?: string | number;
    onChange?: (option: SingleSelectOption) => void;
    placeholder?: string;
    showSearch?: boolean;
    searchPlaceHolder?: string;
    disabled?: boolean;
    displayLabel?: string;
    className?: string;
    size?: string;
    name?: string;
    isAeroDesign?: boolean;
    customSize?: string;
    largeSelectBox?: boolean;
    showEllipsis?: boolean;
  }
  export default class SingleSelect extends React.Component<SingleSelectProps> {}
}

declare module '@birdeye/elemental/core/atoms/FormInput' {
  import React from 'react';
  // FormInput's onChange surface differs by `type`:
  // - text / number / email / url / etc. → `(component, event)`
  // - checkbox / radio                     → `(event)` (the native input change handler is passed through directly)
  // We type both forms via overload-friendly intersection so consumers can pick.
  type FormInputChange =
    | ((component: unknown, event: React.ChangeEvent<HTMLInputElement>) => void)
    | ((event: React.ChangeEvent<HTMLInputElement>) => void);
  interface FormInputProps {
    name: string;
    type?: string;
    value?: string | number | boolean;
    checked?: boolean;
    onChange?: FormInputChange;
    onBlur?: (component: unknown, event: React.FocusEvent<HTMLInputElement>) => void;
    onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    label?: string;
    labelInside?: boolean;
    labelClass?: string;
    disabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    className?: string;
    maxLength?: string;
    autoComplete?: boolean;
    allowClear?: boolean;
    showLeftIcon?: boolean;
    showRightIcon?: boolean;
    customIconClass?: string;
    id?: string;
  }
  const FormInput: React.FC<FormInputProps>;
  export default FormInput;
}

declare module '@birdeye/elemental/core/atoms/TextArea' {
  import React from 'react';
  interface TextAreaProps {
    name: string;
    value?: string;
    onChange?: (component: unknown, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (component: unknown, event: React.FocusEvent<HTMLTextAreaElement>) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    rows?: number;
    maxLength?: number;
    showCharCount?: boolean;
    autoSize?: boolean;
    className?: string;
    placeholder?: string;
    noFloatingLabel?: boolean;
    noLabel?: boolean;
    noBorder?: boolean;
  }
  export default class TextArea extends React.Component<TextAreaProps> {}
}

declare module '@birdeye/elemental/core/atoms/Tooltip' {
  import React from 'react';
  interface TooltipProps {
    text: React.ReactNode;
    children?: React.ReactNode;
    position?: 'right' | 'left' | 'top' | 'bottom' | 'top-right' | 'bottom-right' | 'bottom-left';
    theme?: string;
    size?: string;
    align?: string;
    tooltipClass?: string;
    tooltipMargin?: number;
    customContainerClassName?: string;
    hideOnScroll?: boolean;
    showTriangle?: boolean;
    mouseOver?: boolean;
    disabledTooltip?: boolean;
  }
  export default class Tooltip extends React.Component<TooltipProps> {}
}

declare module '@birdeye/elemental/core/atoms/TabHeader' {
  import React from 'react';
  interface TabContent {
    label: string;
    value: string | number;
    iconName?: string;
    count?: number;
    subLabel?: React.ReactNode;
    onClick?: () => void;
  }
  interface TabHeaderProps {
    content: TabContent[];
    clickTab: (tab: TabContent) => void;
    activeTab?: string | number;
    customClass?: string;
    capitalize?: boolean;
    isAeroDesign?: boolean;
  }
  const TabHeader: React.FC<TabHeaderProps>;
  export default TabHeader;
}

declare module '@birdeye/elemental/core/atoms/SearchFilter' {
  import React from 'react';
  interface SearchFilterProps {
    searchStr?: string;
    onInputValueChange?: (value: string) => void;
    placeholder?: string;
    customStyle?: React.CSSProperties;
    debounceDelay?: number;
    customClass?: string;
    autoFocus?: boolean;
    label?: string;
    isAeroDesign?: boolean;
    maxLength?: number;
    id?: string;
  }
  const SearchFilter: React.FC<SearchFilterProps>;
  export default SearchFilter;
}

declare module '@birdeye/elemental/core/atoms/Tag' {
  import React from 'react';
  interface TagProps {
    title?: string;
    onClick?: () => void;
    onRemove?: () => void;
    active?: boolean;
    size?: string;
    variantType?: string;
    color?: string;
  }
  const Tag: React.FC<TagProps>;
  export default Tag;
}

declare module '@birdeye/elemental/core/atoms/Modal' {
  import React from 'react';
  interface ModalProps {
    dialogOptions: {
      isOpen: boolean;
      title?: string;
      showCloseIcon?: boolean;
      shouldCloseOnEsc?: boolean;
      shouldCloseOnOverlayClick?: boolean;
      onCloseModal?: () => void;
      customIcon?: React.ReactNode;
      insideDrawer?: boolean;
    };
    size?: 'extraSmall' | 'small' | 'medium' | 'large' | 'mediumLarge' | 'extraLarge' | 'megaLarge';
    children?: React.ReactNode;
    smallCloseIcon?: boolean;
  }
  export default class Modal extends React.Component<ModalProps> {}
}

declare module '@birdeye/elemental/core/atoms/CommonSideDrawer' {
  import React from 'react';
  interface CommonDrawerProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: (value: boolean) => void;
    width?: string;
    shouldScroll?: boolean;
    headerRightContent?: React.ReactNode;
    buttonPosition?: 'left' | 'right';
  }
  const CommonDrawer: React.FC<CommonDrawerProps>;
  export default CommonDrawer;
}

declare module '@birdeye/elemental/core/atoms/LoadingShimmer' {
  import React from 'react';
  interface LoadingShimmerProps {
    size?: string;
    shimmerCount?: number | Array<{ size: string; height?: string; width?: string }>;
    displayCount?: number;
    customClassName?: string;
  }
  const LoadingShimmer: React.FC<LoadingShimmerProps>;
  export default LoadingShimmer;
}

declare module '@birdeye/elemental/core/components/NoData' {
  import React from 'react';
  interface NoDataProps {
    imageUrl?: string;
    title?: string | React.ReactElement;
    subtitle?: string | React.ReactElement;
    ctaHTML?: React.ReactNode;
    customStyleName?: string;
    isSmall?: boolean;
    customClassName?: string;
    variant?: 'default' | 'simple';
  }
  const NoData: React.FC<NoDataProps>;
  export default NoData;
}

declare module '@birdeye/elemental/core/components/DatePicker' {
  import React from 'react';
  interface DatePickerProps {
    name?: string;
    startDt?: string | Date | null;
    endDt?: string | Date | null;
    range?: boolean;
    showTimePicker?: boolean;
    showTimezone?: boolean;
    timezoneLabel?: string;
    enableFutureDates?: boolean;
    disablePastDates?: boolean;
    dateRangeFormat?: string;
    showApplyButtons?: boolean;
    inlineApplyButtonTrigger?: boolean;
    sendDateTime?: (startDt?: string, endDt?: string, sameDay?: boolean) => void;
    startDateChange?: (date: unknown) => void;
    endDateChange?: (date: unknown) => void;
    onClickApplyChanges?: (start: string, end: string) => void;
    applyButtonLabel?: string;
    cancelCalendarPopup?: () => void;
    insidePopup?: boolean;
    closeOnClickOutside?: () => void;
    isRequired?: boolean;
    title?: string;
    datePickerLabel?: string;
    showInfo?: boolean;
    infoText?: string;
    showTimePickerAbove?: boolean;
    showInboxDateFormat?: boolean;
    explicitMinDt?: string;
    explicitMaxDt?: string;
    enableBusinessTimeZone?: boolean;
    validateEndDateInRangePicker?: boolean;
    firstTimeFlag?: boolean;
    dynamicClass?: string;
    style?: React.CSSProperties;
  }
  const DatePicker: React.FC<DatePickerProps>;
  export default DatePicker;
}

declare module '@birdeye/elemental/core/atoms/Select' {
  import React from 'react';
  interface SelectItemProps {
    value: string | number;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
  interface SelectClasses {
    root?: string;
    selectDisplay?: string;
    menu?: string;
  }
  interface SelectProps {
    value?: string | number | Array<string | number>;
    defaultValue?: string | number | Array<string | number>;
    onChange?: (
      event: React.SyntheticEvent,
      value: string | number | Array<string | number>,
      isOpen?: boolean,
      item?: string | number,
      isAdded?: boolean
    ) => void;
    onOpen?: () => void;
    onClose?: () => void;
    open?: boolean;
    defaultOpen?: boolean;
    multiple?: boolean;
    autoWidth?: boolean;
    placeHolder?: string;
    labelKey?: string;
    idKey?: string;
    renderValue?: (value: unknown) => React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    classes?: SelectClasses;
    selectDisplayProps?: Record<string, unknown>;
    disabled?: boolean;
    id?: string;
    variant?: string;
  }
  export const Select: React.FC<SelectProps>;
  export const SelectItem: React.FC<SelectItemProps>;
  export const SelectContext: React.Context<unknown>;
  const _default: React.FC<SelectProps>;
  export default _default;
}

declare module '@birdeye/elemental/core/sass/js/colors' {
  export const blue0: string;
  export const blue100: string;
  export const blue200: string;
  export const blue300: string;
  export const blue400: string;
  export const blue500: string;
  export const gray0: string;
  export const gray10: string;
  export const gray50: string;
  export const gray100: string;
  export const gray200: string;
  export const gray300: string;
  export const gray400: string;
  export const gray500: string;
  export const gray600: string;
  export const gray700: string;
  export const gray800: string;
  export const gray900: string;
  export const red10: string;
  export const red100: string;
  export const green10: string;
  export const green100: string;
  export const green200: string;
  const colors: Record<string, string>;
  export default colors;
}
