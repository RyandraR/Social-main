import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

interface RegisterResponse {
  message: string;
}

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const registerMutation = useMutation<
    AxiosResponse<RegisterResponse>,
    Error,
    RegisterPayload
  >({
    mutationFn: (data: RegisterPayload) =>
      api.post<RegisterResponse>('/api/auth/register', data),

    onSuccess: () => {
      navigate('/login');
    },

    onError: () => {
      alert('Register failed, please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    registerMutation.mutate({ name, username, email, phone, password });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-900 to-black px-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg'
      >
        <h1 className='text-3xl font-bold text-white mb-10'>Sociality</h1>

        <h2 className='text-2xl font-semibold mb-1 text-white'>Register</h2>
        <p className='text-sm text-gray-300 mb-6'>
          Create your Sociality account.
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Full Name'
          required
          className='border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Username'
          required
          className='border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          type='email'
          required
          className='border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='Phone Number'
          required
          className='border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          required
          className='border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <input
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm Password'
          required
          className='border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <button
          type='submit'
          className='w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition'
        >
          Submit
        </button>

        <p className='text-sm text-gray-300 text-center mt-4'>
          Already have an account?{' '}
          <Link to='/login' className='text-purple-400 hover:underline'>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
