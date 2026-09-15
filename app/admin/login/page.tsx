'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { styles } from './login.styles';
import {
  titleLabel,
  fieldLabels,
  submitLabel,
  submittingLabel,
  errorLabel,
} from './login.copy';

type SubmitState = 'idle' | 'submitting' | 'error';

const AdminLoginPage = () => {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    setSubmitState('submitting');

  };

  return (
    <main className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>{titleLabel}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className={styles.form}>
            <div className={styles.field}>
              <Label htmlFor='email'>{fieldLabels.email}</Label>
              <Input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor='password'>{fieldLabels.password}</Label>
              <Input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
              />
            </div>
            {submitState === 'error' && (
              <p className={styles.error}>{errorLabel}</p>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type='submit'
              className={styles.submit}
              disabled={submitState === 'submitting'}
            >
              {submitState === 'submitting' ? submittingLabel : submitLabel}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
};

export default AdminLoginPage;
