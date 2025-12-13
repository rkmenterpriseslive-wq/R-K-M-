import React, { useState, useEffect, FC } from 'react';
import Button from './Button';
import Input from './Input';
import { UserType, LoginPanelProps } from '../types';
import { signInUser, signUpUser, mapAuthError } from '../services/firebaseService';
import { AuthError } from 'firebase/auth';

// Define Icons locally
const UserIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const LockIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>;


const LoginPanel: React.FC<LoginPanelProps> = ({ userType, onLoginSuccess, onLoginError, initialIsSignUp = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  useEffect(() => {
    setIsSignUp(initialIsSignUp);
    setErrorMessage('');
  }, [initialIsSignUp, userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setErrorMessage('');
    
    try {
      if (isSignUp) {
        if (!fullName || !phoneNumber || !email || !password) {
          setErrorMessage('Please fill all required fields.');
          setLoading(false);
          return;
        }
        await signUpUser(email, password);
        // The onAuthChange listener in App.tsx will handle the login success state.
        onLoginSuccess();
      } else {
        if (!email || !password) {
          setErrorMessage('Please enter email and password.');
          setLoading(false);
          return;
        }
        await signInUser(email, password);
        // The onAuthChange listener in App.tsx will handle the login success state.
        onLoginSuccess();
      }
    } catch (error) {
      const authError = error as AuthError;
      const friendlyMessage = mapAuthError(authError);
      setErrorMessage(friendlyMessage);
      onLoginError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setErrorMessage('');
      setEmail('');
      setPassword('');
      setFullName('');
      setPhoneNumber('');
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <Input id="name" label="Full Name" type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required />
            <Input id="phone" label="Phone" type="tel" autoComplete="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
          </>
        )}
        <Input 
            id="email" 
            label="User ID / Email *" 
            type="email" 
            autoComplete="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Enter your user ID or email"
            icon={<UserIcon />}
            required 
        />
        <Input 
          id="password" 
          label="Password *"
          type="password" 
          autoComplete={isSignUp ? "new-password" : "current-password"} 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Enter your password"
          icon={<LockIcon />}
          required 
        />
        
        {errorMessage && <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">{errorMessage}</div>}
        <Button 
            type="submit" 
            className="w-full justify-center bg-[#374151] hover:bg-[#1f2937] text-white" 
            loading={loading}
        >
            {isSignUp ? 'Create Account' : 'Login to Panel'}
        </Button>
      </form>

      {!initialIsSignUp && (
          <div className="text-center mt-4">
              <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline focus:outline-none">
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
          </div>
      )}
    </div>
  );
};
export default LoginPanel;