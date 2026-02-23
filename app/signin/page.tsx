'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { FormikForm } from '@/src/components/forms/FormikForm';
import { TextBox } from '@/src/components/ui/TextBox';
import { Button } from '@/src/components/ui/Button';
import { postJson } from '@/src/services/authService';
import { useTranslation } from '@/src/i18n/useTranslation';

interface SigninFormValues {
  email: string;
  password: string;
}

export default function SignInPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const signinSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('validation.emailInvalid'))
      .required(t('validation.emailRequired')),
    password: Yup.string().required(t('validation.passwordRequired')),
  });

  const initialValues: SigninFormValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (
    values: SigninFormValues,
    { setSubmitting }: any
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await postJson('/auth/signin/email', values);
      if (response?.status === 'fail' && response.data?.message) {
        setErrorMessage(response.data.message);
      } else {
        setSuccessMessage(t('message.signinSuccess'));
        try {
          if (typeof window !== 'undefined') {
            if (response?.data?.permissions) {
              localStorage.setItem('userPermissions', response.data.permissions);
            } else {
              localStorage.removeItem('userPermissions');
            }
          }
        } catch (e) {
          // ignore localStorage errors
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      if (err?.data?.message) {
        setErrorMessage(err.data.message);
      } else if (err?.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t('message.signinError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
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

        <FormikForm
          initialValues={initialValues}
          validationSchema={signinSchema}
          onSubmit={handleSubmit}
        >
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
              <Button
                type="submit"
                label={t('signin.submit')}
                disabled={formik.isSubmitting}
              />
            </>
          )}
        </FormikForm>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('signin.noAccount')}{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            {t('signin.signup')}
          </a>
        </p>

        <p className="text-center text-sm text-gray-600 mt-2">
          <a
            href="/forgot-password"
            className="text-blue-600 hover:underline font-medium"
          >
            {t('signin.forgotPassword')}
          </a>
        </p>
      </div>
    </div>
  );
}
