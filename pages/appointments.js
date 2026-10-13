window.Module_Appointments = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            const filesToLoad = [
                'components/Appointments/AppointmentsHeader.js',
                'components/Appointments/AppointmentsStats.js',
                'components/Appointments/AppointmentsFilters.js',
                'components/Appointments/AppointmentsList.js',
                'components/Appointments/AppointmentsCalendar.js', // المكون الجديد
                'components/Appointments/AppointmentFormModal.js',
                'components/Appointments/AppointmentsPromoBanner.js',
                'components/Appointments/Module_Appointments_Container.js'
            ];

            try {
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
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل المواعيد:</span>
                <span className="text-rose-500 mt-2 text-sm">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Appointments_Container) {
        return (
            <div className="flex justify-center items-center h-64 text-[#0EA5E9]">
                <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            </div>
        );
    }

    return React.createElement(window.Module_Appointments_Container, props);
};