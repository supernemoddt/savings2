"use client";
import {ReactNode} from 'react';
import {X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Progress} from '@/components/ui/progress';
export function Picker({value,onChange,options,label}:{value:string,onChange:(v:string)=>void,options:{value:string,label:string}[],label:string}){return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="picker"><SelectValue/></SelectTrigger><SelectContent>{options.map(o=><SelectItem value={o.value} key={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>}
export function Modal({title,description,children,onClose}:{title:string,description:string,children:ReactNode,onClose:()=>void}){return <Dialog open onOpenChange={v=>!v&&onClose()}><DialogContent className="form-modal" showCloseButton={false}><DialogClose className="close-button" aria-label="Закрити"><X size={19}/></DialogClose><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription>{children}</DialogContent></Dialog>}
export type Confirmation={title:string,description:string,action:()=>void};
export function ConfirmDialog({value,onClose}:{value:Confirmation|null,onClose:()=>void}){return <AlertDialog open={!!value} onOpenChange={v=>!v&&onClose()}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{value?.title}</AlertDialogTitle><AlertDialogDescription>{value?.description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Скасувати</AlertDialogCancel><AlertDialogAction onClick={()=>{value?.action();onClose()}}>Підтвердити</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
export function ProgressBar({value,color}:{value:number,color:string}){return <Progress aria-label="Прогрес до цілі" value={Math.min(100,value)} className="jar-progress" style={{'--jar-color':color} as React.CSSProperties}/>}
