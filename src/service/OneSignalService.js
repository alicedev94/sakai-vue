const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '15cb0818-b2ec-4986-83b9-f3bc61218fd4';
const SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';

let loadingPromise = null;

async function initOneSignal(OneSignal) {
    if (window.__reduOneSignalInitialized) {
        return;
    }

    try {
        await OneSignal.init({
            appId: APP_ID,
            allowLocalhostAsSecureOrigin: true,
            httpPermissionRequest: {
                enable: true
            },
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js'
        });
    } catch (error) {
        if (!String(error?.message || error).includes('SDK already initialized')) {
            throw error;
        }
    }

    window.__reduOneSignalInitialized = true;

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
        console.info('Push OneSignal recibido en primer plano', event.notification);
        event.notification.display();
    });

    OneSignal.Notifications.addEventListener('click', (event) => {
        console.info('Push OneSignal abierto por el usuario', event.notification);
    });
}

function loadSdk() {
    if (typeof window === 'undefined') return Promise.reject(new Error('OneSignal solo funciona en navegador'));
    if (window.OneSignalDeferred) return Promise.resolve();
    if (loadingPromise) return loadingPromise;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    loadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SDK_URL;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar OneSignal'));
        document.head.appendChild(script);
    });
    return loadingPromise;
}

function operationalRole(user) {
    const rawRole = user?.role || user?.roleCode || '';
    const role = rawRole.trim().toLowerCase();
    if (role.includes('surtidor')) return 'surtidor';
    if (role.includes('piso')) return 'piso';

    const username = user?.username || user?.email?.split('@')[0] || '';
    return username.trim().toLowerCase();
}

async function getOneSignalTags(OneSignal) {
    try {
        return await OneSignal.User.getTags();
    } catch (error) {
        console.warn('No se pudieron leer los tags de OneSignal:', error);
        return null;
    }
}

export async function setupOneSignalForUser(user) {
    if (!APP_ID || !user) return { ok: false, reason: 'missing-user-or-app' };
    await loadSdk();

    return new Promise((resolve) => {
        window.OneSignalDeferred.push(async (OneSignal) => {
            try {
                await initOneSignal(OneSignal);

                const role = operationalRole(user);
                if (!role) {
                    resolve({ ok: false, reason: 'missing-role' });
                    return;
                }

                await OneSignal.Notifications.requestPermission();
                if (!OneSignal.User.PushSubscription.optedIn && Notification.permission === 'granted') {
                    await OneSignal.User.PushSubscription.optIn();
                }

                if (!OneSignal.User.PushSubscription.optedIn) {
                    console.warn('OneSignal sin suscripcion activa', {
                        permission: Notification.permission,
                        optedIn: OneSignal.User.PushSubscription.optedIn,
                        subscriptionId: OneSignal.User.PushSubscription.id || null
                    });
                    resolve({ ok: false, reason: 'permission-denied' });
                    return;
                }

                await OneSignal.User.addTags({
                    role,
                    username: user.username || role,
                    email: user.email || ''
                });
                const tags = await getOneSignalTags(OneSignal);

                const result = {
                    ok: true,
                    role,
                    permission: Notification.permission,
                    optedIn: OneSignal.User.PushSubscription.optedIn,
                    subscriptionId: OneSignal.User.PushSubscription.id || null,
                    tags
                };
                console.info('OneSignal inicializado para usuario', result);
                resolve(result);
            } catch (error) {
                console.warn('No se pudo inicializar OneSignal:', error);
                resolve({ ok: false, reason: 'onesignal-error' });
            }
        });
    });
}
