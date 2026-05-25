const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '5c02a63a-c3ed-4f01-b4b6-b6e50cbab837';
const SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';

let loadingPromise = null;

async function initOneSignal(OneSignal) {
    if (window.__reduOneSignalInitialized) {
        return;
    }

    try {
        await OneSignal.init({
            appId: APP_ID,
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
                const role = operationalRole(user);
                console.info('[OneSignal] Iniciando setup, role calculado:', role, 'user:', user.username || user.email);

                if (!role) {
                    console.warn('[OneSignal] No se pudo determinar el role operativo. rawRole:', user?.role || user?.roleCode || '');
                    resolve({ ok: false, reason: 'missing-role' });
                    return;
                }

                await initOneSignal(OneSignal);

                const permResult = await OneSignal.Notifications.requestPermission();
                console.info('[OneSignal] Resultado de pedir permiso:', permResult);

                if (permResult === 'denied' || permResult === 'blocked') {
                    console.warn('[OneSignal] Permiso bloqueado o denegado. Verifica que el dominio esté configurado en OneSignal Dashboard.');
                }

                if (!OneSignal.User.PushSubscription.optedIn && Notification.permission === 'granted') {
                    console.info('[OneSignal] Permiso concedido pero no optedIn, intentando optIn manual...');
                    await OneSignal.User.PushSubscription.optIn();
                }

                if (!OneSignal.User.PushSubscription.optedIn) {
                    console.warn('[OneSignal] Usuario NO suscrito', {
                        permission: Notification.permission,
                        optedIn: OneSignal.User.PushSubscription.optedIn,
                        subscriptionId: OneSignal.User.PushSubscription.id || null
                    });
                    resolve({ ok: false, reason: 'permission-denied' });
                    return;
                }

                const subId = OneSignal.User.PushSubscription.id;
                console.info('[OneSignal] Subscription exitosa, id:', subId);

                const externalId = user.username || user.email || role;
                await OneSignal.login(externalId);
                console.info('[OneSignal] External ID asignado:', externalId);

                await OneSignal.User.addTags({
                    role,
                    username: user.username || role,
                    email: user.email || ''
                });

                const tags = await OneSignal.User.getTags();
                console.info('[OneSignal] Tags confirmados:', tags);

                const aliasResult = await OneSignal.User.getAliases();
                console.info('[OneSignal] Alias confirmados:', aliasResult);

                const result = {
                    ok: true,
                    role,
                    externalId,
                    permission: Notification.permission,
                    optedIn: OneSignal.User.PushSubscription.optedIn,
                    subscriptionId: subId,
                    tags,
                    aliases: aliasResult
                };
                console.info('[OneSignal] Setup completo', result);
                resolve(result);
            } catch (error) {
                console.error('[OneSignal] Error inesperado:', error);
                resolve({ ok: false, reason: 'onesignal-error' });
            }
        });
    });
}

