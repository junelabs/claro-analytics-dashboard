
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

interface DashboardHeaderProps {
  copyTrackingScript: () => void;
  scriptCopied: boolean;
}

export const DashboardHeader = ({ copyTrackingScript, scriptCopied }: DashboardHeaderProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/landing');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="flex justify-between items-center">
      <Header />
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center">
            <span className="text-sm mr-2 text-gray-600">{user.email}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
        <button
          onClick={copyTrackingScript}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
            scriptCopied
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-claro-purple text-white hover:bg-claro-light-purple'
          }`}
        >
          {scriptCopied ? 'Copied!' : 'Get Tracking Script'}
        </button>
      </div>
    </div>
  );
};
