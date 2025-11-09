import React from 'react';
import { ChefHat, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CampusBite</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Your one-stop solution for campus dining. Order delicious meals from our canteen 
              with ease and convenience. Fast, reliable, and student-friendly.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@campusbite.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/student/menu" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Menu
                </a>
              </li>
              <li>
                <a href="/student/orders" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Order History
                </a>
              </li>
              <li>
                <a href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Admin Dashboard
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>HITAM Campus, Hyderabad</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>canteen@hitam.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 CampusBite. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Help & Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
