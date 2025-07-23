import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-brand-red" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              HHWH Online Clinic
            </h1>
          </div>
          <Badge variant="outline" className="text-brand-purple">
            Development Environment
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Women's Hormone Health
            <span className="text-brand-orange"> Made Simple</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Expert hormone health care for South African women through accessible virtual consultations and personalized treatment plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-healthcare-primary">
              <Calendar className="mr-2 h-5 w-5" />
              Book Consultation
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="card-healthcare">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-brand-green" />
                <CardTitle className="font-heading">Secure & Compliant</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                POPIA compliant platform with end-to-end encryption for your medical data and privacy.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-brand-red" />
                <CardTitle className="font-heading">Expert Care</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Specialized hormone health doctors with years of experience in women's health and menopause care.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-brand-blue" />
                <CardTitle className="font-heading">Medical Aid Friendly</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Optimized for South African medical aid schemes with streamlined billing and validation processes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 border">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-brand-green rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-brand-amber rounded-full animate-pulse delay-150"></div>
              <div className="w-3 h-3 bg-brand-blue rounded-full animate-pulse delay-300"></div>
            </div>
            <span className="text-sm font-medium">Development Environment Active</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 HHWH Online Clinic. Built with AI-assisted development.</p>
          <p className="mt-2">Prototype Phase - Not for production use</p>
        </div>
      </footer>
    </div>
  );
}