'use client';

import React, { useState } from 'react';
import * as Yup from 'yup';
import { FormikForm } from '@/src/components/forms/FormikForm';
import { TextBox } from '@/src/components/ui/TextBox';
import { Button } from '@/src/components/ui/Button';
import { postJson } from '@/src/services/authService';
import { useTranslation } from '@/src/i18n/useTranslation';
import { SigninFooter } from '../signin/SigninFooter';

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('validation.emailInvalid'))
      .required(t('validation.emailRequired')),
  });

  const initialValues: ForgotPasswordFormValues = {
    email: '',
  };

  const handleSubmit = async (
    values: ForgotPasswordFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await postJson('/auth/forgot/password', values);
      setSuccessMessage(t('message.forgotPasswordSuccess'));
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || t('message.forgotPasswordError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            {t('forgotPassword.title')}
          </h1>
          <p className="text-center text-sm text-gray-600 mb-8">
            {t('forgotPassword.description')}
          </p>

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
            validationSchema={forgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {(formik) => (
              <>
                <TextBox
                  name="email"
                  label={t('forgotPassword.email')}
                  type="email"
                  placeholder={t('forgotPassword.email.placeholder')}
                />
                <Button
                  type="submit"
                  label={t('forgotPassword.submit')}
                  disabled={formik.isSubmitting}
                />
              </>
            )}
          </FormikForm>

          <p className="text-center text-sm text-gray-600 mt-6">
            {t('forgotPassword.rememberPassword')}{' '}
            <a href="/signin" className="text-blue-600 hover:underline font-medium">
              {t('forgotPassword.signIn')}
            </a>
          </p>
        </div>
      </div>
      <SigninFooter className="mt-8" />
    </div>
  );
}
