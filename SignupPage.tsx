import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", user.uid), { uid: user.uid, email: user.email, plan: "free", createdAt: new Date() });
            navigate('/');
        } catch (err: any) { setError(err.message); }
    };
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Crear Cuenta</h1>
                <form onSubmit={handleSignup} className="space-y-6">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded-md" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña (mínimo 6 caracteres)" required className="w-full px-4 py-2 border rounded-md" />
                    <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md">Registrarse</button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
                <p className="text-center text-sm">¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline">Inicia Sesión</Link></p>
            </div>
        </div>
    );
};
export default SignupPage;
