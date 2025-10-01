
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Play, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Unit } from '@/lib/types';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';
import AdminAuthGuard from '@/components/admin-auth-guard';

const getTotalScore = (unit: Unit) => {
  if (!unit.events) return 0;
  return unit.events.reduce((total, event) => total + event.score, 0);
};

export default function AnnouncementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    const unitsRef = ref(database, 'units');
    const unsubscribeUnits = onValue(unitsRef, (snapshot) => {
      if (snapshot.exists()) {
        const unitsData = snapshot.val();
        const unitsArray: Unit[] = Object.keys(unitsData).map(key => ({
          id: key,
          ...unitsData[key],
        }));
        setUnits(unitsArray);
      } else {
        setUnits([]);
      }
      setLoading(false);
    });
    return () => unsubscribeUnits();
  }, []);

  const rankedUnits = useMemo(() => {
    const sortedUnits = [...units]
      .filter(unit => getTotalScore(unit) > 0)
      .sort((a, b) => getTotalScore(b) - getTotalScore(a));
  
    let rank = 0;
    let lastScore = -1;
    return sortedUnits.map((unit, index) => {
      const score = getTotalScore(unit);
      if (score !== lastScore) {
        rank = index + 1;
        lastScore = score;
      }
      return { ...unit, rank };
    });
  }, [units]);
  

  const handleNext = useCallback(() => {
    setCurrentUnitIndex((prevIndex) => (prevIndex + 1) % rankedUnits.length);
  }, [rankedUnits.length]);

  const handlePrev = useCallback(() => {
    setCurrentUnitIndex((prevIndex) => (prevIndex - 1 + rankedUnits.length) % rankedUnits.length);
  }, [rankedUnits.length]);

  useEffect(() => {
    if (!isStarted || rankedUnits.length === 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, isStarted, rankedUnits.length]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center">
            <Skeleton className="w-96 h-64 bg-gray-200" />
            <div className="flex gap-4 mt-4">
                 <Skeleton className="w-24 h-10 bg-gray-200" />
                 <Skeleton className="w-24 h-10 bg-gray
-200" />
            </div>
        </div>
    </div>;
  }
  
  const currentUnit = rankedUnits[currentUnitIndex];

  return (
    <AdminAuthGuard>
    <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden p-4 bg-white text-gray-800">
        <div className="warm-gradient-background"></div>
      {!isStarted ? (
         <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="z-10"
          >
            <Button size="lg" onClick={() => setIsStarted(true)} className="h-24 px-12 text-2xl rounded-full shadow-lg bg-gradient-to-r from-primary via-red-500 to-yellow-500 hover:shadow-xl transition-shadow text-white">
                <Play className="mr-4 h-8 w-8"/>
                Start Presentation
            </Button>
        </motion.div>
      ) : (
      <>
        <div className="w-full max-w-lg z-10 h-96 flex items-center justify-center">
        <AnimatePresence mode="wait">
            {rankedUnits.length > 0 && currentUnit && (
                <motion.div 
                    key={currentUnit.id} 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    transition={{ duration: 0.5 }}
                    className="relative w-[380px] h-[240px] rounded-2xl shadow-xl p-6 flex flex-col justify-between items-center text-center text-white overflow-hidden"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-primary via-red-500 to-yellow-500"
                        style={{ backgroundSize: '200% 200%' }}
                        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative z-10 text-3xl font-bold">
                        Rank {currentUnit.rank}
                    </div>
                    
                    <h1 className="relative z-10 text-4xl font-headline font-extrabold my-2 truncate max-w-full">
                        {currentUnit.name}
                    </h1>
                    
                    <div className="relative z-10 text-6xl font-black font-mono">
                        {getTotalScore(currentUnit)}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </div>
      
        {rankedUnits.length === 0 && !loading && (
            <div className="text-center text-xl text-gray-500 z-10">No scored meghalas to display.</div>
        )}

        <div className="absolute bottom-10 flex items-center gap-6 z-10">
            <Button onClick={handlePrev} size="lg" variant="outline" className="rounded-full h-14 w-14 p-0 bg-white/50 border-gray-300 hover:bg-white/80 text-gray-600">
            <ArrowLeft />
            </Button>
            <div className="text-lg font-mono text-gray-500">
            {rankedUnits.length > 0 ? currentUnitIndex + 1 : 0} / {rankedUnits.length > 0 ? rankedUnits.length : 0}
            </div>
            <Button onClick={handleNext} size="lg" variant="outline" className="rounded-full h-14 w-14 p-0 bg-white/50 border-gray-300 hover:bg-white/80 text-gray-600">
            <ArrowRight />
            </Button>
        </div>
       </>
      )}
    </div>
    </AdminAuthGuard>
  );
}

