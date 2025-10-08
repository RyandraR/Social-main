import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import api, { setAuthToken } from '../api/axios';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

// ✅ Sesuaikan sama response dari backend kamu
interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loginMutation = useMutation<
    AxiosResponse<LoginResponse>,
    Error,
    LoginPayload
  >({
    mutationFn: (data: LoginPayload) =>
      api.post<LoginResponse>('/api/auth/login', data),

    onSuccess: (res) => {
      try {
        const { token, user } = res.data.data;

        // set default axios header
        setAuthToken(token);

        // simpan ke redux + localStorage
        dispatch(setCredentials({ token, user }));

        navigate('/');
      } catch (err) {
        console.error('Error handling login response:', err);
        alert('Login success but failed to parse user data.');
      }
    },

    onError: () => {
      alert('Login failed, check your credentials.');
    },
  });

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-900 to-black px-4'>
      <h1 className='text-3xl font-bold text-white mb-10'>Sociality</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loginMutation.mutate({ email, password });
        }}
        className='w-full max-w-sm bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg'
      >
        <h2 className='text-2xl font-semibold mb-1 text-white'>Login</h2>
        <p className='text-sm text-gray-300 mb-6'>
          Sign in to your Sociality account.
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          type='email'
          required
          className='border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          required
          className='border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
        <button
          type='submit'
          className='w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition'
        >
          Login
        </button>

        <p className='text-sm text-gray-300 mt-4 text-center'>
          Don't have an account?{' '}
          <Link to='/register' className='text-purple-400 hover:underline'>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
