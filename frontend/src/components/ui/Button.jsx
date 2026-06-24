import React from 'react';
import styles from './Button.module.css';
import classNames from 'classnames';

/**
 * Button component with variant styling.
 * Props: children, onClick, variant ('primary'|'secondary'|'danger'|'success'|'gray'), type
 */
const Button = ({ children, onClick, variant = 'primary', type = 'button', ...rest }) => {
  const variantClass = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    danger: styles.buttonDanger,
    success: styles.buttonSuccess,
    gray: styles.buttonSecondary,
  }[variant] || styles.buttonPrimary;
  const btnClass = classNames(styles.button, variantClass);
  return (
    <button type={type} className={btnClass} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Button;
