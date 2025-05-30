// frontend/src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../stores';
import type { RegisterData } from '../../types/auth';
import { Link, useNavigate } from 'react-router-dom';
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


const RegisterForm: React.FC = observer(() => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    role: 'STUDENT', // Default role
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await authStore.register(formData);
    if (success) {
      // On successful registration, backend logs them in and returns tokens
      // AuthStore handles setting isAuthenticated
      navigate('/'); // Navigate to home or dashboard
    }
    // Error messages are displayed via authStore.error
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome to CodeNest
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Create your account to start collaborating
      </p>

      {authStore.error && (
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {authStore.error}
        </div>
      )}

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <LabelInputContainer>
            <FormLabel htmlFor="first_name">First name</FormLabel>
            <AceternityInput id="first_name" name="first_name" placeholder="Ada" type="text" value={formData.first_name} onChange={handleChange} required />
          </LabelInputContainer>
          <LabelInputContainer>
            <FormLabel htmlFor="last_name">Last name</FormLabel>
            <AceternityInput id="last_name" name="last_name" placeholder="Lovelace" type="text" value={formData.last_name} onChange={handleChange} required />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <FormLabel htmlFor="email">Email Address (University Email)</FormLabel>
          <AceternityInput id="email" name="email" placeholder="yourname@university.edu" type="email" value={formData.email} onChange={handleChange} required />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <FormLabel htmlFor="password">Password</FormLabel>
          <AceternityInput id="password" name="password" placeholder="••••••••" type="password" value={formData.password} onChange={handleChange} required />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <FormLabel htmlFor="password2">Confirm password</FormLabel>
          <AceternityInput id="password2" name="password2" placeholder="••••••••" type="password" value={formData.password2} onChange={handleChange} required />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <FormLabel htmlFor="role">I am a...</FormLabel>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="block w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
            // TODO: Style this select with Tailwind/Aceternity if a custom select is available
          >
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
            <option value="ADVISOR">Advisor</option>
          </select>
        </LabelInputContainer>

        <MovingBorderButton
          type="submit"
          className="rounded-md bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          disabled={authStore.isLoading}
        >
          {authStore.isLoading ? 'Registering...' : 'Sign up'}
          <BottomGradient />
        </MovingBorderButton>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        {/* Optional: Social login buttons if you plan to add them */}
        {/* <div className="flex flex-col space-y-4"> ... </div> */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
});

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

export default RegisterForm;