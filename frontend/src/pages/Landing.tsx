import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Zap, MapPin, Clock, Shield, Star } from "lucide-react";
import heroImage from "@/assets/hero-charging.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Find & Book{" "}
                <span className="bg-gradient-electric bg-clip-text text-transparent">
                  EV Charging
                </span>{" "}
                Stations
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Discover thousands of charging stations, book your slot in advance, 
                and charge your electric vehicle with confidence. The future of mobility is here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="shadow-electric hover:shadow-glow transition-all duration-300"
                  asChild
                >
                  <Link to="/stations">Find Charging Stations</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5"
                  asChild
                >
                  <Link to="/register">Sign Up Free</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="EV Charging Station"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-electric rounded-2xl opacity-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose ChargeMap?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the most comprehensive EV charging network with features designed for modern electric vehicle owners.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "Smart Discovery",
                description: "Find nearby charging stations with real-time availability and detailed information."
              },
              {
                icon: Clock,
                title: "Easy Booking",
                description: "Reserve your charging slot in advance and never worry about waiting in line."
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Safe and secure payment processing with multiple payment options."
              },
              {
                icon: Star,
                title: "Community Reviews",
                description: "Read reviews from other EV owners and share your own experiences."
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-card rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Start Charging?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of EV owners who trust ChargeMap for their charging needs. 
              Sign up today and get access to our extensive network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="shadow-electric hover:shadow-glow transition-all duration-300"
                asChild
              >
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/20 hover:bg-primary/5"
                asChild
              >
                <Link to="/stations">Explore Stations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;