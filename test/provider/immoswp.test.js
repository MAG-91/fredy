const similarityCache = require('../../lib/services/similarity-check/similarityCache');
const mockNotification = require('../mocks/mockNotification');
const providerConfig = require('./testProvider.json');
const mockStore = require('../mocks/mockStore');
const proxyquire = require('proxyquire').noCallThru();
const expect = require('chai').expect;
const provider = require('../../lib/provider/immoswp');

describe('#immoswp testsuite()', () => {
  after(() => {
    similarityCache.stopCacheCleanup();
  });

  provider.init(providerConfig.immoswp, [], []);
  const Fredy = proxyquire('../../lib/FredyRuntime', {
    './services/storage/listingsStorage': {
      ...mockStore,
    },
    './notification/notify': mockNotification,
  });

  it('should test immoswp provider', async () => {
    return await new Promise((resolve) => {
      const fredy = new Fredy(provider.config, null, provider.metaInformation.id, 'test1', similarityCache);
      fredy.execute().then((listing) => {
        expect(listing).to.be.a('array');

        const notificationObj = mockNotification.get();
        expect(notificationObj).to.be.a('object');
        expect(notificationObj.serviceName).to.equal('immoswp');

        notificationObj.payload.forEach((notify) => {
          /** check the actual structure **/
          expect(notify.id).to.be.a('string');
          expect(notify.price).to.be.a('string');
          expect(notify.size).to.be.a('string');
          expect(notify.title).to.be.a('string');
          expect(notify.link).to.be.a('string');
          expect(notify.address).to.be.a('string');

          /** check the values if possible **/
          expect(notify.price).that.does.include('€');
          expect(notify.title).to.be.not.empty;
          expect(notify.link).that.does.include('https://immo.swp.de');
          expect(notify.address).to.be.not.empty;
        });
        resolve();
      });
    });
  });
});
