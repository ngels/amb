'use client';

import React from 'react';
import { Formik, FormikConfig, FormikProps, FormikValues } from 'formik';

interface FormikFormProps<Values extends FormikValues> {
  initialValues: Values;
  validationSchema?: any;
  onSubmit: FormikConfig<Values>['onSubmit'];
  children: (formik: FormikProps<Values>) => React.ReactNode;
}

export function FormikForm<Values extends FormikValues>({
  initialValues,
  validationSchema,
  onSubmit,
  children,
}: FormikFormProps<Values>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <form onSubmit={formik.handleSubmit} className="w-full max-w-md">
          {children(formik)}
        </form>
      )}
    </Formik>
  );
}
