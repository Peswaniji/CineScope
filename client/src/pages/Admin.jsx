import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { backendApi } from '../redux/api.js';
import Loader from '../components/Loader.jsx';
import { toUserMessage } from '../utils/userMessage.js';

const emptyMovie = {
  title: '',
  posterUrl: '',
  description: '',
  movieId: '',
  releaseDate: '',
  trailerLink: '',
  genre: '',
  category: '',
};

const Admin = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newMovie, setNewMovie] = useState(emptyMovie);
  const [editingId, setEditingId] = useState('');
  const [editMovie, setEditMovie] = useState(emptyMovie);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, moviesRes] = await Promise.all([backendApi.get('/admin/users'), backendApi.get('/admin/movies')]);
      setUsers(usersRes.data || []);
      setMovies(moviesRes.data || []);
    } catch (err) {
      console.error('Admin dashboard load failed:', err);
      setError(toUserMessage(err, 'Failed to load admin dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.isAdmin) {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [navigate, userInfo]);

  const activeUsers = useMemo(() => users.filter((u) => !u.isBanned), [users]);
  const bannedUsers = useMemo(() => users.filter((u) => u.isBanned), [users]);

  const onMovieField = (stateSetter) => (e) => {
    const { name, value } = e.target;
    stateSetter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const { data } = await backendApi.post('/admin/movies', newMovie);
      setMovies((prev) => [data, ...prev]);
      setNewMovie(emptyMovie);
    } catch (err) {
      console.error('Add movie failed:', err);
      alert(toUserMessage(err, 'Failed to add movie'));
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try {
      await backendApi.delete(`/admin/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error('Delete movie failed:', err);
      alert(toUserMessage(err, 'Failed to delete movie'));
    }
  };

  const startEdit = (movie) => {
    setEditingId(movie._id);
    setEditMovie({
      title: movie.title || '',
      posterUrl: movie.posterUrl || '',
      description: movie.description || '',
      movieId: movie.movieId || '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : '',
      trailerLink: movie.trailerLink || '',
      genre: movie.genre || '',
      category: movie.category || '',
    });
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await backendApi.put(`/admin/movies/${id}`, editMovie);
      setMovies((prev) => prev.map((m) => (m._id === id ? data : m)));
      setEditingId('');
    } catch (err) {
      console.error('Update movie failed:', err);
      alert(toUserMessage(err, 'Failed to update movie'));
    }
  };

  const updateUserBan = async (id, shouldBan) => {
    try {
      const { data } = await backendApi.put(`/admin/users/${id}`, { isBanned: shouldBan });
      setUsers((prev) => prev.map((u) => (u._id === id ? data : u)));
    } catch (err) {
      console.error('Update user status failed:', err);
      alert(toUserMessage(err, 'Failed to update user status'));
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await backendApi.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error('Delete user failed:', err);
      alert(toUserMessage(err, 'Failed to delete user'));
    }
  };

  if (loading) return <div className="pt-24"><Loader text="Loading admin panel..." /></div>;

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 md:px-8 pb-16 space-y-10">
      <section>
        <h1 className="text-3xl md:text-4xl font-black text-white">Admin Dashboard</h1>
        <p className="text-slate-300 mt-2">Manage movies and users.</p>
        {error ? <p className="text-red-300 mt-3">{error}</p> : null}
      </section>

      <section className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 md:p-6">
        <h2 className="text-xl font-bold text-white mb-4">Add Movie</h2>
        <form onSubmit={handleAddMovie} className="grid md:grid-cols-2 gap-3">
          <input name="title" value={newMovie.title} onChange={onMovieField(setNewMovie)} required placeholder="Movie Title" className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
          <input name="movieId" value={newMovie.movieId} onChange={onMovieField(setNewMovie)} required placeholder="Movie ID" className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
          <input name="posterUrl" value={newMovie.posterUrl} onChange={onMovieField(setNewMovie)} required placeholder="Poster URL" className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
          <input name="trailerLink" value={newMovie.trailerLink} onChange={onMovieField(setNewMovie)} placeholder="Trailer YouTube Link" className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
          <input name="releaseDate" type="date" value={newMovie.releaseDate} onChange={onMovieField(setNewMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
          <input name="genre" value={newMovie.genre} onChange={onMovieField(setNewMovie)} placeholder="Genre" className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
          <input name="category" value={newMovie.category} onChange={onMovieField(setNewMovie)} placeholder="Category" className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
          <textarea name="description" value={newMovie.description} onChange={onMovieField(setNewMovie)} placeholder="Description" className="px-3 py-2 rounded bg-slate-950 border border-slate-700 md:col-span-2" rows="3" />
          <button type="submit" className="md:col-span-2 px-4 py-2 rounded bg-cyan-400 text-slate-950 font-bold hover:opacity-90">Create Movie</button>
        </form>
      </section>

      <section className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 md:p-6">
        <h2 className="text-xl font-bold text-white mb-4">Manage Movies</h2>
        <div className="space-y-4">
          {movies.map((movie) => (
            <div key={movie._id} className="border border-slate-700 rounded-lg p-4 bg-slate-950/60">
              {editingId === movie._id ? (
                <div className="grid md:grid-cols-2 gap-3">
                  <input name="title" value={editMovie.title} onChange={onMovieField(setEditMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
                  <input name="movieId" value={editMovie.movieId} onChange={onMovieField(setEditMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
                  <input name="posterUrl" value={editMovie.posterUrl} onChange={onMovieField(setEditMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
                  <input name="trailerLink" value={editMovie.trailerLink} onChange={onMovieField(setEditMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
                  <input name="releaseDate" type="date" value={editMovie.releaseDate} onChange={onMovieField(setEditMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
                  <input name="genre" value={editMovie.genre} onChange={onMovieField(setEditMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
                  <input name="category" value={editMovie.category} onChange={onMovieField(setEditMovie)} className="px-3 py-2 rounded bg-slate-950 border border-slate-700" />
                  <textarea name="description" value={editMovie.description} onChange={onMovieField(setEditMovie)} rows="3" className="px-3 py-2 rounded bg-slate-950 border border-slate-700 md:col-span-2" />
                  <div className="md:col-span-2 flex gap-2">
                    <button onClick={() => saveEdit(movie._id)} className="px-3 py-2 rounded bg-cyan-400 text-slate-950 font-semibold">Save</button>
                    <button onClick={() => setEditingId('')} className="px-3 py-2 rounded border border-slate-600">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{movie.title}</h3>
                    <p className="text-sm text-slate-300">ID: {movie.movieId} | Genre: {movie.genre || 'N/A'} | Category: {movie.category || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(movie)} className="px-3 py-2 rounded border border-slate-600">Edit</button>
                    <button onClick={() => handleDeleteMovie(movie._id)} className="px-3 py-2 rounded bg-red-600/90 text-white">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {movies.length === 0 ? <p className="text-slate-300">No custom movies available.</p> : null}
        </div>
      </section>

      <section className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 md:p-6">
        <h2 className="text-xl font-bold text-white mb-4">Users</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-white mb-2">Active Users ({activeUsers.length})</h3>
            <div className="space-y-2">
              {activeUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between border border-slate-700 rounded p-3 bg-slate-950/50">
                  <div>
                    <p className="text-white text-sm">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {!u.isAdmin ? <button onClick={() => updateUserBan(u._id, true)} className="px-2 py-1 text-xs rounded bg-amber-600 text-black">Ban</button> : null}
                    {!u.isAdmin ? <button onClick={() => deleteUser(u._id)} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Delete</button> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Banned Users ({bannedUsers.length})</h3>
            <div className="space-y-2">
              {bannedUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between border border-slate-700 rounded p-3 bg-slate-950/50">
                  <div>
                    <p className="text-white text-sm">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <button onClick={() => updateUserBan(u._id, false)} className="px-2 py-1 text-xs rounded bg-cyan-400 text-slate-950">Unban</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;


