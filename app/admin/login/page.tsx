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
  CardFooter
} from '@/components/ui/card';
import { login } from '@/api/auth/login';
import { ROUTES } from '@/constants';
import { styles } from './login.styles';
import {
  titleLabel,
  fieldLabels,
  submitLabel,
  submittingLabel,
  errorLabel
} from './login.copy';

type SubmitState = 'idle' | 'submitting' | 'error';

const AdminLoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const isFormFilled = email.trim() !== '' && password.trim() !== '';
  const isDisabled = submitState === 'submitting' || !isFormFilled;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitState('submitting');

    try {
      const response = await login(email, password);

      if (!response.ok) {
        setSubmitState('error');
        return;
      }

      router.push(ROUTES.ADMIN_HOME);
      router.refresh();
    } catch {
      setSubmitState('error');
    }
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
              <Label htmlFor="email">{fieldLabels.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="password">{fieldLabels.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {submitState === 'error' && (
              <p className={styles.error}>{errorLabel}</p>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isDisabled}
              className={styles.submit}
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
