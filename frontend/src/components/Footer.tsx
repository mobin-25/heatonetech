import React from 'react';
import { TabType } from '../types';
import { MapPin, Mail, Phone, Instagram, Linkedin, ShieldCheck } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: TabType) => void;
  onOpenCall: () => void;
}

export default function Footer({ setActiveTab, onOpenCall }: FooterProps) {
  return (
    <footer className="bg-[#0A0A0C] text-zinc-400 border-t border-orange-500/10 mt-auto" id="footer-section">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12" id="footer-grid">
          
          {/* Contact Info */}
          <div className="flex flex-col gap-4 min-w-0" id="footer-contact">
            <h3 className="text-white font-mono text-sm tracking-wider uppercase border-b border-zinc-800 pb-2">
              Contact Info
            </h3>
            <ul className="space-y-3 text-xs md:text-sm min-w-0">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=HEAT+ONE+TECHNOLOGY,+BUS+DEPO,+PLOT+NO+A-342,+Rd+Number+26,+CP+Talav,+Wagle+Industrial+Estate,+Thane+West,+Thane,+Maharashtra+400604"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400 transition-colors"
                >
                  <strong>HEAT ONE TECHNOLOGY</strong>
                  <br />
                  BUS DEPO, PLOT NO A-342, Rd Number 26, CP Talav, Wagle Industrial Estate, Thane West, Thane, Maharashtra 400604
                </a>
              </li>
              <li className="flex items-center gap-2.5 min-w-0">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <a href="mailto:heatonetechnology@gmail.com" className="hover:text-orange-400 font-mono transition-colors break-all">
                  heatonetechnology@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="flex flex-col font-mono text-xs">
                  <a href="tel:+919221783525" className="hover:text-orange-400 transition-colors">
                    +91 92217 83525
                  </a>
                  <a href="tel:+918767655745" className="hover:text-orange-400 transition-colors">
                    +91 87676 55745
                  </a>
                  <a href="tel:+917666634617" className="hover:text-orange-400 transition-colors">
                    +91 76666 34617
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4" id="footer-links">
            <h3 className="text-white font-mono text-sm tracking-wider uppercase border-b border-zinc-800 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <button 
                  onClick={() => setActiveTab('home')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all"
                >
                  Home Landing Page
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all"
                >
                  Explore Products Specs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('contact')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all"
                >
                  Submit Quote Request
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenCall} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all text-orange-500/80"
                >
                  Request Call Consultation
                </button>
              </li>
            </ul>
          </div>

          {/* Products Categories */}
          <div className="flex flex-col gap-4" id="footer-products">
            <h3 className="text-white font-mono text-sm tracking-wider uppercase border-b border-zinc-800 pb-2">
              Product Categories
            </h3>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all text-left"
                >
                  Short Wave Infrared Lamps
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all text-left"
                >
                  Quartz Tube Radiant Envelopes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all text-left"
                >
                  Twin-Tube Carbon Heaters
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all text-left"
                >
                  Ceramic Longwave Panel Plates
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="hover:text-orange-400 hover:translate-x-1 transition-all text-left font-semibold text-zinc-300"
                >
                  Custom Heat Processing Ovens
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media & Verification */}
          <div className="flex flex-col gap-4" id="footer-social">
            <h3 className="text-white font-mono text-sm tracking-wider uppercase border-b border-zinc-800 pb-2">
              Social Connection
            </h3>
            <div className="flex items-center gap-3" id="social-icons">
              <a 
                href="https://www.indiamart.com/heatonetechnology/about-us.html?srsltid=AfmBOorf4DuHNflTqiif_uRGAlOiL7jQNORKOFKNKCb-uvUtfSC18Ew5" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="IndiaMART Profile"
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-[#bf2232] hover:text-[#bf2232] hover:-translate-y-1 transition-all duration-300"
                id="indiamart-social-btn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm1.5-6.81l-.9 4.14c-.09.39-.43.67-.83.67h-.54c-.4 0-.74-.28-.83-.67l-.9-4.14a1 1 0 0 1 .97-1.21h2.06c.63 0 1.11.57.97 1.21z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/heatone.technology/" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Instagram Profile"
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-pink-500 hover:text-pink-500 hover:-translate-y-1 transition-all duration-300"
                id="instagram-social-btn"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://in.linkedin.com/company/heat-one-technology" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="LinkedIn Page"
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-blue-500 hover:text-blue-500 hover:-translate-y-1 transition-all duration-300"
                id="linkedin-social-btn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-4 p-3 bg-orange-950/20 border border-orange-500/10 rounded-lg flex items-center gap-2.5 text-xs text-orange-200/70" id="iso-certified">
              <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
              <span>
                <strong>ISO 9001:2015</strong> Certified Manufacturing & Exporter Operations
              </span>
            </div>
          </div>

        </div>

        {/* Lower copyright bar */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            Copyright © 2026 <span className="text-orange-500/80">Heat One Technology</span>. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Sale</a>
            <span>•</span>
            <a href="#" className="hover:text-orange-400 transition-colors">Sitemap</a>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('admin')} 
              className="hover:text-orange-400 transition-colors cursor-pointer font-semibold uppercase tracking-wider text-[10px]"
              id="footer-admin-link"
            >
              Company Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
