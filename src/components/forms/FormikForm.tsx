'use client';

import React from 'react';
import { Formik, FormikConfig, FormikProps } from 'formik';

interface FormikFormProps<Values> {
  initialValues: Values;
  validationSchema?: any;
  onSubmit: FormikConfig<Values>['onSubmit'];
  children: (formik: FormikProps<Values>) => React.ReactNode;
}

export function FormikForm<Values>({
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
