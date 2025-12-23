import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/Card';

export default function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content container">
                    <div className="hero-text">
                        <h1 className="hero-title animate-fade-in">
                            {t('heroTitle') || 'مستقبلك يبدأ هنا'}
                        </h1>
                        <p className="hero-subtitle animate-fade-in-delayed">
                            {t('heroSubtitle') || 'منصة تعليمية متطورة توفر لك كل ما تحتاجه للنجاح في مسيرتك الدراسية.'}
                        </p>
                        <div className="hero-cta animate-fade-in-slow">
                            <Link to="/login" className="btn-primary btn-lg pulse-animation">
                                {t('getStarted') || 'ابدأ الآن مجاناً'}
                            </Link>
                            <a href="#features" className="btn-outline btn-lg">
                                {t('learnMore') || 'اكتشف المزيد'}
                            </a>
                        </div>
                    </div>
                    <div className="hero-image animate-float">
                        <div className="glass-card main-illustration">
                            <span className="illustration-emoji">🎓</span>
                            <div className="illustration-grid">
                                <div className="grid-box"></div>
                                <div className="grid-box"></div>
                                <div className="grid-box"></div>
                                <div className="grid-box"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-bg-accent"></div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container grid grid-3">
                    <div className="stat-card">
                        <div className="stat-value">+1000</div>
                        <div className="stat-label">طالب مستفيد</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">+50</div>
                        <div className="stat-label">مادة تعليمية</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">+200</div>
                        <div className="stat-label">اختبار وتقييم</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features container">
                <div className="section-header text-center">
                    <h2 className="section-title">{t('ourFeatures') || 'لماذا تختار منصتنا؟'}</h2>
                    <p className="section-subtitle">{t('featuresDesc') || 'نحن نوفر أفضل الأدوات التفاعلية لكل من المعلم والطالب'}</p>
                </div>

                <div className="grid grid-3">
                    <Card className="feature-card">
                        <CardContent>
                            <div className="feature-icon">📚</div>
                            <h3 className="feature-title">{t('feature1Title') || 'محتوى غني'}</h3>
                            <p className="feature-desc">{t('feature1Desc') || 'دروس مسجلة، ملفات PDF، ومواد تفاعلية تغطي كافة المناهج.'}</p>
                        </CardContent>
                    </Card>

                    <Card className="feature-card">
                        <CardContent>
                            <div className="feature-icon">📝</div>
                            <h3 className="feature-title">{t('feature2Title') || 'تقييمات دورية'}</h3>
                            <p className="feature-desc">{t('feature2Desc') || 'اختبارات قصيرة وواجبات لقياس مستوى الطالب وتقديم التغذية الراجعة.'}</p>
                        </CardContent>
                    </Card>

                    <Card className="feature-card">
                        <CardContent>
                            <div className="feature-icon">📊</div>
                            <h3 className="feature-title">{t('feature3Title') || 'متابعة الأداء'}</h3>
                            <p className="feature-desc">{t('feature3Desc') || 'لوحة تحكم كاملة للطالب والمعلم لمتابعة التقدم الأكاديمي.'}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            🎓 {t('schoolPlatform')}
                        </div>
                        <p className="footer-copy">
                            &copy; {new Date().getFullYear()} {t('allRightsReserved') || 'جميع الحقوق محفوظة'}
                        </p>
                    </div>
                </div>
            </footer>

            <style>{`
        .home-page {
          background-color: var(--bg-primary);
          overflow-x: hidden;
        }

        .hero {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: var(--spacing-3xl) 0;
          background: radial-gradient(circle at top right, var(--primary-50) 0%, transparent 70%);
          overflow: hidden;
        }

        .hero-bg-accent {
          position: absolute;
          width: 600px;
          height: 600px;
          background: var(--primary-100);
          filter: blur(100px);
          border-radius: 50%;
          top: -200px;
          right: -100px;
          opacity: 0.5;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: var(--spacing-2xl);
          align-items: center;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          color: var(--grey-900);
          margin-bottom: var(--spacing-lg);
          line-height: 1.1;
          background: linear-gradient(135deg, var(--grey-900) 0%, var(--primary-700) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-2xl);
          max-width: 600px;
        }

        .hero-cta {
          display: flex;
          gap: var(--spacing-md);
        }

        .btn-lg {
          padding: var(--spacing-md) var(--spacing-2xl);
          font-size: var(--font-size-lg);
          border-radius: var(--radius-lg);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(13, 71, 161, 0.1);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          border-radius: 20px;
          padding: 40px;
        }

        .main-illustration {
          width: 100%;
          max-width: 400px;
          aspect-ratio: 1;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .illustration-emoji {
          font-size: 8rem;
          filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1));
        }

        .illustration-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
          width: 80%;
        }

        .grid-box {
          height: 8px;
          background: var(--primary-100);
          border-radius: 4px;
        }

        /* Stats Section */
        .stats-section {
          padding: var(--spacing-2xl) 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--divider-color);
          border-bottom: 1px solid var(--divider-color);
        }

        .stat-card {
          text-align: center;
          padding: var(--spacing-lg);
        }

        .stat-value {
          font-size: var(--font-size-4xl);
          font-weight: 800;
          color: var(--primary-600);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Features */
        .features {
          padding: var(--spacing-3xl) var(--spacing-md);
        }

        .section-header {
          margin-bottom: var(--spacing-3xl);
        }

        .section-title {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        .feature-card {
          text-align: center;
          padding: var(--spacing-xl);
          border: 1px solid transparent;
          transition: all var(--transition-base);
        }

        .feature-card:hover {
          border-color: var(--primary-100);
          transform: translateY(-10px);
        }

        .feature-icon {
          font-size: 3.5rem;
          margin-bottom: var(--spacing-lg);
        }

        .feature-title {
          font-size: var(--font-size-xl);
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
        }

        .home-footer {
          background: var(--grey-900);
          color: white;
          padding: var(--spacing-2xl) 0;
          margin-top: var(--spacing-3xl);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .footer-copy {
          color: var(--grey-400);
          margin: 0;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-fade-in-delayed { animation: fadeIn 0.8s 0.2s ease-out forwards; opacity: 0; }
        .animate-fade-in-slow { animation: fadeIn 0.8s 0.4s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .pulse-animation:hover { animation: pulse 1s infinite; }

        @media (max-width: 968px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-text {
            order: 2;
          }
          .hero-image {
            order: 1;
            margin-bottom: var(--spacing-xl);
          }
          .hero-title {
            font-size: 3rem;
          }
          .hero-cta {
            justify-content: center;
          }
          .footer-content {
            flex-direction: column;
            gap: var(--spacing-md);
          }
        }
      `}</style>
        </div>
    );
}
