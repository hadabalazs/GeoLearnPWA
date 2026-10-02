import type { ComponentType, ReactNode } from 'react';

type DrawerPartProps = { children?: ReactNode; className?: string; [key: string]: unknown };

export const Drawer: ComponentType<DrawerPartProps>;
export const DrawerTrigger: ComponentType<DrawerPartProps>;
export const DrawerPortal: ComponentType<DrawerPartProps>;
export const DrawerClose: ComponentType<DrawerPartProps>;
export const DrawerOverlay: ComponentType<DrawerPartProps>;
export const DrawerContent: ComponentType<DrawerPartProps>;
export const DrawerHeader: ComponentType<DrawerPartProps>;
export const DrawerFooter: ComponentType<DrawerPartProps>;
export const DrawerTitle: ComponentType<DrawerPartProps>;
export const DrawerDescription: ComponentType<DrawerPartProps>;
