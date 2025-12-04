'use client';

import { useState } from 'react';
import { Button, Card, Badge, Spinner, Input } from '@/components/ui';

/**
 * UI Component Library Demo Page
 *
 * Showcases all available UI components with examples
 */
export default function UIDemo() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            UI Component Library
          </h1>
          <p className="text-gray-400 text-lg">
            Reusable React components for SkillFreak Portal
          </p>
        </div>

        {/* Button Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Button</h2>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" loading>
                  Loading
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="primary" onClick={handleLoadingDemo}>
                  {loading ? 'Processing...' : 'Test Loading'}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Full Width</h3>
              <Button variant="primary" fullWidth>
                Full Width Button
              </Button>
            </div>
          </Card>
        </section>

        {/* Card Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Card</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Default Card</h3>
              <p className="text-gray-400">
                A card with hover effect enabled by default
              </p>
            </Card>

            <Card glass className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Glassmorphism Card</h3>
              <p className="text-gray-400">
                A card with glass effect and backdrop blur
              </p>
            </Card>

            <Card hover={false} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">No Hover Effect</h3>
              <p className="text-gray-400">
                A static card without hover animation
              </p>
            </Card>
          </div>
        </section>

        {/* Badge Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Badge</h2>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success" size="sm">Small Badge</Badge>
                <Badge variant="success" size="md">Medium Badge</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Use Cases</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success">Live</Badge>
                <Badge variant="info">Archive</Badge>
                <Badge variant="warning">Upcoming</Badge>
                <Badge variant="error">Cancelled</Badge>
              </div>
            </div>
          </Card>
        </section>

        {/* Spinner Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Spinner</h2>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center">
                  <Spinner size="sm" />
                  <p className="text-sm text-gray-400 mt-2">Small</p>
                </div>
                <div className="text-center">
                  <Spinner size="md" />
                  <p className="text-sm text-gray-400 mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="text-sm text-gray-400 mt-2">Large</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Custom Colors</h3>
              <div className="flex flex-wrap items-center gap-8">
                <Spinner color="text-purple-500" />
                <Spinner color="text-pink-500" />
                <Spinner color="text-green-500" />
                <Spinner color="text-yellow-500" />
                <Spinner color="text-red-500" />
              </div>
            </div>
          </Card>
        </section>

        {/* Input Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Input</h2>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Input</h3>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                helperText="We'll never share your email with anyone else."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Input with Icon</h3>
              <Input
                label="Search"
                type="text"
                placeholder="Search events..."
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Input with Error</h3>
              <Input
                label="Email Validation"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange}
                error={emailError}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Disabled Input</h3>
              <Input
                label="Disabled"
                type="text"
                placeholder="This input is disabled"
                disabled
                value="Cannot edit this"
              />
            </div>
          </Card>
        </section>

        {/* Combined Example */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Combined Example</h2>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Event Registration</h3>
                <Badge variant="success">Open</Badge>
              </div>

              <p className="text-gray-400">
                Register for our upcoming event. Fill in your details below.
              </p>

              <div className="space-y-4 mt-6">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <div className="flex gap-3 pt-4">
                  <Button variant="primary" fullWidth>
                    Register Now
                  </Button>
                  <Button variant="secondary">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-500">
            Built with TypeScript strict mode + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
