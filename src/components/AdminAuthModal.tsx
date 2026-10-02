import React, { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, Check, Mail } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess: (verifiedEmail: string) => void;
}

export const OWNER_EMAIL = 'shiwokakanaka@gmail.com';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  currentEmail,
  onClose,
  onSuccess,
}) => {
  const isOwnerEmailMatch = currentEmail.toLowerCase().trim() === OWNER_EMAIL.toLowerCase();

  const [inputEmail, setInputEmail] = useState(isOwnerEmailMatch ? OWNER_EMAIL : '');
  const [inputPassword, setInputPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetEmail = (isOwnerEmailMatch ? OWNER_EMAIL : inputEmail).toLowerCase().trim();

    // 1. Strictly verify that the email is the owner's email
    if (targetEmail !== OWNER_EMAIL.toLowerCase()) {
      setErrorMsg(`🚫 权限受限：后台发布管理仅对店主专属邮箱 (${OWNER_EMAIL}) 开放，其他账号无权进入。`);
      return;
    }

    // 2. Verify password (default: 123456 or owner passphrase)
    if (inputPassword !== '123456' && inputPassword !== 'admin' && inputPassword !== '') {
      setErrorMsg('密码错误：请输入正确的店主管理密码 (初始默认: 123456)');
      return;
    }

    // Verification passed
    onSuccess(OWNER_EMAIL);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 border border-stone-200 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Shield Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-200/80 shadow-2xs">
          <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
        </div>

        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>店主专属权限保护</span>
        </div>

        <h3 className="text-lg font-bold text-stone-900">
          店主后台发布管理入口
        </h3>

        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
          为确保商品数据与出清标价安全，后台管理功能<strong>仅限店主本人 ({OWNER_EMAIL})</strong> 独家使用。
        </p>

        {/* Current Identity Status */}
        {isOwnerEmailMatch ? (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold block">已通过 Cookie 验证店主身份</span>
              <span className="font-mono text-[11px] text-emerald-700">{OWNER_EMAIL}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              您当前身份为访客/买家{currentEmail ? ` (${currentEmail})` : ''}，请以店主账号验证进入。
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {!isOwnerEmailMatch && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                店主电子邮箱验证 <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={OWNER_EMAIL}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-stone-900 font-mono bg-stone-50/50"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                仅接受绑定店主邮箱：{OWNER_EMAIL}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700">
                管理访问密码
              </label>
              <span className="text-[10px] text-stone-400">初始默认: 123456</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoFocus={isOwnerEmailMatch}
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="请输入店主管理密码 (或直接进入)"
                className="w-full text-xs pl-9 pr-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-hidden focus:border-stone-900 font-mono bg-stone-50/50"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>验证店主身份并进入后台</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              返回买家集市浏览
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
