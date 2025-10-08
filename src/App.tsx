import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import UpdateProfile from './pages/UpdateProfile';
import AddPost from './pages/AddPost';
import Explore from './pages/Explore';
import FollowersList from './pages/FollowersList';
import FollowingList from './pages/FollowingList';
import Saved from './pages/Saved'; // ✅ tambahkan ini

export default function App() {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/create' element={<AddPost />} />
          <Route path='/profile' element={<MyProfile />} />
          <Route path='/user/:username' element={<UserProfile />} />
          <Route path='/user/:username/followers' element={<FollowersList />} />
          <Route path='/user/:username/following' element={<FollowingList />} />
          <Route path='/update-profile' element={<UpdateProfile />} />
          <Route path='/explore' element={<Explore />} />
          <Route path='/saved' element={<Saved />} /> {/* ✅ route baru */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
    </div>
  );
}
