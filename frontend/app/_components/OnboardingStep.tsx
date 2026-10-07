'use client';

import { useState } from 'react';
import { Card, Divider, Label, PrimaryButton, Select, SubtleText, TextInput, Title } from './ui';

interface FieldConfig {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
  fields?: FieldConfig[];
}

interface OnboardingStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    fields: FieldConfig[];
  };
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onNext: () => void;
  isLastStep: boolean;
}

export function OnboardingStep({ step, values, onChange, onNext, isLastStep }: OnboardingStepProps) {
  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <Title>{step.title}</Title>
        <SubtleText>{step.description}</SubtleText>
      </div>

      <Divider />

      <form className="space-y-4">
        {step.fields.map((field) => (
          <div key={field.id} className="space-y-1">
            {field.description && (
              <SubtleText className="text-sm text-gray-500">{field.description}</SubtleText>
            )}

            <Label>{field.label}</Label>

            {field.type === 'text' && (
              <TextInput
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                rows={4}
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

            {field.type === 'select' && (
              <Select
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            )}

            {field.type === 'socialHandles' && (
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {field.fields?.map((socialField) => (
                    <TextInput
                      key={socialField.id}
                      value={values[`socialHandles.${socialField.id}`] || ''}
                      onChange={(e) => onChange(`socialHandles.${socialField.id}`, e.target.value)}
                      placeholder={socialField.placeholder}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <PrimaryButton type="button" onClick={onNext} disabled={isLastStep ? false : false}>
            {isLastStep ? 'Complete Onboarding' : 'Next Step'}
          </PrimaryButton>
        </div>
      </form>
    </Card>
  );
}