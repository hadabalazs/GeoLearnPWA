import type { ComponentType, ReactNode } from 'react';

type DialogPartProps = { children?: ReactNode; className?: string; [key: string]: unknown };

export const Dialog: ComponentType<DialogPartProps>;
export const DialogTrigger: ComponentType<DialogPartProps>;
export const DialogPortal: ComponentType<DialogPartProps>;
export const DialogClose: ComponentType<DialogPartProps>;
export const DialogOverlay: ComponentType<DialogPartProps>;
export const DialogContent: ComponentType<DialogPartProps>;
export const DialogHeader: ComponentType<DialogPartProps>;
export const DialogFooter: ComponentType<DialogPartProps>;
export const DialogTitle: ComponentType<DialogPartProps>;
export const DialogDescription: ComponentType<DialogPartProps>;
