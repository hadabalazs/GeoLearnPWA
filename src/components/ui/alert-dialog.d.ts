import type { ComponentType, ReactNode } from 'react';

type AlertDialogPartProps = { children?: ReactNode; className?: string; [key: string]: unknown };

export const AlertDialog: ComponentType<AlertDialogPartProps>;
export const AlertDialogTrigger: ComponentType<AlertDialogPartProps>;
export const AlertDialogPortal: ComponentType<AlertDialogPartProps>;
export const AlertDialogOverlay: ComponentType<AlertDialogPartProps>;
export const AlertDialogContent: ComponentType<AlertDialogPartProps>;
export const AlertDialogHeader: ComponentType<AlertDialogPartProps>;
export const AlertDialogFooter: ComponentType<AlertDialogPartProps>;
export const AlertDialogTitle: ComponentType<AlertDialogPartProps>;
export const AlertDialogDescription: ComponentType<AlertDialogPartProps>;
export const AlertDialogAction: ComponentType<AlertDialogPartProps>;
export const AlertDialogCancel: ComponentType<AlertDialogPartProps>;
