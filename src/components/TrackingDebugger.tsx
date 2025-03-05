
import React, { useState, useEffect } from 'react';
import { getTrackingStatus } from '@/utils/tracking/pageView';
import { isDashboardUrl } from '@/utils/tracking/urlUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const TrackingDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen, refreshCount]);

  const refreshStatus = () => {
    setStatus(getTrackingStatus());
  };

  const testDirectSupabaseConnection = async () => {
    setTestResult("Testing direct Supabase connection...");
    try {
      // Test direct connection to Supabase
      const response = await supabase.from('page_views').select('count(*)', { count: 'exact', head: true });
      
      if (response.error) {
        setTestResult(`Direct connection error: ${response.error.message}`);
        toast.error(`Error connecting to Supabase: ${response.error.message}`);
      } else {
        setTestResult(`Direct connection successful! Table exists.`);
        toast.success('Successfully connected to Supabase page_views table!');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult(`Direct connection exception: ${error}`);
      toast.error(`Error testing connection: ${error}`);
    }
  };

  const sendTestPing = async () => {
    try {
      const siteId = localStorage.getItem('claro_site_id');
      if (!siteId) {
        toast.error('No site ID found. Cannot send test ping.');
        return;
      }

      toast.info('Sending test ping...');
      
      const pingData = {
        siteId,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        timestamp: new Date().toISOString(),
        pageTitle: document.title,
        eventType: 'test_ping',
        isTest: true
      };
      
      console.log('Sending test ping with data:', pingData);
      
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pingData)
      });
      
      const data = await response.json();
      console.log('Test ping response:', data);
      
      if (data.success) {
        toast.success('Test ping sent successfully!');
      } else {
        toast.error(`Error: ${data.error || 'Unknown error'}`);
      }
      
      refreshStatus();
    } catch (error) {
      console.error('Error sending test ping:', error);
      toast.error(`Error sending test ping: ${error}`);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-md"
        >
          Debug Tracking
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-96 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Tracking Debugger</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
      </div>
      
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h4 className="font-medium text-sm mb-1">Basic Config</h4>
          <div className="text-xs space-y-1">
            <p>Site ID: <span className="font-mono">{status?.siteId || 'Not set'}</span></p>
            <p>Tracking enabled: <span className={status?.trackingEnabled ? 'text-green-600' : 'text-red-600'}>
              {status?.trackingEnabled ? 'Yes' : 'No'}
            </span></p>
            <p>Last URL tracked: <span className="font-mono">{status?.lastPageViewUrl || 'None'}</span></p>
            <p>Last tracking: {status?.timeSinceLastTracking || 'Never'}</p>
            <p>Current URL is dashboard: {isDashboardUrl(window.location.href) ? 'Yes (no tracking)' : 'No (should track)'}</p>
          </div>
        </div>
        
        <div className="border-b pb-2">
          <h4 className="font-medium text-sm mb-1">Supabase Configuration</h4>
          <div className="text-xs space-y-1">
            <p>Environment variables: <span className={status?.supbaseConfigured?.hasEnvVars ? 'text-green-600' : 'text-yellow-600'}>
              {status?.supbaseConfigured?.hasEnvVars ? 'Configured' : 'Not using (using integration)'}
            </span></p>
            <p>Integration configured: <span className={status?.supbaseConfigured?.integrationConfigured ? 'text-green-600' : 'text-red-600'}>
              {status?.supbaseConfigured?.integrationConfigured ? 'Yes' : 'No'}
            </span></p>
            <p>Integration details: <span className="font-mono text-xs">
              {status?.supbaseConfigured?.integrationDetails?.clientAvailable ? 'Client loaded' : 'Client missing'}
            </span></p>
            {testResult && (
              <p className="mt-2 p-2 bg-gray-100 rounded text-xs">
                Test result: {testResult}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <Button size="sm" variant="outline" onClick={() => {
              refreshStatus();
              setRefreshCount(prev => prev + 1);
            }}>
              Refresh Status
            </Button>
            <Button size="sm" variant="default" onClick={sendTestPing}>
              Send Test Ping
            </Button>
          </div>
          <Button size="sm" variant="secondary" onClick={testDirectSupabaseConnection}>
            Test Direct Supabase Connection
          </Button>
        </div>
      </div>
    </div>
  );
};
