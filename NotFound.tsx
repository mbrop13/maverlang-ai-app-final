import { Link } from 'react-router-dom';
const NotFound = () => <div className="flex flex-col items-center justify-center h-screen"><h1 className="text-4xl font-bold">404 - Not Found</h1><Link to="/" className="mt-4 text-blue-600 hover:underline">Go Home</Link></div>;
export default NotFound;
