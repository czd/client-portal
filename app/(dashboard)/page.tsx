import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight sm:text-6xl">
            Technology solutions
            <span className="block text-orange-500">for your business</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
            From custom websites and applications to consulting, workshops, and
            coaching. Browse our services and get started today.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/services">
              <Button size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white text-lg">
                Browse Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="rounded-full text-lg">
                Client Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: 'Websites & Apps',
                description: 'Modern, responsive websites and custom web applications built with the latest technologies.',
              },
              {
                title: 'Consulting & Strategy',
                description: 'Technical consulting, architecture review, and AI strategy guidance for your organization.',
              },
              {
                title: 'Workshops & Coaching',
                description: 'Hands-on workshops and personalized coaching to level up your team or career.',
              },
            ].map((item) => (
              <div key={item.title}>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
