'use client';

import { User } from 'lucide-react';

interface ProfileCardProps {
  name?: string;
  role?: string;
  imageUrl?: string;
}

export function ProfileCard({ 
  name = 'Sankritya', 
  role = 'Student & Developer',
  imageUrl = 'https://avatars.githubusercontent.com/u/yourusername' // Add your GitHub avatar or any image URL
}: ProfileCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col items-center text-center">
        {/* Profile Image */}
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white/20">
            <img 
              src="/sankritya.jpg" 
              alt={name} 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg" />
        </div>

        {/* Name & Role */}
        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <p className="text-sm text-gray-400 mb-4">{role}</p>

        {/* Memory Stats */}
        <div className="w-full bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
          <div className="text-2xl font-bold text-white">47</div>
          <div className="text-xs text-gray-400">Total Memories</div>
        </div>
      </div>
    </div>
  );
}
