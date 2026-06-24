import React from 'react';
import styles from './Textarea.module.css';
import classNames from 'classnames';

/**
 * Textarea component – reusable multi-line text input.
 * Props: label, placeholder, value, onChange, rows, error, className
 */
const Textarea = ({ id, label, placeholder, value, onChange, rows = 4, error, className, ...rest }) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={classNames(styles.textarea, { [styles.error]: !!error })}
        {...rest}
      />
      {error && <div className={styles.errorMsg}>{error}</div>}
    </div>
  );
};

export default Textarea;
