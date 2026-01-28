import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { Link } from "wouter";

export default function Reflection() {
  return (
    <div className="min-h-screen bg-background">
            <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Who Are You Thinking With?</h1>
            <p className="text-lg text-muted-foreground">
              A reflection tool for assessing your current support network
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                This interactive reflection tool is under development. In the meantime, take the Pressure Audit to understand where you need support most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/assessment">
                <Button>Take the Pressure Audit</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
