import React from 'react';
import { getApiBaseUrl } from '../../utils/apiConfig';

// Temporary debug component - remove after fixing API issues
export const ApiDebug: React.FC = () => {
  const apiUrl = getApiBaseUrl();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: '#000', 
      color: '#fff', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔧 API Debug Info</h4>
      <div>API URL: {apiUrl}</div>
      <div>Is Prod: {String(import.meta.env.PROD)}</div>
      <div>Mode: {import.meta.env.MODE}</div>
      <div>Hostname: {window.location.hostname}</div>
      <div>Origin: {window.location.origin}</div>
      <div>VITE_API_URL: {import.meta.env.VITE_API_URL || 'undefined'}</div>
    </div>
  );
};

export default ApiDebug;