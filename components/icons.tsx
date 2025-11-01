
import React from 'react';

export const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2H11v20H3.5A1.5 1.5 0 0 1 2 20.5v-17Zm1.5-.5a.5.5 0 0 0-.5.5v17a.5.5 0 0 0 .5.5H10V3H3.5Z" />
    <path d="M13 2h7.5A1.5 1.5 0 0 1 22 3.5v17a1.5 1.5 0 0 1-1.5 1.5H13V2Zm1 1v18h6.5a.5.5 0 0 0 .5-.5v-17a.5.5 0 0 0-.5-.5H14Z" />
  </svg>
);
