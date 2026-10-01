'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signup } from '../../lib/authClient';
import type { AuthUser } from '../../lib/authClient';
import { BrandLogo } from '../_components/BrandLogo';
import { SocialAuthButtons } from '../_components/SocialAuthButtons';
import { Card, Divider, ErrorBanner, Label, PrimaryButton, Select, SubtleText, TextInput, Title } from '../_components/ui';

type Role = 'creator' | 'brand';

type SignupForm = {
  email: string;
  password: string;
  role: Role;
  displayName: string;
  companyName: string;
  creatorCategory: string;
  primaryPlatform: string;
  teamSize: string;
  website: string;
  location: string;
  bio: string;
  phone: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  x: string;
};

const initialForm: SignupForm = {
  email: '',
  password: '',
  role: 'creator',
  displayName: '',
  companyName: '',
  creatorCategory: '',
  primaryPlatform: 'instagram',
  teamSize: '',
  website: '',
  location: '',
  bio: '',
  phone: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  linkedin: '',
  x: '',
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof SignupForm>(key: K, value: SignupForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const profile: AuthUser['profile'] = {
      displayName: form.displayName,
      companyName: form.role === 'brand' ? form.companyName : '',
      creatorCategory: form.role === 'creator' ? form.creatorCategory : '',
      primaryPlatform: form.role === 'creator' ? form.primaryPlatform : '',
      teamSize: form.role === 'brand' ? form.teamSize : '',
      website: form.website,
      location: form.location,
      bio: form.bio,
      phone: form.phone,
      socialHandles: {
        instagram: form.instagram,
        tiktok: form.tiktok,
        youtube: form.youtube,
        linkedin: form.linkedin,
        x: form.x,
        website: form.website,
      },
    };

    try {
      const result = await signup(form.email, form.password, form.role, profile);
      if (result.requiresEmailVerification) {
        const query = new URLSearchParams({ email: form.email });
        if (!result.verificationEmailSent) query.set('sent', 'false');
        router.replace(`/verify-email?${query.toString()}`);
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <Card>
        <div className="mb-6 space-y-3">
          <BrandLogo imageClassName="h-11 w-auto" priority />
          <div>
            <Title>Create your startup-ready account</Title>
            <SubtleText>Set up your role, profile basics, and social handles in one flow.</SubtleText>
          </div>
        </div>

        <div className="mb-6">
          <SocialAuthButtons redirect="/dashboard" />
        </div>

        <div className="mb-6">
          <Divider />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Account type</Label>
            <Select
              value={form.role}
              onChange={(e) => update('role', e.target.value as Role)}
            >
              <option value="creator">Creator</option>
              <option value="brand">Brand</option>
            </Select>
          </div>

          <div>
            <Label>{form.role === 'brand' ? 'Full name or team lead' : 'Your name'}</Label>
            <TextInput
              value={form.displayName}
              onChange={(e) => update('displayName', e.target.value)}
              placeholder={form.role === 'brand' ? 'Aisha Perera' : 'Kasun Silva'}
              required
            />
          </div>

          {form.role === 'brand' ? (
            <>
              <div>
                <Label>Company name</Label>
                <TextInput
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  placeholder="Collabkar Labs"
                  required
                />
              </div>
              <div>
                <Label>Team size</Label>
                <Select value={form.teamSize} onChange={(e) => update('teamSize', e.target.value)}>
                  <option value="">Select team size</option>
                  <option value="1-5">1-5</option>
                  <option value="6-20">6-20</option>
                  <option value="21-50">21-50</option>
                  <option value="50+">50+</option>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Creator category</Label>
                <Select value={form.creatorCategory} onChange={(e) => update('creatorCategory', e.target.value)}>
                  <option value="">Select category</option>
                  <option value="tech">Tech</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                  <option value="fitness">Fitness</option>
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="business">Business</option>
                </Select>
              </div>
              <div>
                <Label>Primary platform</Label>
                <Select value={form.primaryPlatform} onChange={(e) => update('primaryPlatform', e.target.value)}>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="x">X</option>
                  <option value="linkedin">LinkedIn</option>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label>Email</Label>
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <TextInput
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              minLength={12}
              placeholder="At least 12 characters"
              required
            />
          </div>

          <div>
            <Label>Website</Label>
            <TextInput
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://your-site.com"
            />
          </div>

          <div>
            <Label>Location</Label>
            <TextInput
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Colombo, Sri Lanka"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <TextInput
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+94 77 123 4567"
            />
          </div>

          <div>
            <Label>Bio</Label>
            <textarea
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              rows={4}
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              placeholder={form.role === 'brand' ? 'Tell creators what your brand does and what campaigns you run.' : 'Describe your audience, content style, and what brands should know.'}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="mb-3">
              <Label>Social handles</Label>
              <SubtleText>Add the channels you already use so your account is ready for integrations.</SubtleText>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput value={form.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="Instagram handle" />
              <TextInput value={form.tiktok} onChange={(e) => update('tiktok', e.target.value)} placeholder="TikTok handle" />
              <TextInput value={form.youtube} onChange={(e) => update('youtube', e.target.value)} placeholder="YouTube handle" />
              <TextInput value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} placeholder="LinkedIn handle" />
              <TextInput value={form.x} onChange={(e) => update('x', e.target.value)} placeholder="X handle" />
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </PrimaryButton>
        </form>

        <div className="mt-4 text-sm text-gray-700">
          Already have an account? <Link className="text-blue-700 underline" href="/login">Log in</Link>
        </div>
      </Card>
    </div>
  );
}
