import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';
import { APP_NAME } from '../utils/constants.js';
import { backendApi } from '../redux/api.js';
import { toUserMessage } from '../utils/userMessage.js';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      window.addEventListener('click', onClickOutside);
    }
    return () => window.removeEventListener('click', onClickOutside);
  }, [showUserMenu]);

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  const deleteAccountHandler = async () => {
    const confirmed = window.confirm('Delete your account permanently? This will remove your favorites and history.');
    if (!confirmed) return;

    try {
      await backendApi.delete('/auth/me');
      dispatch(logout());
      navigate('/signup');
    } catch (error) {
      console.error('Delete account failed:', error);
      alert(toUserMessage(error, 'Unable to delete account right now.'));
    }
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-2 py-1 rounded-md transition ${isActive ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-300 hover:text-white'}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all ${
        isScrolled ? 'bg-slate-950/95 backdrop-blur border-slate-800' : 'bg-gradient-to-b from-black/70 to-transparent border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-2xl font-black tracking-tight text-white leading-none">
          <span className="text-cyan-400">{APP_NAME.slice(0, 4)}</span>
          {APP_NAME.slice(4)}
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/search" className={linkClass}>
            Search
          </NavLink>
          {userInfo ? <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink> : null}
          {userInfo?.isAdmin ? <NavLink to="/admin" className={linkClass}>Admin</NavLink> : null}
          {userInfo ? (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="h-10 w-10 rounded-full border border-slate-600 bg-slate-900 text-cyan-400 font-bold hover:border-cyan-400 transition"
                title="User menu"
              >
                {(userInfo?.name || userInfo?.email || 'U').charAt(0).toUpperCase()}
              </button>
              {showUserMenu ? (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-3 z-50">
                  <p className="text-xs text-slate-400">Logged in as</p>
                  <p className="text-sm font-semibold text-white truncate mt-1">{userInfo?.name || 'User'}</p>
                  <p className="text-xs text-slate-300 truncate mt-1">{userInfo?.email || 'No email'}</p>
                  <p className="text-[11px] text-cyan-300 mt-2">
                    Role: {userInfo?.isAdmin ? 'Admin' : 'User'}
                  </p>
                  <button
                    onClick={logoutHandler}
                    className="mt-3 w-full px-3 py-2 rounded-lg bg-cyan-400 text-slate-950 text-sm font-semibold hover:opacity-90"
                  >
                    Log Out
                  </button>
                  <button
                    onClick={deleteAccountHandler}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-red-300/50 text-red-300 text-sm font-semibold hover:bg-red-300/10"
                  >
                    Delete My Account
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 text-sm font-semibold hover:opacity-90">
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
