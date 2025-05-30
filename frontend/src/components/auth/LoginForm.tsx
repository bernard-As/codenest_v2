// frontend/src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../stores';
import type { LoginCredentials } from '../../types/auth';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Assuming you have Aceternity UI Input and a Button component
import { AceternityInput } from '../ui/aceternity/Input'; // Adjust path
import { MovingBorderButton } from '../ui/aceternity/buttons'; // Your Aceternity style button

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

const FormLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    {children}
  </label>
);

const LoginForm: React.FC = observer(() => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await authStore.login(formData);
    if (success) {
      navigate('/'); // Navigate to home or dashboard after successful login
    }
    // Error messages are displayed via authStore.error if login fails
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome Back to CodeNest
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Log in to continue your academic journey
      </p>

      {authStore.error && (
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {authStore.error}
        </div>
      )}

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <FormLabel htmlFor="email">Email Address</FormLabel>
          <AceternityInput
            id="email"
            name="email"
            placeholder="yourname@rdu.edu.tr" // Updated placeholder
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <FormLabel htmlFor="password">Password</FormLabel>
          <AceternityInput
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </LabelInputContainer>

        <MovingBorderButton
          type="submit"
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          disabled={authStore.isLoading}
        >
          {authStore.isLoading ? 'Logging in...' : 'Log in'}
          <BottomGradient />
        </MovingBorderButton>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
});

// You can reuse the BottomGradient from RegisterForm or keep it here
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

export default LoginForm;