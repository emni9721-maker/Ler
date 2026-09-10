import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, HardDrive } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 600);
    const timer2 = setTimeout(() => setStage(2), 1400);
    const timer3 = setTimeout(() => onFinish(), 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        id="zero-splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0c10] text-white select-none px-6"
        onClick={onFinish}
      >
        {/* Subtle background ambient glow */}
        <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        {/* Minimalist Logo Mark */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800/80 shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 via-transparent to-cyan-500/15 opacity-80" />
            <span className="text-4xl font-extrabold tracking-tighter text-white font-['Space_Grotesk'] z-10">
              0
            </span>
            <div className="absolute -bottom-2 w-8 h-1 rounded-full bg-emerald-400 blur-[1px]" />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-[0.25em] text-white uppercase font-['Space_Grotesk']">
            Z E R O
          </h1>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium mt-1">
            Social & Private Photo Vault
          </p>
        </motion.div>

        {/* Dynamic feature hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 1 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-10 flex items-center gap-4 text-xs text-neutral-400 bg-neutral-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800/60"
        >
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Encrypted Vault
          </span>
          <span className="w-1 h-1 rounded-full bg-neutral-700" />
          <span className="flex items-center gap-1.5 text-cyan-400">
            <HardDrive className="w-3.5 h-3.5" /> 50 GB Cloud
          </span>
          <span className="w-1 h-1 rounded-full bg-neutral-700" />
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" /> Stories
          </span>
        </motion.div>

        {/* Tap to skip */}
        <p className="absolute bottom-8 text-[11px] text-neutral-600 tracking-wider">
          Tap anywhere to enter
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
