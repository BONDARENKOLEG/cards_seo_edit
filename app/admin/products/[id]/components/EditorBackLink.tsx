'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useEditorDirty } from '../EditorDirtyContext';
import {
  unsavedChangesTitle,
  unsavedChangesDescription,
  leaveLabel,
  stayLabel
} from '../editor.copy';

const styles = {
  link: cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-start'),
  stay: 'cursor-pointer',
  leave: 'cursor-pointer'
};

type EditorBackLinkProps = {
  href: string;
  label: string;
};

export const EditorBackLink = ({ href, label }: EditorBackLinkProps) => {
  const router = useRouter();
  const { isDirty } = useEditorDirty();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isDirty) return;

    event.preventDefault();
    setConfirmOpen(true);
  };

  const handleLeave = () => {
    setConfirmOpen(false);
    router.push(href);
  };

  return (
    <>
      <Link href={href} className={styles.link} onClick={handleClick}>
        <ArrowLeft />
        {label}
      </Link>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{unsavedChangesTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {unsavedChangesDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="default" className={styles.stay}>
              {stayLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              className={styles.leave}
              onClick={handleLeave}
            >
              {leaveLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
