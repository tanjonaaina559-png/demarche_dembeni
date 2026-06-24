import React from 'react';
import styles from './DataTable.module.css';

const DataTable = ({ columns, data, onRowClick }) => {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {safeColumns.map((col, idx) => (
              <th key={col?.accessor || `col-${idx}`} className={styles.th}>
                {col?.Header || ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={safeColumns.length || 1} className={styles.empty}>No data available</td>
            </tr>
          ) : (
            safeData.map((row, idx) => (
              <tr
                key={row?.id || row?._id || idx}
                className={styles.tr}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {safeColumns.map((col, colIdx) => (
                  <td key={col?.accessor || `col-${colIdx}`} className={styles.td}>
                    {col?.Cell ? col.Cell(row) : (row && col?.accessor ? row[col.accessor] : '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
