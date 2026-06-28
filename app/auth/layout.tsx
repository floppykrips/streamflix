export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]"
         style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(229,9,20,0.15) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <span className="text-4xl font-black text-brand tracking-tight">STREAM<span className="text-[rgb(var(--text))]">FLIX</span></span>
        </div>
        {children}
      </div>
    </div>
  )
}
