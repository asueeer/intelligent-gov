import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const setVisitorId = () => {
  const historyVisitorId = localStorage.getItem('visitorId');
  if (typeof historyVisitorId !== 'string') {
    const fpPromise = FingerprintJS.load();
    
    (async () => {
      // Get the visitor identifier when you need it.
      const fp = await fpPromise;
      const result = await fp.get();
    
      // This is the visitor identifier:
      const { visitorId } = result;
      console.log('set visitor id: ', visitorId, 'to local storage');
      localStorage.setItem('visitorId', visitorId);
    })();
  } else {
    console.log('get history visitor id from local storage: ', historyVisitorId)
  }
}
