'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_CONFIG } from './OnboardingConfig';
import { OnboardingStep } from './OnboardingStep';
import { updateUserProfile } from '../../lib/authClient';
import type { UserRole } from '../../lib/authClient';

interface OnboardingFormProps {
  role: UserRole;
  initialData?: Record<string, any>;
}

export function OnboardingForm({ role, initialData = {} }: OnboardingFormProps) {
  const router = useRouter();
  const config = ONBOARDING_CONFIG[role as keyof typeof ONBOARDING_CONFIG];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return <div>Invalid role selected. Please contact support.</div>;
  }

  const currentStep = config.steps[currentStepIndex];

  const updateFormData = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleNext = async () => {
    if (currentStepIndex < config.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Last step - complete onboarding
      setLoading(true);
      setError(null);
      try {
        await updateUserProfile(formData);
        router.push(`/dashboard/${role}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Onboarding failed');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <OnboardingStep
        step={currentStep}
        values={formData}
        onChange={updateFormData}
        onNext={handleNext}
        isLastStep={currentStepIndex === config.steps.length - 1}
      />

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center space-x-2">
        {config.steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}