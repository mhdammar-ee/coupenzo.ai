import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Globe2,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useLayoutEffect, useRef, useState, useEffect, type ReactNode } from "react";

// Clean script inject engine utility to fetch runtime client directly without node modules break dependencies
declare global {
  interface Window {
    supabase: any;
  }
}

const DESIGN_WIDTH = 896;
const DESIGN_HEIGHT = 456;

interface ScaledDashboardProps {
  children: ReactNode;
}

interface ScaleMetrics {
  scale: number;
  height: number;
}

export function ScaledDashboard({ children }: ScaledDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const [metrics, setMetrics] = useState<ScaleMetrics>({
    scale: 1,
    height: DESIGN_HEIGHT,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const availableWidth = container.getBoundingClientRect().width;
      const nextScale = Math.min(1, availableWidth / DESIGN_WIDTH);

      setMetrics({
        scale: nextScale,
        height: DESIGN_HEIGHT * nextScale,
      });
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(updateScale);
    };

    updateScale();
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: metrics.height }}>
      <div
        className="absolute left-1/2 top-0 will-change-transform"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `translateX(-50%) scale(${metrics.scale})`,
          transformOrigin: "top center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Global Static Sidebar folders array layout matching theme profile
const folders = [
  { label: "Tracked prompts", count: 42, icon: FolderOpen, active: true },
  { label: "Citation targets", count: 18, icon: Folder },
  { label: "Competitors", count: 7, icon: Folder },
] as const;

// Interface properties mapping data profiles
interface LiveCouponRow {
  name: string;
  offer: string;
  coupon_code: string;
  tracking_url: string;
}

interface DashboardMockupProps {
  currentSearchQuery?: string;
}

export default function DashboardMockup({ currentSearchQuery = "" }: DashboardMockupProps) {
  const [dbClient, setDbClient] = useState<any>(null);
  const [storeName, setStoreName] = useState("Coupenzo Workspace");
  const [storeUrl, setStoreUrl] = useState("coupenzo.ai");
  const [coupons, setCoupons] = useState<LiveCouponRow[]>([]);
  const [statusMessage, setStatusMessage] = useState("Search a brand to load live database relational items.");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Supabase safely dynamically when component mounts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => {
      if (window.supabase) {
        const url = "https://mjdarfyzednoohsiasgk.supabase.co";
        const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZGFyZnl6ZWRub29oc2lhc2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTU0MzEsImV4cCI6MjA5ODEzMTQzMX0.5lavKvNNmAZPEB_LVME1BgGNfC6J9uMHhvqQ9Oi6WXo";
        setDbClient(window.supabase.createClient(url, key));
      }
    };
    document.head.appendChild(script);
  }, []);

  // Fetch relational data dynamically whenever currentSearchQuery string alters
  useEffect(() => {
    if (!dbClient || !currentSearchQuery) return;

    async function queryDatabase() {
      setIsLoading(true);
      setStatusMessage("Querying record matching indexes...");
      try {
        // STEP 1: Fetch Store Row Record matching phrase
        const { data: stores, error: storeErr } = await dbClient
          .from("Stores")
          .select("id, name, tracking_url")
          .ilike("name", `%${currentSearchQuery}%`);

        if (storeErr || !stores || stores.length === 0) {
          throw new Error("Store could not be matched");
        }

        const currentStore = stores[0];
        setStoreName(currentStore.name);
        setStoreUrl(currentStore.tracking_url ? currentStore.tracking_url.replace("https://", "").split("/")[0] : "live-store.com");

        // STEP 2: Query related Coupons matching that explicit store index numeric ID
        const { data: couponRecords, error: couponErr } = await dbClient
          .from("Coupons")
          .select("name, offer, coupon_code, tracking_url, store")
          .eq("store", currentStore.id);

        if (couponErr || !couponRecords || couponRecords.length === 0) {
          setCoupons([]);
          setStatusMessage(`Found ${currentStore.name}, but no live vouchers mapped to its record index.`);
          setIsLoading(false);
          return;
        }

        // Format raw database content properties safely into runtime matrix state loop arrays
        const cleanCoupons = couponRecords.map((c: any) => ({
          name: c.name || "OFFER",
          offer: c.offer || "Special Discount Available",
          coupon_code: c.coupon_code || "GET DEAL",
          tracking_url: c.tracking_url || currentStore.tracking_url || "https://google.com"
        }));

        setCoupons(cleanCoupons);
        setStatusMessage(`Live index synced cleanly: Found ${cleanCoupons.length} vouchers.`);
      } catch (err) {
        setCoupons([]);
        setStatusMessage(`Searched for "${currentSearchQuery}" but returned empty or mismatch indexes.`);
      }
      setIsLoading(false);
    }

    queryDatabase();
  }, [dbClient, currentSearchQuery]);

  return (
    <div className="animate-hero-rise [animation-delay:460ms]">
      <ScaledDashboard>
        <div className="h-full overflow-hidden rounded-[28px] border border-white/75 bg-white/95 shadow-[0_38px_100px_rgba(31,50,39,0.24)] ring-1 ring-[#273c2d]/10 backdrop-blur-xl text-left flex flex-col">
          
          {/* Browser Chrome Bar UI Layout */}
          <div className="flex h-[42px] items-center border-b border-[#e9ece7] bg-[#f8faf7] px-4 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff7a6b]" />
              <span className="size-2.5 rounded-full bg-[#f5c95f]" />
              <span className="size-2.5 rounded-full bg-[#7cca75]" />
            </div>
            <div className="mx-auto flex h-6 w-[318px] items-center justify-center gap-1.5 rounded-[7px] border border-[#e4e8e1] bg-white px-3 text-[9px] font-medium text-[#899087] shadow-[0_1px_2px_rgba(27,38,31,0.04)]">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              app.coupenzo.ai/overview
            </div>
            <MoreHorizontal className="size-4 text-[#9aa099]" />
          </div>

          <div className="flex h-[414px] flex-1 min-h-0">
            {/* Sidebar Module Component Element */}
            <aside className="flex w-[22%] shrink-0 flex-col border-r border-[#e7eae5] bg-[#f5f7f3] p-3">
              <div className="flex items-center gap-2 rounded-[12px] border border-[#e2e6df] bg-white px-2.5 py-2 shadow-[0_2px_8px_rgba(29,43,34,0.04)]">
                <div className="grid size-7 place-items-center rounded-[9px] bg-[#17221b] text-white">
                  <Globe2 className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold text-[#1e2b23]">{storeName}</p>
                  <p className="truncate text-[8px] text-[#879087]">{storeUrl}</p>
                </div>
                <ChevronDown className="size-3 text-[#929991]" />
              </div>

              <div className="mt-4 space-y-1">
                <button type="button" className="flex w-full items-center gap-2 rounded-[9px] bg-[#e6eee1] px-2.5 py-2 text-left text-[10px] font-semibold text-[#1f3024]">
                  <BarChart3 className="size-3.5" /> Overview
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2 text-left text-[10px] font-medium text-[#626c63]">
                  <Target className="size-3.5" /> Opportunities
                  <span className="ml-auto rounded-full bg-[#dff0d7] px-1.5 py-0.5 text-[8px] font-semibold text-[#3f7043]">{coupons.length}</span>
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2 text-left text-[10px] font-medium text-[#626c63]">
                  <FileText className="size-3.5" /> Content
                </button>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#9ba199]">Workspace</p>
                  <Plus className="size-3 text-[#929991]" />
                </div>
                <div className="space-y-0.5">
                  {folders.map(({ label, count, icon: Icon, active }) => (
                    <button key={label} type="button" className={`flex w-full items-center gap-2 rounded-[9px] px-2 py-1.5 text-left text-[9px] ${active ? "font-semibold text-[#2b3a30]" : "font-medium text-[#707970]"}`}>
                      <Icon className={active ? "size-3 text-[#557b4f]" : "size-3"} />
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      <span className="text-[8px] text-[#a0a69f]">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Workspace Component Main View Area Frame Layout */}
            <main className="min-w-0 flex-1 overflow-hidden bg-[#fbfcfa] flex flex-col">
              <div className="flex h-[50px] items-center border-b border-[#e9ece7] px-4 shrink-0">
                <div>
                  <p className="text-[12px] font-semibold tracking-[-0.02em] text-[#1c2820]">Live Visibility Console</p>
                  <p className="text-[8px] text-[#8a9189]">Relational Database Synchronizer Active</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button type="button" className="grid size-7 place-items-center rounded-[9px] border border-[#e3e7e1] bg-white text-[#727a72]"><Search className="size-3.5" /></button>
                  <button type="button" className="relative grid size-7 place-items-center rounded-[9px] border border-[#e3e7e1] bg-white text-[#727a72]"><Bell className="size-3.5" /></button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-3 min-h-0 overflow-y-auto">
                <div className="flex items-end justify-between shrink-0">
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.035em] text-[#18231c]">Database Operations</h2>
                    <p className="text-[9px] text-zinc-500">{statusMessage}</p>
                  </div>
                  <span className="rounded-full border border-[#d7e5d1] bg-[#edf6e9] px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-[#4b7849]">Supabase live</span>
                </div>

                {/* Performance Core Metric Panels Cards Frame Layout */}
                <section className="grid grid-cols-3 gap-2.5 shrink-0">
                  <MetricCard label="Active Sync Matches" value={coupons.length > 0 ? "100%" : "0%"} change="Live" icon={TrendingUp} highlighted />
                  <MetricCard label="Vouchers Mapped" value={String(coupons.length)} change="Clean" icon={Check} />
                  <MetricCard label="Relational Status" value={isLoading ? "LOAD" : "READY"} change="Active" icon={Target} />
                </section>

                {/* Relational Table Inbox Results Queue Rendering Engine Layer */}
                <section className="border border-[#e4e8e2] bg-white rounded-xl flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="grid grid-cols-[1.5fr_2fr_1.5fr] bg-[#fafbf9] border-b border-[#eef0ed] px-3 py-2 text-[7px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
                    <span>COUPON TITLE</span>
                    <span>OFFER VALUE DESCRIPTION</span>
                    <span className="text-right">VOUCHER CODE</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
                    {coupons.length > 0 ? (
                      coupons.map((row, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            navigator.clipboard.writeText(row.coupon_code);
                            alert(`Code: ${row.coupon_code} copied! Opening target link...`);
                            window.open(row.tracking_url, "_blank");
                          }}
                          className="grid grid-cols-[1.5fr_2fr_1.5fr] items-center px-3 py-2.5 text-[9px] transition-colors hover:bg-zinc-50/80 cursor-pointer"
                        >
                          <span className="font-bold text-emerald-600 tracking-wide truncate pr-2">{row.name}</span>
                          <span className="font-medium text-zinc-700 truncate pr-2">{row.offer}</span>
                          <div className="text-right">
                            <span className="inline-block bg-zinc-100 px-2 py-1 rounded border border-dashed border-zinc-300 font-mono font-bold text-zinc-800 text-[8px]">
                              {row.coupon_code}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center p-8 text-center text-[10px] text-zinc-400 font-light italic">
                        {isLoading ? "Fetching data from tables..." : "No active database coupon items rendered yet."}
                      </div>
                    )}
                  </div>
                </section>
              </div>

            </main>
          </div>
        </div>
      </ScaledDashboard>
    </div>
  );
}

// Internal supporting layout card framework
function MetricCard({ label, value, change, icon: Icon, highlighted = false }: any) {
  return (
    <article className={`relative overflow-hidden rounded-[14px] border p-3 ${highlighted ? "border-[#b8d7a9] bg-[#eaf5e4]" : "border-[#e6e9e3] bg-white"}`}>
      <div className="flex items-start justify-between">
        <div className="grid size-6 place-items-center rounded-[7px] bg-[#17221b] text-white">
          <Icon className="size-3" />
        </div>
        <span className="inline-flex items-center rounded-full bg-white/75 px-1.5 py-0.5 text-[8px] font-bold text-[#397241]">
          {change}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-[9px] font-medium text-[#788077]">{label}</p>
        <p className="text-[18px] font-bold tracking-tight text-[#1b251f] mt-0.5">{value}</p>
      </div>
    </article>
  );
}
