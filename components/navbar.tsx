'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    await logout(); // Cognito GlobalSignOut — invalidates all tokens
    router.push('/');
  };

  if (!mounted) return null;

  const isActive = (path: string) => pathname === path;
  const isAdmin = user?.role === 'admin' || user?.role === 'loan-officer';

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary font-bold">
              FS
            </div>
            FinServe
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated ? (
              <>
                <Link href="/#products" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
                  Products
                </Link>
                <Link href="/#calculator" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
                  EMI Calculator
                </Link>
                <Link href="/auth/login" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
                  Sign In
                </Link>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                <Link href="/dashboard"
                  className={`text-sm font-medium transition-opacity ${isActive('/dashboard') ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin"
                    className={`text-sm font-medium transition-opacity ${isActive('/admin') ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                    Admin Panel
                  </Link>
                )}
                <Link href="/tracker"
                  className={`text-sm font-medium transition-opacity ${isActive('/tracker') ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  Tracker
                </Link>
                <Link href="/apply"
                  className={`text-sm font-medium transition-opacity ${isActive('/apply') ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  Apply
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-primary-foreground/20">
                  <div className="text-sm">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs opacity-75 capitalize">{user?.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hover:bg-primary-foreground/20"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-primary-foreground/20">
            {!isAuthenticated ? (
              <>
                <Link href="/#products" className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">Products</Link>
                <Link href="/#calculator" className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">EMI Calculator</Link>
                <Link href="/auth/login" className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">Sign In</Link>
                <Link href="/auth/signup" className="block px-4 py-2 rounded bg-accent text-accent-foreground font-medium">Get Started</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">Dashboard</Link>
                {isAdmin && (
                  <Link href="/admin" className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">Admin Panel</Link>
                )}
                <Link href="/tracker" className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">Tracker</Link>
                <Link href="/apply" className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">Apply</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors text-red-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
