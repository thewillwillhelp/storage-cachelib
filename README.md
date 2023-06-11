JS Cache library that allows to store data and setup TTL.
Also reflect cached data to some persinstent storage like localStorage and sessionStorage.
Based on cachelib-js.

Usage:

    const { StorageCacheService } = require('storagecachelib-js');

    const cacheService = new CacheService({
        id: 'test'
    });

    // add external storage config
    cacheService.addExternalStorage({
        id: 'storage1',
        type: 'localStorage', // also available 'sessionStorage' and 'custom'
        // storage: {} - to provide custom storage with Web Storage interface
        interval: 10000, // will save data from cache to external storage in this interval
        intervalInOperations: 10, // will save data from cache to external storage
        // each 10th get/set/remove operation
    });

    // restore data from external storage
    cacheService.restoreData({ id: 'storage1' });
    // should be called after external storages are configured
    // if no id provoided, then first added external storage will be used

    // subscribe to service events (SET, GET, REMOVE)
    cacheService.addListener(CacheService.events.SET, (event) => { /* response on SET event */ });

    // set value to cache which will be non-actual after 10 sec
    cacheService.set('key', { value: 'any value' }, { ttl: 10000 });

    // get value
    const result = cacheService.get('key');

    // remove value
    cacheService.remove('key');

    // extract full data
    const fullCacheData = cacheService.extract();

    // preload data to service
    cacheService.load(fullCacheData);


