export function AutoUnsubscribe(constructor: any) {
  const originalOnDestroyMethod = constructor.prototype.ngOnDestroy;

  constructor.prototype.ngOnDestroy = () => {
    // @ts-ignore
    for (let prop in this) {
      if (prop == 'subscriptions') {
        // @ts-ignore
        for (let subscription of this[prop]) {
          if (subscription && (typeof subscription.unsubscribe === 'function')) {
            subscription.unsubscribe();
          }
        }
        break;
      }
    }
    // @ts-ignore
    originalOnDestroyMethod && typeof originalOnDestroyMethod() === 'function' && originalOnDestroyMethod.apply(this, arguments);
  };
}
