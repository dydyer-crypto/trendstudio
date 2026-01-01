
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-1 space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">TrendStudio</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            L'intelligence artificielle au service de votre croissance digitale. Créez, analysez et dominez votre marché.
                        </p>
                    </div>

                    {/* Solutions Area */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Solutions</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/seo-analysis" className="hover:text-primary transition-colors">Audit SEO & IA</Link></li>
                            <li><Link to="/site-redesign" className="hover:text-primary transition-colors">Refonte Stratégique</Link></li>
                            <li><Link to="/generator-aio" className="hover:text-primary transition-colors">Rédaction AIO</Link></li>
                            <li><Link to="/calendar" className="hover:text-primary transition-colors">Planning Social</Link></li>
                        </ul>
                    </div>

                    {/* Partner Section - Djaboo */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-amber-600">Partenaire CRM</h4>
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-3">
                            <p className="text-xs text-muted-foreground">
                                Profitez de la puissance de <strong>Djaboo CRM</strong> nativement intégré à TrendStudio.
                            </p>
                            <a
                                href="https://auth.djaboo.app/register?aff=Ca4mJWLQeatr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                            >
                                S'inscrire sur Djaboo <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>

                    {/* Support & Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Aide</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/tutorials" className="hover:text-primary transition-colors">Tutoriels</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary transition-colors">Tarifs</Link></li>
                            <li><Link to="/settings/api" className="hover:text-primary transition-colors">Intégrations API</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
                        <span>Fait avec</span>
                        <Heart size={10} className="text-red-500 fill-red-500" />
                        <span>par TrendStudio</span>
                        <span className="mx-2">|</span>
                        <span>© 2024</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                            <ShieldCheck size={14} className="text-green-500" /> Secure Cloud
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">
                            RGPD Compliant
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
