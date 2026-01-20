
import React, { useState, useEffect } from 'react';
import { SiteConfig, UserRole } from '../types';
import { getSiteConfig, saveSiteConfig, getCurrentUser } from '../services/storage';
import { useNavigate } from 'react-router-dom';
import { Save, Globe, Type, Image as ImageIcon, Rss } from 'lucide-react';

export const SiteSettings: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SiteConfig>({
    logoUrl: '',
    faviconUrl: '',
    ogImageUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    newsHeadlines: []
  });

  const [newsInput1, setNewsInput1] = useState('');
  const [newsInput2, setNewsInput2] = useState('');
  const [newsInput3, setNewsInput3] = useState('');
  const [newsInput4, setNewsInput4] = useState('');
  const [newsInput5, setNewsInput5] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.EDITOR) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, []);

  const loadData = () => {
    const current = getSiteConfig();
    setConfig(current);
    
    // Populate news inputs
    setNewsInput1(current.newsHeadlines[0] || '');
    setNewsInput2(current.newsHeadlines[1] || '');
    setNewsInput3(current.newsHeadlines[2] || '');
    setNewsInput4(current.newsHeadlines[3] || '');
    setNewsInput5(current.newsHeadlines[4] || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedConfig: SiteConfig = {
      ...config,
      newsHeadlines: [newsInput1, newsInput2, newsInput3, newsInput4, newsInput5].filter(Boolean)
    };

    saveSiteConfig(updatedConfig);
    alert('Site settings updated successfully! Changes will be reflected on the Public Landing page.');
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Globe className="mr-3 text-blue-600" />
            Site Settings & Branding
        </h1>
        <p className="text-gray-500">Configure logo, text content, and news ticker for the public site.</p>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branding Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <ImageIcon className="mr-2 text-purple-600" size={20}/> Assets & Branding
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Logo URL</label>
                    <input 
                        type="url" 
                        value={config.logoUrl}
                        onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-400 mt-1">Displayed in Navbar and Login screen.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                    <input 
                        type="url" 
                        value={config.faviconUrl}
                        onChange={(e) => setConfig({...config, faviconUrl: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="https://example.com/favicon.ico"
                    />
                    <p className="text-xs text-gray-400 mt-1">Browser tab icon.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Social Thumbnail (OG Image)</label>
                    <input 
                        type="url" 
                        value={config.ogImageUrl}
                        onChange={(e) => setConfig({...config, ogImageUrl: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="https://example.com/thumbnail.jpg"
                    />
                    <p className="text-xs text-gray-400 mt-1">Image shown when sharing the link on social media.</p>
                </div>
            </div>
        </div>

        {/* Hero Text Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Type className="mr-2 text-green-600" size={20}/> Hero Section Text
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
                    <input 
                        type="text" 
                        value={config.heroTitle}
                        onChange={(e) => setConfig({...config, heroTitle: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        placeholder="e.g. Sulaimaniya College"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input 
                        type="text" 
                        value={config.heroSubtitle}
                        onChange={(e) => setConfig({...config, heroSubtitle: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Inter House Sports Meet 2026"
                    />
                </div>
            </div>
        </div>

        {/* News Ticker Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Rss className="mr-2 text-orange-600" size={20}/> News Ticker Headlines
            </h2>
            <p className="text-sm text-gray-500 mb-4">Add up to 5 headlines that will scroll at the bottom of the public page.</p>
            
            <div className="space-y-3">
                <input type="text" value={newsInput1} onChange={e => setNewsInput1(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Headline 1" />
                <input type="text" value={newsInput2} onChange={e => setNewsInput2(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Headline 2" />
                <input type="text" value={newsInput3} onChange={e => setNewsInput3(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Headline 3" />
                <input type="text" value={newsInput4} onChange={e => setNewsInput4(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Headline 4" />
                <input type="text" value={newsInput5} onChange={e => setNewsInput5(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Headline 5" />
            </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
            <button 
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform transform hover:scale-105"
            >
                <Save size={20} />
                <span>Save All Settings</span>
            </button>
        </div>
      </form>
    </div>
  );
};
