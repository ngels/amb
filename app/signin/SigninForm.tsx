'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { FormikForm } from '@/src/components/forms/FormikForm';
import { TextBox } from '@/src/components/ui/TextBox';
import { Button } from '@/src/components/ui/Button';
import { useTranslation } from '@/src/i18n/useTranslation';

export function SigninForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const signinSchema = Yup.object().shape({
    email: Yup.string().email(t('validation.emailInvalid')).required(t('validation.emailRequired')),
    password: Yup.string().required(t('validation.passwordRequired')),
  });

  const initialValues = { email: '', password: '' };

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const body = await response.json();
      if (!response.ok || body?.status === 'fail') {
        const message = body?.data?.message || body?.message || t('message.signinError');
        setErrorMessage(message);
      } else {
        setSuccessMessage(t('message.signinSuccess'));
        try {
          if (typeof window !== 'undefined') {
            if (body?.data?.permissions) {
              localStorage.setItem('userPermissions', body.data.permissions);
            } else {
              localStorage.removeItem('userPermissions');
            }
            if (body?.data?.accessToken) {
              localStorage.setItem('accessToken', body.data.accessToken);
            }
            if (body?.data?.loginToken) {
              localStorage.setItem('loginToken', body.data.loginToken);
            }
          }
        } catch (e) {}
        router.push('/dashboard');
      }
    } catch (error: any) {
      setErrorMessage(error?.message || t('message.signinError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800" data-testid="signin-title">
          {t('signin.title')}
        </h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <FormikForm initialValues={initialValues} validationSchema={signinSchema} onSubmit={handleSubmit}>
          {(formik) => (
            <>
              <TextBox
                name="email"
                label={t('signin.email')}
                type="email"
                placeholder={t('signin.email.placeholder')}
              />
              <TextBox
                name="password"
                label={t('signin.password')}
                type="password"
                placeholder={t('signin.password.placeholder')}
              />
              <Button type="submit" label={t('signin.submit')} disabled={formik.isSubmitting} />
            </>
          )}
        </FormikForm>
      </div>
    </div>
  );
}
