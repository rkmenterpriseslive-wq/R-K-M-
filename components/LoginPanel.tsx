import React, { useState, useEffect, FC } from 'react';
import Button from './Button';
import Input from './Input';
import { UserType, LoginPanelProps } from '../types';
import { signInUser, signUpUser, mapAuthError, findCandidateInLineupsByMobile, signOutUser, getUserProfile } from '../services/firebaseService';
import { AuthError } from 'firebase/auth';

const UserIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const LockIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25-2.25z" /></svg>;
const PhoneIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;


const LoginPanel: React.FC<LoginPanelProps> = ({ userType, onLoginSuccess, onLoginError, initialIsSignUp = false }) => {
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  const isCandidateLogin = userType === UserType.CANDIDATE;

  useEffect(() => {
    setIsSignUp(initialIsSignUp);
    setErrorMessage('');
    setEmail('');
    setMobileNumber('');
    setPassword('');
    setFullName('');
  }, [initialIsSignUp, userType]);

  const createProxyEmail = (mobile: string) => `${mobile}@rkmcareer.dev`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const authIdentifier = isCandidateLogin ? createProxyEmail(mobileNumber) : email;

    try {
        if (isSignUp) {
            if (!fullName || !authIdentifier || !password) {
                setErrorMessage('Please fill all required fields.');
                setLoading(false);
                return;
            }
            await signUpUser(authIdentifier, password, fullName, mobileNumber);
            onLoginSuccess();
        } else {
            if ((!mobileNumber && isCandidateLogin) || (!email && !isCandidateLogin) || !password) {
                setErrorMessage('Please provide your credentials.');
                setLoading(false);
                return;
            }
            
            const user = await signInUser(authIdentifier, password);
            const userProfile = await getUserProfile(user.uid);

            if (!userProfile && user.email !== 'rkrohit19kumar@gmail.com') {
                await signOutUser();
                setErrorMessage("Your user profile could not be found. Please contact support.");
                onLoginError("User profile not found.");
                return;
            }
            
            const resolvedUserType = user.email === 'rkrohit19kumar@gmail.com' ? UserType.ADMIN : (userProfile.userType || UserType.NONE).toUpperCase() as UserType;

            const candidatePanelTypes = [UserType.CANDIDATE];
            const partnerPanelTypes = [UserType.PARTNER, UserType.STORE_SUPERVISOR];
            const teamPanelTypes = [UserType.TEAM, UserType.TEAMLEAD, UserType.HR, UserType.ADMIN];
            const adminPanelTypes = [UserType.ADMIN];

            let isLoginAllowed = false;

            if (userType === UserType.CANDIDATE && candidatePanelTypes.includes(resolvedUserType)) isLoginAllowed = true;
            else if (userType === UserType.PARTNER && partnerPanelTypes.includes(resolvedUserType)) isLoginAllowed = true;
            else if (userType === UserType.TEAM && teamPanelTypes.includes(resolvedUserType)) isLoginAllowed = true;
            else if (userType === UserType.ADMIN && adminPanelTypes.includes(resolvedUserType)) isLoginAllowed = true;

            
            if (!isLoginAllowed) {
                await signOutUser();
                const friendlyMessage = "Access Denied. You are not authorized to log in through this panel.";
                setErrorMessage(friendlyMessage);
                onLoginError(friendlyMessage);
                return;
            }

            onLoginSuccess();
        }
    } catch (error) {
        const authError = error as AuthError;

        if (isCandidateLogin && !isSignUp && (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential')) {
            try {
                const lineupCandidate = await findCandidateInLineupsByMobile(mobileNumber);
                if (lineupCandidate) {
                    await signUpUser(
                        authIdentifier,
                        password,
                        lineupCandidate.candidateName,
                        mobileNumber
                    );
                    onLoginSuccess();
                    return;
                }
            } catch (signupError) {
                console.error("JIT Signup Error:", signupError);
            }
        }

        let friendlyMessage = mapAuthError(authError);
        if (isCandidateLogin) {
             if (friendlyMessage.includes('email address')) {
                friendlyMessage = friendlyMessage.replace('email address', 'mobile number');
            }
        }
        setErrorMessage(friendlyMessage);
        onLoginError(friendlyMessage);
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setErrorMessage('');
  }
  
  const canShowSignUpLink = isCandidateLogin;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <Input id="name" label="Full Name" type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required />
        )}

        {isCandidateLogin ? (
            <Input 
                id="mobileNumber" 
                label="Mobile Number *" 
                type="tel" 
                autoComplete="tel" 
                value={mobileNumber} 
                onChange={e => setMobileNumber(e.target.value)} 
                placeholder="Enter your 10-digit mobile number"
                icon={<PhoneIcon />}
                required 
            />
        ) : (
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
        )}
        
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

      {canShowSignUpLink && (
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