import React from 'react';
import styles from './Select.module.css';
import classNames from 'classnames';

/**
 * Select component – reusable select dropdown.
 * Props: label, options, value, onChange, placeholder, error, className
 */
const Select = ({ id, label, options = [], value, onChange, placeholder = 'Select...', error, className, ...rest }) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={classNames(styles.select, { [styles.error]: !!error })}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className={styles.errorMsg}>{error}</div>}
    </div>
  );
};

export default Select;
