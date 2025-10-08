import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Menu, Search } from 'lucide-react';

export default function Navbar() {
  const { user, token } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/explore');
    setSearch('');
  };

  return (
    <nav className='w-full bg-black text-white px-4 sm:px-6 py-4 relative'>
      <div className='w-full max-w-[1440px] mx-auto flex items-center justify-between'>
        {/* Left: Logo */}
        <Link to='/' className='flex items-center gap-2'>
          <img
            src='/navbar.png'
            alt='Sociality logo'
            className='w-[32px] h-[32px] object-contain'
          />
          <span className='hidden md:flex font-bold text-xl'>Sociality</span>
        </Link>

        {/* Middle: Search bar (desktop only) */}
        <form
          onSubmit={handleSearch}
          className='hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-md'
        >
          <input
            type='text'
            placeholder='Search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600'
          />
          <button
            type='submit'
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white'
          >
            <Search size={18} />
          </button>
        </form>

        {/* Right */}
        <div className='flex items-center gap-4 relative'>
          {/* Mobile search icon */}
          <button
            onClick={() => navigate('/explore')}
            className='block md:hidden text-gray-400 hover:text-white'
          >
            <Search className='w-6 h-6' />
          </button>

          {!token && (
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className='block md:hidden'
            >
              <Menu className='w-6 h-6' />
            </button>
          )}

          {token ? (
            <div className='relative'>
              <button
                onClick={() => setOpen((p) => !p)}
                className='flex items-center gap-2'
              >
                <div className='w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold'>
                  {initials}
                </div>
                <span className='hidden md:inline text-sm font-medium'>
                  {user?.name || 'User'}
                </span>
              </button>

              {open && (
                <div className='absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg py-2 z-50'>
                  <Link
                    to='/profile'
                    className='block px-4 py-2 text-sm hover:bg-neutral-800'
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setOpen(false);
                      navigate('/login');
                    }}
                    className='block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Login & Register */}
              <div className='hidden md:flex items-center gap-3'>
                <Link
                  to='/login'
                  className='px-4 py-2 border border-neutral-700 rounded-full text-sm font-medium hover:bg-neutral-800'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700'
                >
                  Register
                </Link>
              </div>

              {/* Mobile dropdown (Hamburger menu) */}
              {mobileOpen && (
                <div className='absolute top-14 right-0 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg py-2 z-50 md:hidden'>
                  <Link
                    to='/login'
                    className='block px-4 py-2 text-sm hover:bg-neutral-800'
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to='/register'
                    className='block px-4 py-2 text-sm hover:bg-neutral-800'
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
