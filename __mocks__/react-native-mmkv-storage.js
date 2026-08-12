const stores = new Map();

const getStore = id => {
  if (!stores.has(id)) {
    stores.set(id, new Map());
  }
  return stores.get(id);
};

class MMKVLoader {
  constructor() {
    this.instanceId = 'default';
  }

  withInstanceID(instanceId) {
    this.instanceId = instanceId;
    return this;
  }

  initialize() {
    const store = getStore(this.instanceId);
    return {
      getString: key => {
        const value = store.get(key);
        return typeof value === 'string' ? value : undefined;
      },
      setString: (key, value) => store.set(key, value),
      getBool: key => {
        const value = store.get(key);
        return typeof value === 'boolean' ? value : undefined;
      },
      setBool: (key, value) => store.set(key, value),
      getInt: key => {
        const value = store.get(key);
        return typeof value === 'number' ? value : undefined;
      },
      setInt: (key, value) => store.set(key, value),
      removeItem: key => store.delete(key),
      clearStore: () => store.clear(),
    };
  }
}

module.exports = {MMKVLoader};
