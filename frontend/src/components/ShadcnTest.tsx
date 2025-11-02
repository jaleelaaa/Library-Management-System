import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Test component to verify shadcn/ui setup
 * This component demonstrates the usage of shadcn/ui components
 */
export function ShadcnTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">shadcn/ui Setup Test</h1>

      <Card className="w-96">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>
            This card uses shadcn/ui components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-input">Test Input</Label>
            <Input id="test-input" placeholder="Type something..." />
          </div>

          <div className="flex gap-2">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        ✅ If you can see this card with styled components, shadcn/ui is working correctly!
      </div>
    </div>
  )
}
