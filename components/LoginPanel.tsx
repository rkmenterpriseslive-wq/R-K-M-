

import React, { useState, useEffect, FC } from 'react';
import Button from './Button';
import Input from './Input';
import { UserType, LoginPanelProps, UserProfile } from '../types'; // Import UserProfile
import { signInUser, signUpUser, mapAuthError, findCandidateInLineupsByMobile, signOutUser, getUserProfile, findTeamMemberByEmail, findSupervisorByEmail, fetchRoles, findUserProfileByEmail } from '../services/firebaseService';
import { AuthError, User as FirebaseUser } from 'firebase/auth'; // Import FirebaseUser

const UserIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const LockIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2 0 00-2.25-2.25v6.75a2.25 2 0 002.25-2.25z" /></svg>;
const PhoneIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;


export const LoginPanel: React.FC<LoginPanelProps> = ({ userType, onLoginSuccess, onLoginError, initialIsSignUp = false }) => {
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

  // Helper to infer UserType from role string (duplicated from firebaseService for client-side JIT)
  const inferUserTypeFromRole = async (role: string): Promise<UserType> => {
      const allRoles = await fetchRoles();
      const matchingRole = allRoles.find(r => r.name.trim().toLowerCase() === role.trim().toLowerCase());

      if (matchingRole) {
          switch (matchingRole.panel) {
              case 'HR': return UserType.HR;
              case 'TeamLead': return UserType.TEAMLEAD;
              case 'Admin': return UserType.ADMIN;
              case 'Partner': return UserType.PARTNER;
              default: return UserType.TEAM;
          }
      } else {
          if (role.toLowerCase().includes('hr')) return UserType.HR;
          else if (role.toLowerCase().includes('lead')) return UserType.TEAMLEAD;
          else if (role.toLowerCase().includes('admin')) return UserType.ADMIN;
      }
      return UserType.TEAM;
  };

  // New retry function for fetching user profile
  const retryGetUserProfile = async (uid: string, retries = 5, delay = 500): Promise<UserProfile | null> => {
      for (let i = 0; i < retries; i++) {
          const profile = await getUserProfile(uid);
          if (profile) return profile;
          await new Promise(res => setTimeout(res, delay));
      }
      return null;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const authIdentifier = isCandidateLogin ? createProxyEmail(mobileNumber) : email.trim();
    let user: FirebaseUser | null = null; // Declare user here to ensure scope

    try {
        if (isSignUp) {
            if (!fullName || !authIdentifier || !password) {
                setErrorMessage('Please fill all required fields.');
                setLoading(false);
                return;
            }
            // Infer userType if not candidate
            let resolvedSignUpType = UserType.CANDIDATE;
            if (!isCandidateLogin) {
                const existingTeamMember = await findTeamMemberByEmail(authIdentifier);
                if (existingTeamMember) {
                    resolvedSignUpType = await inferUserTypeFromRole(existingTeamMember.role);
                } else if (userType === UserType.ADMIN) { // Direct admin signup
                    resolvedSignUpType = UserType.ADMIN;
                } else if (userType === UserType.HR) {
                    resolvedSignUpType = UserType.HR;
                } else if (userType === UserType.TEAMLEAD) {
                    resolvedSignUpType = UserType.TEAMLEAD;
                } else if (userType === UserType.PARTNER) { // This is for main partner portal, not store supervisor
                    resolvedSignUpType = UserType.PARTNER;
                }
            }

            user = await signUpUser(authIdentifier, password, fullName, mobileNumber, resolvedSignUpType);
            onLoginSuccess();
        } else {
            if ((!mobileNumber && isCandidateLogin) || (!email && !isCandidateLogin) || !password) {
                setErrorMessage('Please provide your credentials.');
                setLoading(false);
                return;
            }
            
            try {
                // Attempt standard login
                user = await signInUser(authIdentifier, password);
            } catch (authError: any) {
                console.log("Login attempt failed. Code:", authError.code);
                
                const isAuthFailure = authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential';
                
                if (isAuthFailure && password === 'password') { // JIT for default password
                    let existingRecord: any = null;
                    let inferredType: UserType = UserType.NONE;

                    if (userType === UserType.TEAM) {
                        existingRecord = await findTeamMemberByEmail(authIdentifier);
                        if (existingRecord) inferredType = await inferUserTypeFromRole(existingRecord.role);
                    } else if (userType === UserType.PARTNER) { // Covers Store Supervisor too, as they login via Partner panel
                        existingRecord = await findSupervisorByEmail(authIdentifier);
                        if (existingRecord) inferredType = UserType.STORE_SUPERVISOR; // Directly assigned
                    } else if (isCandidateLogin) {
                        existingRecord = await findCandidateInLineupsByMobile(mobileNumber);
                        if (existingRecord) inferredType = UserType.CANDIDATE;
                    }

                    if (existingRecord && inferredType !== UserType.NONE) {
                        try {
                            user = await signUpUser(authIdentifier, 'password', existingRecord.name || fullName, existingRecord.mobile || mobileNumber, inferredType);
                        } catch (jitErr: any) {
                            if (jitErr.code === 'auth/email-already-in-use') {
                                // User exists but password wasn't 'password' or it was a normal user logging in.
                                // Fall through to original authError logic.
                                throw authError; 
                            }
                            throw jitErr; // Re-throw other JIT errors
                        }
                    }
                }
                
                if (!user) throw authError; // If user still not resolved, re-throw original auth error
            }

            // At this point, 'user' should be populated if login/signup was successful.
            if (!user) { // Should not happen with the above logic, but for type safety
                throw new Error("Authentication failed: User object is null.");
            }

            let userProfile: UserProfile | null = null;
            if (user.email !== 'rkrohit19kumar@gmail.com') { // Only fetch profile for non-admin email
                userProfile = await retryGetUserProfile(user.uid);
                if (!userProfile) {
                    // If profile still not found after retries, it's a critical issue
                    await signOutUser();
                    const msg = "Account database record could not be loaded. Please try logging in again. If the issue persists, contact support.";
                    setErrorMessage(msg);
                    onLoginError(msg);
                    return;
                }
            }
            
            // Resolve userType for panel access control
            let resolvedUserType: UserType;
            if (user.email === 'rkrohit19kumar@gmail.com') {
                resolvedUserType = UserType.ADMIN;
            } else if (userProfile && userProfile.userType) {
                resolvedUserType = userProfile.userType.toUpperCase() as UserType;
            } else {
                // Fallback if userProfile.userType is missing (should ideally not happen with retry)
                const teamMember = await findTeamMemberByEmail(authIdentifier);
                if (teamMember) resolvedUserType = await inferUserTypeFromRole(teamMember.role);
                else {
                    const supervisor = await findSupervisorByEmail(authIdentifier);
                    if (supervisor) resolvedUserType = UserType.STORE_SUPERVISOR;
                    else resolvedUserType = UserType.NONE; // Default if nothing matches
                }
            }

            const candidatePanelTypes = [UserType.CANDIDATE];
            const partnerPanelTypes = [UserType.PARTNER, UserType.STORE_SUPERVISOR];
            const teamPanelTypes = [UserType.TEAM, UserType.TEAMLEAD, UserType.HR, UserType.ADMIN]; // Admin can log in as Team for demo

            let isLoginAllowed = false;

            if (userType === UserType.CANDIDATE && candidatePanelTypes.includes(resolvedUserType)) isLoginAllowed = true;
            else if (userType === UserType.PARTNER && partnerPanelTypes.includes(resolvedUserType)) isLoginAllowed = true;
            else if (userType === UserType.TEAM && teamPanelTypes.includes(resolvedUserType)) isLoginAllowed = true;
            else if (userType === UserType.ADMIN && resolvedUserType === UserType.ADMIN) isLoginAllowed = true;

            if (!isLoginAllowed) {
                await signOutUser();
                const roleName = resolvedUserType.toLowerCase() === 'candidate' ? 'Employee' : resolvedUserType.toLowerCase();
                const panelName = userType.toLowerCase() === 'candidate' ? 'Employee' : userType.toLowerCase();
                const friendlyMessage = `Access Denied. Your account is linked to the ${roleName} Panel. Please use the appropriate login button.`;
                setErrorMessage(friendlyMessage);
                onLoginError(friendlyMessage);
                return;
            }

            onLoginSuccess();
        }
    } catch (error: any) {
        console.error("Login Handler Catch:", error);
        let friendlyMessage = '';

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            friendlyMessage = "Incorrect password. \n\nTip: If you haven't changed your password yet, the default is 'password'.";
        } else if (error.code === 'auth/user-not-found') {
            friendlyMessage = "Account not found. If you are a new team member, ensure you use 'password' as your password for the first login.";
        } else if (error.message && error.message.includes('Index not defined')) {
            // This case is actually now handled by our fallback in firebaseService,
            // but we keep it here just in case a raw error bubbles up.
            friendlyMessage = "Temporary database connection issue. Please try again in a few seconds.";
        } else {
            friendlyMessage = mapAuthError(error as AuthError);
        }

        if (isCandidateLogin && friendlyMessage.includes('email address')) {
            friendlyMessage = friendlyMessage.replace('email address', 'mobile number');
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
                placeholder="Enter your registered email"
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
        
        {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm whitespace-pre-wrap font-medium">
                {errorMessage}
            </div>
        )}

        <Button 
            type="submit" 
            className="w-full justify-center bg-[#1e293b] hover:bg-[#0f172a] text-white py-3 rounded-lg shadow-sm" 
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
