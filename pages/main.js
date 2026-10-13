window.Module_Main = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                // 1. تحميل مكتبة Chart.js إذا لم تكن موجودة لرسم البياني
                if (!window.Chart) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'assets/chart.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }

                // 2. قائمة الملفات التي سيتم جلبها وترجمتها (تم إضافة FinancialSection)
                const filesToLoad = [
                    'components/Main/MainStats.js',
                    'components/Main/QuickAccess.js',
                    'components/Main/FinancialSection.js', // المكون الجديد
                    'components/Main/RecentLists.js',
                    'components/Main/PromoBanner.js',
                    'components/Main/Module_Main_Container.js' // الحاوية الرئيسية (تُحمل أخيراً)
                ];

                for (const file of filesToLoad) {
                    const componentName = file.split('/').pop().split('.')[0];
                    if (window[componentName]) continue;
                    
                    const res = await fetch(`${file}?v=${Date.now()}`);
                    if (!res.ok) throw new Error(`تعذر تحميل: ${file}`);
                    
                    const rawScript = await res.text();
                    const compiled = window.Babel.transform(rawScript, { presets: ['react'] }).code;
                    
                    const scriptEl = document.createElement('script');
                    scriptEl.text = compiled;
                    document.body.appendChild(scriptEl);
                }
                setComponentsLoaded(true);
            } catch (err) {
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 mt-10 max-w-2xl mx-auto text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل الشاشة الرئيسية:</span>
                <span className="text-rose-500 mt-2 text-sm">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Main_Container) {
        return (
            <div className="flex justify-center items-center h-64 text-[#0EA5E9]">
                <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            </div>
        );
    }

    return React.createElement(window.Module_Main_Container, props);
};