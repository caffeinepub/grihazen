import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageCircle,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BudgetTag, ConversionStatus, UrgencyTag } from "../backend";
import { useSubmitLead } from "../hooks/useQueries";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "HOME", href: "#" },
  { label: "SERVICES", href: "#services" },
  { label: "PORTFOLIO", href: "#portfolio" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#lead-funnel" },
];

const SERVICES = [
  {
    id: "kitchen",
    icon: "🍳",
    title: "Modular Kitchen Design",
    description:
      "Smart storage, premium finishes, and ergonomic layouts crafted for modern living.",
    process: [
      "Initial consultation & site measurement",
      "3D design visualization & material selection",
      "Factory-built modular units for precision fit",
      "Professional installation & quality check",
      "Post-installation support & warranty",
    ],
  },
  {
    id: "fullhome",
    icon: "🏠",
    title: "Full Home Interior",
    description:
      "Comprehensive turnkey solutions transforming every room into a cohesive masterpiece.",
    process: [
      "Detailed space planning and concept development",
      "Material, furniture & décor curation",
      "Coordinated execution across all rooms",
      "Electrical, civil & carpentry integration",
      "Final styling and handover walkthrough",
    ],
  },
  {
    id: "bedroom",
    icon: "🛏️",
    title: "Bedroom & Living Room",
    description:
      "Tranquil bedrooms and inviting living spaces designed for comfort and elegance.",
    process: [
      "Mood board and theme alignment session",
      "Custom furniture design and sourcing",
      "Lighting design for ambience",
      "Soft furnishings and accessory curation",
      "Styling and final reveal",
    ],
  },
  {
    id: "office",
    icon: "💼",
    title: "Office Interiors",
    description:
      "Productive, inspiring workspaces that reflect your brand identity and company culture.",
    process: [
      "Workspace analysis and ergonomic planning",
      "Brand-aligned design concept",
      "Modular furniture and partition solutions",
      "AV, lighting and cable management",
      "Phased delivery to minimize disruption",
    ],
  },
];

const PORTFOLIO_ITEMS = [
  {
    id: 1,
    category: "living",
    title: "Modern Minimalist Living",
    budget: "Premium",
    gradient: "from-slate-700 via-slate-600 to-stone-500",
    beforeGradient: "from-gray-400 to-gray-500",
  },
  {
    id: 2,
    category: "bedroom",
    title: "Moon-Inspired Master Suite",
    budget: "Luxury",
    gradient: "from-indigo-900 via-purple-800 to-slate-700",
    beforeGradient: "from-gray-300 to-stone-400",
  },
  {
    id: 3,
    category: "kitchen",
    title: "Handleless Island Kitchen",
    budget: "Premium",
    gradient: "from-stone-600 via-amber-700 to-stone-500",
    beforeGradient: "from-gray-400 to-slate-400",
  },
  {
    id: 4,
    category: "living",
    title: "Warm Industrial Lounge",
    budget: "Essential",
    gradient: "from-amber-800 via-stone-700 to-amber-900",
    beforeGradient: "from-gray-300 to-gray-400",
  },
  {
    id: 5,
    category: "bedroom",
    title: "Zen Japandi Bedroom",
    budget: "Luxury",
    gradient: "from-stone-400 via-stone-500 to-slate-600",
    beforeGradient: "from-gray-300 to-stone-300",
  },
  {
    id: 6,
    category: "office",
    title: "Executive Studio Office",
    budget: "Premium",
    gradient: "from-slate-800 via-slate-700 to-zinc-600",
    beforeGradient: "from-gray-400 to-gray-500",
  },
];

const PRICING_TIERS = [
  {
    name: "Essential",
    price: "₹1,500",
    unit: "/sq.ft",
    description: "Quality design for growing families",
    features: [
      "Space planning & layout",
      "Standard material selection",
      "Modular furniture",
      "Basic lighting design",
      "1 revision round",
      "6-month warranty",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Premium",
    price: "₹2,500",
    unit: "/sq.ft",
    description: "Elevated interiors for discerning homeowners",
    features: [
      "Custom furniture design",
      "Premium material & finish selection",
      "3D visualization",
      "Dedicated design consultant",
      "3 revision rounds",
      "1-year warranty",
      "Post-handover support",
    ],
    cta: "Most Popular",
    featured: true,
  },
  {
    name: "Luxury",
    price: "₹4,000",
    unit: "/sq.ft",
    description: "Bespoke excellence with no compromise",
    features: [
      "Fully bespoke design",
      "Imported materials & custom joinery",
      "VR walkthrough",
      "Senior lead designer",
      "Unlimited revisions",
      "2-year warranty",
      "White-glove delivery",
      "Smart home integration",
    ],
    cta: "Go Luxury",
    featured: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    initials: "PS",
    color: "bg-rose-400",
    rating: 5,
    text: "GRIHAZEN transformed our 3BHK into a dream home. The team understood exactly what we wanted and delivered beyond expectations. Every detail was perfect.",
  },
  {
    name: "Rahul Mehta",
    city: "Bangalore",
    initials: "RM",
    color: "bg-blue-400",
    rating: 5,
    text: "Professional, timely, and creative. Our modular kitchen is the highlight of every dinner party. I highly recommend GRIHAZEN to anyone looking for quality interiors.",
  },
  {
    name: "Ananya Iyer",
    city: "Chennai",
    initials: "AI",
    color: "bg-emerald-400",
    rating: 5,
    text: "The bedroom design was inspired — calm, luxurious and exactly our style. The process was seamless from concept to delivery. Truly a world-class experience.",
  },
  {
    name: "Vikram Nair",
    city: "Delhi",
    initials: "VN",
    color: "bg-purple-400",
    rating: 5,
    text: "Our villa interior took 8 weeks — delivered on time, on budget, and absolutely stunning. GRIHAZEN's project management is impeccable. Will work with them again.",
  },
  {
    name: "Kavita Reddy",
    city: "Hyderabad",
    initials: "KR",
    color: "bg-amber-400",
    rating: 5,
    text: "From the first consultation to the final reveal, GRIHAZEN made us feel valued. The living room is now the cosiest place I've ever been in.",
  },
  {
    name: "Siddharth Bose",
    city: "Pune",
    initials: "SB",
    color: "bg-teal-400",
    rating: 5,
    text: "Office interiors done with flair and functionality. Our team loves the workspace. Productivity has noticeably improved. Couldn't ask for more!",
  },
];

const PROPERTY_TYPES = ["2BHK", "3BHK", "4BHK", "Villa", "Office"];
const BUDGET_RANGES = ["Under ₹5L", "₹5–10L", "₹10–20L", "₹20–50L", "₹50L+"];
const TIMELINES = ["Immediately", "1–3 months", "3–6 months", "6+ months"];

function getBudgetTag(budgetRange: string): BudgetTag {
  if (budgetRange === "Under ₹5L" || budgetRange === "₹5–10L")
    return BudgetTag.standard;
  if (budgetRange === "₹10–20L") return BudgetTag.mid;
  return BudgetTag.premium;
}

function getUrgencyTag(timeline: string): UrgencyTag {
  if (timeline === "Immediately") return UrgencyTag.hot;
  if (timeline === "6+ months") return UrgencyTag.cold;
  return UrgencyTag.warm;
}

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    const items = el.querySelectorAll(".scroll-reveal");
    for (const item of Array.from(items)) {
      observer.observe(item);
    }
    if (el.classList.contains("scroll-reveal")) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white"
      } border-b border-border`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-xl font-bold tracking-wide">
          <span className="text-gold">G</span>RIHAZEN
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              data-ocid={`nav.${link.label.toLowerCase()}.link`}
              className="text-xs font-medium tracking-widest text-foreground/70 hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex">
          <a href="#lead-funnel">
            <Button
              data-ocid="header.consultation.button"
              className="rounded-full px-6 bg-gold text-foreground hover:brightness-95 shadow-gold font-medium text-sm"
            >
              Get a Consultation
            </Button>
          </a>
        </div>

        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          data-ocid="nav.hamburger.toggle"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 pb-4 pt-2 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium tracking-widest text-foreground/70 hover:text-gold py-1"
            >
              {link.label}
            </a>
          ))}
          <Button
            className="w-full rounded-full bg-gold text-foreground font-medium text-sm"
            onClick={() => {
              setMenuOpen(false);
              document
                .getElementById("lead-funnel")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Get a Consultation
          </Button>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark">
      {/* Animated geometric background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gold geometric lines */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C6A869" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#C6A869" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="200"
            x2="1200"
            y2="400"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />
          <line
            x1="0"
            y1="600"
            x2="1200"
            y2="200"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
          <line
            x1="200"
            y1="0"
            x2="400"
            y2="800"
            stroke="#C6A869"
            strokeWidth="0.3"
            strokeOpacity="0.1"
          />
          <line
            x1="800"
            y1="0"
            x2="600"
            y2="800"
            stroke="#C6A869"
            strokeWidth="0.3"
            strokeOpacity="0.1"
          />
          <rect
            x="150"
            y="150"
            width="120"
            height="120"
            fill="none"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.12"
            className="animate-float"
            style={{ transformOrigin: "210px 210px" }}
          />
          <rect
            x="900"
            y="400"
            width="80"
            height="80"
            fill="none"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.15"
            className="animate-float-slow"
            style={{ transformOrigin: "940px 440px" }}
          />
          <circle
            cx="1050"
            cy="150"
            r="60"
            fill="none"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.1"
            className="animate-float"
          />
          <circle
            cx="100"
            cy="650"
            r="40"
            fill="none"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.1"
            className="animate-float-slow"
          />
          <polygon
            points="600,50 650,130 550,130"
            fill="none"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.12"
            className="animate-float"
            style={{ transformOrigin: "600px 90px" }}
          />
          <polygon
            points="300,600 360,700 240,700"
            fill="none"
            stroke="#C6A869"
            strokeWidth="0.5"
            strokeOpacity="0.1"
            className="animate-float-slow"
            style={{ transformOrigin: "300px 650px" }}
          />
        </svg>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1F1F1F 0%, #2C2518 50%, #1A1A14 100%)",
          }}
        />
        {/* Subtle gold vignette bottom */}
        <div
          className="absolute bottom-0 inset-x-0 h-32"
          style={{
            background:
              "linear-gradient(to top, oklch(0.73 0.1 75.5 / 0.05), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <p
          className="text-gold text-xs tracking-[0.35em] uppercase mb-6 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          Premium Interior Design
        </p>
        <h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          YOUR SPACE
          <br />
          <span className="text-gold">MATTERS,</span>
          <br />
          LET'S CREATE
          <br />
          TOGETHER
        </h1>
        <p
          className="text-white/60 text-base sm:text-lg font-light max-w-xl mx-auto mb-10 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          End-to-end interior solutions tailored to your style and budget
        </p>
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <a href="#lead-funnel">
            <Button
              data-ocid="hero.consultation.primary_button"
              size="lg"
              className="rounded-full px-10 py-6 text-base bg-gold text-foreground hover:brightness-95 shadow-gold font-semibold"
            >
              Get Free Design Consultation
            </Button>
          </a>
          <a href="#portfolio">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-10 py-6 text-base border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            >
              View Portfolio
            </Button>
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-6 h-6 text-gold/60" />
      </div>
    </section>
  );
}

// ─── Trust Strip ──────────────────────────────────────────────────────────────

function TrustStrip() {
  const ref = useScrollReveal();
  const stats = [
    { value: "500+", label: "Homes Designed" },
    { value: "4.8★", label: "Customer Rating" },
    { value: "100%", label: "Satisfaction Guarantee" },
    { value: "10+", label: "Years Experience" },
  ];
  return (
    <section ref={ref} className="bg-beige border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 lg:grid-cols-4 gap-0">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`scroll-reveal flex flex-col items-center text-center py-4 px-6 ${
              i < 3 ? "lg:border-r border-border" : ""
            }`}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <span className="font-display text-3xl font-bold text-gold">
              {s.value}
            </span>
            <span className="text-xs text-muted-foreground tracking-wide mt-1">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

function Services() {
  const ref = useScrollReveal();
  const [activeService, setActiveService] = useState<
    (typeof SERVICES)[0] | null
  >(null);

  return (
    <section id="services" ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="scroll-reveal text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            What We Offer
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold">
            OUR BESPOKE SERVICES
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => (
            <div
              key={service.id}
              className="scroll-reveal group p-8 rounded-xl border border-border bg-white hover:shadow-card hover:border-primary/30 transition-all duration-300"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-5">{service.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {service.description}
              </p>
              <Button
                variant="outline"
                size="sm"
                data-ocid={`services.${service.id}.button`}
                className="rounded-full border-gold text-gold hover:bg-gold hover:text-foreground transition-colors text-xs tracking-wide"
                onClick={() => setActiveService(service)}
              >
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={!!activeService}
        onOpenChange={(o) => !o && setActiveService(null)}
      >
        <DialogContent className="max-w-lg" data-ocid="services.detail.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-3">
              <span>{activeService?.icon}</span>
              {activeService?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 my-2">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
              Our Process
            </p>
            {activeService?.process.map((step, i) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground/80">{step}</p>
              </div>
            ))}
          </div>
          <Button
            data-ocid="services.detail.submit_button"
            className="w-full rounded-full bg-gold text-foreground hover:brightness-95 font-semibold mt-2"
            onClick={() => {
              setActiveService(null);
              document
                .getElementById("lead-funnel")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Get a Quote
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

function Portfolio() {
  const ref = useScrollReveal();
  const [beforeAfter, setBeforeAfter] = useState<Record<number, boolean>>({});

  const toggle = (id: number) =>
    setBeforeAfter((prev) => ({ ...prev, [id]: !prev[id] }));

  const badgeColor = (b: string) => {
    if (b === "Luxury") return "bg-amber-100 text-amber-800";
    if (b === "Premium") return "bg-slate-100 text-slate-700";
    return "bg-stone-100 text-stone-600";
  };

  return (
    <section id="portfolio" ref={ref} className="py-24 bg-beige">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="scroll-reveal text-center mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Our Work
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold">
            CURATED PORTFOLIO
          </h2>
        </div>

        <Tabs defaultValue="all" className="scroll-reveal">
          <TabsList
            className="mx-auto flex justify-center mb-10 bg-white border border-border rounded-full p-1 w-fit"
            data-ocid="portfolio.filter.tab"
          >
            {["all", "living", "bedroom", "kitchen", "office"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-full px-5 py-2 text-xs tracking-wide capitalize data-[state=active]:bg-gold data-[state=active]:text-foreground"
              >
                {tab === "all"
                  ? "All"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", "living", "bedroom", "kitchen", "office"].map((tabVal) => (
            <TabsContent key={tabVal} value={tabVal}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PORTFOLIO_ITEMS.filter(
                  (p) => tabVal === "all" || p.category === tabVal,
                ).map((item, idx) => (
                  <div
                    key={item.id}
                    className="scroll-reveal group rounded-xl overflow-hidden bg-white shadow-card border border-border"
                    style={{ transitionDelay: `${idx * 0.08}s` }}
                    data-ocid={`portfolio.item.${idx + 1}`}
                  >
                    <div
                      className={`h-52 bg-gradient-to-br ${
                        beforeAfter[item.id]
                          ? item.beforeGradient
                          : item.gradient
                      } relative transition-all duration-700`}
                    >
                      <div className="absolute inset-0 flex items-end justify-between p-4">
                        <span className="text-white/80 text-xs font-medium bg-black/30 rounded px-2 py-1">
                          {beforeAfter[item.id] ? "BEFORE" : "AFTER"}
                        </span>
                        <span
                          className={`text-xs font-semibold rounded-full px-3 py-1 ${badgeColor(item.budget)}`}
                        >
                          {item.budget}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <h3 className="font-display text-sm font-semibold">
                        {item.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        className="text-xs text-gold border border-gold rounded-full px-3 py-1 hover:bg-gold hover:text-foreground transition-colors whitespace-nowrap"
                        data-ocid={`portfolio.toggle.${idx + 1}`}
                      >
                        {beforeAfter[item.id] ? "See After" : "See Before"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const ref = useScrollReveal();
  return (
    <section id="pricing" ref={ref} className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="scroll-reveal text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Investment
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold">
            TRANSPARENT PRICING
          </h2>
          <p className="text-muted-foreground mt-4 text-sm">
            Every project is unique. These are starting rates — your final quote
            is tailored to your space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className={`scroll-reveal rounded-2xl p-8 border flex flex-col ${
                tier.featured
                  ? "border-primary bg-dark text-white relative"
                  : "border-border bg-white"
              }`}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gold text-foreground text-xs rounded-full px-4">
                    Most Popular
                  </Badge>
                </div>
              )}
              <div className="mb-6">
                <h3
                  className={`font-display text-xl font-bold mb-1 ${tier.featured ? "text-gold" : ""}`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`text-xs mb-4 ${tier.featured ? "text-white/60" : "text-muted-foreground"}`}
                >
                  {tier.description}
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className={`font-display text-4xl font-bold ${tier.featured ? "text-white" : ""}`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${tier.featured ? "text-white/60" : "text-muted-foreground"}`}
                  >
                    {tier.unit}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${tier.featured ? "text-gold" : "text-gold"}`}
                    />
                    <span
                      className={
                        tier.featured ? "text-white/80" : "text-foreground/80"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="#lead-funnel">
                <Button
                  data-ocid={`pricing.${tier.name.toLowerCase()}.primary_button`}
                  className={`w-full rounded-full font-semibold ${
                    tier.featured
                      ? "bg-gold text-foreground hover:brightness-95"
                      : "border border-gold text-gold bg-transparent hover:bg-gold hover:text-foreground"
                  }`}
                  variant={tier.featured ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const ref = useScrollReveal();
  const [current, setCurrent] = useState(0);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const t = TESTIMONIALS[current];

  return (
    <section id="testimonials" ref={ref} className="py-24 bg-beige">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="scroll-reveal text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Client Stories
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold">
            WHAT OUR CLIENTS SAY
          </h2>
        </div>

        <div className="scroll-reveal">
          <div className="bg-white rounded-2xl p-10 shadow-card border border-border text-center relative min-h-[280px] flex flex-col items-center justify-center">
            <div
              className={`w-14 h-14 rounded-full ${t.color} flex items-center justify-center text-white font-bold font-display text-lg mb-4`}
            >
              {t.initials}
            </div>
            <div className="flex gap-1 mb-4">
              {t.rating >= 1 && (
                <Star className="w-4 h-4 fill-gold text-gold" />
              )}
              {t.rating >= 2 && (
                <Star className="w-4 h-4 fill-gold text-gold" />
              )}
              {t.rating >= 3 && (
                <Star className="w-4 h-4 fill-gold text-gold" />
              )}
              {t.rating >= 4 && (
                <Star className="w-4 h-4 fill-gold text-gold" />
              )}
              {t.rating >= 5 && (
                <Star className="w-4 h-4 fill-gold text-gold" />
              )}
            </div>
            <blockquote className="font-display text-lg italic text-foreground/80 leading-relaxed max-w-2xl mb-6">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.city}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={prev}
              data-ocid="testimonials.pagination_prev"
              className="w-10 h-10 rounded-full border border-border bg-white hover:border-gold hover:text-gold flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((t2, i) => (
                <button
                  type="button"
                  key={t2.name}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-gold w-6" : "bg-border"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              data-ocid="testimonials.pagination_next"
              className="w-10 h-10 rounded-full border border-border bg-white hover:border-gold hover:text-gold flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function About() {
  const ref = useScrollReveal();
  const values = [
    {
      icon: "✦",
      title: "Expert Design",
      desc: "Our curated network of experienced designers brings deep expertise across residential and commercial projects.",
    },
    {
      icon: "◈",
      title: "Transparent Process",
      desc: "No hidden costs, no surprises. You're informed and in control at every stage of your interior journey.",
    },
    {
      icon: "◉",
      title: "On-Time Delivery",
      desc: "We respect your time. Our streamlined project management ensures delivery on the date we promise.",
    },
  ];
  return (
    <section id="about" ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
              Our Story
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">
              ABOUT GRIHAZEN
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              GRIHAZEN is a complete interior solution provider — a trusted name
              that homeowners across India rely on to transform their spaces
              into places they love.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-5">
              We have built a seamless, end-to-end design experience that takes
              you from concept to completion with zero stress. With a carefully
              assembled network of experienced interior designers, craftsmen,
              and project managers, we deliver exceptional results every time.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our approach is simple: listen deeply, design boldly, deliver
              reliably. Because your home deserves nothing less than perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="scroll-reveal flex gap-5 p-6 rounded-xl border border-border hover:border-primary/40 hover:shadow-card transition-all"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className="text-gold text-2xl flex-shrink-0 font-display">
                  {v.icon}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-base mb-1">
                    {v.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Lead Funnel ──────────────────────────────────────────────────────────────

interface FunnelData {
  propertyType: string;
  budgetRange: string;
  location: string;
  timeline: string;
  name: string;
  phone: string;
  email: string;
}

const STEP_LABELS = ["Property", "Budget", "Location", "Timeline", "Contact"];

function LeadFunnel() {
  const ref = useScrollReveal();
  const submitMutation = useSubmitLead();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<FunnelData>({
    propertyType: "",
    budgetRange: "",
    location: "",
    timeline: "",
    name: "",
    phone: "",
    email: "",
  });

  const canNext = useCallback(() => {
    if (step === 1) return !!data.propertyType;
    if (step === 2) return !!data.budgetRange;
    if (step === 3) return !!data.location.trim();
    if (step === 4) return !!data.timeline;
    if (step === 5) {
      const fullPhone = data.phone.startsWith("+91")
        ? data.phone
        : `+91${data.phone.replace(/\D/g, "")}`;
      return !!(
        data.name.trim() &&
        fullPhone.length === 13 &&
        data.email.trim()
      );
    }
    return false;
  }, [step, data]);

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync({
        id: 0n,
        createdAt: 0n,
        propertyType: data.propertyType,
        budgetRange: data.budgetRange,
        location: data.location,
        timeline: data.timeline,
        name: data.name,
        phone: data.phone.startsWith("+91")
          ? data.phone
          : `+91${data.phone.replace(/\D/g, "")}`,
        email: data.email,
        notes: "",
        budgetTag: getBudgetTag(data.budgetRange),
        urgencyTag: getUrgencyTag(data.timeline),
        conversionStatus: ConversionStatus.new_,
      });
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const OptionCard = ({
    label,
    selected,
    onSelect,
  }: { label: string; selected: boolean; onSelect: () => void }) => (
    <button
      type="button"
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${
        selected
          ? "border-gold bg-gold/10 text-foreground"
          : "border-border bg-white hover:border-primary/50"
      }`}
    >
      {selected && <Check className="w-4 h-4 text-gold inline mr-2" />}
      {label}
    </button>
  );

  return (
    <section id="lead-funnel" ref={ref} className="py-24 bg-dark">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="scroll-reveal text-center mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Begin Your Journey
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white">
            START YOUR INTERIOR JOURNEY
          </h2>
          <p className="text-white/50 mt-4 text-sm">
            Answer 5 quick questions and our expert will reach out within 30
            minutes.
          </p>
        </div>

        <div className="scroll-reveal bg-white rounded-2xl p-8 shadow-xl">
          {!submitted ? (
            <>
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {STEP_LABELS.map((label, i) => (
                    <span
                      key={label}
                      className={`text-xs font-medium ${
                        i + 1 <= step ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <Progress
                  value={(step / 5) * 100}
                  className="h-1.5 bg-border"
                  data-ocid="funnel.progress.loading_state"
                />
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  Step {step} of 5
                </p>
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <h3 className="font-display text-xl font-semibold mb-6">
                    What type of property are you designing?
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((pt) => (
                      <OptionCard
                        key={pt}
                        label={pt}
                        selected={data.propertyType === pt}
                        onSelect={() =>
                          setData((d) => ({ ...d, propertyType: pt }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <h3 className="font-display text-xl font-semibold mb-6">
                    What is your budget range?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {BUDGET_RANGES.map((br) => (
                      <OptionCard
                        key={br}
                        label={br}
                        selected={data.budgetRange === br}
                        onSelect={() =>
                          setData((d) => ({ ...d, budgetRange: br }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <h3 className="font-display text-xl font-semibold mb-6">
                    Where is your property located?
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="location"
                        className="text-sm text-muted-foreground mb-1 block"
                      >
                        City / Area
                      </Label>
                      <Input
                        id="location"
                        data-ocid="funnel.location.input"
                        placeholder="e.g. Mumbai, Bangalore, Delhi..."
                        value={data.location}
                        onChange={(e) =>
                          setData((d) => ({ ...d, location: e.target.value }))
                        }
                        className="rounded-xl border-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div>
                  <h3 className="font-display text-xl font-semibold mb-6">
                    When do you plan to start?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {TIMELINES.map((tl) => (
                      <OptionCard
                        key={tl}
                        label={tl}
                        selected={data.timeline === tl}
                        onSelect={() =>
                          setData((d) => ({ ...d, timeline: tl }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {step === 5 && (
                <div>
                  <h3 className="font-display text-xl font-semibold mb-6">
                    How can we reach you?
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm text-muted-foreground mb-1 block"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        data-ocid="funnel.name.input"
                        placeholder="Your name"
                        value={data.name}
                        onChange={(e) =>
                          setData((d) => ({ ...d, name: e.target.value }))
                        }
                        className="rounded-xl border-border"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm text-muted-foreground mb-1 block"
                      >
                        Phone Number
                      </Label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm font-medium text-foreground select-none z-10">
                          +91
                        </span>
                        <Input
                          id="phone"
                          data-ocid="funnel.phone.input"
                          placeholder="XXXXX XXXXX"
                          type="tel"
                          maxLength={10}
                          value={
                            data.phone.startsWith("+91")
                              ? data.phone.slice(3)
                              : data.phone
                          }
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setData((d) => ({ ...d, phone: digits }));
                          }}
                          className="rounded-xl border-border pl-12"
                        />
                      </div>
                      {data.phone.length > 0 &&
                        data.phone.replace(/\D/g, "").length !== 10 && (
                          <p className="text-xs text-destructive mt-1">
                            Please enter a valid 10-digit mobile number
                          </p>
                        )}
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm text-muted-foreground mb-1 block"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        data-ocid="funnel.email.input"
                        placeholder="you@example.com"
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                          setData((d) => ({ ...d, email: e.target.value }))
                        }
                        className="rounded-xl border-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 gap-4">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    data-ocid="funnel.back.button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-full px-8 border-border"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                {step < 5 ? (
                  <Button
                    data-ocid="funnel.next.primary_button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canNext()}
                    className="rounded-full px-8 bg-gold text-foreground hover:brightness-95 disabled:opacity-50 font-semibold"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    data-ocid="funnel.submit.submit_button"
                    onClick={handleSubmit}
                    disabled={!canNext() || submitMutation.isPending}
                    className="rounded-full px-8 bg-gold text-foreground hover:brightness-95 disabled:opacity-50 font-semibold"
                  >
                    {submitMutation.isPending
                      ? "Sending..."
                      : "Get My Free Consultation"}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8" data-ocid="funnel.success_state">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">
                You're All Set!
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mb-2">
                Our design expert will call you within{" "}
                <strong>30 minutes</strong>.
              </p>
              <p className="text-muted-foreground text-sm">
                You'll receive a confirmation on your phone and email shortly.
              </p>
              <div className="mt-8 p-4 bg-beige rounded-xl text-sm text-muted-foreground">
                ✨ While you wait, explore our portfolio for inspiration.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-dark text-white/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <p className="font-display text-2xl font-bold text-white mb-3">
              <span className="text-gold">G</span>RIHAZEN
            </p>
            <p className="text-sm leading-relaxed text-white/50">
              Complete interior solutions tailored to your style and budget.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white text-sm tracking-wide mb-4">
              Services
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "Modular Kitchen",
                "Full Home Interior",
                "Bedroom Design",
                "Office Interiors",
              ].map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="hover:text-gold transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white text-sm tracking-wide mb-4">
              Company
            </p>
            <ul className="space-y-2 text-sm">
              {["About Us", "Portfolio", "Pricing", "Testimonials"].map((s) => (
                <li key={s}>
                  <a
                    href={`#${s.toLowerCase().replace(" ", "-")}`}
                    className="hover:text-gold transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white text-sm tracking-wide mb-4">
              Contact
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="tel:+919999999999"
                  className="hover:text-gold transition-colors"
                >
                  +91 99999 99999
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@grihazen.com"
                  className="hover:text-gold transition-colors"
                >
                  hello@grihazen.com
                </a>
              </li>
              <li className="text-white/40">Mon–Sat, 9am–7pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© {year} GRIHAZEN. All rights reserved.</p>
          <p>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/60 hover:text-gold transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating Elements ────────────────────────────────────────────────────────

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919999999999"
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="whatsapp.open_modal_button"
      className="fixed bottom-24 md:bottom-8 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform whatsapp-pulse"
      style={{ backgroundColor: "#25D366" }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
    </a>
  );
}

function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-border p-3">
      <a href="#lead-funnel">
        <Button
          data-ocid="mobile.consultation.primary_button"
          className="w-full rounded-full bg-gold text-foreground font-semibold shadow-gold"
        >
          Book Free Consultation
        </Button>
      </a>
    </div>
  );
}

function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const submitMutation = useSubmitLead();

  useEffect(() => {
    const shown = sessionStorage.getItem("exit_popup_shown");
    if (shown) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("exit_popup_shown", "1");
      }, 30000);
      return () => clearTimeout(timer);
    }
    {
      const handleLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setOpen(true);
          sessionStorage.setItem("exit_popup_shown", "1");
          document.removeEventListener("mouseleave", handleLeave);
        }
      };
      document.addEventListener("mouseleave", handleLeave);
      return () => document.removeEventListener("mouseleave", handleLeave);
    }
  }, []);

  const handleSubmit = async () => {
    const fullPhone = `+91${phone.replace(/\D/g, "")}`;
    if (!name.trim() || fullPhone.length !== 13) return;
    try {
      await submitMutation.mutateAsync({
        id: 0n,
        createdAt: 0n,
        propertyType: "Consultation Request",
        budgetRange: "Not Specified",
        location: "Not Specified",
        timeline: "ASAP",
        name,
        phone: `+91${phone.replace(/\D/g, "")}`,
        email: "",
        notes: "Exit intent popup",
        budgetTag: BudgetTag.standard,
        urgencyTag: UrgencyTag.hot,
        conversionStatus: ConversionStatus.new_,
      });
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" data-ocid="exit_popup.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Wait! Get Your <span className="text-gold">Free Design Plan</span>
          </DialogTitle>
        </DialogHeader>
        {!submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Leave your details and we'll send you a free design plan within 24
              hours.
            </p>
            <div>
              <Label htmlFor="exit-name" className="text-sm mb-1 block">
                Your Name
              </Label>
              <Input
                id="exit-name"
                data-ocid="exit_popup.name.input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="exit-phone" className="text-sm mb-1 block">
                Phone Number
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm font-medium text-foreground select-none z-10">
                  +91
                </span>
                <Input
                  id="exit-phone"
                  data-ocid="exit_popup.phone.input"
                  placeholder="XXXXX XXXXX"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="rounded-xl pl-12"
                />
              </div>
              {phone.length > 0 && phone.replace(/\D/g, "").length !== 10 && (
                <p className="text-xs text-destructive mt-1">
                  Please enter a valid 10-digit mobile number
                </p>
              )}
            </div>
            <Button
              data-ocid="exit_popup.submit_button"
              onClick={handleSubmit}
              disabled={
                !name.trim() ||
                phone.replace(/\D/g, "").length !== 10 ||
                submitMutation.isPending
              }
              className="w-full rounded-full bg-gold text-foreground hover:brightness-95 font-semibold"
            >
              {submitMutation.isPending ? "Sending..." : "Get My Free Plan"}
            </Button>
          </div>
        ) : (
          <div
            className="text-center py-4"
            data-ocid="exit_popup.success_state"
          >
            <Check className="w-10 h-10 text-gold mx-auto mb-3" />
            <p className="font-display text-lg font-semibold">Perfect!</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll send your free design plan within 24 hours.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen font-body">
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <Portfolio />
        <Pricing />
        <Testimonials />
        <About />
        <LeadFunnel />
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
      <ExitIntentPopup />
    </div>
  );
}
