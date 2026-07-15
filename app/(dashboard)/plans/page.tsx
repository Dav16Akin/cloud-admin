'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlansPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Plans</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Plan management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
