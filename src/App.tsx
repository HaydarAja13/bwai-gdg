import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Copy, Loader2, Sparkles, Check, ChevronRight } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
Anda adalah Master Copywriter untuk 'Dani Bakery', spesialis media sosial Instagram.
Tugas Anda adalah mengubah input produk (nama kue dan detail/deskripsi) menjadi caption Instagram yang menggugah selera, menarik, dan siap posting.

Guidelines:
1. Tone & Gaya Bahasa: Hangat, menggiurkan (mouth-watering), bersahabat, dan mengajak (Call-to-Action). Gunakan emoji secukupnya.
2. Format Output:
   - Kalimat pembuka yang memikat selera (Hook).
   - Deskripsi rasa/tekstur/kelebihan produk secara detail berdasarkan input.
   - Info harga (jika dicantumkan di input).
   - Kalimat ajakan (Call to Action) seperti "Pesan sekarang", "Stock terbatas lho", dsb.
   - Minimal 3 hashtag deskriptif, diakhiri dengan #DaniBakery.
3. Penanganan Input Tidak Valid (Sangat Penting):
   - Jika input kosong atau hanya berisi karakter acak yang tidak berarti, balas HANYA dengan pesan: "Ups! Mohon masukkan nama dan detail kue yang jelas agar saya bisa buatkan caption yang menggugah selera ya \u2728"
   - Jika input tidak berhubungan sama sekali dengan makanan/kue, balas HANYA dengan pesan: "Maaf, saya spesialis pembuat caption kue untuk Dani Bakery. Mohon masukkan detail kue atau roti yang relevan \ud83d\ude0a"
   - Jika input hanya nama tanpa deskripsi, berikan caption terbaik dengan deskripsi imajinatif yang cocok untuk produk tersebut.
`;

const TEST_CASES = [
  "Chocolate Lava Cake, cokelat Belgia, meleleh di tengah.",
  "Roti Sobek Cokelat, tekstur lembut, isi melimpah.",
  "Cookies Cokelat Kenari, renyah, kemasan toples.",
  "Brownies lumer, topping keju, harga 65rb"
];

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateContent = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError('');
    setOutput('');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2, // Low temperature for consistency
        }
      });
      setOutput(response.text || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghasilkan konten. Coba periksa koneksi atau API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="h-screen w-full bg-[#FDFCFB] flex flex-col font-sans text-[#3D2B1F] overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-20 shrink-0 border-b border-[#3D2B1F]/10 flex items-center justify-between px-6 md:px-10 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3D2B1F] rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#FDFCFB]" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#3D2B1F]">
            DANI BAKERY <span className="font-light text-[#A67C52] hidden sm:inline">| AI Workflow</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium uppercase tracking-widest text-[#A67C52]">
          <span className="hidden sm:inline">Status: Active</span>
          <span className="px-3 py-1 bg-[#3D2B1F] text-white rounded-full text-[10px]">V 1.0.4</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Configurations & Test Cases */}
        <aside className="w-80 shrink-0 border-r border-[#3D2B1F]/10 p-8 flex-col gap-8 bg-[#F9F7F5] overflow-y-auto hidden lg:flex">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52] mb-3 block">System Persona</label>
            <div className="p-4 bg-white border border-[#3D2B1F]/10 rounded-xl text-xs leading-relaxed italic text-[#3D2B1F]/70 shadow-sm">
              "Anda adalah Copywriter Dani Bakery. Tugas: Ubah input menjadi caption Instagram yang hangat & menggugah selera."
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52] mb-3 block">Model Parameters</label>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs">Temperature</span>
                <span className="text-xs font-mono font-bold">0.2</span>
              </div>
              <div className="h-1.5 w-full bg-[#3D2B1F]/10 rounded-full">
                <div className="h-full w-1/5 bg-[#3D2B1F] rounded-full"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Consistency</span>
                <span className="text-xs text-green-600 font-bold uppercase text-[10px]">High</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52] block">Test Cases</label>
            <div className="flex flex-col gap-2">
              {TEST_CASES.map((tc, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(tc)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-white border border-[#3D2B1F]/10 hover:border-[#A67C52] hover:text-[#3D2B1F] text-[#3D2B1F]/70 transition-colors truncate max-w-full shadow-sm"
                >
                  {tc.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="p-4 bg-[#3D2B1F] rounded-xl text-[#FDFCFB] text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Account Usage</p>
              <p className="text-xl font-bold">1,284 <span className="text-sm font-normal opacity-50">/ 5k</span></p>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <section className="flex-1 p-6 md:p-10 flex flex-col gap-8 overflow-y-auto">
          {/* Input Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52]">Cake Details & Ingredients</label>
              <span className="text-[10px] text-[#3D2B1F]/40">{input.length} / 200 characters</span>
            </div>
            
            {/* Show test cases on mobile only */}
            <div className="flex lg:hidden flex-wrap gap-2 mb-2">
               {TEST_CASES.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(tc)}
                    className="text-left text-[10px] px-2 py-1 rounded-full bg-white border border-[#3D2B1F]/10 hover:border-[#A67C52] text-[#3D2B1F]/70 uppercase tracking-wider font-bold"
                  >
                    Test {idx + 1}
                  </button>
                ))}
            </div>

            <textarea
              id="product-details"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: Chocolate Lava Cake, cokelat Belgia, meleleh di tengah..."
              className="w-full h-40 p-6 bg-white border-2 border-[#3D2B1F]/10 rounded-2xl focus:border-[#3D2B1F] focus:outline-none transition-colors resize-none md:text-lg text-sm placeholder-[#3D2B1F]/20 shadow-sm"
            />
            <button
              onClick={generateContent}
              disabled={isLoading || !input.trim()}
              className="w-full py-4 bg-[#3D2B1F] text-white rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-[#5A4030] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#3D2B1F]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  Generate Konten AI
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52]">Generated Copywriting</label>
              {output && (
                <button onClick={copyToClipboard} className="text-[10px] font-bold text-[#3D2B1F] flex items-center gap-1 hover:underline">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'COPIED!' : 'COPY TO CLIPBOARD'}
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-white border border-[#3D2B1F]/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group shadow-inner flex flex-col">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#3D2B1F]/40 bg-white/80 z-10 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A67C52]" />
                  <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Menyiapkan inspirasi...</p>
                </div>
              ) : output ? (
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-full text-[#3D2B1F] leading-relaxed text-sm md:text-base border-none bg-transparent resize-none focus:outline-none flex-1"
                />
              ) : error ? (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <p className="text-sm font-medium text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">{error}</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#3D2B1F]/40">
                  <div className="text-[#3D2B1F]/10 font-bold text-2xl md:text-4xl uppercase tracking-tighter select-none mb-4">
                    Awaiting Input
                  </div>
                  <p className="text-xs uppercase tracking-widest font-medium opacity-60">Masukkan detail kue untuk memulai</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

