const { CacheService } = require('cachelib-js');

class StorageCacheService extends CacheService {
    static _instancesCounter = 0;

    /**
     * @param {Object} params
     * @param {number} params.defaultTTL
     * @param {string} params.id
     */
    constructor(params = {}) {
        super();

        if (params?.defaultTTL) {
            this._defaultTTL = params.defaultTTL;
        }

        if (params?.id) {
            this._id = params.id;
        } else {
            console.warn(`Please set unique id for the storage, especially` +
                ` you have multiple storages in your app`);
            this._id = `tmp-storage-${StorageCacheService._instancesCounter}`;
        }

        this._externalStorages = [];        
        this._timers = [];

        StorageCacheService._instancesCounter++;
    }
    
    /**
     * @param {String} key
     * @param {any} value
     * @param {Object} options
     * @param {Number} options.ttl
     * @return {void} 
     */
    set(key, value, options = {}) {
        super.set(key, value, options);

        this._storeDataByOperations();    
    }
    
    /**
     * @param {String} key
     * @return {any}
     */
    get(key) {
        const result = super.get(key);

        this._storeDataByOperations();

        return result;
    }
    
    /**
     * @param {String} key
     * @return {void}
     */
    remove(key) {
        super.remove(key); 

        this._storeDataByOperations();
    }
    
    /**
     * @param {Object?} params
     * @param {string?} params.id
     * @param {string}  params.type - 'localStorage' | 'sessionStorage' | 'custom'
     * @oaram {StorageLikeObject?} params.storage - for 'custom' type
     * @param {number?} params.interval
     * @param {number?} params.intervalInOperations
     */
    addExternalStorage(params = {}) {
        let storage = null;

        if (params?.type === 'localStorage') {
            storage = localStorage;
        } else if (params?.type === 'sessionStorage') {
            storage = sessionStorage;
        } else if (params?.type === 'custom') {
            if (params?.storage) {
                storage = params?.storage;
            } else {
                console.warn(`External storage must be provided for custom type`); 
                return;
            }
        } else {
            console.warn('External storage is not correct. Skipped');
            return;
        }

        const storageConfig = {
            id: params?.id,
            type: params?.type,
            interval: params?.interval,
            intervalInOperations: params?.intervalInOperations,
            storage: storage,
            operationsCounter: 0,
        };

        if (params?.interval) {
            storageConfig.timer = setInterval(() => {
                storageConfig.storage.setItem(this._id, JSON.stringify(this.extract()));
            }, params.interval);
        }
        
        this._externalStorages.push(storageConfig);
    }
    
    /**
     * @param {Object?} params
     * @param {string} params.id
     */
    restoreData(params) {
        let storageToRestore = null;

        if (params?.id) {
            storageToRestore = this._externalStorages
                .find(storageConfig => storageConfig.id === params.id);
        } else {
            storageToRestore = this._externalStorages[0];
        }

        if (!storageToRestore) {
            console.warn('No external storage to restore data');
            return;
        }

        const restoredStore = JSON
            .parse(storageToRestore.storage.getItem(this._id));

        this.load(restoredStore || {});
    }


    _storeDataByOperations() {
        this._externalStorages.forEach(storageConfig => {
            if (storageConfig.intervalInOperations) {
                if (storageConfig.operationsCounter === 
                    storageConfig.intervalInOperations - 1) {
                    storageConfig.storage.setItem(this._id, JSON.stringify(this.extract()));
                    storageConfig.operationsCounter = 0;
                } else {
                    storageConfig.operationsCounter++;
                }
            }
        });
    }
}

module.exports.StorageCacheService = StorageCacheService;
