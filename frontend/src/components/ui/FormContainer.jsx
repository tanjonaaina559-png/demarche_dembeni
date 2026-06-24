import React from 'react';
import styles from './FormContainer.module.css';
import classNames from 'classnames';

/**
 * FormContainer – wrapper for form layouts.
 * Props: title, subtitle, children, onSubmit, submitText, isLoading
 */
const FormContainer = ({
  title,
  subtitle,
  children,
  onSubmit,
  submitText = 'Submit',
  isLoading = false,
  className,
}) => {
  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.header}>
        {title && <h1 className={styles.title}>{title}</h1>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <form onSubmit={onSubmit} className={styles.form}>
        {children}
        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Loading...' : submitText}
        </button>
      </form>
    </div>
  );
};

export default FormContainer;
