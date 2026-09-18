import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Lock, Unlock, Delete, UserCheck } from 'lucide-react';
import { User } from '../../types';

interface Props {
  onSuccess: (agent: User) => void;
}

export const AgentPinLogin: React.FC<Props> = ({ onSuccess }) => {
  const { agents, verifyAgentPin, setCurrentUser } = useFinance();

  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg(null);

      if (nextPin.length === 4) {
        validatePin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const validatePin = (inputPin: string) => {
    const verified = verifyAgentPin(inputPin);
    if (verified) {
      setIsSuccess(true);
      setCurrentUser(verified);
      setTimeout(() => {
        onSuccess(verified);
      }, 500);
    } else {
      setErrorMsg('Invalid 4-digit PIN. Please try again.');
      setTimeout(() => {
        setPin('');
      }, 800);
    }
  };

  const handleQuickSelectAgent = (agent: User) => {
    setPin(agent.pinCode);
    validatePin(agent.pinCode);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-b-full"></div>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/40 scale-110'
              : errorMsg
              ? 'bg-rose-500/20 text-rose-400 ring-4 ring-rose-500/40'
              : 'bg-slate-800 text-slate-300 ring-2 ring-slate-700'
          }`}
        >
          {isSuccess ? (
            <Unlock className="w-8 h-8 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        <h2 className="text-xl font-black text-white">Agent Field Lock</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your 4-digit security PIN to unlock your route
        </p>

        {/* 4 Dots PIN Display */}
        <div className="flex items-center justify-center gap-4 my-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? isSuccess
                      ? 'bg-emerald-400 scale-125 shadow-lg shadow-emerald-500/50'
                      : 'bg-white scale-110'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="text-xs font-semibold text-rose-400 mb-4 animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 my-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-white border border-slate-700/80 text-lg font-bold text-white transition duration-150 flex items-center justify-center shadow-md select-none"
            >
              {digit}
            </button>
          ))}

          {/* Empty corner */}
          <div className="h-14"></div>

          {/* 0 digit */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-white border border-slate-700/80 text-lg font-bold text-white transition duration-150 flex items-center justify-center shadow-md select-none"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 transition duration-150 flex items-center justify-center shadow-md"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Agent PIN Shortcut Pills */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2.5">
            Quick Agent Login
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {agents.map((ag) => (
              <button
                key={ag.id}
                type="button"
                onClick={() => handleQuickSelectAgent(ag)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-medium transition flex items-center gap-1.5"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>{ag.name.split(' ')[0]} (PIN: {ag.pinCode})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
