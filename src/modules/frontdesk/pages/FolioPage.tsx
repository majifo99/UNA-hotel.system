import React from 'react';
import { useParams } from 'react-router-dom';
import { FolioManagerPage } from '../components/FolioManagerPage';

export const FolioPage: React.FC = () => {
  const { folioId } = useParams<{ folioId: string }>();
  
  const folioIdNumber = folioId ? parseInt(folioId, 10) : undefined;

  return (
    <FolioManagerPage folioId={folioIdNumber} />
  );
};