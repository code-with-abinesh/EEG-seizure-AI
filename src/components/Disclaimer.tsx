import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Disclaimer: React.FC = () => {
  return (
    <section
      id="about"
      className="py-16 bg-[#F8F6EC]"
      aria-labelledby="disclaimer-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl border border-[#DDE4DC] bg-white overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,92,53,0.06)' }}
        >
          {/* Green top accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#087A46] to-[#14945A]" aria-hidden="true" />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl bg-[#DCEBDD] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <ShieldCheck size={22} className="text-[#087A46]" />
              </div>

              {/* Content */}
              <div>
                <div
                  className="text-[10px] font-bold text-[#087A46] uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Important notice
                </div>
                <h2
                  id="disclaimer-heading"
                  className="text-xl sm:text-2xl font-extrabold text-[#111614] mb-3"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Research &amp; Educational Use
                </h2>
                <p
                  className="text-[#5F6862] leading-relaxed text-sm sm:text-base"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Experimental AI analysis only. This result is{' '}
                  <strong className="text-[#111614] font-semibold">not a medical diagnosis</strong>
                  {' '}and should not replace evaluation by a qualified healthcare professional.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Not a diagnostic device', desc: 'Output is for research purposes only' },
                    { label: 'Not clinically approved', desc: 'Requires qualified clinical interpretation' },
                    { label: 'Prototype stage', desc: 'Model accuracy is not yet validated' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-2 p-3 rounded-xl bg-[#F8F6EC] border border-[#DDE4DC]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#087A46] mt-1.5 shrink-0" aria-hidden="true" />
                      <div>
                        <div
                          className="text-[11px] font-semibold text-[#111614] mb-0.5"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {item.label}
                        </div>
                        <div
                          className="text-[10px] text-[#5F6862]"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Disclaimer;
