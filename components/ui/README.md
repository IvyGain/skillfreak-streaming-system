# UI Component Library

A collection of reusable, type-safe React components for the SkillFreak Portal, built with TypeScript strict mode and Tailwind CSS.

## Components

### Button

A flexible button component with multiple variants, sizes, and states.

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost' | 'danger'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `loading`: `boolean` (default: `false`)
- `disabled`: `boolean` (default: `false`)
- `fullWidth`: `boolean` (default: `false`)

**Example:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

<Button variant="danger" loading disabled>
  Processing...
</Button>
```

### Card

A card container with optional glassmorphism and hover effects.

**Props:**
- `hover`: `boolean` (default: `true`) - Enable hover animation
- `glass`: `boolean` (default: `false`) - Enable glassmorphism effect

**Example:**
```tsx
import { Card } from '@/components/ui';

<Card hover>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</Card>

<Card glass className="p-6">
  <p>Glassmorphism card</p>
</Card>
```

### Badge

A badge component for status indicators and labels.

**Props:**
- `variant`: `'success' | 'warning' | 'error' | 'info'` (default: `'info'`)
- `size`: `'sm' | 'md'` (default: `'md'`)

**Example:**
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="md">
  Live
</Badge>

<Badge variant="error" size="sm">
  Error
</Badge>
```

### Spinner

A loading spinner with customizable size and color.

**Props:**
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `color`: `string` (default: `'text-purple-500'`) - Tailwind color class

**Example:**
```tsx
import { Spinner } from '@/components/ui';

<Spinner size="md" />

<Spinner size="lg" color="text-purple-500" />
```

### Input

An input field with label, error messages, and icon support.

**Props:**
- `label`: `string` - Input label
- `error`: `string` - Error message to display
- `icon`: `ReactNode` - Icon to display on the left
- `helperText`: `string` - Helper text below input

**Example:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Invalid email address"
/>

<Input
  label="Search"
  placeholder="Search events..."
  icon={<SearchIcon />}
/>
```

## Usage

Import all components from the main index:

```tsx
import { Button, Card, Badge, Spinner, Input } from '@/components/ui';
```

Or import individually:

```tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
```

## Demo

View all components in action at `/ui-demo`

## Design System

All components follow the SkillFreak Portal design system:

- **Colors**: Purple gradients, dark backgrounds
- **Borders**: Rounded corners (12px-24px)
- **Transitions**: Smooth 200ms animations
- **Typography**: Geist Sans font family
- **Accessibility**: Keyboard navigation, ARIA labels

## TypeScript

All components are built with TypeScript strict mode:

- Full type safety
- IntelliSense support
- `forwardRef` for ref forwarding
- Generic props extending HTML element attributes

## Contributing

When adding new components:

1. Create the component in `components/ui/ComponentName.tsx`
2. Export from `components/ui/index.ts`
3. Add JSDoc documentation
4. Include usage examples
5. Update this README

## Related

- **Design Tokens**: See `app/globals.css` for CSS custom properties
- **Tailwind Config**: See `tailwind.config.ts` for theme configuration
- **Existing Components**: See `components/portal/` for portal-specific components
