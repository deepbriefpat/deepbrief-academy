export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.jpeg" 
        alt="The Deep Brief" 
        className="h-8 w-auto"
      />
    </div>
  );
}
