import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, LogIn } from 'lucide-react';
import { BlindBoxUser } from '../../types';

interface BlindBoxAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: BlindBoxUser) => void;
}

export const BlindBoxAuthModal: React.FC<BlindBoxAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const authenticateMainSession = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const token = localStorage.getItem('sys_stream_auth_token');

        if (!token) {
          throw new Error('Silakan login terlebih dahulu melalui halaman utama SYS.');
        }

        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.user) {
          localStorage.removeItem('sys_stream_auth_token');
          throw new Error('Sesi login utama sudah tidak valid. Silakan login kembali.');
        }

        onAuthSuccess(token, data.user);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Sesi login utama tidak valid.');
      } finally {
        setIsLoading(false);
      }
    };

    authenticateMainSession();
  }, [isOpen, onAuthSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
            {isLoading ? (
              <LogIn className="h-8 w-8 text-amber-600 animate-pulse" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-amber-600" />
            )}
          </div>

          <h2 className="text-xl font-black text-gray-900">
            {isLoading ? 'Memeriksa Sesi...' : 'Login SYS Utama Diperlukan'}
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Blind Box menggunakan akun login utama SYS. Tidak diperlukan login
            atau pendaftaran akun kedua.
          </p>

          {errorMsg && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          {!isLoading && errorMsg && (
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              Kembali ke Login Utama
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
