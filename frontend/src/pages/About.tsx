import { Card, CardContent } from "@/components/ui/card";
import { Zap, Users, Globe, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            About{" "}
            <span className="bg-gradient-electric bg-clip-text text-transparent">
              ChargeMap
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing the electric vehicle charging experience by making 
            it easier than ever to find, book, and use charging stations across the country.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At ChargeMap, we believe that sustainable transportation should be accessible, 
                convenient, and worry-free. Our platform connects EV owners with a comprehensive 
                network of charging stations, eliminating range anxiety and making electric 
                vehicle ownership a seamless experience.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're committed to supporting the transition to clean energy by building 
                the infrastructure and technology that makes electric mobility possible for everyone.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-card rounded-2xl p-8 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">10K+</div>
                    <div className="text-sm text-muted-foreground">Charging Stations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">50K+</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">1M+</div>
                    <div className="text-sm text-muted-foreground">Charging Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Innovation",
                description: "Continuously improving our technology to provide the best charging experience."
              },
              {
                icon: Users,
                title: "Community",
                description: "Building a supportive network of EV owners and charging station partners."
              },
              {
                icon: Globe,
                title: "Sustainability",
                description: "Committed to creating a cleaner, more sustainable future for transportation."
              },
              {
                icon: Award,
                title: "Reliability",
                description: "Ensuring our platform and network are dependable when you need them most."
              }
            ].map((value, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Built by EV Enthusiasts
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our team consists of passionate engineers, designers, and sustainability advocates 
            who are dedicated to accelerating the world's transition to sustainable transport. 
            We're EV owners ourselves, which means we understand the challenges you face and 
            are committed to solving them.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;