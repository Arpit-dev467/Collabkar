'use client';

import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  const widthClass = className.includes('max-w-') ? '' : 'max-w-md';
  return <div className={`w-full ${widthClass} rounded-2xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur p-6 ${className}`}>{children}</div>;
}

export function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-2xl font-semibold tracking-tight text-gray-900 ${className}`}>{children}</h1>;
}

export function SubtleText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
}

export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium text-gray-800 mb-1">{children}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        className || '',
      ].join(' ')}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={[
        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        className || '',
      ].join(' ')}
    />
  );
}

export function PrimaryButton({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        'w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium shadow-sm',
        'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-60 disabled:hover:bg-blue-600',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        'w-full rounded-lg bg-gray-900 text-white py-2.5 font-medium shadow-sm',
        'hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2',
        'disabled:opacity-60 disabled:hover:bg-gray-900',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}
