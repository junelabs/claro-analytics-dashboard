
import React, { useState, useEffect } from 'react';
import { getTrackingStatus, testSupabaseConnection } from '@/utils/tracking/pageView';
import { isDashboardUrl } from '@/utils/tracking/urlUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const TrackingDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  const [connectionDetails, setConnectionDetails] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      
      // Set up automatic refresh every minute
      const intervalId = setInterval(() => {
        refreshStatus();
        setLastRefreshTime(new Date().toLocaleTimeString());
      }, 60000); // 60000ms = 1 minute
      
      return () => clearInterval(intervalId);
    }
  }, [isOpen]);

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
      // Log the client details
      console.log('Supabase client:', supabase ? 'Available' : 'Not available');
      
      // Get project information
      const connectionInfo = await fetch('https://fnpmaffptlkwjioccifp.supabase.co/rest/v1/', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucG1hZmZwdGxrd2ppb2NjaWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTc0MTksImV4cCI6MjA1NjQzMzQxOX0.c6IqlWlVDK0aUsT84b00t1zIj3DKI4i0bMef3NuMnq0'
        }
      }).then(res => res.json()).catch(err => ({ error: err.message }));
      
      setConnectionDetails(JSON.stringify(connectionInfo, null, 2));
      
      // Test direct connection to Supabase
      const response = await testSupabaseConnection();
      
      if (!response.success) {
        setTestResult(`Connection error: ${JSON.stringify(response.error)}`);
        toast.error(`Error connecting to Supabase: ${JSON.stringify(response.error)}`);
        console.error('Connection test response error:', response.error);
      } else {
        setTestResult(`Connection successful! Table exists and is accessible.`);
        toast.success('Successfully connected to Supabase page_views table!');
        console.log('Connection test successful:', response);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult(`Connection exception: ${error}`);
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
      
      // Try direct Supabase insertion
      const { data, error } = await supabase.from('page_views').insert({
        site_id: siteId,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        timestamp: new Date().toISOString(),
        page_title: document.title,
        event_type: 'test_ping'
      });
      
      if (error) {
        console.error('Direct Supabase insertion error:', error);
        toast.error(`Direct insertion error: ${error.message}`);
      } else {
        console.log('Direct Supabase insertion successful:', data);
        toast.success('Test ping directly inserted to Supabase!');
      }
      
      // Also try API route for comparison
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pingData)
      });
      
      const apiData = await response.json();
      console.log('API route test ping response:', apiData);
      
      if (apiData.success) {
        toast.success('API route test ping sent successfully!');
      } else {
        toast.error(`API route error: ${apiData.error || 'Unknown error'}`);
      }
      
      refreshStatus();
    } catch (error) {
      console.error('Error sending test ping:', error);
      toast.error(`Error sending test ping: ${error}`);
    }
  };
  
  const checkPageViewsTable = async () => {
    try {
      setTestResult("Checking page_views table data...");
      const { data, error } = await supabase
        .from('page_views')
        .select('*')
        .limit(5);
      
      if (error) {
        setTestResult(`Error fetching data: ${error.message}`);
        toast.error(`Error fetching data: ${error.message}`);
      } else {
        const resultText = data.length > 0 
          ? `Found ${data.length} records in page_views table. Latest: ${JSON.stringify(data[0], null, 2)}` 
          : 'No records found in page_views table.';
        setTestResult(resultText);
        toast.info(data.length > 0 ? `Found ${data.length} records` : 'No records found');
      }
    } catch (error) {
      console.error('Error checking table:', error);
      setTestResult(`Error checking table: ${error}`);
      toast.error(`Error checking table: ${error}`);
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
            {lastRefreshTime && <p>Last auto-refresh: {lastRefreshTime}</p>}
          </div>
        </div>
        
        <div className="border-b pb-2">
          <h4 className="font-medium text-sm mb-1">Supabase Configuration</h4>
          <div className="text-xs space-y-1">
            <p>Client available: <span className={status?.supbaseConfigured?.hasConfiguredClient ? 'text-green-600' : 'text-red-600'}>
              {status?.supbaseConfigured?.hasConfiguredClient ? 'Yes' : 'No'}
            </span></p>
            <p>Table accessible: <span className={status?.supbaseConfigured?.tableAccessible ? 'text-green-600' : 'text-red-600'}>
              {status?.supbaseConfigured?.tableAccessible ? 'Yes' : 'No'}
            </span></p>
            {connectionDetails && (
              <div className="mt-2 bg-gray-100 rounded p-2 text-xs overflow-auto max-h-24">
                <pre>{connectionDetails}</pre>
              </div>
            )}
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
              setLastRefreshTime(new Date().toLocaleTimeString());
            }}>
              Refresh Status
            </Button>
            <Button size="sm" variant="default" onClick={sendTestPing}>
              Send Test Ping
            </Button>
          </div>
          <div className="flex justify-between">
            <Button size="sm" variant="secondary" onClick={testDirectSupabaseConnection}>
              Test Supabase Connection
            </Button>
            <Button size="sm" variant="outline" onClick={checkPageViewsTable}>
              Check Table Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
