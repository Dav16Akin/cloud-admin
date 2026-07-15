'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HostingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Hosting</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Hosting</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Hosting management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
