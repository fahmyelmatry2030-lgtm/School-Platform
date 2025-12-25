import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/Card';
import { Navbar } from '../components/Navbar'; // Assuming we want Navbar here too, or usage within App layout

export default function About() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    return (
        <div className={`about-container ${isRtl ? 'rtl' : 'ltr'}`}>
            <div className="about-hero">
                <h1 className="about-title">{t('aboutUs')}</h1>
                <p className="about-subtitle">{t('heroSubtitle')}</p>
            </div>

            <div className="about-content">
                <Card className="about-card teacher-bio">
                    <CardContent>
                        <div className="bio-grid">
                            <div className="bio-image">
                                {/* Placeholder for Teacher Image */}
                                <div className="placeholder-img">👩‍🏫</div>
                            </div>
                            <div className="bio-text">
                                <h2>{t('teacherBio')}</h2>
                                <p>
                                    {isRtl
                                        ? "أهلاً بكم في منصتي التعليمية. أنا [اسم المعلمة]، معلمة متخصصة في [اسم المادة] بخبرة تزيد عن 10 سنوات. هدفي هو تبسيط المفاهيم العلمية وجعل التعلم رحلة ممتعة وتفاعلية لكل طالب."
                                        : "Welcome to my educational platform. I am [Teacher Name], a specialized teacher in [Subject Name] with over 10 years of experience. My goal is to simplify scientific concepts and make learning an enjoyable and interactive journey for every student."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="info-grid">
                    <Card className="about-card">
                        <CardContent>
                            <h3>{t('ourMission')}</h3>
                            <p>
                                {isRtl
                                    ? "نسعى لتقديم محتوى تعليمي عالي الجودة يجمع بين الأصالة والحداثة، باستخدام أحدث التقنيات لضمان وصول المعلومة بوضوح وسلاسة."
                                    : "We strive to provide high-quality educational content that combines authenticity and modernity, using the latest technologies to ensure clear and smooth information delivery."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="about-card">
                        <CardContent>
                            <h3>{t('qualifications')}</h3>
                            <ul className="qualifications-list">
                                <li>🎓 {isRtl ? "بكالوريوس في [التخصص] - جامعة [الجامعة]" : "Bachelor's in [Major] - [University] University"}</li>
                                <li>📜 {isRtl ? "دبلومة تربوية عامة" : "General Educational Diploma"}</li>
                                <li>🏆 {isRtl ? "جائزة المعلم المثالي لعام 2024" : "Ideal Teacher Award 2024"}</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style>{`
            .about-container {
                min-height: 100vh;
                background-color: var(--bg-secondary);
                padding-bottom: var(--spacing-2xl);
            }

            .about-hero {
                background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
                color: white;
                padding: var(--spacing-2xl) var(--spacing-lg);
                text-align: center;
                margin-bottom: var(--spacing-xl);
            }

            .about-title {
                font-size: 3rem;
                margin-bottom: var(--spacing-md);
                font-weight: bold;
            }

            .about-subtitle {
                font-size: 1.2rem;
                opacity: 0.9;
                max-width: 600px;
                margin: 0 auto;
            }

            .about-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 var(--spacing-lg);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }

            .about-card {
                height: 100%;
                border-top: 4px solid var(--primary-600);
            }

            .teacher-bio h2 {
                color: var(--primary-700);
                margin-bottom: var(--spacing-md);
                font-size: 1.8rem;
            }

            .bio-grid {
                display: grid;
                grid-template-columns: 200px 1fr;
                gap: var(--spacing-xl);
                align-items: center;
            }

            .bio-image {
                display: flex;
                justify-content: center;
            }

            .placeholder-img {
                font-size: 8rem;
                background: var(--bg-secondary);
                border-radius: 50%;
                width: 180px;
                height: 180px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 4px solid var(--primary-100);
            }

            .bio-text p {
                font-size: 1.1rem;
                line-height: 1.8;
                color: var(--text-primary);
            }

            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-lg);
            }

            .qualifications-list {
                list-style: none;
                padding: 0;
            }

            .qualifications-list li {
                padding: var(--spacing-sm) 0;
                border-bottom: 1px solid var(--divider-color);
                font-size: 1.05rem;
            }

            .qualifications-list li:last-child {
                border-bottom: none;
            }

            @media (max-width: 768px) {
                .bio-grid {
                    grid-template-columns: 1fr;
                    text-align: center;
                }
                .info-grid {
                    grid-template-columns: 1fr;
                }
                .about-title {
                    font-size: 2rem;
                }
            }
        `}</style>
        </div>
    );
}
