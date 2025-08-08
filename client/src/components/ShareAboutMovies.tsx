export default function ShareAboutMovies() {
  return (
    <div className="cred-container cred-section">
      {/* Pick your movie section */}
      <div className="text-center cred-fade-in">
        <h1 className="text-display font-['Poppins'] font-bold text-white mb-4 tracking-tight">
          Pick your <span className="text-premium">movie</span>
        </h1>
        <p className="text-body-lg text-[#B8B8B8] font-['Inter'] max-w-md mx-auto leading-relaxed">
          and add to your watch list
        </p>
      </div>
    </div>
  );
}