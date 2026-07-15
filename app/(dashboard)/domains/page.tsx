'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DomainsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Domains</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Domain management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
