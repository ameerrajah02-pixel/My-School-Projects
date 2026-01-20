
import React, { useState, useEffect } from 'react';
import { GalleryImage, HeroImage } from '../types';
import { getGalleryImages, saveGalleryImage, deleteGalleryImage, getHeroImages, saveHeroImage, deleteHeroImage } from '../services/storage';
import { Plus, Trash2, Image as ImageIcon, MonitorPlay } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const GalleryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'hero'>('gallery');
  
  // Gallery State
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  // Hero State
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [newHeroUrl, setNewHeroUrl] = useState('');

  const loadData = () => {
    setGalleryImages(getGalleryImages());
    setHeroImages(getHeroImages());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl) return;

    const newImage: GalleryImage = {
      id: uuidv4(),
      url: newGalleryUrl,
      caption: newGalleryCaption,
      timestamp: new Date().toISOString()
    };

    saveGalleryImage(newImage);
    setNewGalleryUrl('');
    setNewGalleryCaption('');
    loadData();
  };

  const handleAddHeroImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeroUrl) return;

    const newImage: HeroImage = {
      id: uuidv4(),
      url: newHeroUrl,
      timestamp: new Date().toISOString()
    };

    saveHeroImage(newImage);
    setNewHeroUrl('');
    loadData();
  };

  const handleDeleteGallery = (id: string) => {
    if (confirm('Remove this image from the gallery?')) {
      deleteGalleryImage(id);
      loadData();
    }
  };

  const handleDeleteHero = (id: string) => {
    if (confirm('Remove this image from the home slider?')) {
      deleteHeroImage(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ImageIcon className="mr-3 text-pink-600" />
            Media Manager
        </h1>
        <p className="text-gray-500">Manage public gallery photos and home page slider images.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'gallery' ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              <ImageIcon size={16} className="mr-2"/> Event Gallery
          </button>
          <button 
            onClick={() => setActiveTab('hero')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'hero' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              <MonitorPlay size={16} className="mr-2"/> Home Hero Slider
          </button>
      </div>

      {activeTab === 'gallery' ? (
          <div className="space-y-6 animate-fade-in">
            {/* Add New Gallery Image Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Add to Gallery</h2>
                <form onSubmit={handleAddGalleryImage} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input 
                            type="url" 
                            required
                            placeholder="Enter Image URL" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                            value={newGalleryUrl}
                            onChange={(e) => setNewGalleryUrl(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Caption (Optional)" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                            value={newGalleryCaption}
                            onChange={(e) => setNewGalleryCaption(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 flex items-center justify-center font-medium transition-colors"
                    >
                        <Plus size={18} className="mr-2" /> Add Photo
                    </button>
                </form>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {galleryImages.map(img => (
                    <div key={img.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square w-full bg-gray-100 relative">
                            <img 
                                src={img.url} 
                                alt={img.caption || 'Gallery Image'} 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Error'; }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={() => handleDeleteGallery(img.id)}
                                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transform hover:scale-110 transition-transform"
                                    title="Delete Image"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        {img.caption && (
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-700 truncate">{img.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
                {galleryImages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        Gallery is empty.
                    </div>
                )}
            </div>
          </div>
      ) : (
          <div className="space-y-6 animate-fade-in">
             {/* Add New Hero Image Form */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Update Home Slider</h2>
                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">
                    High resolution landscape images (1920x1080) are recommended for best results on the home page.
                </div>
                <form onSubmit={handleAddHeroImage} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input 
                            type="url" 
                            required
                            placeholder="Enter Hero Image URL" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newHeroUrl}
                            onChange={(e) => setNewHeroUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center font-medium transition-colors"
                    >
                        <Plus size={18} className="mr-2" /> Add Slide
                    </button>
                </form>
            </div>

            {/* Hero Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroImages.map(img => (
                    <div key={img.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-video w-full bg-gray-100 relative">
                            <img 
                                src={img.url} 
                                alt="Hero Slide" 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Image+Error'; }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={() => handleDeleteHero(img.id)}
                                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transform hover:scale-110 transition-transform"
                                    title="Delete Slide"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {heroImages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        No slider images found. The home page will be blank.
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
};
