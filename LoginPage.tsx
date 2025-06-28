import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) { setError(err.message); }
  };
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded-md" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required className="w-full px-4 py-2 border rounded-md" />
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md">Login</button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
        <p className="text-center text-sm">¿No tienes cuenta? <Link to="/signup" className="text-blue-600 hover:underline">Regístrate</Link></p>
      </div>
    </div>
  );
};
export default LoginPage;
