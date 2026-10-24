import React from 'react';
import { ResearchInfographicModal } from './ResearchInfographicModal';
import { ResearchInfographic, Publication } from '../types';

interface InfographicLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  infographic?: ResearchInfographic | null;
  publication?: Publication | null;
}

export const InfographicLightbox: React.FC<InfographicLightboxProps> = ({
  isOpen,
  onClose,
  infographic,
  publication
}) => {
  if (!isOpen || !infographic) return null;

  return (
    <ResearchInfographicModal
      isOpen={isOpen}
      onClose={onClose}
      infographic={infographic}
      publication={publication || undefined}
    />
  );
};
