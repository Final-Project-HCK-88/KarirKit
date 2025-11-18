import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0c1b8a] text-white py-12 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/kaka.png"
                alt="KarirKit Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                unoptimized
              />
              <span className="text-xl font-bold">KarirKit</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              AI-powered career platform helping job seekers find their dream
              opportunities with confidence.
            </p>
          </div>

          {/* Column 2 - Features */}
          <div>
            <h3 className="font-bold text-base mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard/job-matching"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Job Matching
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/salary-benchmark"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Salary Benchmark
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/contract-analysis"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Contract Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h3 className="font-bold text-base mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/20 text-center text-sm text-white/70">
          <p>
            &copy; {new Date().getFullYear()} KarirKit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
