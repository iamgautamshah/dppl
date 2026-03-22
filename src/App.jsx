import { useEffect, useState } from 'react';
import {
  NavLink,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';

function setMetaTag(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function Layout({ children, menuItems }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
      <div className="absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200/70 blur-3xl" />
        <div className="absolute top-20 left-20 h-56 w-56 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute bottom-16 right-16 h-64 w-64 rounded-full bg-cyan-200/55 blur-3xl" />
      </div>

      <div className="relative min-h-screen p-3 sm:p-4 md:p-6">
        <nav className="mx-auto mt-2 flex w-full max-w-6xl flex-col items-center gap-4 rounded-[28px] border border-white/60 bg-white/35 px-4 py-4 backdrop-blur-xl shadow-[0_10px_40px_rgba(125,211,252,0.25),inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-6 md:flex-row md:justify-between md:rounded-full">
          <NavLink
            to="/home"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <img
              src="/logo.png"
              alt="DPPL LOGO"
              className="h-10 w-10 rounded-full object-cover shadow-md sm:h-12 sm:w-12"
            />
            <span className="text-lg font-bold uppercase tracking-wide text-black sm:text-xl">
              DPPL
            </span>
          </NavLink>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:justify-end md:gap-8">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative text-sm font-bold uppercase tracking-wide text-black transition-opacity duration-200 hover:opacity-80 sm:text-base md:text-lg ${
                    isActive ? 'opacity-100' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-black transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mx-auto mt-6 max-w-6xl sm:mt-8">{children}</div>
      </div>
    </div>
  );
}

function HomePage({ silverPrices, dateInfo, priceError }) {
  return (
    <section className="w-full rounded-[28px] border border-blue-100/80 bg-white/35 backdrop-blur-xl shadow-[0_20px_80px_rgba(186,230,253,0.55),0_10px_40px_rgba(59,130,246,0.08)] sm:rounded-[32px]">
      <div className="rounded-[28px] bg-gradient-to-b from-sky-50/80 via-blue-50/45 to-cyan-50/30 px-4 py-8 sm:rounded-[32px] sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold uppercase leading-tight text-black sm:text-4xl md:text-6xl">
            WELCOME TO DPPL
          </h1>
          <h2 className="mt-4 text-xl font-bold uppercase text-black/90 sm:text-2xl md:text-3xl">
            THE NO. 1 TRUSTED NAME IN NEPAL
          </h2>
          <p className="mt-4 text-lg font-semibold text-black/80 sm:text-xl md:text-2xl">
            शुद्ध Silver , शुद्ध सेवा
          </p>
          <p className="mt-8 text-sm leading-7 text-black/75 sm:text-base md:text-lg md:leading-8">
            At DPPL, we are committed to delivering trusted quality, genuine
            products, and dependable service you can rely on. We take pride in
            building long-term relationships with our customers through honesty,
            consistency, and excellence.
          </p>

          <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold uppercase text-black sm:text-2xl md:text-3xl">
                TODAY&apos;S SILVER PRICE
              </h3>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/70 bg-white/40 px-4 py-4 shadow-[0_8px_24px_rgba(125,211,252,0.12)] backdrop-blur-xl sm:px-5">
                <p className="text-sm font-bold uppercase text-black/70 md:text-base">
                  {dateInfo.nepali.day || '-'}
                </p>
                <p className="mt-2 text-base font-extrabold uppercase text-black sm:text-lg">
                  {dateInfo.nepali.date || '-'}
                </p>
              </div>

              <div className="rounded-[20px] border border-white/70 bg-white/40 px-4 py-4 shadow-[0_8px_24px_rgba(125,211,252,0.12)] backdrop-blur-xl sm:px-5">
                <p className="text-sm font-bold uppercase text-black/70 md:text-base">
                  {dateInfo.english.day || '-'}
                </p>
                <p className="mt-2 text-base font-bold uppercase text-black sm:text-lg">
                  {dateInfo.english.date || '-'}
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:hidden">
              <div className="rounded-[24px] border border-white/70 bg-white/45 p-4 shadow-[0_12px_40px_rgba(125,211,252,0.18)] backdrop-blur-xl">
                <div className="mb-4 flex justify-center">
                  <span className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-4 py-2 text-sm font-bold uppercase text-black shadow-sm">
                    1 TOLA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-white/70 bg-white/50 p-3 text-center">
                    <p className="text-xs font-bold uppercase text-black/70">
                      SALE
                    </p>
                    <p className="mt-2 text-sm font-bold text-black">
                      NPR {silverPrices.sale.tola1}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-white/70 bg-white/50 p-3 text-center">
                    <p className="text-xs font-bold uppercase text-black/70">
                      PURCHASE
                    </p>
                    <p className="mt-2 text-sm font-bold text-black">
                      NPR {silverPrices.purchase.tola1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/45 p-4 shadow-[0_12px_40px_rgba(125,211,252,0.18)] backdrop-blur-xl">
                <div className="mb-4 flex justify-center">
                  <span className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-4 py-2 text-sm font-bold uppercase text-black shadow-sm">
                    10 GRAM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-white/70 bg-white/50 p-3 text-center">
                    <p className="text-xs font-bold uppercase text-black/70">
                      SALE
                    </p>
                    <p className="mt-2 text-sm font-bold text-black">
                      NPR {silverPrices.sale.gram10}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-white/70 bg-white/50 p-3 text-center">
                    <p className="text-xs font-bold uppercase text-black/70">
                      PURCHASE
                    </p>
                    <p className="mt-2 text-sm font-bold text-black">
                      NPR {silverPrices.purchase.gram10}
                    </p>
                  </div>
                </div>
              </div>

              {priceError && (
                <p className="px-4 py-3 text-center text-sm font-semibold text-red-600">
                  {priceError}
                </p>
              )}
            </div>

            <div className="hidden w-full overflow-x-auto rounded-[24px] border border-white/70 bg-white/45 shadow-[0_12px_40px_rgba(125,211,252,0.18)] backdrop-blur-xl sm:block sm:rounded-[28px]">
              <table className="min-w-[520px] w-full border-collapse text-center sm:min-w-[620px]">
                <thead>
                  <tr>
                    <th className="border border-white/60 bg-sky-100/70 px-2 py-3 text-xs font-bold uppercase text-black sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-sm sm:px-4">
                        UNIT
                      </span>
                    </th>
                    <th className="border border-white/60 bg-sky-100/70 px-2 py-3 text-xs font-bold uppercase text-black sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-sm sm:px-4">
                        SALE
                      </span>
                    </th>
                    <th className="border border-white/60 bg-sky-100/70 px-2 py-3 text-xs font-bold uppercase text-black sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-sm sm:px-4">
                        PURCHASE
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border border-white/60 px-2 py-3 text-xs font-bold uppercase text-black/80 sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-3 py-2 shadow-sm sm:px-4">
                        1 TOLA
                      </span>
                    </td>
                    <td className="border border-white/60 px-2 py-3 text-xs text-black/70 sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex min-w-[110px] justify-center rounded-full border border-sky-100/80 bg-white/60 px-3 py-2 font-bold shadow-sm sm:min-w-[130px] sm:px-4">
                        NPR {silverPrices.sale.tola1}
                      </span>
                    </td>
                    <td className="border border-white/60 px-2 py-3 text-xs text-black/70 sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex min-w-[110px] justify-center rounded-full border border-sky-100/80 bg-white/60 px-3 py-2 font-bold shadow-sm sm:min-w-[130px] sm:px-4">
                        NPR {silverPrices.purchase.tola1}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-white/60 px-2 py-3 text-xs font-bold uppercase text-black/80 sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-3 py-2 shadow-sm sm:px-4">
                        10 GRAM
                      </span>
                    </td>
                    <td className="border border-white/60 px-2 py-3 text-xs text-black/70 sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex min-w-[110px] justify-center rounded-full border border-sky-100/80 bg-white/60 px-3 py-2 font-bold shadow-sm sm:min-w-[130px] sm:px-4">
                        NPR {silverPrices.sale.gram10}
                      </span>
                    </td>
                    <td className="border border-white/60 px-2 py-3 text-xs text-black/70 sm:px-4 sm:py-4 sm:text-lg">
                      <span className="inline-flex min-w-[110px] justify-center rounded-full border border-sky-100/80 bg-white/60 px-3 py-2 font-bold shadow-sm sm:min-w-[130px] sm:px-4">
                        NPR {silverPrices.purchase.gram10}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {priceError && (
                <p className="px-4 py-3 text-center text-sm font-semibold text-red-600">
                  {priceError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductsPage({ products }) {
  return (
    <section className="w-full rounded-[28px] border border-blue-100/80 bg-white/35 p-4 backdrop-blur-xl shadow-[0_20px_80px_rgba(186,230,253,0.55),0_10px_40px_rgba(59,130,246,0.08)] sm:rounded-[32px] sm:p-6 md:p-8">
      <h2 className="mb-4 text-center text-2xl font-bold uppercase tracking-wide text-black sm:mb-6 sm:text-3xl md:text-4xl">
        PRODUCTS
      </h2>
      <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-7 text-black/75 sm:text-base md:text-lg">
        DPPL supplies silver bars for investment and silver grains for business
        purposes in Nepal with trusted quality and dependable service.
      </p>

      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        {products.map((product) => (
          <div
            key={product.name}
            className="rounded-[24px] border border-white/60 bg-white/45 p-4 shadow-[0_12px_40px_rgba(125,211,252,0.18)] sm:rounded-[28px] sm:p-6"
          >
            <div className="flex min-h-[260px] items-center justify-center rounded-[20px] bg-white/70 p-4 sm:min-h-[340px] sm:rounded-[24px] sm:p-6 md:min-h-[420px]">
              <img
                src={product.image}
                alt={
                  product.name === 'SILVER BAR'
                    ? 'DPPL SILVER BAR PRODUCT IMAGE'
                    : 'DPPL SILVER GRAINS PRODUCT IMAGE'
                }
                className="max-h-[220px] w-auto object-contain sm:max-h-[300px] md:max-h-[380px]"
              />
            </div>

            <h3 className="mt-6 text-center text-xl font-bold uppercase text-black sm:text-2xl">
              {product.name}
            </h3>

            {product.name === 'SILVER BAR' && (
              <p className="mt-3 text-center text-xs font-bold uppercase tracking-wide text-black/75 sm:text-sm md:text-base">
                100 GRAM | 500 GRAM | 1 KG
              </p>
            )}

            <div className="mt-5 flex justify-center">
              <a
                href={`https://wa.me/9779805617932?text=${encodeURIComponent(
                  product.whatsappText
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-sky-100/80 bg-gradient-to-r from-sky-200/90 via-blue-200/85 to-cyan-200/90 px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-[0_10px_30px_rgba(125,211,252,0.35),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_14px_36px_rgba(125,211,252,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-8 sm:text-base"
              >
                BUY
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="w-full rounded-[28px] border border-blue-100/80 bg-white/35 p-4 backdrop-blur-xl shadow-[0_20px_80px_rgba(186,230,253,0.55),0_10px_40px_rgba(59,130,246,0.08)] sm:rounded-[32px] sm:p-6 md:p-10">
      <h2 className="text-center text-2xl font-bold uppercase tracking-wide text-black sm:text-3xl md:text-4xl">
        ABOUT US
      </h2>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 text-center md:text-justify">
        <p className="text-sm leading-7 text-black/80 sm:text-base md:text-lg md:leading-8 md:text-justify">
          Established in 2080 B.S., DPPL began its journey by supplying silver
          granules exclusively for business purposes. Like every growing
          business, we faced ups and downs along the way, but those experiences
          made us stronger and helped us understand the market more deeply.
        </p>

        <p className="text-sm leading-7 text-black/80 sm:text-base md:text-lg md:leading-8 md:text-justify">
          With time and careful market analysis, we recognized a growing need to
          make silver investment more accessible. As a result, in 2082 B.S., we
          started manufacturing silver bars for investment purposes.
        </p>

        <p className="text-sm leading-7 text-black/80 sm:text-base md:text-lg md:leading-8 md:text-justify">
          Today, DPPL is proud to provide silver bars for investors and silver
          granules for business use only. Our journey is built on trust,
          learning, and commitment, and we continue to serve our customers with
          honesty, care, and quality.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        <h3 className="text-center text-xl font-bold text-black sm:text-2xl md:text-3xl">
          OUR JOURNEY
        </h3>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/70 bg-white/55 p-5 text-center shadow-[0_12px_40px_rgba(125,211,252,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
            <div className="mx-auto inline-flex rounded-full border border-blue-100/80 bg-sky-50 px-5 py-2 text-base font-bold text-black shadow-sm sm:text-lg">
              2080 B.S.
            </div>
            <p className="mt-5 text-sm leading-7 text-black/80 sm:text-base">
              DPPL WAS ESTABLISHED. WE STARTED BY SELLING SILVER GRANULES FOR
              BUSINESS PURPOSES ONLY.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/55 p-5 text-center shadow-[0_12px_40px_rgba(125,211,252,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
            <div className="mx-auto inline-flex rounded-full border border-blue-100/80 bg-sky-50 px-5 py-2 text-base font-bold text-black shadow-sm sm:text-lg">
              2082 B.S.
            </div>
            <p className="mt-5 text-sm leading-7 text-black/80 sm:text-base">
              AFTER ANALYZING THE MARKET, WE BEGAN PRODUCING SILVER BARS TO HELP
              PEOPLE INVEST IN SILVER.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/55 p-5 text-center shadow-[0_12px_40px_rgba(125,211,252,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
            <div className="mx-auto inline-flex rounded-full border border-blue-100/80 bg-sky-50 px-5 py-2 text-base font-bold text-black shadow-sm sm:text-lg">
              TODAY
            </div>
            <p className="mt-5 text-sm leading-7 text-black/80 sm:text-base">
              WE OFFER SILVER BARS FOR INVESTMENT AND SILVER GRANULES FOR
              BUSINESS PURPOSES ONLY, WITH TRUST, QUALITY, AND CUSTOMER
              SATISFACTION AT THE HEART OF EVERYTHING WE DO.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="w-full rounded-[28px] border border-blue-100/80 bg-white/35 p-4 text-center backdrop-blur-xl shadow-[0_20px_80px_rgba(186,230,253,0.55),0_10px_40px_rgba(59,130,246,0.08)] sm:rounded-[32px] sm:p-6 md:p-8">
      <h2 className="text-center text-2xl font-bold uppercase tracking-wide text-black sm:text-3xl md:text-4xl">
        CONTACT
      </h2>

      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-[24px] border border-white/70 bg-white/55 p-5 text-center shadow-[0_12px_40px_rgba(125,211,252,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
          <p className="text-base font-bold uppercase tracking-wide text-black sm:text-lg">
            EMAIL
          </p>
          <div className="mt-4">
            <a
              href="mailto:dppl2080@gmail.com"
              className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-4 py-2 text-sm font-bold text-black shadow-sm transition-opacity hover:opacity-70 sm:text-base md:text-lg"
            >
              dppl2080@gmail.com
            </a>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/55 p-5 text-center shadow-[0_12px_40px_rgba(125,211,252,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
          <p className="text-base font-bold uppercase tracking-wide text-black sm:text-lg">
            PHONE NUMBERS
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm sm:text-base md:text-lg">
            <a
              href="tel:+97715915052"
              className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-4 py-2 font-bold text-black shadow-sm transition-opacity hover:opacity-70"
            >
              +97715915052
            </a>
            <a
              href="tel:+9779805617932"
              className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-4 py-2 font-bold text-black shadow-sm transition-opacity hover:opacity-70"
            >
              +9779805617932
            </a>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/55 p-5 text-center shadow-[0_12px_40px_rgba(125,211,252,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
          <p className="text-base font-bold uppercase tracking-wide text-black sm:text-lg">
            WHATSAPP
          </p>
          <div className="mt-4">
            <a
              href="https://wa.me/9779805617932"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-4 py-2 text-sm font-bold text-black shadow-sm transition-opacity hover:opacity-70 sm:text-base md:text-lg"
            >
              +9779805617932
            </a>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/55 p-5 text-center shadow-[0_12px_40px_rgba(125,211,252,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-6">
          <p className="text-base font-bold uppercase tracking-wide text-black sm:text-lg">
            LOCATION
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex rounded-full border border-sky-100/80 bg-white/70 px-4 py-2 text-sm font-bold text-black shadow-sm sm:text-base md:text-lg">
              5TH FLOOR, SASA COMPLEX, NEW ROAD, KATHMANDU
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [silverPrices, setSilverPrices] = useState({
    sale: { gram10: '-', tola1: '-' },
    purchase: { gram10: '-', tola1: '-' },
  });
  const [dateInfo, setDateInfo] = useState({
    english: { day: '', date: '' },
    nepali: { day: '', date: '' },
  });
  const [priceError, setPriceError] = useState('');

  const products = [
    {
      name: 'SILVER BAR',
      image: '/product1.png',
      whatsappText: 'Hello DPPL, I want to buy SILVER BAR.',
    },
    {
      name: 'SILVER GRAINS',
      image: '/product2.png',
      whatsappText: 'Hello DPPL, I want to buy SILVER GRAINS.',
    },
  ];

  const menuItems = [
    { label: 'HOME', to: '/home' },
    { label: 'PRODUCTS', to: '/products' },
    { label: 'ABOUT US', to: '/about-us' },
    { label: 'CONTACT', to: '/contact' },
  ];

  const location = useLocation();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_BASE_URL}/api/silver-prices`);

        if (!response.ok) {
          throw new Error('Failed to fetch silver prices');
        }

        const data = await response.json();

        setSilverPrices({
          sale: {
            gram10: data?.silver?.sale?.gram10 ?? '-',
            tola1: data?.silver?.sale?.tola1 ?? '-',
          },
          purchase: {
            gram10: data?.silver?.purchase?.gram10 ?? '-',
            tola1: data?.silver?.purchase?.tola1 ?? '-',
          },
        });

        setDateInfo({
          english: {
            day: data?.dateInfo?.english?.day ?? '',
            date: data?.dateInfo?.english?.date ?? '',
          },
          nepali: {
            day: data?.dateInfo?.nepali?.day ?? '',
            date: data?.dateInfo?.nepali?.date ?? '',
          },
        });

        setPriceError('');
      } catch (error) {
        setPriceError('Could not load live silver prices.');
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    const routeMeta = {
      '/home': {
        title: 'DPPL - Silver Bar and Silver Grains in Nepal',
        description:
          'DPPL offers trusted silver bars for investment and silver grains for business purposes in Nepal.',
        canonical: 'https://dppl.com/home',
      },
      '/products': {
        title: 'DPPL Products - Silver Bar and Silver Grains',
        description:
          'Explore DPPL products including silver bar options and silver grains with trusted quality in Nepal.',
        canonical: 'https://dppl.com/products',
      },
      '/about-us': {
        title: 'About DPPL - Trusted Silver Business in Nepal',
        description:
          'Learn about DPPL, established in 2080 B.S., and our journey from silver grains to silver bars for investment.',
        canonical: 'https://dppl.com/about-us',
      },
      '/contact': {
        title: 'Contact DPPL - New Road, Kathmandu',
        description:
          'Contact DPPL by email, phone, or WhatsApp. Visit us at 5th Floor, Sasa Complex, New Road, Kathmandu.',
        canonical: 'https://dppl.com/contact',
      },
    };

    const meta = routeMeta[location.pathname] || routeMeta['/home'];

    document.title = meta.title;
    setMetaTag('description', meta.description);
    setCanonical(meta.canonical);
  }, [location.pathname]);

  return (
    <Layout menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <HomePage
              silverPrices={silverPrices}
              dateInfo={dateInfo}
              priceError={priceError}
            />
          }
        />
        <Route path="/products" element={<ProductsPage products={products} />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Layout>
  );
}