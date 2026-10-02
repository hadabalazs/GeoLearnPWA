import type { ComponentType } from 'react';

export const Switch: ComponentType<{
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}>;
