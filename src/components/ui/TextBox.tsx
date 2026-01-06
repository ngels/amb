'use client';

import React from 'react';
import { useField } from 'formik';

interface TextBoxProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'checkbox';
  placeholder?: string;
  validate?: (value: any) => string | undefined;
  className?: string;
}

export const TextBox: React.FC<TextBoxProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  validate,
  className = '',
}) => {
  const [field, meta] = useField({ name, validate, type });

  if (type === 'checkbox') {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={field.value === 1}
            onChange={(e) => {
              field.onChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.target.checked ? 1 : 0,
                  name: field.name,
                },
              });
            }}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>
        {meta.touched && meta.error && (
          <div className="text-red-600 text-xs mt-1">{meta.error}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={name}
        {...field}
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          meta.touched && meta.error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        }`}
      />
      {meta.touched && meta.error && (
        <div className="text-red-600 text-xs mt-1">{meta.error}</div>
      )}
    </div>
  );
};
