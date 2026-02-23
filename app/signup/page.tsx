'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { FormikForm } from '@/src/components/forms/FormikForm';
import { TextBox } from '@/src/components/ui/TextBox';
import { Button } from '@/src/components/ui/Button';
import { postJson } from '@/src/services/authService';
import { useTranslation } from '@/src/i18n/useTranslation';

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  isTermsAccepted: number;
  isAcceptNewsletter: number;
}

export default function SignUpPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && successMessage) {
      const timer = setTimeout(() => {
        router.push('/signin');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [countdown, successMessage, router]);

  const signupSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('validation.nameRequired'))
      .matches(/^[^\d]*$/, t('validation.nameNoNumbers')),
    email: Yup.string()
      .email(t('validation.emailInvalid'))
      .required(t('validation.emailRequired')),
    password: Yup.string()
      .min(6, t('validation.passwordMinLength'))
      .required(t('validation.passwordRequired')),
    isTermsAccepted: Yup.number().oneOf([1], t('validation.termsRequired')),
    isAcceptNewsletter: Yup.number(),
  });

  const initialValues: SignupFormValues = {
    name: '',
    email: '',
    password: '',
    isTermsAccepted: 0,
    isAcceptNewsletter: 0,
  };

  const handleSubmit = async (
    values: SignupFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await postJson('/auth/signup/email', values);
      
      if (response.status === 'fail' && response.data?.message) {
        setErrorMessage(response.data.message);
      } else {
        setSuccessMessage(t('message.signupSuccess'));
        setCountdown(10);
        resetForm();
      }
    } catch (err: any) {
      // Handle fetch errors or other exceptions
      if (err.data?.message) {
        setErrorMessage(err.data.message);
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t('message.signupError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const validateName = (value: string) => {
    if (/\d/.test(value)) {
      return t('validation.nameNoNumbers');
    }
    return undefined;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {t('signup.title')}
        </h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {successMessage}
            {countdown > 0 && (
              <p className="mt-2 text-xs">
                {t('message.redirecting') || 'Redirecting to sign-in in'} {countdown}s...
              </p>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <FormikForm
          initialValues={initialValues}
          validationSchema={signupSchema}
          onSubmit={handleSubmit}
        >
          {(formik) => (
            <>
              <TextBox
                name="name"
                label={t('signup.fullName')}
                placeholder={t('signup.fullName.placeholder')}
                validate={validateName}
              />
              <TextBox
                name="email"
                label={t('signup.email')}
                type="email"
                placeholder={t('signup.email.placeholder')}
              />
              <TextBox
                name="password"
                label={t('signup.password')}
                type="password"
                placeholder={t('signup.password.placeholder')}
              />
              <TextBox
                name="isTermsAccepted"
                type="checkbox"
                label={t('signup.terms')}
              />
              <TextBox
                name="isAcceptNewsletter"
                type="checkbox"
                label={t('signup.newsletter')}
              />
              <Button
                type="submit"
                label={t('signup.submit')}
                disabled={formik.isSubmitting}
              />
            </>
          )}
        </FormikForm>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('signup.haveAccount')}{' '}
          <a href="/signin" className="text-blue-600 hover:underline font-medium">
            {t('signup.signIn')}
          </a>
        </p>
      </div>
    </div>
  );
}
