'use client';

import React from 'react';
import SanctionLetterPDF from '@/components/SanctionLetterPDF';

export interface AwardLetterModalProps {
  app?: any;
  data?: any;
  onClose?: () => void;
}

export default function AwardLetterModal({ app, data, onClose }: AwardLetterModalProps) {
  const item = app || data;
  if (!item) return null;

  return <SanctionLetterPDF application={item} onClose={onClose || (() => window.history.back())} />;
}
