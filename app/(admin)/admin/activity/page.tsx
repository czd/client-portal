import { getActivityLogs } from '@/lib/supabase/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default async function AdminActivityPage() {
  const logs = await getActivityLogs(undefined, 100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Activity Log</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.resource_type}
                      {log.resource_id && ` · ${log.resource_id.slice(0, 8)}...`}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">{formatTimeAgo(log.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No activity recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
