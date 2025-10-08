import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, PlusCircle, User } from 'lucide-react';

export default function Menu() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50'>
      <div className='w-[360px] h-[80px] bg-neutral-900 rounded-2xl flex items-center justify-around shadow-lg'>
        {/* Home */}
        <Link to='/' className='flex flex-col items-center'>
          <Home
            size={26}
            className={isActive('/') ? 'text-purple-500' : 'text-gray-400'}
          />
          <span
            className={`text-xs ${
              isActive('/') ? 'text-purple-500' : 'text-gray-400'
            }`}
          >
            Home
          </span>
        </Link>

        {/* Explore */}
        <Link to='/explore' className='flex flex-col items-center'>
          <Compass
            size={26}
            className={
              isActive('/explore') ? 'text-purple-500' : 'text-gray-400'
            }
          />
          <span
            className={`text-xs ${
              isActive('/explore') ? 'text-purple-500' : 'text-gray-400'
            }`}
          >
            Explore
          </span>
        </Link>

        {/* Add Post */}
        <Link to='/create' className='flex flex-col items-center'>
          <PlusCircle
            size={36}
            className={
              isActive('/create') ? 'text-purple-500' : 'text-gray-400'
            }
          />
        </Link>

        {/* Profile */}
        <Link to='/profile' className='flex flex-col items-center'>
          <User
            size={26}
            className={
              isActive('/profile') ? 'text-purple-500' : 'text-gray-400'
            }
          />
          <span
            className={`text-xs ${
              isActive('/profile') ? 'text-purple-500' : 'text-gray-400'
            }`}
          >
            Profile
          </span>
        </Link>
      </div>
    </div>
  );
}
