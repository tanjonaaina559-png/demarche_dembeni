import React from 'react';
import styles from './SearchBar.module.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ placeholder = 'Search...', value, onChange }) => (
  <div className={styles.searchBar}>
    <FaSearch className={styles.icon} />
    <input
      className={styles.input}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
