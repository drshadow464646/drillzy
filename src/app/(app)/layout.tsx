import React from 'react';

// This is the layout for the main application pages.
// It currently just passes children through, but can be used for shared UI.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
