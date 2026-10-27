import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Building2,
  MapPin,
  Phone,
  Mail,
  Scale,
  X,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'contact';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'contact'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Statutory Land Governance & Legal Framework
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SVAMITVA, DILRMP & Digital Personal Data Protection (DPDP) Act 2023
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy (DPDP Act)</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Cadastral Terms & SLAs</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Nodal Directory & Physical Address</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Sovereign Citizen Data Protection Commitment
                </h4>
                <p className="text-emerald-800 dark:text-emerald-200 text-xs">
                  All cadastral coordinates, Aadhaar tokens, Khasra certificates, and landowner names processed on BhuDrishti are stored inside sovereign Indian datacenter clusters adhering to the Digital Personal Data Protection (DPDP) Act 2023.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                  1. Data Collection & Cadastral Records
                </h3>
                <p>
                  BhuDrishti acts as a spatial integration platform linking Survey of India drone orthorectified imagery, State Land Revenue Departments (e.g. Bhulekh, UP Revenue Code 2006, Karnataka Bhoomi), and municipal GIS databases. We collect polygon centroid coordinates, survey verification timestamps, dispute tokens, and designated officer e-signatures.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                  2. Offline Storage & Local Encryption
                </h3>
                <p>
                  Surveyors operating in rural areas with zero network connectivity utilize AES-256 encrypted browser IndexedDB storage. Telemetry pings are buffered locally and only synchronized to the master PostgreSQL/Supabase database when a verified cryptographic handshake is established.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                  3. Right to Correction & Resurvey
                </h3>
                <p>
                  Every registered citizen holds the right under Section 31 of the SVAMITVA Operational Guidelines to request a physical field verification or drone resurvey if boundary discrepancies exceed the statutory 5 cm CORS RTK tolerance limit.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Statutory Cadastral & Valuation Standards
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs">
                  Cadastral boundaries rendered in BhuDrishti conform to WGS 84 (EPSG:4326) and UTM Zone 43N/44N projections with CORS network differential correction.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                  1. Evidentiary Weight of E-Gharouni (Property Cards)
                </h3>
                <p>
                  The Digital Property Card issued through the Citizen Portal is a valid legal record of rights in accordance with respective State Panchayati Raj and Land Revenue Amendments, enabling owners to secure agricultural bank credit and municipal building permits.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                  2. Infrastructure Acquisition Payouts (RFCTLARR Act 2013)
                </h3>
                <p>
                  All compensation valuations for highway, railway, or solar corridor acquisitions computed within this system follow the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act 2013, applying a 100% solatium and 12% annual statutory interest.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                  3. Grievance Service Level Agreements (SLAs)
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Boundary encroachment reports: Resolved within 14 business days by Revenue Inspector.</li>
                  <li>Record of Rights (RoR) spelling corrections: Processed within 7 business days by Tehsildar.</li>
                  <li>Drone Resurvey disputes: Field ground-truthing scheduled within 21 business days.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                  Official Nodal Headquarters & Support Directory
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-4">
                  For official inquiries, boundary dispute escalations, and technical integration with State Geoportals:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Physical Address Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Physical Ministry Headquarters</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                      Ministry of Rural Development & Panchayati Raj<br />
                      Krishi Bhawan / Shram Shakti Bhawan<br />
                      Rafi Marg, New Delhi – 110001<br />
                      Republic of India
                    </p>
                  </div>

                  {/* Survey of India Technical Wing */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Survey of India (SOI) GIS Wing</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                      Surveyor General’s Office<br />
                      Hathibarkala Estate, Post Box No. 28<br />
                      Dehradun, Uttarakhand – 248001<br />
                      Geodetic & Research Branch
                    </p>
                  </div>

                  {/* Citizen Toll-Free Helpline */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-2">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span>National Citizen Helpline</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Toll-Free Helpline: <span className="font-bold text-slate-900 dark:text-white font-mono">1800-180-1551</span><br />
                      Operational: 08:00 AM – 08:00 PM IST (Mon–Sat)<br />
                      IVRS Language: Hindi, English, Regional
                    </p>
                  </div>

                  {/* Official Electronic Mail */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-2">
                      <Mail className="w-4 h-4 text-amber-600" />
                      <span>Official Nodal Desk</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                      support-cadastre@bhudrishti.gov.in<br />
                      nodal-svamitva@panchayat.gov.in<br />
                      NIC Service Desk: 011-2338-7654
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Digital Land Governance Portal (DILRMP/SVAMITVA)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
