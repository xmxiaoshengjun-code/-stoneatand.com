export function ClientLogos() {
  const markets = [
    'USA',
    'Germany',
    'UK',
    'Italy',
    'Spain',
    'France',
    'Canada',
    'Australia',
    'Netherlands',
    'Poland',
  ];

  return (
    <section className="border-y bg-gray-50 py-12">
      <div className="container-custom">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-gray-500">
          Trusted by tile brands in 80+ countries
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {markets.map((name) => (
            <div
              key={name}
              className="text-base font-medium tracking-tight text-gray-400 transition-colors hover:text-gray-700"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
