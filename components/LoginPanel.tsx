import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { UserType, LoginPanelProps, AppUser } from '../types';
import { supabase } from '../services/supabaseClient';

const LoginPanel: React.FC<LoginPanelProps> = ({ userType, onLoginSuccess, onLoginError, initialIsSignUp = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  useEffect(() => {
    // Reset state if the initial mode changes (e.g., modal is re-opened for a different purpose)
    setIsSignUp(initialIsSignUp);
    setErrorMessage('');
  }, [initialIsSignUp, userType]);


  const isCandidateLogin = userType === UserType.CANDIDATE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setErrorMessage('');
    
    try {
      if (!email || !password || (isSignUp && (!fullName || !phoneNumber))) throw new Error('Please fill all required fields.');

      const { data, error } = isSignUp 
        ? await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone: phoneNumber, role: userType } } })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (data.user) {
        // For new sign-ups, Supabase might require email confirmation.
        if (isSignUp && !data.session) {
            setErrorMessage('Account created! Please check your email to confirm your account before signing in.');
            // Do not call onLoginSuccess, just show the message.
            return;
        }
        
        const userRoleFromMetadata = data.user.user_metadata?.role as UserType;
        let finalUserType: UserType;

        if (isSignUp) {
            finalUserType = userType;
        } else {
            // This is a sign-in flow. Always trust the role from the database if it exists.
            if (userRoleFromMetadata) {
                finalUserType = userRoleFromMetadata;
            } else {
                // If no role is in metadata, default to CANDIDATE.
                // This handles users created before roles or directly in Supabase.
                finalUserType = UserType.CANDIDATE;
                // Attempt to update the user's role for future logins.
                supabase.auth.updateUser({ data: { role: UserType.CANDIDATE } })
                    .catch(err => console.error("Async user role update failed:", err));
            }
        }
        
        onLoginSuccess({ uid: data.user.id, email: data.user.email || '', userType: finalUserType });
      } else if (isSignUp) {
        // This case handles sign-ups that don't return a user object but also don't error, often due to email confirmation.
        setErrorMessage('Account created! Please check your email to confirm your account before signing in.');
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('security purposes') || err.status === 429) msg = 'Too many attempts. Please wait 30 seconds.';
      else if (msg.includes('Invalid login')) msg = isCandidateLogin && !isSignUp ? 'Invalid credentials. Please check your email and 6-digit code.' : 'Invalid email or password.';
      else if (msg.includes('User already registered')) msg = 'An account with this email already exists. Please Sign In.';
      setErrorMessage(msg); 
      onLoginError(msg);
    } finally { 
      setLoading(false); 
    }
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setErrorMessage('');
      // Clear fields for better UX when switching modes
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
        <Input id="email" label="Email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input 
          id="password" 
          label={isCandidateLogin && !isSignUp ? "6-digit login code" : "Password"} 
          type="password" 
          autoComplete={isSignUp ? "new-password" : "current-password"} 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          maxLength={isCandidateLogin && !isSignUp ? 6 : undefined}
          required 
        />
        
        {errorMessage && <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">{errorMessage}</div>}
        <Button type="submit" className="w-full justify-center" loading={loading}>{isSignUp ? 'Create Account' : 'Sign In'}</Button>
      </form>

      {!initialIsSignUp && (
          <div className="text-center mt-4">
              <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline focus:outline-none">
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
          </div>
      )}

      <p className="text-xs text-gray-400 mt-6 text-center">Secured by Supabase Authentication</p>
    </div>
  );
};
export default LoginPanel;