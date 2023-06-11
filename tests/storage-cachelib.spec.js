jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

const StorageCacheService = require('../src/storage-cachelib.js').StorageCacheService;

function setTime(time) {
    const originalGetTime = Date.prototype.getTime;

    Date.prototype.getTime = () => time;

    return () => {
        Date.prototype.getTime = originalGetTime;
    }
}

function mockBrowserStorage(type) {
    const tmpMockStorage = {
        _data: {},
        setItem: function(key, value) {
            this._data[key] = value.toString();
        },
        getItem: function(key) {
            return this._data[key];
        }
    };

    global[type] = tmpMockStorage;
}


describe('Storage Cache Service tests', () => {
    beforeEach(() => {
        global.localStorage
    });


    test('Simple set-get', () => {
        const cacheService = new StorageCacheService({
            id: 'test'
        });

        cacheService.set('key1', 'value1');

        expect(cacheService.get('key1')).toBe('value1');
        expect(cacheService._id).toBe('test');
    });

    test('Set get with expired ttl', () => {
        const cacheService = new StorageCacheService();

        cacheService.set('key1', 'value1', { ttl: 1000 });

        expect(cacheService.get('key1')).toBe('value1');

        const resetTime = setTime(new Date().getTime() + 2000);

        expect(cacheService.get('key1')).toBe(undefined);

        resetTime();
    });
 
    test('Set get with expired Default ttl', () => {
        const cacheService = new StorageCacheService({
            defaultTTL: 1000,        
        });

        cacheService.set('key1', 'value1');

        expect(cacheService.get('key1')).toBe('value1');

        const resetTime = setTime(new Date().getTime() + 2000);

        expect(cacheService.get('key1')).toBe(undefined);

        resetTime();
    });
    
    test('Use localStorage', () => {
        const cacheService = new StorageCacheService({
            id: 'test',
        });
        mockBrowserStorage('localStorage');
        
        cacheService.addExternalStorage({
            type: 'localStorage',
            intervalInOperations: 1
        });

        cacheService.set('key1', 'value1');
        
        expect(global.localStorage.getItem('test'))
            .toBe(JSON.stringify(cacheService.extract()));
        expect(cacheService.get('key1')).toBe('value1');
    });

    test('Use sessionStorage', () => {
        const cacheService = new StorageCacheService({
            id: 'test',
        });
        mockBrowserStorage('sessionStorage');
        
        cacheService.addExternalStorage({
            type: 'sessionStorage',
            intervalInOperations: 1
        });

        cacheService.set('key1', 'value1');

        expect(global.sessionStorage.getItem('test'))
            .toBe(JSON.stringify(cacheService.extract()));
        expect(cacheService.get('key1')).toBe('value1');
    });

    test('Use storage with interval in operations > 1', () => {
        const cacheService = new StorageCacheService({
            id: 'test',
        });
        mockBrowserStorage('localStorage');
        
        cacheService.addExternalStorage({
            type: 'localStorage',
            intervalInOperations: 2
        });

        cacheService.set('key1', 'value1');
        const result1 = global.localStorage.getItem('test');
        const result2 = cacheService.get('key1');

        const result3 = global.localStorage.getItem('test');

        expect(result1).toBe(undefined);
        expect(result2).toBe('value1');
        expect(result3)
            .toBe(JSON.stringify(cacheService.extract()));

    });

    test('Interval saving', () => {
        const cacheService = new StorageCacheService({
            id: 'test',
        });
        mockBrowserStorage('localStorage');
        
        cacheService.addExternalStorage({
            type: 'localStorage',
            interval: 1000,
        }); 

        cacheService.set('key1', 'value1');
        const result1 = global.localStorage.getItem('test');

        expect(result1).toBe(undefined);
        expect(setInterval).toHaveBeenCalledTimes(1);
    });
    
    test('Restore Data', () => {
        const tmpCacheService = new StorageCacheService({
            id: 'test',
        });
        mockBrowserStorage('localStorage');
        
        tmpCacheService.addExternalStorage({
            type: 'localStorage',
            intervalInOperations: 1,
        }); 

        tmpCacheService.set('key1', 'value1');
        const storedData = tmpCacheService.extract();
        const result1 = global.localStorage.getItem('test');

        const cacheService = new StorageCacheService({
            id: 'test',
        });

        cacheService.addExternalStorage({
            type: 'localStorage',
            intervalInOperations: 2,
        });

        const dataBeforeRestoring = cacheService.extract();
        cacheService.restoreData();
        const dataAfterRestoring = cacheService.extract();

        expect(JSON.parse(result1)).toEqual(storedData);
        expect(dataBeforeRestoring).toEqual({});
        expect(dataAfterRestoring).toEqual(storedData);
    });

});
