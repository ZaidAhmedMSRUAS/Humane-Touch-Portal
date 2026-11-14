'use client';

import React from 'react';
import CertificatePDF from '@/components/CertificatePDF';

export interface CertificateModalProps {
  app?: any;
  data?: any;
  onClose?: () => void;
}

export default function CertificateModal({ app, data, onClose }: CertificateModalProps) {
  const item = app || data;
  if (!item) return null;

  return <CertificatePDF application={item} onClose={onClose || (() => window.history.back())} />;
}
