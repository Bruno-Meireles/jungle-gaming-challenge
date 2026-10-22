import { DialogClose, DialogDescription, DialogTitle } from '../dialog';
import type { DialogCloseProps, DialogDescriptionProps, DialogTitleProps } from '../dialog';

export type SheetTitleProps = DialogTitleProps;
export type SheetDescriptionProps = DialogDescriptionProps;
export type SheetCloseProps = DialogCloseProps;

export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
export const SheetClose = DialogClose;
