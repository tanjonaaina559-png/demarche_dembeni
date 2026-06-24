import React from 'react';
import styles from './Input.module.css';
import classNames from 'classnames';

/**
 * Input – reusable text input component.
 * Preserves existing design by using the project's CSS module system.
 */
const Input = ({ id, label, placeholder, type = 'text', className, error, ...rest }) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={classNames(styles.input, { [styles.error]: !!error })}
        {...rest}
      />
      {error && <div className={styles.errorMsg}>{error}</div>}
    </div>
  );
};

export default Input;
