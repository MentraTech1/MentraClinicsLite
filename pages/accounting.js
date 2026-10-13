window.Module_Accounting = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                // 1. تحميل مكتبة الرسم البياني Chart.js أولاً
                if (typeof window.Chart === 'undefined') {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'assets/chart.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }

                // 2. تحميل ملفات الشاشة
                const filesToLoad = [
                    'components/Accounting/AccountingHeader.js',
                    'components/Accounting/AccountingFilters.js',
                    'components/Accounting/AccountingStats.js',
                    'components/Accounting/AccountingList.js',
                    'components/Accounting/ExpenseFormModal.js',
                    'components/Accounting/InvoiceFormModal.js',
                    'components/Accounting/AccountingPromoBanner.js',
                    'components/Accounting/Module_Accounting_Container.js'
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
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل شاشة الحسابات:</span>
                <span className="text-rose-500 mt-2 text-sm">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Accounting_Container) {
        return (
            <div className="flex justify-center items-center h-64 text-[#0EA5E9]">
                <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            </div>
        );
    }

    return React.createElement(window.Module_Accounting_Container, props);
};