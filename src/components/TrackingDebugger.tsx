import React, { useState, useEffect } from 'react';
import { getTrackingStatus, testSupabaseConnection } from '@/utils/tracking/pageView';
import { isDashboardUrl } from '@/utils/tracking/urlUtils';
import { getPingDiagnostics, pingActiveSession } from '@/utils/tracking/sessionPing';
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
  const [pingStats, setPingStats] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setPingStats(getPingDiagnostics());
  };

  const testDirectSupabaseConnection = async () => {
    setIsTesting(true);
    setTestResult("Testing direct Supabase connection...");
    
    try {
      // Get configuration from environment variables instead of accessing protected properties
      const clientDetails = {
        clientAvailable: !!supabase,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not available',
        hasApiKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        // Removed functionsUrl since it's a protected property
      };
      
      console.log('Supabase client details:', clientDetails);
      setConnectionDetails(JSON.stringify(clientDetails, null, 2));
      
      // Test direct connection to Supabase
      setIsLoading(true);
      const response = await testSupabaseConnection();
      setIsLoading(false);
      
      if (!response.success) {
        let errorDetails = '';
        
        // Safe property access with type checking
        if (typeof response === 'object' && response !== null) {
          if ('error' in response && response.error) {
            if (typeof response.error === 'object') {
              errorDetails = JSON.stringify(response.error, null, 2);
            } else {
              errorDetails = String(response.error);
            }
          }
        }
        
        setTestResult(`Connection error: ${errorDetails}`);
        
        // Safe access to hint and statusText properties
        if (typeof response === 'object' && response !== null) {
          if ('hint' in response && response.hint) {
            setTestResult(prev => `${prev}\nHint: ${response.hint}`);
          }
          if ('statusText' in response && response.statusText) {
            setTestResult(prev => `${prev}\nStatus: ${response.statusText}`);
          }
        }
        
        toast.error(`Error connecting to Supabase: ${errorDetails}`);
        console.error('Connection test response error:', response);
      } else {
        // Safe access to count property
        const countText = ('count' in response && response.count !== undefined) 
          ? ` Found ${response.count} records.` 
          : '';
          
        setTestResult(`Connection successful! Table exists and is accessible.${countText}`);
        toast.success('Successfully connected to Supabase page_views table!');
        console.log('Connection test successful:', response);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult(`Connection exception: ${error}`);
      toast.error(`Error testing connection: ${error}`);
    } finally {
      setIsTesting(false);
      setIsLoading(false);
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
      setIsLoading(true);
      
      // Send a test ping using the existing function
      const pingResult = await pingActiveSession();
      console.log('Test ping result:', pingResult);
      
      // Safe property access with type checking for skipped property
      if (pingResult.success) {
        if ('skipped' in pingResult && pingResult.skipped) {
          const reason = 'reason' in pingResult ? pingResult.reason : 'Unknown reason';
          toast.info(`Test ping skipped: ${reason}`);
        } else {
          toast.success(`Test ping sent successfully via ${pingResult.method || 'unknown'} method!`);
        }
      } else {
        toast.error(`Test ping failed: ${pingResult.error || 'Unknown error'}`);
      }
      
      refreshStatus();
    } catch (error) {
      console.error('Error sending test ping:', error);
      toast.error(`Error sending test ping: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkPageViewsTable = async () => {
    try {
      setTestResult("Checking page_views table data...");
      setIsLoading(true);
      
      const { data, error, count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        setTestResult(`Error fetching data: ${error.message}`);
        toast.error(`Error fetching data: ${error.message}`);
      } else {
        const countText = count !== undefined ? `${count} total records. ` : '';
        const resultText = data && data.length > 0 
          ? `${countText}Found ${data.length} recent records in page_views table. Latest: ${JSON.stringify(data[0], null, 2)}` 
          : `${countText}No records found in page_views table.`;
        setTestResult(resultText);
        
        if (data && data.length > 0) {
          toast.success(`Found ${data.length} records in the table`);
        } else {
          toast.info('No records found in the table');
        }
      }
    } catch (error) {
      console.error('Error checking table:', error);
      setTestResult(`Error checking table: ${error}`);
      toast.error(`Error checking table: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkSiteReachability = async () => {
    try {
      const siteId = localStorage.getItem('claro_site_id');
      if (!siteId) {
        toast.error('No site ID found.');
        return;
      }
      
      setTestResult("Checking API endpoint reachability...");
      setIsLoading(true);
      
      try {
        const url = `${window.location.origin}/api/track`;
        console.log(`Testing API endpoint at ${url}`);
        
        const response = await fetch(url, {
          method: 'OPTIONS',
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setTestResult(`API endpoint is reachable! Status: ${response.status}`);
          toast.success('API endpoint is reachable');
        } else {
          setTestResult(`API endpoint returned error status: ${response.status} ${response.statusText}`);
          toast.error(`API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setTestResult(`Cannot reach API endpoint: ${error}`);
        toast.error(`Cannot reach API: ${error}`);
      }
    } catch (error) {
      console.error('Error checking site reachability:', error);
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
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
          <h4 className="font-medium text-sm mb-1">Ping Statistics</h4>
          <div className="text-xs space-y-1">
            <p>Total pings: {pingStats?.totalPings || 0}</p>
            <p>Failed pings: {pingStats?.failedPings || 0}</p>
            <p>Last ping: {pingStats?.lastPingTime || 'Never'}</p>
            <p>Time since last ping: {pingStats?.timeSinceLastPing || 'Never'}</p>
            <p>Ping interval: {pingStats?.pingInterval || 'Unknown'}</p>
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
            <p>Project URL: <span className="font-mono text-xs break-words">
              {status?.supbaseConfigured?.integrationDetails?.projectUrl || 'Not available'}
            </span></p>
            <p>API Key set: {status?.supbaseConfigured?.integrationDetails?.hasApiKey ? 'Yes' : 'No'}</p>
            
            {connectionDetails && (
              <div className="mt-2 bg-gray-100 rounded p-2 text-xs overflow-auto max-h-24">
                <pre>{connectionDetails}</pre>
              </div>
            )}
            {testResult && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs whitespace-pre-wrap overflow-auto max-h-40">
                Test result: {testResult}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                refreshStatus();
                setRefreshCount(prev => prev + 1);
                setLastRefreshTime(new Date().toLocaleTimeString());
              }}
              disabled={isLoading}
            >
              Refresh Status
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              onClick={sendTestPing}
              disabled={isLoading}
            >
              Send Test Ping
            </Button>
          </div>
          <div className="flex justify-between">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={testDirectSupabaseConnection}
              disabled={isTesting || isLoading}
            >
              Test Supabase Connection
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkPageViewsTable}
              disabled={isLoading}
            >
              Check Table Data
            </Button>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkSiteReachability}
            disabled={isLoading}
          >
            Check API Reachability
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 border-t pt-2 mt-2">
          <p className="font-medium mb-1">Troubleshooting Steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Verify your Site ID is correctly set</li>
            <li>Test the Supabase connection first</li>
            <li>Send a test ping to verify the tracking flow</li>
            <li>Check if any data is being stored in the table</li>
            <li>Verify the tracking script is in the &lt;head&gt; of your website</li>
            <li>Check browser console for JavaScript errors</li>
            <li>Ensure CORS is properly configured</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
