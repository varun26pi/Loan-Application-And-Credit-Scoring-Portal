'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loanProducts, calculateEMI } from '@/lib/mock-data';
import { TrendingUp, Clock, Shield, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenure, setTenure] = useState(36);
  const [selectedProduct, setSelectedProduct] = useState(loanProducts[0]);
  const [emiData, setEmiData] = useState<any>(null);

  useEffect(() => {
    const result = calculateEMI(loanAmount, selectedProduct.baseRate, tenure);
    setEmiData(result);
  }, [loanAmount, tenure, selectedProduct]);

  const chartData = emiData
    ? [
        { name: 'Principal', value: loanAmount },
        { name: 'Interest', value: emiData.totalInterest },
      ]
    : [];

  const metrics = [
    { icon: Users, label: '100K+ Happy Customers', value: 'Served' },
    { icon: TrendingUp, label: 'Best Rates', value: 'Guaranteed' },
    { icon: Clock, label: 'Quick Approval', value: '24-48 hours' },
    { icon: Shield, label: 'Secure & Safe', value: 'RBI Regulated' },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary to-primary/95 text-primary-foreground py-20 md:py-32">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                Smart Loans for Every Dream
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                Get the financial support you need with our flexible loan solutions.
                Fast approval, competitive rates, and transparent terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all">
                  <Link href="/auth/signup">Apply Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-accent text-accent bg-transparent hover:bg-accent/10">
                  <Link href="#products">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center relative">
              {/* Animated concentric circles with gradient */}
              <div className="relative w-80 h-80">
                {/* Outer rotating circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-accent/20 to-accent/10 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                
                {/* Middle circle */}
                <div className="absolute inset-8 bg-gradient-to-br from-accent/25 to-accent/5 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                
                {/* Inner circle with icon */}
                <div className="absolute inset-16 bg-gradient-to-br from-accent/40 to-accent/20 rounded-full flex items-center justify-center shadow-2xl">
                  {/* Floating icon background */}
                  <div className="absolute inset-0 bg-accent/15 rounded-full blur-xl"></div>
                  
                  {/* Currency symbol with pulse */}
                  <div className="relative z-10 text-center">
                    <div className="text-7xl font-bold text-primary mb-2 animate-pulse">₹</div>
                    <p className="text-xs text-primary-foreground/80 font-semibold tracking-widest">LOANS</p>
                  </div>
                </div>

                {/* Floating accent dots */}
                <div className="absolute top-10 right-10 w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-20 left-5 w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 -right-5 w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="text-center">
                  <Icon className="w-8 h-8 text-accent mx-auto mb-3" />
                  <p className="font-semibold text-foreground text-sm md:text-base">{metric.label}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Loan Products
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the perfect loan type that matches your financial needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanProducts.map((product) => (
              <Card
                key={product.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                  selectedProduct.id === product.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  {product.name}
                </Badge>
                <h3 className="font-bold text-foreground mb-2 text-lg">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-foreground">
                      ₹{(product.minAmount / 100000).toFixed(0)}L - ₹{(product.maxAmount / 1000000).toFixed(0)}Cr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenure:</span>
                    <span className="font-semibold text-foreground">
                      {product.minTenure} - {product.maxTenure} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-semibold text-accent">
                      {product.baseRate}% p.a.
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* EMI Calculator Section */}
      <section id="calculator" className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              EMI Calculator
            </h2>
            <p className="text-muted-foreground text-lg">
              Calculate your monthly EMI and understand your loan better
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Loan Amount: ₹{loanAmount.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min={selectedProduct.minAmount}
                  max={selectedProduct.maxAmount}
                  step={10000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>₹{(selectedProduct.minAmount / 100000).toFixed(0)}L</span>
                  <span>₹{(selectedProduct.maxAmount / 1000000).toFixed(1)}Cr</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Tenure: {tenure} months ({(tenure / 12).toFixed(1)} years)
                </label>
                <input
                  type="range"
                  min={selectedProduct.minTenure}
                  max={selectedProduct.maxTenure}
                  step={1}
                  value={tenure}
                  onChange={(e) => setTenure(parseInt(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{selectedProduct.minTenure} months</span>
                  <span>{selectedProduct.maxTenure} months</span>
                </div>
              </div>

              {emiData && (
                <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium">Monthly EMI</span>
                    <span className="text-2xl font-bold text-accent">
                      ₹{emiData.monthlyEMI.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal Amount</span>
                      <span className="font-semibold text-foreground">
                        ₹{loanAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Interest</span>
                      <span className="font-semibold text-foreground">
                        ₹{emiData.totalInterest.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total Amount Payable</span>
                      <span className="text-accent text-lg">
                        ₹{emiData.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                <Link href="/auth/signup">Apply with This Amount</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => (
                        <span className="text-xs font-semibold">
                          {name}: ₹{(value / 100000).toFixed(0)}L
                        </span>
                      )}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#1e3a5f" />
                      <Cell fill="#d4a574" />
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${(value as number).toLocaleString('en-IN')}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Apply?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get your loan approved in minutes with our quick and transparent process.
            Fill out our simple application form and get instant decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/auth/signup">Get Started Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border border-white text-white bg-transparent hover:bg-white/10"
            >
              <Link href="/tracker">Track Application</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
